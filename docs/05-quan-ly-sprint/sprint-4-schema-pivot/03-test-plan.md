# Sprint 4 — Test Plan

> **Mục đích**: spec test cho từng story Sprint 4. Đọc trước khi code, viết test cùng code (TDD recommended).
>
> **Tools**: Vitest (unit + integration), Playwright (E2E), manual QA checklist cho UX subjective.

---

## Tổng quan

| Loại test | Coverage target | Tool | When |
| --- | --- | --- | --- |
| Unit | 100% cho `lib/tour/calculate-price.ts`, ≥80% services | Vitest | Mỗi story |
| Integration (DB) | Booking flow + Inquiry flow | Vitest + test DB | S4-04, S4-06 |
| E2E | Booking E2E + Inquiry E2E | Playwright | S4-05, S4-06 |
| Migration smoke | 10 case kiểm tra schema sau migrate | psql + manual | S4-01 |
| Manual QA | UX subjective (widget, form mobile) | Người thật | S4-05, S4-06 |
| Regression | Sprint 1-3 features không break | Playwright existing | S4-07 |

---

## Test infrastructure setup

> **Decision**: Test DB chạy trên **Docker Postgres local** (không dùng Supabase test schema). Lý do:
> - Không tốn tiền Supabase project riêng
> - Reset state nhanh (truncate qua `prisma migrate reset --force`)
> - Chạy được CI/CD GitHub Actions
> - Latency thấp (local socket)

### Setup file `docker-compose.test.yml`

```yaml
services:
  postgres-test:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
      POSTGRES_DB: vivu_test
    ports:
      - "5433:5432"
    tmpfs:
      - /var/lib/postgresql/data  # in-memory cho speed
```

### Setup `.env.test`

```bash
DATABASE_URL="postgresql://test:test@localhost:5433/vivu_test?schema=public"
DIRECT_URL="postgresql://test:test@localhost:5433/vivu_test"
NODE_ENV="test"
```

### Vitest config — `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import { config } from 'dotenv'

config({ path: '.env.test' })

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: ['./tests/global-setup.ts'],
    setupFiles: ['./tests/setup.ts'],
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
})
```

### Global setup — `tests/global-setup.ts`

```typescript
import { execSync } from 'node:child_process'

export async function setup() {
  execSync('docker-compose -f docker-compose.test.yml up -d postgres-test', { stdio: 'inherit' })
  execSync('pnpm prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
  })
  console.log('[test] DB ready')
}

