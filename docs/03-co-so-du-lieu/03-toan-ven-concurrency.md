# 03 — Toàn vẹn, Concurrency, Visibility

> **Vai trò đọc**: DBA, dev — biết DB tự bảo vệ data như thế nào và service layer cần phối hợp ra sao.
> **File này gộp 4 thứ**: 4 nguyên tắc DB của Vivu, integrity (CHECK/Zod), concurrency (lock), visibility (isActive + index conventions).

---

## 4 nguyên tắc DB của Vivu (N-01 → N-04)

Mọi quyết định schema phải tuân thủ. Code reviewer dùng làm checklist.

| # | Nguyên tắc | Hệ quả thực tế |
| --- | --- | --- |
| **N-01** | Polymorphic luôn dùng **Exclusive Arc + CHECK** | Không bao giờ dùng string slug làm reference đa hình. Mọi target có FK riêng + CHECK ép đúng 1 cột non-NULL |
| **N-02** | Mọi entity public-facing có **`isActive`** + tách method admin vs public | Không dùng `isPublished`/`isVisible` mỗi nơi mỗi khác. Service layer có `getActive*()` riêng cho public |
| **N-03** | Counter chia sẻ phải có **CHECK chặn overflow + locking** | DB-level safety net dù app có bug. Vd `TourDeparture.bookedCount <= maxParticipants` |
| **N-04** | **`onDelete`/`onUpdate` khai báo tường minh**, không dựa default Prisma | Self-documenting. Đọc lại 6 tháng sau không phải đoán |

---

## 1. Integrity — CHECK constraints toàn schema

### 1.1 Tour pricing (ADR-002)

```sql
-- Duration hợp lệ
ALTER TABLE tours ADD CONSTRAINT tours_duration_valid
  CHECK (duration_days >= 1 AND duration_nights >= 0 AND duration_nights <= duration_days);
```

### 1.2 TourDeparture counter (N-03)

```sql
-- Counter không âm
ALTER TABLE tour_departures ADD CONSTRAINT tour_departures_booked_count_non_negative
  CHECK (booked_count >= 0);

-- Không overbook
ALTER TABLE tour_departures ADD CONSTRAINT tour_departures_no_overbook
  CHECK (booked_count <= COALESCE(max_participants, booked_count));
```

### 1.3 TourBooking participants (ADR-002)

```sql
-- Số khách > 0
ALTER TABLE tour_bookings ADD CONSTRAINT tour_bookings_participants_positive
  CHECK (participants > 0);

-- Tổng = adults + children + infants
ALTER TABLE tour_bookings ADD CONSTRAINT tour_bookings_participants_consistency
  CHECK (participants = adults_count + children_count + infants_count);

-- Ít nhất 1 người lớn
ALTER TABLE tour_bookings ADD CONSTRAINT tour_bookings_at_least_one_adult
  CHECK (adults_count >= 1);
```

### 1.4 HotelAllotment (N-03)

```sql
-- Không over-use phòng đã contract
ALTER TABLE hotel_allotments ADD CONSTRAINT hotel_allotments_no_overuse
  CHECK (used_rooms + released_rooms <= contracted_rooms);

-- period_month luôn là ngày 1 của tháng
ALTER TABLE hotel_allotments ADD CONSTRAINT hotel_allotments_period_first_day
  CHECK (EXTRACT(DAY FROM period_month) = 1);
```

### 1.5 Review polymorphic (N-01)

```sql
ALTER TABLE reviews ADD CONSTRAINT reviews_target_exclusive
  CHECK (
    (reviewable_type = 'HOTEL' AND hotel_id IS NOT NULL AND tour_id IS NULL)
    OR
    (reviewable_type = 'TOUR'  AND tour_id IS NOT NULL AND hotel_id IS NULL)
  );

ALTER TABLE reviews ADD CONSTRAINT reviews_rating_range
  CHECK (rating BETWEEN 1 AND 5);
```

### 1.6 SeoPage polymorphic (N-01)

```sql
ALTER TABLE seo_pages ADD CONSTRAINT seo_pages_exclusive_target
  CHECK (
    -- Đúng 1 trong 4 cột non-NULL
    (CASE WHEN tour_id        IS NOT NULL THEN 1 ELSE 0 END
   + CASE WHEN destination_id IS NOT NULL THEN 1 ELSE 0 END
   + CASE WHEN hotel_id       IS NOT NULL THEN 1 ELSE 0 END
   + CASE WHEN custom_path    IS NOT NULL THEN 1 ELSE 0 END) = 1
    AND
    -- Khớp với targetType
    (
      (target_type = 'TOUR'        AND tour_id        IS NOT NULL)
      OR (target_type = 'DESTINATION' AND destination_id IS NOT NULL)
      OR (target_type = 'HOTEL'    AND hotel_id       IS NOT NULL)
      OR (target_type = 'STATIC'   AND custom_path    IS NOT NULL)
    )
  );
```

---

## 2. App-layer validation — Zod schemas (bổ trợ DB CHECK)

