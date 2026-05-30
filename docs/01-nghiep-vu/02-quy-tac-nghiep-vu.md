# 02 — Quy tắc nghiệp vụ

> **Vai trò đọc**: BA, dev — biết business rules cứng để code không vi phạm.
> **Quy tắc**: mỗi rule có ID (BR-XX) để code/test/PR có thể trace ngược. Khi business pivot → tăng version BR-XX.A.

---

## Pricing (BR-PR)

### BR-PR-01: Per-pax pricing (ADR-002)

Mỗi tour có giá per-pax theo độ tuổi:

| Độ tuổi | Field | Giá điển hình | Null behavior |
| --- | --- | --- | --- |
| Người lớn (≥12) | `Tour.priceAdult` | NOT NULL | — |
| Trẻ em (5-11) | `Tour.priceChild` | Thường 75% adult | Null = "Liên hệ" |
| Em bé (0-4) | `Tour.priceInfant` | Thường 0 (free) | Null = không cho đi |
| Phụ thu phòng đơn | `Tour.singleSupplement` | 0-30% giá tour | Null = không cho đi 1 người |

**Công thức tính subtotal cơ bản**:
```
baseSubtotal = (adults × priceAdult)
             + (children × priceChild)
             + (infants × priceInfant)
```

### BR-PR-02: Upsell options (TourOption)

Options thêm vào sau base, có `pricingUnit` quyết định cách tính:

| pricingUnit | Cách tính | Ví dụ |
| --- | --- | --- |
| `PER_PAX` | priceDelta × participants | Deluxe upgrade 500k/người, 3 người → 1.5tr |
| `PER_BOOKING` | priceDelta × 1 | Đưa đón sân bay riêng 800k/booking |
| `PER_ROOM` | priceDelta × số phòng (admin tính) | Extra bed 300k/phòng |

**Công thức tính total**:
```
optionsTotal = SUM(option.priceDelta × multiplier(pricingUnit))
total = baseSubtotal + optionsTotal - discount
```

### BR-PR-03: Snapshot pricing

`TourBooking.priceBreakdown` (JSON) lưu **snapshot** giá tại thời điểm book. Sau này admin sửa giá tour → booking cũ giữ nguyên giá đã book.

### BR-PR-04: Currency

Phase 1 chỉ VND. Mọi `Decimal` lưu nguyên VND không scale (`Decimal(14, 0)` — 14 chữ số, 0 thập phân).

### BR-PR-05: Departure price override

`TourDeparture.priceOverride` ghi đè `Tour.priceAdult` cho departure đó (vd cao điểm Tết tăng giá). Logic:
```
unitPriceAdult = departure.priceOverride ?? tour.priceAdult
```

---

## Booking (BR-BK)

### BR-BK-01: Must-login (ADR-004)

Khách phải login Supabase Auth mới book được. `Booking.userId` NOT NULL. Không có guest checkout.

### BR-BK-02: Payment hold 15 phút

Khi tạo Booking PENDING:
- `paymentDeadline = createdAt + 15 minutes`
- `TourDeparture.bookedCount` đã được tăng (slot tạm giữ)
- Cron `auto-cancel-pending-bookings` chạy mỗi 1 phút catch booking quá deadline → CANCELLED + release slot

### BR-BK-03: Anti-overbook (N-03)

```
DB CHECK: bookedCount <= COALESCE(maxParticipants, bookedCount)
```

Trong code, transaction `Serializable` + `SELECT FOR UPDATE` đảm bảo:
- 2 khách book cùng slot cuối → 1 win + 1 nhận `DepartureFullError`.

### BR-BK-04: Tối thiểu 1 người lớn

```
DB CHECK: adultsCount >= 1
```

Trẻ em / em bé không đi 1 mình. Service catch trước khi đến DB CHECK để báo lỗi i18n.

### BR-BK-05: Số khách consistency

```
DB CHECK: participants = adultsCount + childrenCount + infantsCount
```

Frontend luôn gửi đủ 3 trường + sum. Service validate Zod trước khi insert.

### BR-BK-06: Hủy booking — refund manual Phase 1

- Khách: form contact admin (không tự hủy)
- Admin xử lý:
  - UPDATE `Booking.status = CANCELLED`
  - Decrement `bookedCount`
  - Refund qua VNPay/MoMo dashboard (ngoài hệ thống)
  - Email khách
- Phase 1.5: self-service cancel theo policy

---

## Cancellation policy (BR-CP)

### BR-CP-01: Lưu policy dạng JSON có Zod schema

`Tour.policy` (Json) cấu trúc:
```json
{
  "children": {
    "ageGroups": {
      "infant": { "minAge": 0, "maxAge": 4, "pricingPct": 0 },
      "child":  { "minAge": 5, "maxAge": 11, "pricingPct": 0.75 },
      "adult":  { "minAge": 12 }
    },
    "extraBed": { "available": true, "surcharge": 500000 }
  },
  "cancellation": {
    "tiers": [
      { "daysBeforeDeparture": 30, "refundPct": 1.0 },
      { "daysBeforeDeparture": 14, "refundPct": 0.7 },
      { "daysBeforeDeparture": 7,  "refundPct": 0.5 },
      { "daysBeforeDeparture": 3,  "refundPct": 0.2 },
      { "daysBeforeDeparture": 0,  "refundPct": 0   }
    ]
  },
  "inclusions": ["Xe khứ hồi", "Hotel 3★", "3 bữa sáng", "Vé tham quan"],
  "exclusions": ["Đồ uống cá nhân", "Tip hướng dẫn viên"]
}
```

### BR-CP-02: Refund tier — tính refund

