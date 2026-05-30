# 01 — Luồng nghiệp vụ cốt lõi

> **Vai trò đọc**: BA, dev — hiểu hệ thống vận hành như thế nào ở mức business flow trước khi đụng code/schema.
> **File này có**: 2 flow chính (Series Tour + Private Tour) + status transitions + edge cases.

---

## Tóm tắt 1 câu

**Khách lẻ book SERIES TOUR (qua web, ghép đoàn 15-20). Khách nhóm ≥10 người dùng INQUIRY FORM (Vivu liên hệ quote manual). Vivu nội bộ allocate HOTEL theo allotment đã contract trước. Khách KHÔNG bao giờ trực tiếp book hotel (ADR-001).**

---

## 2 loại tour Vivu phục vụ

| Đặc điểm | Series Tour (Tour ghép) | Private Tour / Corporate |
| --- | --- | --- |
| Nguồn khách | Khách lẻ 1-4 người | Nhóm ≥10 (công ty, đại gia đình) |
| Ngày khởi hành | Vivu set trước (15/06, 22/06...) | Khách yêu cầu ngày tự do |
| Đoàn | Ghép 15-20 khách lạ | 1 nhóm riêng |
| Giá | Niêm yết per-pax | Quote riêng theo nhóm |
| Booking flow | **Online** — book trực tiếp | **Inquiry form** → admin liên hệ quote |
| Entity DB chính | `TourDeparture` → `Booking` → `TourBooking` | `InquiryRequest` → (chốt deal) → admin tạo `Booking` tay |
| Phase 1 ratio | ~70% revenue | ~30% revenue (biên cao hơn) |

**Vì sao tách 2 flow** (ADR-006):
- Private Tour không thể book online vì cần custom (hotel theo yêu cầu, route theo yêu cầu, payment terms B2B, VAT đỏ).
- Series Tour không thể quote tay vì cần xử lý nhanh + thanh toán online + ghép đoàn tự động.
- Trộn 2 flow → schema phức tạp, UX khó hiểu. Tách sạch → đơn giản.

---

## Flow Series Tour — 4 bước

### Bước 1 — Vivu chuẩn bị (trước khi mở bán)

```
1. Founder/Ops ký contract Hotel ABC: "giữ 100 phòng-đêm/tháng 6"
2. Admin nhập HotelAllotment:
     hotelId=ABC, periodMonth=2026-06-01, contractedRooms=100
3. Admin tạo Tour Đà Lạt 4N3Đ:
     - priceAdult=4.5tr, priceChild=3.3tr, priceInfant=0
     - TourOption: Deluxe upgrade +500k/pax, Single supplement +1.2tr
     - TourItinerary 3 đêm: hotelId=ABC, roomTypeNote="Twin Deluxe"
4. Admin tạo TourDeparture 15/06: max=20, min=10, cancellationDeadline=08/06
5. Publish tour: Tour.isActive=true, Departure.status=AVAILABLE
```

### Bước 2 — Khách book (online, real-time)

```
1. Anh Khoa chọn tour Đà Lạt 4N3Đ, chọn departure 15/06
2. Điền: 2 adult + 1 child + chọn "Deluxe upgrade"
3. Click "Thanh toán" → Server Action `BookingService.createTourBooking()`:
     a. require(user.isLoggedIn)        ← ADR-004 must-login
     b. transaction Serializable:
        - SELECT TourDeparture FOR UPDATE   ← pessimistic lock
        - Check slot: bookedCount + 3 <= maxParticipants
        - Compute priceBreakdown:
            2 × 4.5tr (adult)             = 9.0tr
            1 × 3.3tr (child)             = 3.3tr
            3 × 500k (Deluxe per_pax)     = 1.5tr
            ──────────────────────────────────────
            Total                         = 13.8tr
        - INSERT Booking(status=PENDING, paymentDeadline=NOW+15min)
        - INSERT TourBooking(priceBreakdown=JSON, participants=3,
                              adultsCount=2, childrenCount=1, infantsCount=0)
        - UPDATE TourDeparture.bookedCount += 3
        - INSERT Payment(status=PENDING, method=VNPAY)
        - LOG ActivityLog
     c. Redirect tới VNPay với externalRef = Payment.id
4. VNPay → khách trả tiền → webhook về `/api/payments/vnpay/webhook`:
     - Verify signature
     - UPDATE Payment.status=SUCCESS, externalId=<VNPay tx>
     - UPDATE Booking.status=PAID
     - Send email confirm
```

### Bước 3 — Vivu allocate phòng (admin UI, semi-manual)

