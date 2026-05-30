# ADR-006: Series + Private Tour split

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder

---

## Context

User đặt câu hỏi: "Ví dụ công ty đặt 40 người đi 3 ngày 2 đêm, sao ghép đoàn được?"

Điều tra thực tế thị trường tour VN: 2 loại tour có pattern hoàn toàn khác:

| | Series Tour | Private / Corporate |
| --- | --- | --- |
| Khách | Lẻ 1-4 người | Nhóm ≥10 |
| Ngày | Vivu set trước | Khách yêu cầu |
| Đoàn | Ghép 15-20 khách lạ | 1 nhóm riêng |
| Giá | Niêm yết per-pax | Quote riêng |
| Sản phẩm | Standard package | Custom hoá (hotel, route, gala) |
| Thanh toán | Online VNPay/MoMo | Chuyển khoản B2B + VAT đỏ |

Trộn 2 flow vào 1 schema → vừa phức tạp vừa UX confuse.

---

## Decision

**Tách 2 flow rõ rệt ngay từ Phase 1:**

### Series Tour — book online qua `TourDeparture`

- Tour có sẵn departures (15/06, 22/06...)
- Khách lẻ chọn departure + số người
- Pessimistic lock `TourDeparture.bookedCount` chống overbook
- Thanh toán VNPay/MoMo online
- Auto ghép đoàn 15-20 khách lạ

### Private Tour — Inquiry Request lead capture

- Form public "Đặt tour cho nhóm riêng (10+)"
- Submit → `InquiryRequest` status = NEW
- Admin liên hệ 24h, build quote custom (Excel)
- Chốt deal qua HĐ giấy + chuyển khoản B2B
- Admin tạo Booking thủ công, link `InquiryRequest.convertedBookingId`

### Schema

```prisma
model InquiryRequest {
  id                   String         @id @default(uuid()) @db.Uuid
  tourId               String?        @db.Uuid                    // optional, click từ tour page
  type                 InquiryType    // PRIVATE_TOUR | CORPORATE_GROUP | CUSTOM_QUOTE
  contactName          String
  contactEmail         String
  contactPhone         String
  companyName          String?
  groupSize            Int
  preferredDates       String?                                    // free-text "tuần 2 tháng 6"
  budget               Decimal?       @db.Decimal(14, 0)
  message              String?
  status               InquiryStatus  @default(NEW)
  assignedTo           String?        @db.Uuid                    // admin xử lý
  adminNotes           String?
  convertedBookingId   String?        @db.Uuid                    // link khi chốt deal
  // ...
}

enum InquiryType    { PRIVATE_TOUR  CORPORATE_GROUP  CUSTOM_QUOTE }
enum InquiryStatus  { NEW  CONTACTED  QUOTED  CONFIRMED  REJECTED  EXPIRED }
```

### Workflow admin

```
NEW → CONTACTED (≤24h) → QUOTED → CONFIRMED (chốt deal, tạo Booking thủ công)
                            │
                            ├──► REJECTED (khách không OK quote)
                            │
                            └──► EXPIRED (cron daily, 30 ngày không update)
```

---

## Consequences

### Tốt

- Schema rõ ràng: Series vs Private không trộn
- UX khách: 2 CTA tách biệt, không confuse
- Admin có workflow riêng cho Inquiry (Dashboard L0 hiển thị queue)
- Phase 1 vẫn capture được 30% revenue từ Private mà không build full system
- ROI: form đơn giản, build trong 1 sprint thay vì 3+ sprint cho full corporate booking

### Trade-off

- Private Tour Phase 1 vẫn phải xử lý manual (Excel + email + chuyển khoản)
- Không track được conversion rate Inquiry → Booking trong dashboard (Phase 1.5 mới có)
- Khách công ty có thể không quen submit form, prefer gọi điện → cần thêm hotline trong form

### Hệ quả kỹ thuật

- 1 bảng mới `inquiry_requests` (migration PART 7)
- Cron daily expire: 30 ngày không update → status EXPIRED
- Admin UI `/portal/inquiries` cần Phase 1
- Public form `/inquiry` + CTA trong trang `/tours/[slug]`
- Auto email reply khi submit (Resend)

---

## Alternatives đã cân nhắc

### A. Cho Private Tour book online (rejected)

- Cần custom dynamic pricing — complexity Phase 1 không đủ resource
- Hotel allotment per-group rất khác Series tour
- Payment B2B (chuyển khoản, VAT) khó tích hợp VNPay/MoMo

### B. Bỏ Private Tour Phase 1, focus Series (rejected)

- Mất 30% revenue
- Khách corporate là retention lớn (lặp lại annual event)

### C. 1 model chung `Booking` với enum `bookingMode` (rejected)

- Trộn lại logic — vi phạm separation of concern
- Field optional nhiều → schema messy

---

## Liên kết

- Luồng nghiệp vụ Private Tour: `../../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md` mục "Flow Private Tour"
- Business rules BR-IQ: `../../01-nghiep-vu/02-quy-tac-nghiep-vu.md`
- Schema InquiryRequest: `../../03-co-so-du-lieu/02-thiet-ke-bang.md` mục 2.4
- Migration PART 7: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Anchor cũ trace: V-12
