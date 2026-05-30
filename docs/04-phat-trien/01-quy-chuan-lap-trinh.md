# 01 — Quy chuẩn lập trình

> **Vai trò đọc**: dev — biết code Vivu viết theo style nào, lint check gì, naming ra sao.
> **Quy tắc**: PR vi phạm các rule cứng (đánh dấu 🔴) sẽ bị reject. Rule mềm (🟡) là khuyến nghị.

---

## 1. Stack

- TypeScript (strict mode)
- Next.js 15 App Router (RSC mặc định, Client Component khi cần)
- Prisma ORM
- Zod validation
- Tailwind CSS + shadcn/ui
- ESLint (Next.js preset) + Prettier
- pnpm workspace

---

## 2. Quy ước thư mục

```
travel-web/
├── app/
│   ├── (public)/
│   ├── portal/
│   ├── api/v1/
│   └── middleware.ts
├── src/
│   ├── components/
│   │   ├── ui/                 (shadcn/ui primitives)
│   │   ├── tour/               (TourCard, TourFilter, ...)
│   │   ├── booking/
│   │   └── admin/
│   ├── lib/
│   │   ├── services/           (TourService, BookingService, ...)
│   │   ├── schemas/            (Zod schemas)
│   │   ├── errors.ts
│   │   ├── safe-action.ts
│   │   ├── prisma.ts           (singleton Prisma Client)
│   │   ├── supabase/           (server + browser client)
│   │   └── utils/              (formatPrice, formatDuration, ...)
│   └── types/                  (shared TypeScript types)
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── messages/
│   ├── vi.json
│   └── en.json
└── public/
```

---

## 3. Naming convention

### 3.1 Files

| Loại | Convention | Ví dụ |
| --- | --- | --- |
| Component | PascalCase | `TourCard.tsx`, `BookingForm.tsx` |
| Service | kebab-case + `.service.ts` | `tour.service.ts`, `booking.service.ts` |
| Schema (Zod) | kebab-case + `.schema.ts` | `booking-form.schema.ts` |
| Utility | kebab-case | `format-price.ts`, `format-duration.ts` |
| Action | `actions.ts` cùng folder với page | `app/(public)/tours/[slug]/actions.ts` |
| API route | `route.ts` | `app/api/v1/payments/vnpay/webhook/route.ts` |
| Test | cùng tên + `.test.ts` | `booking.service.test.ts` |

### 3.2 TypeScript

| Loại | Convention | Ví dụ |
| --- | --- | --- |
| Variable / function | camelCase | `getUserTours`, `createBooking` |
| Type / interface | PascalCase | `Tour`, `BookingInput`, `PriceBreakdown` |
| Constant | UPPER_SNAKE | `PAYMENT_DEADLINE_MS`, `MAX_PARTICIPANTS` |
| Enum value | UPPER_SNAKE | `BookingStatus.PENDING`, `RoomType.STANDARD` |
| Server Action | `verb-firstAction` | `createBookingAction`, `cancelBookingAction` |

### 3.3 Database (xem `../03-co-so-du-lieu/02-thiet-ke-bang.md`)

- Model: PascalCase (`Tour`, `TourDeparture`)
- Field code: camelCase + `@map("snake_case")`
- Table name: snake_case plural
- FK field: `<entity>Id`
- ID: `@db.Uuid` (ADR-003)

---

## 4. Service layer rules (🔴 cứng)

### 4.1 Không gọi Prisma trực tiếp từ page/component

```typescript
// ❌ SAI — page gọi Prisma
export default async function ToursPage() {
  const tours = await prisma.tour.findMany({ where: { isActive: true } })
  return <TourList tours={tours} />
}

// ✅ ĐÚNG — qua service
export default async function ToursPage() {
  const tours = await tourService.findActiveTours()
  return <TourList tours={tours} />
}
```

### 4.2 Mọi service public method có 2 biến thể

```typescript
class TourService {
  // Cho public (filter isActive)
  async findActiveTours(filter?: TourFilter): Promise<Tour[]> { ... }
  async findActiveBySlug(slug: string): Promise<Tour | null> { ... }

  // Cho admin (không filter)
  async findAllForAdmin(filter?: TourFilter): Promise<Tour[]> { ... }
  async findByIdForAdmin(id: string): Promise<Tour | null> { ... }
}
```

### 4.3 Service throw class error, không throw string

```typescript
// ❌ SAI
if (!tour) throw new Error('Tour not found')

// ✅ ĐÚNG
if (!tour) throw new NotFoundError('Tour', tourId)
```

### 4.4 Mutation phải log ActivityLog

```typescript
async createTour(input: CreateTourInput, userId: string) {
  const tour = await prisma.tour.create({ data: input })
  await activityLogService.log({
    userId,
    action: 'CREATE_TOUR',
    entity: 'Tour',
    entityId: tour.id,
    details: { name: tour.nameVi },
  })
  return tour
}
```

### 4.5 Transaction boundary trong service, không trong page

```typescript
// ✅ Service quản transaction
async createTourBooking(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    // lock, validate, create, update
  }, { isolationLevel: 'Serializable', timeout: 10_000 })
}
```

---

## 5. Validation rules (🔴 cứng)

### 5.1 Mọi input từ ngoài → Zod parse trước khi service

```typescript
// Server Action
const Schema = z.object({ ... })

export async function createBookingAction(input: unknown) {
  return safeAction(async () => {
    const parsed = Schema.parse(input)  // throw ValidationError nếu fail
    return bookingService.createTourBooking(parsed)
  })
}
```

### 5.2 Service nhận DTO đã typed, không parse lại

```typescript
// Service signature dùng z.infer<>
type CreateBookingInput = z.infer<typeof CreateBookingSchema>

class BookingService {
  async createTourBooking(input: CreateBookingInput) { ... }
}
```