```
1. Admin Dashboard L0 thấy Booking PAID mới
2. Admin tính: 3 người → 2 phòng Twin (2+1 share)
3. Admin vào HotelAllotment tháng 6:
     usedRooms += (2 phòng × 3 đêm) = 6
4. Admin email/call Hotel ABC: "đặt 2 Twin Deluxe 15-18/06 cho khách Khoa, ref VV-001"
5. Hotel ABC confirm → Admin update Booking.status=CONFIRMED
   (Phase 1.5+: hệ thống auto email Hotel khi booking PAID)
```

### Bước 4 — Tour diễn ra

```
1. 15/06: Anh Khoa lên xe Vivu → check-in Hotel ABC
2. 18/06: tour kết thúc → admin update Booking.status=COMPLETED
3. Admin update TourDeparture.actualCostPerPax (cho L1/L2 reporting)
4. Cuối tháng: Vivu invoice/pay Hotel ABC theo usedRooms
5. Email khách link review tour (chỉ enable khi COMPLETED)
```

---

## Flow Private Tour — Inquiry Request 3 bước

### Bước 1 — Khách submit inquiry (online)

```
1. HR công ty XYZ vào trang tour Đà Lạt 4N3Đ
2. Thấy CTA "Đặt tour cho công ty / nhóm riêng (10+ người)"
3. Click → form mở:
     - Tên + email + phone
     - Tên công ty: XYZ
     - Số người: 40
     - Ngày dự kiến: "tuần 2 tháng 6, linh hoạt"
     - Ngân sách: 200tr (optional)
     - Yêu cầu chi tiết: "Hotel 4★+, có gala dinner"
4. Submit → InquiryRequest tạo:
     - status=NEW
     - tourId=<tour ban đầu>
     - type=CORPORATE_GROUP
5. Auto-email reply "Cảm ơn, Vivu sẽ liên hệ trong 24h"
```

### Bước 2 — Vivu xử lý (admin, manual)

```
1. Dashboard L0 hiển thị inquiry mới → assign cho Ops Linh
   InquiryRequest.assignedTo=<Linh.userId>
2. Ops Linh gọi điện trong 24h → status=CONTACTED
3. Ops build quote custom (Excel): hotel + xe + guide + ăn uống
4. Email khách báo giá 5.2tr × 40 = 208tr → status=QUOTED
```

### Bước 3 — Chốt deal (ngoài hệ thống → bridge vào hệ thống)

```
1. Khách OK quote → 2 bên ký HĐ giấy (B2B), chuyển khoản
2. Ops Linh tạo Booking thủ công:
     - Tạo TourDeparture riêng (max=40, custom date)
     - Tạo Booking + TourBooking với priceBreakdown tay
     - Link InquiryRequest.convertedBookingId = booking.id
     - UPDATE InquiryRequest.status=CONFIRMED
3. Sau đó flow giống Series Tour: confirm hotel allotment + tour run
```

> **Note**: Phase 1 Private Tour vẫn dùng `TourDeparture` model (admin tạo tay 1 departure riêng cho mỗi nhóm). Phase 2 cân nhắc tách model `PrivateBooking` nếu cần.

---

## Status transitions

### Booking

```
PENDING ──payment success──► PAID ──admin confirm──► CONFIRMED
   │                                                      │
   │ payment timeout (cron 15min)                         │ tour ngày cuối
   │ or admin cancel                                      ▼
   ▼                                                  COMPLETED
CANCELLED                                                 │
                                                          │ khách yêu cầu refund
                                                          ▼
                                                       REFUNDED
```

| From | To | Trigger | Side effect |
| --- | --- | --- | --- |
| `PENDING` | `PAID` | Payment webhook SUCCESS | Send email confirm, ActivityLog |
| `PENDING` | `CANCELLED` | Cron auto-cancel (paymentDeadline < NOW) | Decrement `TourDeparture.bookedCount` |
| `PENDING` | `CANCELLED` | Admin manual | Decrement bookedCount, email khách |
| `PAID` | `CONFIRMED` | Admin confirm sau khi hotel xác nhận | ActivityLog |
| `CONFIRMED` | `COMPLETED` | Admin set sau ngày tour kết thúc | Enable review link, email khách |
| `COMPLETED` | `REFUNDED` | Admin process refund | ActivityLog, không touch bookedCount |
| `PAID`/`CONFIRMED` | `CANCELLED` | Admin manual (force) | Decrement bookedCount, refund flow |

### TourDeparture

```
AVAILABLE ──bookedCount = max──► FULL
    │
    │ admin cancel (không đủ min)
    ▼
CANCELLED
```

### InquiryRequest

```
NEW → CONTACTED → QUOTED → CONFIRMED (→ link Booking)
                    │
                    ├──► REJECTED
                    │
                    └──► EXPIRED (cron 30 ngày)
```

---

## Edge cases

### EC-1: Khách bỏ ngang khi đang thanh toán

