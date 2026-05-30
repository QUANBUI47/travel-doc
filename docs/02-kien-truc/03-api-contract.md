# 03 — API contract

> **Vai trò đọc**: dev viết Server Action / API route — biết convention request/response trước khi code.
> **Scope**: Phase 1 chỉ có Server Action (internal) + vài API route public (`/api/v1/payments/*/webhook`, `/api/v1/crons/*`).

---

## 1. Mô hình tổng

```
Browser
  │
  ├─► Server Action  (internal, RSC + Form submit)    [đa số mutation]
  │
  └─► API Route     (external/cron/webhook callable)
        ├─ /api/v1/payments/vnpay/checkout    (start payment)
        ├─ /api/v1/payments/vnpay/webhook     (VNPay → us)
        ├─ /api/v1/payments/momo/webhook
        ├─ /api/v1/upload                     (Cloudinary signed URL)
        └─ /api/v1/crons/*                    (Vercel cron)
```

**Quy ước**: ưu tiên Server Action cho mọi mutation từ UI mình. API route chỉ khi:
- Bên ngoài gọi vào (webhook)
- Cron job
- Cần REST cho mobile / future client

---

## 2. Server Action convention

### 2.1 Naming

- File: `app/<route>/actions.ts`
- Function: verb-first camelCase, đuôi `Action` cho rõ
  - `createBookingAction`, `updateTourAction`, `cancelBookingAction`

### 2.2 Signature

```typescript
'use server'

import { z } from 'zod'
import { safeAction } from '@/lib/safe-action'
import { bookingService } from '@/lib/services/booking.service'

const CreateBookingInput = z.object({
  tourId:        z.string().uuid(),
  departureId:   z.string().uuid(),
  adultsCount:   z.number().int().min(1),
  childrenCount: z.number().int().min(0),
  infantsCount:  z.number().int().min(0),
  selectedOptionIds: z.array(z.string().uuid()),
  guestName:  z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().min(8),
  notes: z.string().max(1000).optional(),
})

export async function createBookingAction(input: z.infer<typeof CreateBookingInput>) {
  return safeAction(async () => {
    const parsed = CreateBookingInput.parse(input)
    const user = await requireUser()  // throw UnauthorizedError nếu chưa login
    return bookingService.createTourBooking({ ...parsed, userId: user.id })
  })
}
```

### 2.3 Response shape

`safeAction` luôn wrap kết quả:
```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: any } }
```

Client xử lý:
```typescript
const result = await createBookingAction(payload)
if (!result.ok) {
  toast.error(result.error.message)
  return
}
router.push(`/payments/vnpay?bookingId=${result.data.id}`)
```

---

## 3. API Route convention

### 3.1 Versioning

- Path: `/api/v1/*` cho phase 1
- Breaking change → `v2` (Phase 2+)
- Phase 1 không expose public dev portal

### 3.2 Method semantics

| Method | Dùng cho |
| --- | --- |
| GET | Read |
| POST | Create / business action |
| PATCH | Partial update |
| PUT | Full replace (hiếm dùng) |
| DELETE | Delete (mostly soft delete via update isActive) |

### 3.3 Request format

Body JSON, Zod validate ở đầu handler.

```typescript
// app/api/v1/payments/vnpay/checkout/route.ts
const RequestSchema = z.object({
  bookingId: z.string().uuid(),
  returnUrl: z.string().url(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ ok: false, error: { code: 'VALIDATION', issues: parsed.error.issues } }, { status: 400 })
  }
  // ...
}
```

### 3.4 Response shape

**Success**:
```json
{ "ok": true, "data": { ... } }
```

**Error**:
```json
{
  "ok": false,
  "error": {
    "code": "DEPARTURE_FULL",
    "message": "Lịch khởi hành đã hết slot",
    "details": { "departureId": "..." }
  }
}
```

**HTTP status**:
- 200 — Success
- 400 — Validation error
- 401 — Not authenticated
- 403 — Not authorized
- 404 — Not found
- 422 — Business rule violation
- 500 — Internal error

### 3.5 Webhook idempotency

VNPay/MoMo có thể gọi lại webhook nhiều lần. Service phải:

```typescript
async function handleVnpayWebhook(payload: VnpayPayload) {
  if (!verifyVnpaySignature(payload)) throw new ForbiddenError()

  const payment = await prisma.payment.findUnique({
    where: { externalId: payload.vnp_TxnRef }
  })

  if (!payment) return // unknown payment, ignore
  if (payment.status === 'SUCCESS') return // already processed, idempotent

  await prisma.$transaction([
    prisma.payment.update({ where: { id: payment.id }, data: { status: 'SUCCESS' } }),
    prisma.booking.update({ where: { id: payment.bookingId }, data: { status: 'PAID' } }),
  ])

  // Send email confirm
  await emailService.sendBookingConfirm(payment.bookingId)
}
```

---

## 4. Pagination convention

| Param | Type | Default |
| --- | --- | --- |
| `page` | int | 1 |
| `pageSize` | int | 20 (max 100) |
| `sort` | string | `-createdAt` (`-` = desc) |
| `filter[*]` | string/array | per-endpoint |

Response:
```json
{
  "ok": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 156,
      "totalPages": 8
    }
  }
}
```

---

## 5. Filter convention (Tour list ví dụ)

```
GET /api/v1/tours?
  filter[destinationId]=<uuid>&
  filter[minPrice]=2000000&
  filter[maxPrice]=10000000&
  filter[durationDays]=3,5,7&
  filter[tags]=gia-dinh,bien&
  sort=-priceFrom&
  page=1&pageSize=20
```

Server Action equivalent:
```typescript
tourService.searchListings({
  destinationId: '...',
  minPrice: 2_000_000,
  maxPrice: 10_000_000,
  durationDays: [3, 5, 7],
  tags: ['gia-dinh', 'bien'],
  sort: '-priceFrom',
  page: 1, pageSize: 20,
})
```

---

## 6. Field naming

- JSON request/response: **camelCase** (`createdAt`, `priceAdult`)
- Don't expose `*_at` snake_case từ DB ra ngoài
- Service layer convert nếu cần

---

## 7. Date/Time format

| Loại | Format | Ví dụ |
| --- | --- | --- |
| Date only (date column) | ISO 8601 date | `2026-06-01` |
| DateTime | ISO 8601 with offset | `2026-06-01T08:00:00+07:00` |
| Money | Integer (VND nguyên) | `4500000` (không phải `4500000.00`) |

---

## 8. CORS

Phase 1 chỉ Vercel domain → không cần CORS open. Phase 2 mobile app → whitelist app scheme.

---

## 9. Versioning policy

| Thay đổi | Phải bump version? |
| --- | --- |
| Thêm endpoint mới | Không |
| Thêm field optional vào response | Không |
| Thêm field required vào request | Không (nếu có default) |
| Đổi tên field | **Có** (`v2`) |
| Đổi type field | **Có** (`v2`) |
| Đổi behavior endpoint | **Có** nếu break client |
| Xoá field | **Có** |

---

## Liên kết

- Kiến trúc tổng thể: `01-kien-truc-tong-the.md`
- Cross-cutting: `02-cross-cutting.md`
- Quy chuẩn code: `../04-phat-trien/01-quy-chuan-lap-trinh.md`
- Status transitions: `../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md`