### 5.3 DB CHECK là rào chắn cuối — service catch lỗi business RỒI

```typescript
async createTourBooking(input: CreateBookingInput) {
  if (input.adultsCount < 1) {
    throw new BusinessError('At least 1 adult required', { i18nKey: 'booking.adultRequired' })
  }
  // DB CHECK `adults_count >= 1` chỉ catch khi app bug
}
```

---

## 6. Visibility rules (🔴 cứng)

### 6.1 Public route: chỉ trả `isActive=true` entities

```typescript
// ❌ SAI — page filter inline
const tours = await prisma.tour.findMany({ where: { isActive: true } })

// ✅ ĐÚNG — service đã filter
const tours = await tourService.findActiveTours()
```

### 6.2 Cascade hide

Service `findActiveTours()` phải:
```typescript
return prisma.tour.findMany({
  where: {
    isActive: true,
    destination: { isActive: true },  // cascade hide
  },
})
```

→ Chi tiết: `../03-co-so-du-lieu/03-toan-ven-concurrency.md` mục Visibility.

---

## 7. Money handling (🔴 cứng)

### 7.1 Decimal là `Prisma.Decimal`, không Number

```typescript
import { Prisma } from '@prisma/client'

const price = new Prisma.Decimal(4_500_000)
const total = price.times(participants)  // Decimal × number
```

### 7.2 Display: dùng util `formatPrice()`

```typescript
import { formatPrice } from '@/lib/utils/format-price'

<p>{formatPrice(tour.priceAdult)}</p>  // "4.500.000 ₫"
```

### 7.3 KHÔNG dùng `parseFloat` / `Number` cho money

```typescript
// ❌ SAI — mất precision với số lớn
const total = Number(tour.priceAdult) * participants

// ✅ ĐÚNG
const total = new Prisma.Decimal(tour.priceAdult).times(participants)
```

---

## 8. Date/time handling (🔴 cứng)

### 8.1 Timezone

- Server lưu `TIMESTAMPTZ` (UTC)
- Client display theo timezone Việt Nam (`Asia/Ho_Chi_Minh`) bằng `date-fns-tz`
- `Date` column (vd `TourDeparture.startDate`, `HotelAllotment.periodMonth`) không có timezone

### 8.2 Date library: `date-fns` (không moment)

```typescript
import { format, addMinutes, differenceInDays } from 'date-fns'
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

const VN_TZ = 'Asia/Ho_Chi_Minh'
const startDateLocal = utcToZonedTime(departure.startDate, VN_TZ)
```

### 8.3 `paymentDeadline` luôn UTC

```typescript
const paymentDeadline = addMinutes(new Date(), 15)  // UTC
await prisma.booking.create({ data: { ..., paymentDeadline } })
```

---

## 9. Error handling rules (🔴 cứng)

→ Chi tiết: `../02-kien-truc/02-cross-cutting.md` mục Error handling.

- Mọi error class extend `DomainError`
- Server Action wrap bằng `safeAction()`
- Client xử lý `result.ok === false` rồi toast `result.error.message`
- KHÔNG throw raw `Error('...')` từ service

---

## 10. Testing

### Phase 1 — minimum

- **Unit test** cho service quan trọng (BookingService, PaymentService, InquiryService)
- **Integration test** cho booking flow happy path
- E2E test (Playwright) defer Phase 1.5

### Test convention

```typescript
// src/lib/services/booking.service.test.ts
import { describe, it, expect } from 'vitest'

describe('BookingService.createTourBooking', () => {
  it('throws DepartureFullError when bookedCount + participants > max', async () => {
    // arrange, act, expect
  })

  it('increments bookedCount atomically with pessimistic lock', async () => {
    // ...
  })
})
```

---

## 11. Git & PR

- Branch name: `feat/<sprint>-<short-desc>` (vd `feat/sprint4-booking-flow`)
- Commit message: imperative, English, không past tense
- PR template: link sprint task + checklist (lint pass, tests pass, doc updated)
- 1 PR ≤ 500 dòng diff (review dễ)
- Schema/migration PR phải có Tech Lead sign-off (xem checklist `../03-co-so-du-lieu/03-toan-ven-concurrency.md` mục 6)

→ Chi tiết: `02-quy-trinh-git.md`.

---

## 12. Comment policy 🟡

- Comment giải thích **why**, không comment **what**
- Tránh narrate code (`// Increment counter`, `// Loop array`)
- Note edge case + business rule trace BR-XX là OK
- TODO/FIXME có ngày + người + ticket: `// TODO(2026-06-15, @khoa, SPR4-23): xử lý refund partial`

---

## 13. Anti-pattern tránh

| Anti-pattern | Hệ quả | Đúng |
| --- | --- | --- |
| `as any` | Mất type safety | Dùng `unknown` + narrowing |
| `try/catch` swallow | Bug ẩn | Re-throw hoặc log + return error result |
| `findFirst` không có `where` | Lấy random row | Dùng `findUnique` với key |
| Update mà không có `where` | Update toàn bảng | DB safety net + dev review |
| `prisma.$queryRawUnsafe` với user input | SQL injection | `$queryRaw` tagged template |
| Service gọi service khác | Tight coupling | Move logic chung ra util |
| Mix server + client code 1 file | Bundle bloat | Tách `'use server'` / `'use client'` rõ |

---

## Liên kết

- Quy trình Git: `02-quy-trinh-git.md`
- Testing: `03-testing.md`
- Bảo mật: `04-bao-mat-xac-thuc.md`
- DB integrity rules: `../03-co-so-du-lieu/03-toan-ven-concurrency.md`
- API contract: `../02-kien-truc/03-api-contract.md`
