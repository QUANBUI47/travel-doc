# 01 — Kiến trúc tổng thể

> **Vai trò đọc**: Tech Lead, dev — biết các thành phần hệ thống Vivu và cách chúng nói chuyện với nhau.

---

## Stack overview

```
┌────────────────────────────────────────────────────────────────┐
│              Browser / Mobile Web (B2C + Admin)                │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼─────────────────────────────────────┐
│                  Vercel — Next.js 15 App Router                │
│  ┌──────────────────────┬─────────────────────────────────┐    │
│  │ Public routes        │ Admin routes                    │    │
│  │ /(public)/...        │ /portal/...                     │    │
│  └──────────────────────┴─────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Service Layer (TourService, BookingService, ...)       │    │
│  └────────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Prisma Client                                          │    │
│  └────────────────────────────────────────────────────────┘    │
└──────────┬───────────────┬────────────────┬─────────────┬──────┘
           │               │                │             │
           ▼               ▼                ▼             ▼
   ┌──────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐
   │  Supabase    │ │  Cloudinary │ │  VNPay /   │ │   Resend    │
   │  Postgres +  │ │  (Images)   │ │   MoMo     │ │  (Email)    │
   │  Auth        │ │             │ │            │ │             │
   └──────────────┘ └─────────────┘ └────────────┘ └─────────────┘
```

| Component | Role | Phase 1 plan |
| --- | --- | --- |
| **Next.js 15 App Router** | Frontend + server logic (RSC + Server Actions + API Routes) | Đã chốt |
| **Supabase Auth** | User authentication (email + Google OAuth) | Free tier đủ |
| **Supabase Postgres** | Primary DB | Free tier 500MB Phase 1, upgrade khi cần |
| **Prisma** | ORM | Mapping `@db.Uuid` cho mọi ID (ADR-003) |
| **Cloudinary** | Image upload + optimize | Free tier 25GB |
| **VNPay + MoMo** | Payment gateway | Sandbox Phase 1, prod khi launch |
| **Resend** | Email transactional | Free tier 3k/tháng đủ |
| **Vercel** | Hosting + Edge functions | Free tier hobby Phase 1, Pro khi prod |

---

## Routing layout

```
travel-web/app/
├── (public)/                  ← Group public routes
│   ├── page.tsx               (home)
│   ├── tours/
│   │   ├── page.tsx           (list)
│   │   └── [slug]/page.tsx    (detail)
│   ├── destinations/
│   │   └── [slug]/page.tsx
│   ├── hotels/
│   │   └── [slug]/page.tsx
│   ├── inquiry/
│   │   └── page.tsx           (Private Tour lead form)
│   ├── account/               ← User profile (require auth)
│   │   ├── bookings/page.tsx
│   │   └── profile/page.tsx
│   └── auth/
│       ├── login/page.tsx
│       └── register/page.tsx
│
├── portal/                    ← Admin routes (require role=ADMIN)
│   ├── dashboard/page.tsx     (L0 Operational)
│   ├── tours/
│   ├── destinations/
│   ├── hotels/
│   ├── bookings/
│   ├── inquiries/
│   ├── seo/
│   └── settings/
│
├── api/
│   └── v1/
│       ├── payments/
│       │   ├── vnpay/
│       │   │   ├── checkout/route.ts
│       │   │   └── webhook/route.ts
│       │   └── momo/
│       ├── upload/route.ts    (Cloudinary signed upload)
│       └── crons/
│           ├── auto-cancel-bookings/route.ts
│           └── expire-inquiries/route.ts
│
└── middleware.ts              ← Dual cookie public/admin
```

**Quy tắc routing**:
- `/(public)/*` → khách & admin đều xem được, lọc theo `isActive`
- `/portal/*` → chỉ ADMIN (middleware reject nếu role≠ADMIN)
- `/api/v1/*` → internal (không public dev portal Phase 1)

---

## Service layer architecture

Page/component **KHÔNG** gọi Prisma trực tiếp. Mọi mutation qua service.

```
Page (RSC / Client Component)
   │
   ├──► Server Action ──┐
   │                    ├──► Service (TourService, BookingService, …)
   └──► API Route ──────┘            │
                                     ├──► Prisma ──► PostgreSQL
                                     └──► External (VNPay, Cloudinary, Resend)
```

### Service convention

```
travel-web/src/lib/services/
├── tour.service.ts            # findActive*(), findForAdmin*(), create*, update*
├── booking.service.ts         # createTourBooking() — pessimistic lock
├── payment.service.ts         # VNPay/MoMo wrap
├── inquiry.service.ts
├── hotel.service.ts
├── review.service.ts
├── seo.service.ts
├── auth.service.ts            # ensureUserProfile() từ Supabase
└── activity-log.service.ts    # logActivity()
```