DB CHECK là rào chắn cuối. Zod ở service layer catch lỗi sớm + i18n message tốt hơn.

### 2.1 PriceBreakdown (TourBooking.priceBreakdown)

```typescript
import { z } from 'zod'

export const PriceBreakdownSchema = z.object({
  // Base
  adults: z.object({
    count: z.number().int().min(1),
    unitPrice: z.number().int().nonnegative(),
    subtotal: z.number().int().nonnegative(),
  }),
  children: z.object({
    count: z.number().int().nonnegative(),
    unitPrice: z.number().int().nonnegative(),
    subtotal: z.number().int().nonnegative(),
  }),
  infants: z.object({
    count: z.number().int().nonnegative(),
    unitPrice: z.number().int().nonnegative(),
    subtotal: z.number().int().nonnegative(),
  }),
  // Upsell options
  options: z.array(z.object({
    optionId: z.string().uuid(),
    nameSnapshot: z.string(),
    pricingUnit: z.enum(['PER_PAX', 'PER_BOOKING', 'PER_ROOM']),
    qty: z.number().int().positive(),
    priceDelta: z.number().int(),
    subtotal: z.number().int(),
  })),
  // Totals
  subtotal: z.number().int().nonnegative(),
  discount: z.number().int().nonnegative().default(0),
  total: z.number().int().nonnegative(),
  currency: z.literal('VND').default('VND'),
})

export type PriceBreakdown = z.infer<typeof PriceBreakdownSchema>
```

**Quy ước**: BookingService phải validate `priceBreakdown` bằng Zod TRƯỚC khi gọi `prisma.create`. Bug ở app sinh JSON sai sẽ trigger TypeError ngay, không lọt xuống DB.

### 2.2 Tour.policy (children + extra bed + cancellation)

```typescript
export const TourPolicySchema = z.object({
  children: z.object({
    ageGroups: z.object({
      infant:  z.object({ minAge: z.literal(0), maxAge: z.literal(4),  pricingPct: z.number().min(0).max(1) }),
      child:   z.object({ minAge: z.literal(5), maxAge: z.literal(11), pricingPct: z.number().min(0).max(1) }),
      adult:   z.object({ minAge: z.literal(12) }),
    }),
    extraBed: z.object({
      available: z.boolean(),
      surcharge: z.number().int().nonnegative().optional(),
    }),
  }),
  cancellation: z.object({
    tiers: z.array(z.object({
      daysBeforeDeparture: z.number().int().nonnegative(),
      refundPct: z.number().min(0).max(1),
    })),
  }),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
})
```

---

## 3. Concurrency strategy

### 3.1 Pessimistic lock — TourDeparture.bookedCount

**Hotspot duy nhất Phase 1.** Race condition: 2 khách book cùng departure khi còn 1 slot → cả 2 đọc `bookedCount=4, max=5` → cả 2 update lên `5` → overbook.

**Giải pháp**: `SELECT ... FOR UPDATE` trong transaction `Serializable`.

```typescript
async createTourBooking(input: CreateBookingInput) {
  return prisma.$transaction(async (tx) => {
    // 1. LOCK row TourDeparture
    const departure = await tx.$queryRaw<TourDeparture[]>`
      SELECT * FROM tour_departures
      WHERE id = ${input.departureId}::uuid
      FOR UPDATE
    `
    if (!departure[0]) throw new NotFoundError()

    // 2. Validate slot
    const remaining = (departure[0].maxParticipants ?? Infinity) - departure[0].bookedCount
    if (remaining < input.participants) {
      throw new DepartureFullError()
    }

    // 3. Increment counter (DB CHECK sẽ catch nếu app bug)
    await tx.tourDeparture.update({
      where: { id: input.departureId },
      data: { bookedCount: { increment: input.participants } },
    })

    // 4. Tạo Booking + TourBooking + Payment record
    return tx.booking.create({ ... })
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    timeout: 10_000,
  })
}
```

**Lưu ý quan trọng**:
- KHÔNG dùng `prisma.tourDeparture.findUnique` rồi `update` riêng — sẽ race.
- Transaction timeout 10s — đủ cho VNPay handshake không.
- Nếu Serializable conflict (40001) → retry 1 lần ở service layer.

### 3.2 Cron auto-cancel (payment hold 15 phút)

Booking PENDING không lên PAID trong 15 phút → cron release slot.

```sql
-- Query cron chạy mỗi 1 phút
SELECT id, payment_deadline
FROM bookings
WHERE status = 'PENDING'
  AND payment_deadline < NOW()
ORDER BY payment_deadline ASC
LIMIT 100;
```

Logic cancel (mỗi booking trong transaction riêng):
1. Lock booking + departure
2. Update `booking.status = 'CANCELLED'`
3. Decrement `departure.bookedCount` by `tour_booking.participants`
4. Log `ActivityLog`

**Indexes hỗ trợ**: `(status, payment_deadline) WHERE status = 'PENDING'` — partial cho cron query.

### 3.3 Hotel allotment — admin manual (no lock cần)

