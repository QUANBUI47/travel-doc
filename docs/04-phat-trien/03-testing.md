# 03 — Testing

> **Vai trò đọc**: dev — biết viết test cho service, action, component theo convention Vivu.

---

## 1. Pyramid testing

```
              ┌───────────────┐
              │  E2E (defer)  │   Playwright — Phase 1.5
              │      ~5%      │
              └───────────────┘
            ┌───────────────────┐
            │   Integration     │   Test service + Prisma (test DB)
            │       ~25%        │
            └───────────────────┘
        ┌───────────────────────────┐
        │       Unit tests          │   Vitest — util, schema, service logic
        │           ~70%            │
        └───────────────────────────┘
```

---

## 2. Tools

| Layer | Tool | Lý do |
| --- | --- | --- |
| Unit + Integration | **Vitest** | Fast, ESM native, compatible với Jest API |
| Mock | Vitest `vi.mock()` + `vi.fn()` | Built-in |
| Test DB | Postgres test container hoặc separate Supabase project | Phase 1: dùng Supabase test instance |
| E2E (Phase 1.5+) | Playwright | Cross-browser, parallel |

---

## 3. Unit test — Service logic

### 3.1 Cấu trúc

```typescript
// src/lib/services/booking.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BookingService } from './booking.service'
import { prisma } from '@/lib/prisma'
import { DepartureFullError } from '@/lib/errors'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    booking: { create: vi.fn() },
    tourDeparture: { update: vi.fn() },
  },
}))

describe('BookingService.createTourBooking', () => {
  beforeEach(() => vi.resetAllMocks())

  it('throws DepartureFullError when bookedCount + participants > max', async () => {
    // arrange
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback({
        $queryRaw: vi.fn().mockResolvedValue([{ bookedCount: 18, maxParticipants: 20 }]),
      })
    )

    // act + expect
    await expect(
      bookingService.createTourBooking({ ...validInput, participants: 5 })
    ).rejects.toThrow(DepartureFullError)
  })

  it('increments bookedCount atomically with pessimistic lock', async () => {
    // ...
  })
})
```

### 3.2 Coverage target Phase 1

| Module | Coverage target | Lý do |
| --- | --- | --- |
| BookingService | **≥90%** | Critical revenue path |
| PaymentService | **≥85%** | External integration, idempotency |
| InquiryService | ≥80% | Workflow phức tạp |
| TourService | ≥70% | Mainly CRUD |
| Util functions (`formatPrice`, `formatDuration`) | **100%** | Pure functions |
| Component | ≥40% Phase 1 (focus visual + UX manual) | Component tests rất expensive |

---

## 4. Integration test — Service + DB

### 4.1 Setup test DB

```typescript
// vitest.setup.ts
import { execSync } from 'child_process'
import { beforeAll, afterAll } from 'vitest'

beforeAll(() => {
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL }
  })
})

afterAll(async () => {
  // Truncate all tables
  await testPrisma.$executeRaw`TRUNCATE TABLE bookings, tour_bookings, payments CASCADE`
})
```

### 4.2 Test isolation — transaction rollback

```typescript
import { prisma } from '@/lib/prisma'

describe('TourService (integration)', () => {
  let tx: PrismaTransactionClient

  beforeEach(async () => {
    // Start transaction, không commit
    await new Promise((resolve) => {
      prisma.$transaction(async (txClient) => {
        tx = txClient
        resolve(null)
        await new Promise(() => {})  // pend forever
      }).catch(() => {})
    })
  })

  afterEach(async () => {
    // Transaction sẽ auto-rollback
  })

  it('creates tour with valid data', async () => {
    const tour = await tx.tour.create({ data: validTour })
    expect(tour.id).toBeDefined()
  })
})
```

> Note: Phase 1 dùng cách simpler — truncate after each test (chậm hơn nhưng đơn giản).

---

## 5. Test Server Action

```typescript
// app/(public)/tours/[slug]/actions.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createBookingAction } from './actions'

vi.mock('@/lib/services/booking.service', () => ({
  bookingService: { createTourBooking: vi.fn() },
}))

describe('createBookingAction', () => {
  it('returns ok=false for invalid input', async () => {
    const result = await createBookingAction({ /* missing fields */ })
    expect(result.ok).toBe(false)
    expect(result.error.code).toBe('VALIDATION')
  })

  it('calls bookingService and returns ok=true', async () => {
    vi.mocked(bookingService.createTourBooking).mockResolvedValue({ id: 'b1', ... })
    const result = await createBookingAction(validInput)
    expect(result.ok).toBe(true)
    expect(result.data.id).toBe('b1')
  })
})
```

---

## 6. Test data factory

```typescript
// src/test/factories/tour.factory.ts
import { Tour } from '@prisma/client'

let counter = 0

export function makeTour(overrides: Partial<Tour> = {}): Tour {
  counter++
  return {
    id: `tour-${counter}`,
    slug: `tour-${counter}`,
    nameVi: `Tour Test ${counter}`,
    priceAdult: new Prisma.Decimal(4_500_000),
    durationDays: 4,
    durationNights: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    // ... other defaults
    ...overrides,
  }
}
```

Sử dụng:
```typescript
const tour = makeTour({ priceAdult: new Prisma.Decimal(6_000_000) })
```

---

## 7. Snapshot testing — defer

Vivu **không dùng snapshot test** ở Phase 1 vì:
- Dễ bị "approve blindly"
- UI thay đổi nhiều ở Phase 1 → snapshot rotten
- Component test manual + visual review (Storybook Phase 1.5 nếu cần)

---

## 8. Critical test scenarios Phase 1

### Sprint 4 — Booking (highest priority)

- [ ] Race condition: 2 concurrent booking cùng slot cuối → 1 win + 1 throw
- [ ] Payment webhook duplicate → idempotent (status SUCCESS chỉ 1 lần)
- [ ] Payment timeout → cron cancel + decrement bookedCount
- [ ] Admin cancel CONFIRMED booking → decrement bookedCount + email
- [ ] PriceBreakdown computation đúng cho mọi combination (adult/child/infant + options)
- [ ] CHECK constraint catch khi service bug (participants ≠ sum, adultsCount < 1)

### Sprint 5 — Review

- [ ] Chỉ user có Booking COMPLETED mới insert được Review
- [ ] Exclusive arc CHECK constraint reject khi hotelId + tourId cùng non-NULL
- [ ] Rating 1-5 enforce

### Sprint 6 — SEO + Performance

- [ ] Sitemap XML render đúng tất cả URL public
- [ ] Lighthouse score >90 cho trang home, list, detail
- [ ] OG image dynamic render đúng tour name + image

---

## 9. Test naming convention

```typescript
// ❌ Vague
it('works', () => { ... })
it('test booking', () => { ... })

// ✅ Mô tả behavior
it('throws DepartureFullError when bookedCount + participants > max', () => { ... })
it('returns booking with PENDING status and paymentDeadline = createdAt + 15min', () => { ... })
```

Format: `<subject> <expected behavior> when <condition>`.

---

## 10. CI/CD test pipeline

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - run: pnpm build   # Verify build OK trước merge
```

Required check trước merge `main`:
- Lint pass
- TypeCheck pass
- Test pass + coverage không giảm
- Build pass

---

## Liên kết

- Quy chuẩn code: `01-quy-chuan-lap-trinh.md`
- Quy trình Git: `02-quy-trinh-git.md`
- Bảo mật: `04-bao-mat-xac-thuc.md`
- Critical test scenarios → trace sprint folder `../05-quan-ly-sprint/`