export async function teardown() {
  execSync('docker-compose -f docker-compose.test.yml down', { stdio: 'inherit' })
}
```

### Per-test setup — `tests/setup.ts`

```typescript
import { afterEach, beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma'

beforeEach(async () => {
  await prisma.$transaction([
    prisma.payment.deleteMany(),
    prisma.tourBooking.deleteMany(),
    prisma.booking.deleteMany(),
    prisma.tourDeparture.deleteMany(),
    prisma.tourItinerary.deleteMany(),
    prisma.tourOption.deleteMany(),
    prisma.review.deleteMany(),
    prisma.tour.deleteMany(),
    prisma.room.deleteMany(),
    prisma.hotelAllotment.deleteMany(),
    prisma.hotel.deleteMany(),
    prisma.destination.deleteMany(),
    prisma.region.deleteMany(),
    prisma.inquiryRequest.deleteMany(),
    prisma.profile.deleteMany(),
  ])
})
```

### Test data factories — `tests/factories.ts`

```typescript
export const seedProfile = (overrides = {}) =>
  prisma.profile.create({
    data: { id: randomUUID(), role: 'USER', displayName: 'Test User', ...overrides },
  })

export const seedTour = (overrides = {}) =>
  prisma.tour.create({
    data: {
      id: randomUUID(), slug: `tour-${randomString(6)}`, nameVi: 'Tour test',
      durationDays: 3, tourType: 'SERIES',
      priceAdult: 5_000_000, priceChild: 3_500_000, priceInfant: 0,
      singleSupplementPrice: 2_000_000,
      isActive: true, ...overrides,
    },
  })

export const seedDeparture = (overrides) =>
  prisma.tourDeparture.create({
    data: {
      id: randomUUID(), startDate: new Date('2026-08-01'), endDate: new Date('2026-08-03'),
      maxParticipants: 20, bookedCount: 0, status: 'AVAILABLE', ...overrides,
    },
  })
```

> **Trade-off**: Docker Postgres ≠ Supabase exactly (RLS policy không có, extension pgcrypto cần init script). Đối với test integration ở mức service/repo, đây không phải vấn đề. RLS được test ở manual QA + E2E staging.

---

## 1. Migration smoke test (S4-01)

Chạy SAU khi `prisma migrate deploy` xong trên staging. Mỗi case copy-paste SQL vào Supabase SQL Editor.

### M-01 — UUID type conversion

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('id', 'user_id', 'tour_id', 'destination_id', 'hotel_id', 'booking_id');
```

**Pass**: tất cả `data_type = 'uuid'`. Pass = 0 row có `data_type = 'text'`.

### M-02 — New columns trên Tour

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tours';
```

**Pass**: có các cột `price_adult`, `price_child`, `price_infant`, `single_supplement_price`, `estimated_cost`, `tour_type`. KHÔNG có `price_from`, `duration_text`.

### M-03 — TourOption table

```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tour_options';
```

**Pass**: có columns `id`, `tour_id`, `name_vi`, `name_en`, `description`, `extra_price_adult`, `sort_order`. `tour_id` is NOT NULL.

### M-04 — InquiryRequest table

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'inquiry_requests';
```

**Pass**: có columns `id`, `name`, `email`, `phone`, `tour_type`, `participants`, `target_date`, `budget_min`, `budget_max`, `notes`, `status`, `internal_note`, `created_at`, `updated_at`.

### M-05 — HotelAllotment table

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'hotel_allotments';
```

**Pass**: có columns `id`, `hotel_id`, `period_month` (DATE type, không phải string), `room_count`, `note`.

### M-06 — HotelBooking dropped

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'hotel_bookings'
);
```

**Pass**: `false`.

### M-07 — Booking dropped fields

```sql
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'bookings';
```

**Pass**: KHÔNG có columns `booking_type`, `check_in`, `check_out`. CÓ column `payment_deadline` (timestamp).

### M-08 — CHECK constraints

```sql
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'c' AND connamespace = 'public'::regnamespace;
```

**Pass**: có ≥6 CHECK constraint với tên:
- `reviews_target_exclusive`
- `seo_pages_exclusive_target`
- `tour_departures_no_overbooking_check`
- `tour_bookings_participants_positive_check`
- `tours_pricing_positive_check`
- `hotel_allotments_period_first_day_check`

### M-09 — Partial indexes

```sql
SELECT indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND indexdef LIKE '%WHERE%is_active%';
```

**Pass**: có ≥3 partial index trên `destinations`, `tours`, `hotels` với `WHERE is_active = true`.

### M-10 — Cascade rules

```sql
SELECT
  tc.constraint_name,
  tc.table_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name IN ('bookings', 'reviews')
  AND tc.constraint_type = 'FOREIGN KEY';
```

**Pass**: `bookings_user_id_fkey` và `reviews_user_id_fkey` có `delete_rule = 'RESTRICT'` (không phải `CASCADE`).

---

## 2. Unit test — `calculatePrice()` (S4-04)

File: `lib/tour/__tests__/calculate-price.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { calculatePrice } from '../calculate-price'
import { Decimal } from '@prisma/client/runtime/library'

const baseTour = {
  priceAdult: new Decimal(5_000_000),
  priceChild: new Decimal(3_500_000),
  priceInfant: new Decimal(0),
  singleSupplementPrice: new Decimal(2_000_000),
}

describe('calculatePrice', () => {
  it('UC-01: 1 adult — basic', () => {
    const r = calculatePrice({ ...baseTour, adults: 1, children: 0, infants: 0 })
    expect(r.total.toNumber()).toBe(5_000_000)
    expect(r.breakdown).toMatchObject({
      adults: { count: 1, unitPrice: 5_000_000, subtotal: 5_000_000 },
    })
  })

  it('UC-02: 2 adults', () => {
    const r = calculatePrice({ ...baseTour, adults: 2, children: 0, infants: 0 })
    expect(r.total.toNumber()).toBe(10_000_000)
  })

  it('UC-03: 2 adults + 1 child', () => {
    const r = calculatePrice({ ...baseTour, adults: 2, children: 1, infants: 0 })
    expect(r.total.toNumber()).toBe(10_000_000 + 3_500_000)
  })

  it('UC-04: 2 adults + 1 child + 1 infant', () => {
    const r = calculatePrice({ ...baseTour, adults: 2, children: 1, infants: 1 })
    expect(r.total.toNumber()).toBe(10_000_000 + 3_500_000 + 0)
  })

  it('UC-05: 1 adult + single supplement', () => {
    const r = calculatePrice({
      ...baseTour, adults: 1, children: 0, infants: 0,
      isSingleSupplement: true,
    })
    expect(r.total.toNumber()).toBe(5_000_000 + 2_000_000)
  })

  it('UC-06: 2 adults + tour option (Deluxe +500k/adult)', () => {
    const option = {
      id: 'opt-deluxe', extraPriceAdult: new Decimal(500_000),
    }
    const r = calculatePrice({
      ...baseTour, adults: 2, children: 0, infants: 0, option,
    })
    expect(r.total.toNumber()).toBe(10_000_000 + 1_000_000)
    expect(r.breakdown.option).toMatchObject({
      id: 'opt-deluxe', count: 2, unitPrice: 500_000, subtotal: 1_000_000,
    })
  })

  it('UC-07: validation — adults must be ≥ 1', () => {
    expect(() =>
      calculatePrice({ ...baseTour, adults: 0, children: 1, infants: 0 })
    ).toThrow('VIVU_BOOKING_ADULTS_REQUIRED')
  })

  it('UC-08: validation — single supplement chỉ cho phép khi adults = 1', () => {
    expect(() =>
      calculatePrice({
        ...baseTour, adults: 2, children: 0, infants: 0,
        isSingleSupplement: true,
      })
    ).toThrow('VIVU_BOOKING_SINGLE_SUPPLEMENT_INVALID')
  })

  it('UC-09: precision — decimal multiplication không lose precision', () => {
    const tour = { ...baseTour, priceAdult: new Decimal(1_999_999) }
    const r = calculatePrice({ ...tour, adults: 3, children: 0, infants: 0 })
    expect(r.total.toString()).toBe('5999997')
  })

  it('UC-10: priceBreakdown JSON match Zod schema', () => {
    const r = calculatePrice({ ...baseTour, adults: 2, children: 1, infants: 0 })
    expect(priceBreakdownSchema.safeParse(r.breakdown).success).toBe(true)
  })
})
```

**Pass condition**: 10/10 test pass. Coverage `calculatePrice` 100%.

---

## 3. Integration test — BookingService (S4-04)

File: `services/__tests__/booking.service.test.ts`

Setup: dùng test DB (Docker Postgres local hoặc Supabase test schema), seed data trước mỗi test.

```typescript
describe('BookingService.createTourBooking', () => {
  beforeEach(async () => {
    await seedTour({
      id: 'tour-1',
      priceAdult: 5_000_000, priceChild: 3_500_000, priceInfant: 0,
      isActive: true,
    })
    await seedDeparture({
      id: 'dep-1', tourId: 'tour-1',
      maxParticipants: 20, bookedCount: 0, status: 'AVAILABLE',
    })
    await seedProfile({ id: 'user-1' })
  })

  it('IT-01: tạo booking 2 adults thành công', async () => {
    const b = await BookingService.createTourBooking({
      userId: 'user-1', tourId: 'tour-1', departureId: 'dep-1',
      adults: 2, children: 0, infants: 0,
      guestName: 'A', guestEmail: 'a@b.c', guestPhone: '0901234567',
    })
    expect(b.totalAmount.toNumber()).toBe(10_000_000)
    expect(b.status).toBe('PENDING')
    expect(b.paymentDeadline).toBeInstanceOf(Date)

    const dep = await prisma.tourDeparture.findUnique({ where: { id: 'dep-1' } })
    expect(dep?.bookedCount).toBe(2)
  })

  it('IT-02: từ chối khi không đủ slot', async () => {
    await prisma.tourDeparture.update({
      where: { id: 'dep-1' },
      data: { bookedCount: 19 },
    })
    await expect(
      BookingService.createTourBooking({
        userId: 'user-1', tourId: 'tour-1', departureId: 'dep-1',
        adults: 2, children: 0, infants: 0,
        guestName: 'A', guestEmail: 'a@b.c', guestPhone: '0901',
      })
    ).rejects.toThrow('VIVU_BOOKING_NOT_ENOUGH_SLOTS')
  })

  it('IT-03: concurrent 2 request — chỉ 1 thành công', async () => {
    await prisma.tourDeparture.update({
      where: { id: 'dep-1' },
      data: { maxParticipants: 1, bookedCount: 0 },
    })
    const [r1, r2] = await Promise.allSettled([
      BookingService.createTourBooking({ /* … 1 adult */ }),
      BookingService.createTourBooking({ /* … 1 adult */ }),
    ])
    const ok = [r1, r2].filter(r => r.status === 'fulfilled').length
    const fail = [r1, r2].filter(r => r.status === 'rejected').length
    expect(ok).toBe(1)
    expect(fail).toBe(1)
  })

  it('IT-04: priceBreakdown JSON đúng format', async () => {
    const b = await BookingService.createTourBooking({
      userId: 'user-1', tourId: 'tour-1', departureId: 'dep-1',
      adults: 2, children: 1, infants: 0,
      guestName: 'A', guestEmail: 'a@b.c', guestPhone: '0901',
    })
    const tb = await prisma.tourBooking.findUnique({ where: { bookingId: b.id } })
    expect(tb?.priceBreakdown).toMatchObject({
      adults: { count: 2, unitPrice: 5_000_000, subtotal: 10_000_000 },
      children: { count: 1, unitPrice: 3_500_000, subtotal: 3_500_000 },
    })
  })

  it('IT-05: paymentDeadline = now + 15 min', async () => {
    const before = new Date()
    const b = await BookingService.createTourBooking({ /* 1 adult */ })
    const expected = new Date(before.getTime() + 15 * 60 * 1000)
    expect(b.paymentDeadline.getTime()).toBeCloseTo(expected.getTime(), -3) // ±1s
  })
})

describe('BookingService.cancelTourBooking', () => {
  it('IT-06: hủy booking PENDING → trả lại slot', async () => {
    const b = await BookingService.createTourBooking({ /* 2 adults */ })
    await BookingService.cancelTourBooking(b.id)
    const dep = await prisma.tourDeparture.findUnique({ where: { id: 'dep-1' } })
    expect(dep?.bookedCount).toBe(0)
  })
})
```

---

## 4. E2E test — Booking flow (S4-05)

File: `tests/e2e/booking-pattern-c.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test('User books tour with 2 adults + 1 child + Deluxe option', async ({ page }) => {
  await page.goto('/dang-nhap')
  await page.fill('[name=email]', 'test@vivu.local')
  await page.fill('[name=password]', 'Test123!')
  await page.click('button[type=submit]')

  await page.goto('/tours/ha-noi-sapa-3n2d')
  await page.click('text=Đặt ngay')

  await expect(page.locator('[data-testid=booking-widget]')).toBeVisible()

  await page.click('[data-testid=adults-plus]')
  await page.click('[data-testid=children-plus]')

  await page.click('[data-testid=option-deluxe]')

  await expect(page.locator('[data-testid=total-amount]')).toHaveText('14.500.000 ₫')

  await page.click('text=Tiếp tục')

  await expect(page).toHaveURL(/\/dat-tour\/.+\/thanh-toan/)
  await expect(page.locator('[data-testid=payment-deadline]')).toContainText('15 phút')
})

test('Single user with single supplement', async ({ page }) => {
})
```

---

## 5. E2E test — Inquiry flow (S4-06)

```typescript
test('Visitor submits inquiry for private tour', async ({ page }) => {
  await page.goto('/lien-he-doan-rieng')

  await page.fill('[name=name]', 'Nguyễn Văn A')
  await page.fill('[name=email]', 'a@example.com')
  await page.fill('[name=phone]', '0901234567')
  await page.fill('[name=participants]', '15')
  await page.fill('[name=targetDate]', '2026-08-15')
  await page.selectOption('[name=tourType]', 'CORPORATE')
  await page.fill('[name=budgetMin]', '50000000')
  await page.fill('[name=budgetMax]', '100000000')
  await page.fill('[name=notes]', 'Đoàn 15 người, công ty IT, đi Đà Nẵng 4N3Đ')

  await page.click('text=Gửi yêu cầu')

  await expect(page.locator('[role=alert]')).toContainText('Yêu cầu đã gửi')

  await loginAsAdmin(page)
  await page.goto('/portal/inquiries')
  await expect(page.locator('text=Nguyễn Văn A')).toBeVisible()
  await expect(page.locator('text=NEW')).toBeVisible()
})
```

---

## 6. Manual QA checklist

### Booking widget UX (S4-05)

Chạy với 3 người: founder + 2 user thật (bạn bè).

- [ ] Hiểu ngay tăng/giảm số người bằng nút +/-
- [ ] Total update không lag (<200ms)
- [ ] Phân biệt được người lớn / trẻ em / em bé (có hint tuổi)
- [ ] Hiểu single supplement nghĩa là gì (có icon/giải thích)
- [ ] Nhìn breakdown rõ ràng — biết tiền đến từ đâu
- [ ] Mobile (iPhone SE 375px): không scroll ngang, button đủ to
- [ ] Mobile (iPhone 12 Pro 390px): cùng test
- [ ] Tablet (iPad 768px): layout không vỡ
- [ ] Desktop 1440px: widget không quá rộng
- [ ] Disabled state khi hết slot rõ ràng
- [ ] Error message khi vượt slot dễ hiểu
- [ ] CTA "Đặt ngay" / "Tiếp tục" rõ ràng phân biệt

### Inquiry form UX (S4-06)

- [ ] Form không quá dài (< 8 fields visible)
- [ ] Validation message inline (không Snackbar)
- [ ] Date picker mobile native
- [ ] Budget range slider intuitive
- [ ] hCaptcha không annoying
- [ ] Success message sau submit rõ + có CTA tiếp theo (về home / xem tour)

---

## 7. Regression test (S4-07)

Đảm bảo Sprint 1-3 không break sau pivot.

| Feature | Test | Pass condition |
| --- | --- | --- |
| Sprint 1 Auth | Đăng ký + đăng nhập + quên pw | All flow OK |
| Sprint 1 Auth Google | Login Google → callback → profile sync | OK |
| Sprint 2 Destination CRUD | Admin tạo + sửa + xoá destination | OK, image upload OK |
| Sprint 2 Cloudinary | Upload 5 ảnh gallery | All thumbnail OK |
| Sprint 2 Home Builder | Edit homepage section + save | OK |
| Sprint 2 Sitemap | `/sitemap.xml` accessible + valid XML | OK |
| Sprint 3 Tour CRUD | Admin tạo tour → public hiển thị | Sau pivot: 4 giá field OK |
| Sprint 3 Tour search | `/tours?q=ha+noi` filter | OK |
| Existing destination detail | `/diem-den/[slug]` | Render OK |

Chạy bằng Playwright suite hiện có hoặc manual nếu chưa.

---

## 8. Performance benchmark (post-migration)

| Metric | Trước (baseline) | Sau (target) |
| --- | --- | --- |
| `/tours` first load | ___ms | ≤ trước (partial index expect cải thiện) |
| `/tours/[slug]` | ___ms | ≤ trước |
| Admin booking list | ___ms | ≤ trước |
| `createTourBooking` (single request) | ___ms | ≤ 500ms |
| `createTourBooking` (concurrent 10) | ___ms | 100% serialize, không deadlock |

### Procedure đo baseline (chạy TRƯỚC migration)

**Bước 1 — Lighthouse public pages** (Day 0):

```bash
# Cài Lighthouse CI
pnpm add -D @lhci/cli

# Chạy 3 lần, lấy median
lhci collect --url=https://vivu-travel.com/tours --numberOfRuns=3
lhci collect --url=https://vivu-travel.com/tours/<sample-slug> --numberOfRuns=3
lhci collect --url=https://vivu-travel.com/diem-den --numberOfRuns=3
```

Save report vào `tests/baseline/lighthouse-pre-migration-<date>.json`.

**Bước 2 — Admin pages** (login required):

Manual với DevTools Performance tab:
- Mở `/portal/bookings` → record 5s → note "Largest Contentful Paint"
- Mở `/portal/tours` → tương tự

Save vào `tests/baseline/admin-perf-pre.md`.

**Bước 3 — API/Service request** (optional, nice-to-have):

K6 simple script `tests/k6/booking-create.js`:

```javascript
import http from 'k6/http'
import { check } from 'k6'

export const options = {
  vus: 10, duration: '30s',
}

export default function () {
  const res = http.post('https://vivu-travel.com/api/v1/bookings/test', {
    tourId: '...', departureId: '...', participants: 1, /* ... */
  })
  check(res, { 'status is 200': r => r.status === 200 })
}
```

Chạy: `k6 run tests/k6/booking-create.js > tests/baseline/k6-pre.txt`.

**Bước 4 — Database query plans** (most important):

```sql
EXPLAIN ANALYZE
SELECT * FROM tours
WHERE is_active = true AND destination_id = '<sample-uuid>'
ORDER BY created_at DESC LIMIT 20;
```

Save plan vào `tests/baseline/query-plans-pre.sql`.

### Procedure đo sau migration (Day 3 sau S4-01)

Lặp lại 4 bước trên trên prod sau migration. Save vào `tests/baseline/<file>-post-migration-<date>`.

### Pass condition

- Lighthouse score giảm ≤ 5 điểm (post vs pre) cho 3 page chính
- LCP admin pages tăng ≤ 200ms
- K6 p95 latency tăng ≤ 100ms
- Query plan: `tours` query dùng `idx_tours_active_destination` partial index (chứ không phải full scan)

Nếu fail: investigate trong 24h, có thể cần thêm index hoặc rollback (extreme case).

---

## Liên kết

- Stories: `01-stories.md`
- Runbook: `02-runbook.md`
- Test pyramid + tools: `../../04-phat-trien/03-testing.md`
