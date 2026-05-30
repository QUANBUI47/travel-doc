# 02 — Cross-cutting concerns

> **Vai trò đọc**: Tech Lead, dev — biết các "horizontal" concerns đi xuyên mọi module: auth, i18n, cache, log, error handling.

---

## 1. Auth & Authorization

### 1.1 Identity provider — Supabase Auth

- Email + password (verification email)
- Google OAuth (1-click)
- Phase 1.5: Facebook, Apple Sign-in

### 1.2 Session — dual cookie

| Cookie | Scope | TTL | Idle timeout |
| --- | --- | --- | --- |
| `sb-access-token` (public) | `/(public)/*`, `/account/*` | 30 days | — |
| `sb-admin-session` (admin) | `/portal/*` | 30 days | 8h |

**Idle timeout admin**: nếu admin không tương tác 8h → middleware redirect login lại. Tránh laptop bỏ quên ở chỗ public.

### 1.3 Profile mirror (Vivu DB)

Khi user login lần đầu → service `ensureUserProfile()` tạo `Profile` với `id = auth.users.id`. Không tự sinh UUID khác — phải dùng đúng UUID Supabase để join native (ADR-003).

```typescript
async function ensureUserProfile(supabaseUser: User) {
  return prisma.profile.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,  // ← UUID từ Supabase, không generate mới
      displayName: supabaseUser.user_metadata.full_name,
      avatarUrl:   supabaseUser.user_metadata.avatar_url,
      role: 'USER',
    },
    update: {},
  })
}
```

### 1.4 Role check — middleware + service

```typescript
// middleware.ts
if (pathname.startsWith('/portal')) {
  if (!user || user.role !== 'ADMIN') redirect('/auth/login?from=' + pathname)
}

// service
async function requireAdmin(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile || profile.role !== 'ADMIN') throw new ForbiddenError()
}
```

### 1.5 Login redirect & state preservation

Khi khách click "Book" ở `/tours/da-lat-4n3d` mà chưa login:
1. Redirect `/auth/login?from=/tours/da-lat-4n3d&action=book&departureId=...`
2. Sau login thành công → redirect lại với context được giữ (departure đã chọn)
3. Tránh khách phải chọn lại — giảm drop-off (Personas, chỗ "Pick date → Login" risk cao nhất).

→ Chi tiết security: `../04-phat-trien/04-bao-mat-xac-thuc.md`.

---

## 2. Internationalization (i18n)

### 2.1 Library — `next-intl`

- VI là ngôn ngữ chính, EN là khung sườn Phase 1
- Phase 1.5 EN đầy đủ cho tour quốc tế

### 2.2 URL structure

```
/                       → VI default
/en                     → EN home
/tours/da-lat-4-ngay    → VI
/en/tours/da-lat-4-day  → EN
```

### 2.3 Content i18n

| Loại | Cách lưu |
| --- | --- |
| UI labels | `messages/vi.json`, `messages/en.json` |
| Tour name, description | `Tour.nameVi`, `Tour.nameEn` (nullable) |
| Tour policy, inclusions | `Tour.policy` Json — i18n trong cùng field nếu cần |
| Legal content | `LegalContent.content` Json — i18n trong cùng field |

**Fallback**: nếu `nameEn IS NULL` → display `nameVi` (đỡ orphan EN page).

### 2.4 Slug strategy

Phase 1 slug giữ 1 ngôn ngữ (VI). Phase 1.5: thêm `slugEn` riêng nếu EN content đầy đủ.

---

## 3. Caching

### 3.1 Static — Next.js ISR

```typescript
// app/(public)/tours/[slug]/page.tsx
export const revalidate = 21600 // 6h

export async function generateStaticParams() {
  const tours = await tourService.findActiveTours()
  return tours.map(t => ({ slug: t.slug }))
}
```

### 3.2 On-demand revalidation

Khi admin update tour:
```typescript
await tourService.update(tourId, data)
revalidatePath(`/tours/${tour.slug}`)
revalidateTag('tour-list')
revalidateTag(`destination-${tour.destinationId}`)
```

### 3.3 Server-side cache (Next.js `unstable_cache`)

```typescript
const getCachedTourList = unstable_cache(
  async (filter) => tourService.searchListings(filter),
  ['tour-list'],
  { revalidate: 300, tags: ['tour-list'] }
)
```

### 3.4 Client-side — React Query (Phase 1.5)

Phase 1 dùng RSC + Server Action đủ. Phase 1.5 + mobile RN thêm React Query khi cần optimistic update.

---

## 4. Logging

### 4.1 Application log — console + Vercel logs

Phase 1: dùng `console.log` + Vercel built-in logs.