**Rule cứng**:
1. Service nhận DTO (Zod validated), trả entity hoặc throw domain error.
2. Service quản lý transaction boundary (đặc biệt với booking).
3. Service tự log `ActivityLog` cho mọi mutation.
4. Service throw class error (NotFoundError, ValidationError, BusinessError, DepartureFullError) — không throw string.
5. Service không gọi service khác (tránh tight coupling). Nếu cần, di chuyển logic chung lên util.
6. Service có 2 method cho public/admin: `findActive*()` filter `isActive: true`, `findAll*()` không filter.

→ Chi tiết: `../04-phat-trien/01-quy-chuan-lap-trinh.md`.

---

## Database — Supabase Postgres

| Aspect | Phase 1 |
| --- | --- |
| Provider | Supabase (managed Postgres 15+) |
| Tier | Free (500MB, 2 connection pool) |
| Connection | Connection pooler (PgBouncer) → Prisma |
| Backup | Supabase auto daily backup |
| Migration | Prisma Migrate (`prisma migrate deploy`) |

**Khoảng cách Prisma ↔ Postgres**:
- Mọi ID: `@db.Uuid` (ADR-003)
- Mọi field `@map("snake_case")`
- Decimal money: `@db.Decimal(14, 0)` (VND nguyên, 14 chữ số)
- Date: `@db.Date` (không có timezone) cho `period_month`, `start_date`
- DateTime: TIMESTAMPTZ (default Prisma)

→ Schema chi tiết: `../03-co-so-du-lieu/02-thiet-ke-bang.md`.

---

## Authentication

```
                         ┌──────────────────┐
                         │ Supabase Auth    │
                         │ (email + Google) │
                         └────────┬─────────┘
                                  │ JWT
┌────────────────────┐            │
│   middleware.ts    │◄───────────┘
│ Verify token       │
│ Set cookie:        │
│  - sb-access-token │
│  - sb-refresh-token│
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────┐
│   ensureUserProfile()   │ ← Tạo Profile row nếu chưa có
│   Profile.id = auth.id  │
└─────────────────────────┘
```

**Dual cookie strategy**:
- Public cookie: 30 days
- Admin cookie: 8h (idle timeout)
- Middleware phân biệt route `/portal/*` vs `/(public)/*`

→ Chi tiết: `02-cross-cutting.md` mục Auth + `../04-phat-trien/04-bao-mat-xac-thuc.md`.

---

## External integrations

### Cloudinary (image)

- Admin upload qua signed URL → `/api/v1/upload`
- URL lưu vào `Tour.imageUrls[]`, `Hotel.imageUrls[]`, `Destination.imageUrls[]`
- Transform on-the-fly cho responsive: `cloudinary.com/image/upload/c_fill,w_800,h_600,q_auto/...`

### VNPay / MoMo (payment)

```
Booking PENDING → Payment.create → Redirect tới VNPay/MoMo
                                                    │
                                                    ▼ user pays
                                          Webhook → /api/v1/payments/vnpay/webhook
                                                    │
                                                    ▼ verify signature
                                          Update Payment.status=SUCCESS
                                          Update Booking.status=PAID
```

**Idempotency**: webhook có thể gọi nhiều lần → service phải:
```typescript
if (payment.status === 'SUCCESS') return // already processed
// otherwise update
```

### Resend (email)

- Email template (HTML) lưu trong code, render với `react-email` lib
- Transactional only Phase 1 (confirm, cancel, reminder, review invite)
- Marketing email Phase 1.5

---

## Cron jobs (Vercel Cron)

`vercel.json`:
```json
{
  "crons": [
    { "path": "/api/v1/crons/auto-cancel-bookings", "schedule": "* * * * *" },
    { "path": "/api/v1/crons/expire-inquiries",     "schedule": "0 2 * * *" }
  ]
}
```

| Cron | Frequency | Mục đích |
| --- | --- | --- |
| `auto-cancel-bookings` | 1 phút | Cancel Booking PENDING quá `paymentDeadline` |
| `expire-inquiries` | 1 ngày (02:00 UTC) | Expire InquiryRequest > 30 ngày không update |

**Auth cron**: header `Authorization: Bearer $CRON_SECRET` để Vercel verify.

---

## Caching strategy

| Layer | Cache | TTL |
| --- | --- | --- |
| Static pages (home, about) | Next.js ISR | 1h revalidate |
| Tour list/detail | Next.js ISR + on-demand revalidate khi admin update | 6h + manual revalidate |
| Search results | Server-side cache key by filter params | 5 phút |
| Admin pages | No cache | — |
| Static assets (image, font) | Cloudinary/Vercel CDN | Forever |

**Revalidation**: khi admin update tour → service call `revalidatePath('/tours/[slug]')` + `revalidateTag('tour-list')`.

---

## Liên kết

- Cross-cutting concerns (auth, i18n, cache, log, error): `02-cross-cutting.md`
- API contract: `03-api-contract.md`
- ADR folder: `decisions/`
- Quy chuẩn code: `../04-phat-trien/01-quy-chuan-lap-trinh.md`
- Schema DB: `../03-co-so-du-lieu/02-thiet-ke-bang.md`
