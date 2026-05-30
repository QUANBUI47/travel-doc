# ADR-002: Pricing Pattern C — Per-pax + Service Tier Upsell

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder + Tech Lead

---

## Context

Schema ban đầu chỉ có `Tour.priceFrom` (Decimal) — quá đơn giản, không cover được thực tế tour Việt Nam:

- Tour gia đình 2 adult + 1 child + 1 infant — giá khác nhau
- Khách đi 1 mình muốn phòng đơn → phụ thu
- Khách muốn upgrade phòng Standard → Deluxe
- Khách muốn thêm dịch vụ (bảo hiểm, đưa đón sân bay riêng)

Industry phổ biến có 4 pattern pricing:
- **A. Single price** — chỉ 1 giá, không phân biệt độ tuổi
- **B. Per-pax simple** — adult/child/infant 3 giá
- **C. Per-pax + service tier** — như B + upsell options (room upgrade, single supplement, add-on)
- **D. Dynamic pricing** — giá thay đổi theo cao điểm/thấp điểm + demand

---

## Decision

**Phase 1 dùng Pattern C** — per-pax 3 tier + upsell qua `TourOption`. Pattern D (dynamic) defer Phase 2.

### Schema changes

```prisma
model Tour {
  priceAdult        Decimal   @db.Decimal(14, 0)  // NOT NULL ≥12 tuổi
  priceChild        Decimal?  @db.Decimal(14, 0)  // 5-11, null = "Liên hệ"
  priceInfant       Decimal?  @db.Decimal(14, 0)  // 0-4, default 0 = free
  singleSupplement  Decimal?  @db.Decimal(14, 0)  // null = không cho 1 người
  priceFrom         Decimal?  @db.Decimal(14, 0)  // listing display (= priceAdult thường)
  options           TourOption[]
}

model TourOption {
  type         TourOptionType   // ROOM_UPGRADE | SINGLE_SUPPLEMENT | EXTRA_BED | SERVICE_ADDON
  priceDelta   Decimal          // có thể âm cho discount
  pricingUnit  PricingUnit      // PER_PAX | PER_BOOKING | PER_ROOM
  // ...
}

model TourBooking {
  adultsCount    Int  @default(1)
  childrenCount  Int  @default(0)
  infantsCount   Int  @default(0)
  participants   Int  // = adults + children + infants (CHECK enforce)
  priceBreakdown Json // snapshot tính tiền
}
```

### Tính giá

```typescript
baseSubtotal = adults × priceAdult
             + children × (priceChild ?? throw)
             + infants × (priceInfant ?? 0)

optionsTotal = SUM(option.priceDelta × multiplier(pricingUnit))

total = baseSubtotal + optionsTotal − discount
```

Lưu `priceBreakdown` JSON full chi tiết vào `TourBooking.priceBreakdown` để truy lại được.

### CHECK constraints

```sql
CHECK (participants > 0)
CHECK (participants = adults_count + children_count + infants_count)
CHECK (adults_count >= 1)
```

→ Migration: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` PART 3.

---

## Consequences

### Tốt

- Cover 90% case tour gia đình Việt Nam Phase 1
- Upsell tăng AOV 15-25% không cần thêm tour mới (industry benchmark)
- `priceBreakdown` JSON snapshot → admin sửa giá tour sau, booking cũ không bị ảnh hưởng (compliance + tax audit)
- DB CHECK đảm bảo participants consistency dù app có bug

### Trade-off

- Phức tạp hơn Pattern B (1 enum + 2 bảng phụ)
- UI form booking phải có 3 ô (adult/child/infant) + checkbox options — nhiều click hơn

### Hệ quả kỹ thuật

- Service `BookingService.computePriceBreakdown()` cần test kỹ với nhiều combination
- Zod schema cho `priceBreakdown` validate ở service trước khi DB
- Display ở UI: dùng util `formatPrice()` + `formatPriceBreakdown()` để khách thấy chi tiết

---

## Alternatives đã cân nhắc

### Pattern B — chỉ adult/child/infant (rejected)

- Không có upsell → mất 15-25% AOV
- Cancellation phòng đơn không xử lý được → phải refund/swap manual
- Tour gia đình không tận dụng được giá lẻ

### Pattern D — Dynamic pricing (defer Phase 2)

- Cần data 6-12 tháng để biết demand pattern
- Phức tạp UI hiển thị
- Phase 1 chưa cần — chấp nhận giá fixed per departure (qua `TourDeparture.priceOverride`)

---

## Liên kết

- BR-PR pricing rules: `../../01-nghiep-vu/02-quy-tac-nghiep-vu.md`
- Spec bảng: `../../03-co-so-du-lieu/02-thiet-ke-bang.md` mục Tour, TourOption, TourBooking
- Migration PART 3: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Anchor cũ trace: V-09