`HotelAllotment.usedRooms` chỉ admin update khi confirm booking → low contention, không cần pessimistic lock. CHECK `usedRooms + releasedRooms <= contractedRooms` catch overflow.

---

## 4. Visibility strategy — `isActive` cascade

### 4.1 Bảng nào có `isActive`

| Entity | `isActive` | Lý do |
| --- | :---: | --- |
| Region | ❌ | Seed cứng, không CRUD |
| Destination | ✅ | Public listing |
| Hotel | ✅ | Public listing |
| Room | ✅ | Hiển thị trong Hotel detail |
| Tour | ✅ | Public listing |
| TourOption | ✅ | Option có thể bật/tắt theo mùa |
| TourItinerary | ❌ | Thuộc Tour — visibility theo parent |
| TourDeparture | dùng `status` ENUM | AVAILABLE / FULL / CANCELLED |
| Booking, Payment, Review,... | ❌ | Không public-facing, không hide visibility |

### 4.2 Cascade hide — filter ở service layer

DB không tự động hide child khi parent `isActive=false` — service layer phải filter.

```typescript
class TourService {
  async findActiveTours() {
    return prisma.tour.findMany({
      where: {
        isActive: true,
        destination: { isActive: true }, // cascade hide
      },
      include: {
        itineraries: {
          include: {
            hotel: { where: { isActive: true } }, // hotel hide thì roomTypeNote vẫn show
          },
        },
      },
    })
  }
}
```

**Quy ước**: mọi service phải có 2 method tách bạch:
- `findActive*()` — cho public (filter `isActive: true` + cascade)
- `findAll*()` / `findForAdmin*()` — cho admin (không filter)

→ Detail patterns + edge cases ở `../04-phat-trien/01-quy-chuan-lap-trinh.md`.

### 4.3 Partial index convention

**Quy ước**: mọi index trên cờ `is_active` phải là **partial** `WHERE is_active = true`, KHÔNG full Boolean column.

**Lý do**:
- Production sẽ có 99%+ row `is_active = true` → index full Boolean có **selectivity rất thấp** → Postgres bỏ qua, dùng Seq Scan.
- Partial chỉ chứa active rows → nhỏ hơn nhiều, selectivity = 100% cho public query.

```sql
-- ĐÚNG
CREATE INDEX idx_tours_active_destination
  ON tours(destination_id)
  WHERE is_active = true;

-- SAI (planner sẽ ignore)
CREATE INDEX tours_is_active_idx ON tours(is_active);
```

**Naming pattern**: `idx_<table>_active[_<col>]` cho partial. KHÔNG dùng default `<table>_is_active_idx` (gây hiểu nhầm).

→ Migration `add_pricing_options_and_allotment` PART 10 convert old full indexes sang partial.

---

## 5. Type convention — UUID toàn schema (ADR-003)

**Quy ước**: mọi PK + FK ID column dùng PostgreSQL `UUID` type, KHÔNG `TEXT`. Prisma phải có `@db.Uuid`.

```prisma
// ĐÚNG
id      String   @id @default(uuid()) @db.Uuid
userId  String   @map("user_id") @db.Uuid

// SAI (sinh cột TEXT — silent issue, mismatch khi join auth.users)
id      String   @id @default(uuid())
userId  String   @map("user_id")
```

**Lý do**:
- Match Supabase `auth.users.id` (UUID native) — join trực tiếp không CAST.
- Index B-tree nhanh hơn ~30% so với TEXT.
- Storage 16 bytes vs 36 bytes.
- Type safety: PostgreSQL từ chối insert string không phải UUID format.

→ Migration alignment (TEXT → UUID cho schema cũ): xem **PART 0** trong `migrations/2026-05-27_add_pricing_options_and_allotment.md`.

---

## 6. Checklist code review (DB-related)

Mỗi PR đụng schema/migration phải có CTO/Tech Lead sign-off + check:

- [ ] Mọi `String @id` + FK ID có `@db.Uuid` (ADR-003)
- [ ] Mọi relation có `onDelete` + `onUpdate` tường minh (N-04)
- [ ] CHECK constraint mới được thêm có audit trong PR description
- [ ] Counter mới (nếu có) có CHECK chống overflow (N-03)
- [ ] Polymorphic mới (nếu có) đi Exclusive Arc + CHECK (N-01)
- [ ] `isActive` mới (nếu có) — partial index, không full column (N-02)
- [ ] Migration có audit pre-flight + rollback note (`04-quy-trinh-migration.md`)
- [ ] Service layer có `findActive*()` cho public, không inline filter `where: {isActive: true}` trong page

---

## Liên kết

- ERD overview: `01-erd-tong-quan.md`
- Spec bảng: `02-thiet-ke-bang.md`
- Quy trình migration: `04-quy-trinh-migration.md`
- Code standard: `../04-phat-trien/01-quy-chuan-lap-trinh.md`
- ADR: `../02-kien-truc/decisions/ADR-001`, `ADR-002`, `ADR-003`