```
1. Khách click "Thanh toán" → Booking PENDING + bookedCount += 3
2. Khách đóng browser, không quay lại VNPay
3. 16 phút sau, cron job `auto-cancel-pending-bookings` (chạy 1 phút/lần):
     SELECT * FROM bookings WHERE status='PENDING' AND payment_deadline < NOW()
4. Mỗi booking → transaction:
     - UPDATE Booking.status = CANCELLED
     - UPDATE TourDeparture.bookedCount -= participants
     - LOG ActivityLog action=AUTO_CANCEL_TIMEOUT
5. Slot release → khách khác có thể book
```

### EC-2: Departure không đủ min participants

```
1. Tour 15/06: min=10, đến 08/06 (cancellationDeadline) chỉ booked 5
2. Admin nhận cảnh báo Dashboard L0
3. Admin quyết cancel:
     - UPDATE TourDeparture.status=CANCELLED
     - SET cancellationReason="Không đủ số lượng khách"
4. Tất cả Booking của departure này → admin manual:
     - UPDATE Booking.status=CANCELLED (force)
     - Decrement bookedCount = 0
     - Trigger refund manual (qua VNPay dashboard)
5. Email khách: tour cancel, offer departure 22/06 cùng tour HOẶC refund
6. HotelAllotment.usedRooms giảm tương ứng (admin update tay)
```

### EC-3: Inquiry hết hạn (auto-expire)

```
1. InquiryRequest status=NEW
2. 30 ngày sau, không update (no admin contact, no customer response)
3. Cron daily job:
     UPDATE inquiry_requests SET status='EXPIRED'
     WHERE status IN ('NEW', 'CONTACTED') AND updated_at < NOW() - INTERVAL '30 days'
4. Admin có thể manually re-open nếu khách quay lại
```

### EC-4: Race condition — 2 khách book slot cuối

```
1. TourDeparture max=20, bookedCount=18, có 2 slot
2. Khách A và B cùng lúc click "Thanh toán" cho 2 người
3. Server transaction A: SELECT FOR UPDATE → lock row → check 18+2≤20 OK
4. Server transaction B: SELECT FOR UPDATE → WAIT cho A commit
5. A commit: bookedCount=20
6. B unlock: check 20+2≤20 FAIL → throw DepartureFullError
7. B rollback → khách B nhận message "Hết slot, chọn departure khác"
```

### EC-5: Hotel allotment vượt contract (admin nhập sai)

```
1. Admin tạo HotelAllotment hotelId=ABC, periodMonth=2026-06-01,
   contractedRooms=100, usedRooms=95
2. Admin tăng usedRooms thêm 8 (tổng 103)
3. DB CHECK `hotel_allotments_no_overuse` reject:
     ERROR: new row for relation "hotel_allotments" violates check constraint
4. Service layer catch error → return business error "Vượt allotment"
5. Admin phải release rooms hoặc đàm phán thêm với hotel
```

---

## Ranh giới ai làm gì

| Thực thể | Track ở đâu | Ai update | Phase 1 cách thức |
| --- | --- | --- | --- |
| Tour package | `tours`, `tour_itineraries`, `tour_options`, `tour_departures` | Content admin | Form admin |
| Series Tour booking | `bookings` + `tour_bookings` + `payments` | Hệ thống tự động | Server Action + webhook |
| Private Tour inquiry | `inquiry_requests` | Khách submit + admin xử lý | Form web → admin manual workflow |
| Private Tour booking (sau chốt) | `bookings` (admin tạo tay) | Ops admin | Tạo Booking + Departure riêng thủ công |
| Hotel info | `hotels`, `rooms` | Content admin | Form admin |
| Hotel allotment | `hotel_allotments` (monthly) | Ops admin | Form admin nhập tay đầu tháng |
| Hotel reservation thực sự với hotel | (ngoài hệ thống) | Ops admin → call/email hotel | Phone/email — không track DB Phase 1 |
| Refund khách | (ngoài hệ thống) | Ops admin → VNPay/MoMo dashboard | Manual qua portal payment gateway |

> **Lưu ý ADR-001 vĩnh viễn**: Vivu không trở thành OTA hotel kể cả Phase 2. Mọi tương tác khách-Vivu đều qua `Booking + TourBooking`. Tương tác Vivu-hotel đi qua `HotelAllotment` + email/phone.

---

## Liên kết

- Quy tắc nghiệp vụ (pricing, cancellation policy): `02-quy-tac-nghiep-vu.md`
- Thuật ngữ: `03-thuat-ngu.md`
- Ma trận tính năng: `04-ma-tran-tinh-nang.md`
- Spec DB: `../03-co-so-du-lieu/02-thiet-ke-bang.md`
- Concurrency lock chi tiết: `../03-co-so-du-lieu/03-toan-ven-concurrency.md`
- ADR liên quan: `../02-kien-truc/decisions/ADR-001`, `ADR-002`, `ADR-006`