Format chuẩn:
```typescript
console.log(JSON.stringify({
  level: 'info',
  timestamp: new Date().toISOString(),
  service: 'BookingService',
  action: 'createTourBooking',
  userId: input.userId,
  bookingId: result.id,
  durationMs: Date.now() - start,
}))
```

### 4.2 Audit log — DB `ActivityLog`

Mọi mutation admin + booking lifecycle phải log:

```typescript
await prisma.activityLog.create({
  data: {
    userId,
    action: 'CREATE_BOOKING',
    entity: 'Booking',
    entityId: booking.id,
    details: { tourId, departureId, totalAmount, ip, userAgent },
  }
})
```

**Action naming**: `<VERB>_<ENTITY>` UPPER_SNAKE. Vd `CREATE_TOUR`, `UPDATE_DESTINATION`, `AUTO_CANCEL_TIMEOUT`.

### 4.3 Phase 1.5 — Centralized log

Cân nhắc Logtail / Better Stack / Axiom khi volume tăng.

---

## 5. Error handling

### 5.1 Domain error classes

```typescript
// lib/errors.ts
export class DomainError extends Error {
  code: string
  httpStatus: number
  i18nKey: string
  details?: Record<string, unknown>
}

export class NotFoundError extends DomainError      { code = 'NOT_FOUND',     httpStatus = 404 }
export class ValidationError extends DomainError    { code = 'VALIDATION',    httpStatus = 400 }
export class BusinessError extends DomainError      { code = 'BUSINESS_RULE', httpStatus = 422 }
export class UnauthorizedError extends DomainError  { code = 'UNAUTHORIZED',  httpStatus = 401 }
export class ForbiddenError extends DomainError     { code = 'FORBIDDEN',     httpStatus = 403 }
export class DepartureFullError extends BusinessError {
  code = 'DEPARTURE_FULL'
  i18nKey = 'errors.departureFull'
}
```

### 5.2 Server Action / API route — uniform response

```typescript
// Server Action helper
export async function safeAction<T>(fn: () => Promise<T>): Promise<{ ok: true; data: T } | { ok: false; error: ErrorPayload }> {
  try {
    return { ok: true, data: await fn() }
  } catch (e) {
    if (e instanceof DomainError) {
      return { ok: false, error: { code: e.code, message: t(e.i18nKey), details: e.details } }
    }
    console.error('Unexpected error:', e)
    return { ok: false, error: { code: 'INTERNAL_ERROR', message: t('errors.internal') } }
  }
}
```

### 5.3 Boundary error UI

```typescript
// app/(public)/error.tsx
'use client'
export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorScreen onRetry={reset} message={t(error.message)} />
}
```

### 5.4 Form error — Zod + react-hook-form

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(BookingFormSchema),
})

// Display
{errors.email && <span>{t(errors.email.message)}</span>}
```

---

## 6. Rate limiting & abuse prevention

### 6.1 Public endpoints — `Upstash Redis` (Phase 1.5)

Phase 1 chấp nhận không rate limit (volume thấp). Phase 1.5 thêm khi có spam form Inquiry hoặc bot scrape.

### 6.2 Cron auth

Header `Authorization: Bearer ${CRON_SECRET}` — Vercel Cron auto add. Verify trong API route.

```typescript
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // ...
}
```

### 6.3 Webhook signature

VNPay/MoMo webhook verify signature trước khi update Booking.status:

```typescript
const isValid = verifyVnpaySignature(req.body, req.query.vnp_SecureHash)
if (!isValid) return new Response('Invalid signature', { status: 400 })
```

---

## 7. Observability — Phase 1.5+

- Sentry (error tracking) khi launch
- PostHog (product analytics) free tier
- Plausible (web analytics) — privacy-friendly
- Vercel Analytics — Core Web Vitals

---

## 8. Env variables

Phân theo public/server:

```bash
# .env.example
# === PUBLIC (client-safe) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_APP_URL=

# === SERVER ONLY (secrets) ===
DATABASE_URL=
DIRECT_URL=                  # cho Prisma Migrate (bypass pooler)
SUPABASE_SERVICE_ROLE_KEY=
CLOUDINARY_API_SECRET=
VNPAY_TMN_CODE=
VNPAY_SECRET=
MOMO_PARTNER_CODE=
MOMO_SECRET=
RESEND_API_KEY=
CRON_SECRET=
```

**Quy ước**: server-only env KHÔNG có prefix `NEXT_PUBLIC_` — Vercel sẽ refuse expose.

---

## Liên kết

- Kiến trúc tổng thể: `01-kien-truc-tong-the.md`
- API contract: `03-api-contract.md`
- ADR: `decisions/`
- Code standard: `../04-phat-trien/01-quy-chuan-lap-trinh.md`
- Bảo mật chi tiết: `../04-phat-trien/04-bao-mat-xac-thuc.md`