Khi admin process refund:
```typescript
const daysLeft = differenceInDays(departure.startDate, NOW)
const tier = policy.cancellation.tiers.find(t => daysLeft >= t.daysBeforeDeparture)
const refund = booking.totalAmount × tier.refundPct
```

Phase 1 admin tính tay theo bảng tier. Phase 1.5 tự động hoá.

### BR-CP-03: Tour ngắn ngày — policy nghiêm hơn

Tour ≤2 ngày: cancellation tier có thể chỉ còn 2 mức (vd 7d=100%, 0d=0%). Admin set per-tour.

---

## Hotel allotment (BR-AL)

### BR-AL-01: Track monthly, admin nhập tay

`HotelAllotment` 1 row/hotel/tháng. Admin nhập đầu mỗi tháng dựa contract đã ký.

### BR-AL-02: Đơn vị tính = phòng-đêm

`contractedRooms` = số PHÒNG × số ĐÊM trong tháng. Vd "30 phòng × 30 đêm tháng 6 = 900 phòng-đêm".

### BR-AL-03: Không overuse

```
DB CHECK: usedRooms + releasedRooms <= contractedRooms
```

Admin phải release rooms trước cut-off date (3-7 ngày trước) nếu không bán được → tránh fee.

### BR-AL-04: No-show fee

Nếu khách không show + Vivu không kịp release → `noShowFee` ghi nhận. Phase 1 tính tay.

### BR-AL-05: PeriodMonth luôn ngày 1

```
DB CHECK: EXTRACT(DAY FROM period_month) = 1
```

Vd `2026-06-01`, không phải `2026-06-15`. Display UI: format `formatPeriodMonth(date, locale)` → "06/2026" hoặc "June 2026".

---

## Departure (BR-DP)

### BR-DP-01: Min participants chống wash

`TourDeparture.minParticipants`: nếu booked < min đến `cancellationDeadline` → admin cancel departure.

### BR-DP-02: Cancellation deadline

`TourDeparture.cancellationDeadline` = hạn cuối Vivu quyết. Sau ngày này, Vivu commit chạy tour dù chưa đủ min (chịu lỗ).

### BR-DP-03: Status auto khi đầy

Khi `bookedCount >= maxParticipants` → service set `status = FULL`. UI public ẩn departure FULL khỏi dropdown.

### BR-DP-04: actualCostPerPax — sau tour

Sau khi tour kết thúc, admin update `TourDeparture.actualCostPerPax` cho L1/L2 reporting (ADR-007). Phase 1 manual.

---

## Inquiry (BR-IQ)

### BR-IQ-01: Lead capture form

Form public ở `/private-tour/inquiry` hoặc CTA trong trang tour. Submit → InquiryRequest status `NEW` + auto email reply.

### BR-IQ-02: SLA liên hệ 24h

Admin liên hệ trong 24h kể từ submit → status `CONTACTED`. Vi phạm SLA → cảnh báo Dashboard L0.

### BR-IQ-03: Auto-expire 30 ngày

Cron daily:
```sql
UPDATE inquiry_requests SET status='EXPIRED'
WHERE status IN ('NEW', 'CONTACTED') AND updated_at < NOW() - INTERVAL '30 days'
```

### BR-IQ-04: Convert sang Booking

Khi chốt deal: admin tạo Booking thủ công + link `InquiryRequest.convertedBookingId = booking.id` + UPDATE status `CONFIRMED`.

---

## Review (BR-RV)

### BR-RV-01: Verified review only

Khách chỉ review được sau khi `Booking.status = COMPLETED`. Service check trước insert:
```sql
SELECT 1 FROM bookings
WHERE user_id = $1 AND status = 'COMPLETED'
  AND EXISTS (SELECT 1 FROM tour_bookings tb WHERE tb.booking_id = bookings.id AND tb.tour_id = $2)
LIMIT 1;
```

### BR-RV-02: 1 user 1 review per target

Unique constraint logical (chưa enforce DB Phase 1, service-layer check). Phase 1.5 thêm unique index khi rule rõ hơn.

### BR-RV-03: Rating 1-5

```
DB CHECK: rating BETWEEN 1 AND 5
```

---

## Visibility (BR-VI)

### BR-VI-01: `isActive=false` ẩn khỏi public

Service public chỉ trả entity `isActive=true`. Admin xem tất cả.

### BR-VI-02: Cascade hide

Khi `Destination.isActive=false` → mọi `Tour` + `Hotel` thuộc nó cũng ẩn public. Filter ở service layer (Postgres không tự cascade visibility).

### BR-VI-03: Departure dùng `status` enum thay `isActive`

`AVAILABLE` / `FULL` / `CANCELLED` — không có `isActive`. Public chỉ thấy `AVAILABLE`.

---

## Account / Privacy (BR-AC)

### BR-AC-01: Hard delete user — không cho phép Phase 1

Cascade `Profile → Booking/Review = Restrict` (ADR-003 / migration PART 9). Admin muốn xoá user → procedure anonymize (clear PII fields, giữ Profile row).

### BR-AC-02: PII fields cần anonymize

`Profile.displayName`, `avatarUrl`, `phone` + `Booking.guestName/Email/Phone` + `Review.title/content`.

### BR-AC-03: Phase 1.5+ — soft delete

Thêm `Profile.deletedAt` + cron auto-anonymize sau X ngày inactive. Chi tiết → `../04-phat-trien/04-bao-mat-xac-thuc.md`.

---

## Liên kết

- Luồng nghiệp vụ: `01-luong-nghiep-vu-cot-loi.md`
- Thuật ngữ: `03-thuat-ngu.md`
- Ma trận tính năng: `04-ma-tran-tinh-nang.md`
- DB integrity: `../03-co-so-du-lieu/03-toan-ven-concurrency.md`
- ADR liên quan: `../02-kien-truc/decisions/`
