# ADR-007: Admin Reporting 3 tier (L0/L1/L2)

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder

---

## Context

Câu hỏi: "Có cần Admin Dashboard cho operational/business/P&L không?"

Founder phân vân: chừng nào "đáng" build dashboard, build sớm quá tốn dev time, build muộn quá thì không biết kinh doanh ra sao.

Phân tích nhu cầu reporting theo độ "trưởng thành":

| Tier | Mục đích | Câu hỏi trả lời | Khi nào cần |
| --- | --- | --- | --- |
| **L0 Operational** | Vận hành hàng ngày | "Hôm nay có bao nhiêu đơn? Tour nào hot? Đơn nào fail?" | Phase 1 — bắt buộc |
| **L1 Business** | Hiệu quả kinh doanh | "Conversion bao nhiêu? AOV tăng/giảm? CAC?" | Phase 1.5 — khi có 3 tháng data |
| **L2 Financial (P&L)** | Lỗ lãi từng tour | "Tour này lãi bao nhiêu? Khoản chi nào lớn nhất?" | Phase 2 hoặc Excel + kế toán |

---

## Decision

**Phase 1 chỉ build L0. L1/L2 defer nhưng schema chừa cửa từ Phase 1.**

### L0 Dashboard — Phase 1 (Sprint 6)

**Mục đích**: vận hành operational hàng ngày.

**Module**:
- Đơn hôm nay (count + total amount theo status)
- Doanh thu tuần (line chart 7 ngày)
- Top tour bán chạy (top 5 tuần này)
- Booking PENDING quá deadline (cảnh báo)
- Inquiry NEW chưa contact (cảnh báo SLA 24h)
- Departure không đủ min participants sắp cancel
- Export CSV booking trong khoảng ngày

**Effort**: ~2-3 ngày dev.

### L1 Business Dashboard — Phase 1.5

**Mục đích**: đo hiệu quả marketing + product.

**Module**:
- Conversion rate (visitor → booking)
- AOV trend
- CAC theo channel
- Repeat rate
- Funnel drop-off (browse → detail → book → pay)

**Effort**: ~1-2 tuần dev.

### L2 P&L — Phase 2 hoặc Excel

**Mục đích**: tính lãi/lỗ chi tiết từng tour.

**Tránh build dedicated**: kế toán + Excel có thể đảm nhận, dev focus revenue path.

### Schema chừa cửa từ Phase 1

Để L1/L2 build sau không phải migrate đau:

```prisma
model Tour {
  // ... existing fields
  estimatedCost  Decimal?  @db.Decimal(14, 0)   // chi phí vốn ước tính per khách
}

model TourDeparture {
  // ... existing fields
  actualCostPerPax  Decimal?  @db.Decimal(14, 0)   // admin update sau tour
}
```

**Cách dùng**:
- `Tour.estimatedCost`: admin nhập ước tính khi tạo tour
- `TourDeparture.actualCostPerPax`: admin update sau khi tour chạy (hotel/xe/guide thực tế)
- L1 dashboard: chart `estimatedCost vs actualCostPerPax` để biết tour nào miss budget
- L2 dashboard: tính `gross profit = (priceAdult × bookedCount) - (actualCostPerPax × bookedCount)`

---

## Consequences

### Tốt

- Phase 1 không tốn dev cho dashboard fancy → focus revenue path
- Schema chừa cửa → L1/L2 build sau không migrate đau
- Founder vẫn có L0 đủ để vận hành hàng ngày
- Kế toán + Excel xử lý P&L phase đầu (rẻ hơn build dev)

### Trade-off

- Founder không thấy "conversion rate" realtime ở Phase 1 → phải dựa intuition + Google Analytics
- Phải xây cron daily aggregate khi build L1 (Phase 1.5)

### Hệ quả kỹ thuật

- Phase 1: 1 page `/portal/dashboard` với 6 module trên
- Phase 1.5: thêm `MaterializedView` cho L1 metric aggregation (tránh query nặng realtime)
- Phase 2: tính cân nhắc xây L2 hoặc tích hợp với accounting software

---

## Alternatives đã cân nhắc

### A. Build L0+L1 ngay Phase 1 (rejected)

- Tốn ~3-4 tuần dev — mất Sprint 5 hoặc 6
- Founder chưa đủ data Phase 1 để biết metric nào quan trọng nhất → build tốn rồi sửa

### B. Outsource toàn bộ reporting cho Excel + kế toán (rejected)

- Operational L0 cần realtime, Excel không kịp
- Admin không tự check booking trong giờ làm việc → support khách chậm

### C. Mua dashboard SaaS (Metabase, Looker) (defer)

- Phase 1.5+ cân nhắc khi có volume
- Phase 1 chưa cần — query đơn giản, dev built-in nhanh hơn setup SaaS

---

## Liên kết

- Vision Non-Goals mục "L1/L2 reporting": `../../00-san-pham/01-tam-nhin.md`
- Tour.estimatedCost schema: `../../03-co-so-du-lieu/02-thiet-ke-bang.md` mục 1.5
- KPI sống còn: `../../00-san-pham/02-mo-hinh-kinh-doanh.md` câu 7
- Anchor cũ trace: V-08
