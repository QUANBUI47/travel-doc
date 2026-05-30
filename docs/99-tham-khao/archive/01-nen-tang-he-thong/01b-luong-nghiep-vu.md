# Luồng Nghiệp Vụ — Vivu Travel

> **Phiên bản:** 0.1 DRAFT · **Ngày:** 26/05/2026 · **Tier:** 2 (Functional)
>
> **Trạng thái:** ⚠️ DRAFT — chưa hoàn thiện. Nội dung được trích từ
> [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md)
> v2.2 (đã quá lan man) để giải phóng file Data Detail tập trung vào DB.
>
> File này sẽ được **refine + viết lại đầy đủ** khi vào Đợt 4 (Thiết kế cơ bản)
> và Đợt sau (Thiết kế chi tiết / Phân tích nghiệp vụ). Hiện tại đây chỉ
> là nội dung **tham khảo** cho dev hiểu cách hệ thống vận hành.
>
> **Trace anchor:** V-01, V-02, V-05, V-09, V-10, V-12

---

## Mục lục

- [Tóm tắt 1 câu](#tóm-tắt-1-câu)
- [2 loại tour Vivu Phase 1 phục vụ](#2-loại-tour-vivu-phase-1-phục-vụ)
- [Vì sao tách 2 flow (V-12)](#vì-sao-tách-2-flow-v-12)
- [Flow Series Tour — 4 bước](#flow-series-tour--4-bước)
- [Flow Private Tour — Inquiry Request 3 bước](#flow-private-tour--inquiry-request-3-bước)
- [Edge cases](#edge-cases)
- [Ranh giới ai làm gì](#ranh-giới-ai-làm-gì)

---

## Tóm tắt 1 câu

**Khách lẻ book SERIES TOUR (qua web, ghép đoàn 15-20). Khách nhóm
≥10 người dùng INQUIRY FORM (Vivu liên hệ quote manual). Vivu nội bộ
allocate HOTEL theo allotment đã contract trước (qua admin UI). Khách
KHÔNG bao giờ trực tiếp book hotel ở Phase 1 (V-05 vĩnh viễn).**

---

## 2 loại tour Vivu Phase 1 phục vụ

| Đặc điểm | **Series Tour (Tour ghép)** | **Private Tour (Tour riêng / Corporate)** |
| --- | --- | --- |
| Nguồn khách | Khách lẻ 1-4 người | Nhóm ≥10 (công ty, đại gia đình) |
| Ngày khởi hành | Vivu set trước (15/06, 22/06...) | Khách yêu cầu ngày tự do |
| Đoàn | Ghép 15-20 khách lạ | 1 nhóm riêng |
| Giá | Niêm yết per-pax | Quote riêng theo nhóm |
| Booking flow | **Online** — book trực tiếp | **Inquiry form** → admin liên hệ quote manual |
| Schema entity chính | `TourDeparture` → `TourBooking` | `InquiryRequest` (→ admin chốt deal → tạo `Booking` thủ công) |
| Phase 1 ratio | ~70% revenue | ~30% revenue (biên cao hơn) |

---

## Vì sao tách 2 flow (V-12)

- **Private Tour không thể book online** vì cần custom hoá (chọn hotel
  theo yêu cầu, route theo yêu cầu, payment terms B2B, VAT đỏ).
- **Series Tour không thể quote tay** vì cần xử lý nhanh + thanh toán
  online + ghép đoàn tự động.
- Trộn 2 flow → schema phức tạp, UX khó hiểu. Tách sạch → đơn giản.

---

## Flow Series Tour — 4 bước

```
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1 — VIVU CHUẨN BỊ (trước khi mở bán)                            │
├──────────────────────────────────────────────────────────────────────┤
│ • Founder/Ops ký contract Hotel ABC: "giữ 100 phòng-đêm/tháng"       │
│ • Admin nhập vào HotelAllotment:                                     │
│     hotelId=ABC, monthYear="2026-06", contractedRooms=100            │
│ • Admin tạo Tour Đà Lạt 4N3Đ:                                        │
│     - priceAdult=4.500.000, priceChild=3.300.000                    │
│     - TourOption: Deluxe upgrade +500k, Single supplement +1.2tr     │
│     - TourItinerary 3 đêm: hotelId=ABC, roomTypeNote="Twin Deluxe"  │
│ • Admin tạo TourDeparture 15/06: max=20, min=10, deadline=08/06     │
│ • Publish tour lên web                                              │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 2 — KHÁCH BOOK TOUR (online, real-time)                         │
├──────────────────────────────────────────────────────────────────────┤
│ • Anh Khoa chọn tour, chọn departure 15/06                          │
│ • Điền: 2 adult + 1 child + chọn "Deluxe upgrade"                   │
│ • Click "Thanh toán" → Server Action:                                │
│     a. Pessimistic lock TourDeparture (FOR UPDATE)                  │
│     b. Check slot: bookedCount+3 <= maxParticipants?                 │
│     c. Tính priceBreakdown JSON:                                     │
│        - 2 × 4.5tr (adult) = 9tr                                     │
│        - 1 × 3.3tr (child) = 3.3tr                                   │
│        - 3 × 500k (Deluxe option, per_pax) = 1.5tr                  │
│        - Total: 13.8tr                                               │
│     d. Tạo Booking(status=PENDING, paymentDeadline=NOW+15min)       │
│     e. Tăng bookedCount += 3                                         │
│     f. Redirect tới VNPay                                            │
│                                                                      │
│ • Anh Khoa trả tiền VNPay → webhook → Booking.status=PAID            │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 3 — VIVU ALLOCATE PHÒNG (admin UI, semi-manual)                 │
├──────────────────────────────────────────────────────────────────────┤
│ • Admin Vivu thấy Booking PAID mới trên Dashboard L0                │
│ • Admin tính: 3 người → 2 phòng Twin (2+1 share)                    │
│ • Admin vào trang HotelAllotment tháng 6:                            │
│     usedRooms += (2 phòng × 3 đêm) = 6                              │
│ • Admin email/call Hotel ABC: "đặt 2 Twin Deluxe 15-18/06 cho       │
│   khách Khoa, ref booking VV-001"                                   │
│ • Hotel ABC confirm → Admin update Booking.status=CONFIRMED         │
│ • (Phase 1.5+: hệ thống auto email Hotel khi booking PAID)          │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 4 — TOUR DIỄN RA                                                │
├──────────────────────────────────────────────────────────────────────┤
│ • 15/06: Anh Khoa lên xe Vivu → check-in Hotel ABC                  │
│ • 18/06: tour kết thúc → Booking.status=COMPLETED                    │
│ • Admin update TourDeparture.actualCostPerPax (cho V-08 reporting)   │
│ • Cuối tháng: Vivu invoice/pay Hotel ABC theo usedRooms              │
│ • Email khách: link review tour (chỉ enable khi COMPLETED)           │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Flow Private Tour — Inquiry Request 3 bước

```
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 1 — KHÁCH SUBMIT INQUIRY (online)                               │
├──────────────────────────────────────────────────────────────────────┤
│ • Anh Khoa (HR công ty XYZ) vào trang tour Đà Lạt 4N3Đ              │
│ • Thấy CTA "Đặt tour cho công ty / nhóm riêng (10+ người)"          │
│ • Click → form mở:                                                   │
│     - Tên + email + phone                                            │
│     - Tên công ty: XYZ                                               │
│     - Số người: 40                                                   │
│     - Ngày dự kiến: "tuần 2 tháng 6, linh hoạt"                     │
│     - Ngân sách: 200tr (optional)                                    │
│     - Yêu cầu chi tiết: "Hotel 4★+, có gala dinner"                 │
│ • Submit → InquiryRequest tạo status=NEW + email auto-reply         │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 2 — VIVU XỬ LÝ (admin, manual)                                  │
├──────────────────────────────────────────────────────────────────────┤
│ • Dashboard L0 hiển thị inquiry mới — assign cho Ops Linh           │
│ • Ops Linh gọi điện trong 24h → status=CONTACTED                     │
│ • Ops build quote custom (Excel): hotel + xe + guide + ăn uống      │
│ • Email Khoa: báo giá 5.2tr/người × 40 = 208tr → status=QUOTED      │
└──────────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────────┐
│ BƯỚC 3 — CHỐT DEAL (ngoài hệ thống → bridge vào hệ thống)           │
├──────────────────────────────────────────────────────────────────────┤
│ • Khoa OK quote → 2 bên ký HĐ giấy (B2B), thanh toán chuyển khoản   │
│ • Ops Linh tạo Booking thủ công trên hệ thống:                       │
│     - Tạo TourDeparture riêng cho đoàn này (max=40, custom date)    │
│     - Tạo Booking + TourBooking với priceBreakdown tay              │
│     - Link convertedBookingId của InquiryRequest → mới này          │
│     - InquiryRequest.status=CONFIRMED                                │
│ • Sau đó flow giống Series Tour: confirm hotel allotment + tour run │
└──────────────────────────────────────────────────────────────────────┘
```

> **Note:** Phase 1 Private Tour vẫn dùng `TourDeparture` model nhưng
> chỉ admin tạo tay (1 departure riêng cho từng nhóm). Phase 2 có thể
> tách model `PrivateBooking` nếu thấy cần.

---

## Edge cases

### Edge case 1: Khách bỏ ngang khi đang thanh toán

```
1. Khách click "Thanh toán" → Booking PENDING tạo + bookedCount += 3
2. Khách đóng browser, không quay lại VNPay
3. 16 phút sau, Cron job daily/5-min:
   SELECT booking WHERE status=PENDING AND paymentDeadline < NOW()
4. Auto-cancel booking + giảm bookedCount -= 3 → slot release
5. Khách khác có thể book slot này lại
```

### Edge case 2: Departure không đủ min participants

```
1. Tour Đà Lạt 15/06: min=10, đến 08/06 (cancellationDeadline) chỉ booked 5
2. Admin nhận cảnh báo từ Dashboard L0
3. Admin quyết cancel: TourDeparture.status=CANCELLED + cancellationReason
4. Tất cả TourBooking của departure này → trigger refund (admin manual Phase 1)
5. Email khách: tour cancel, offer departure 22/06 cùng tour hoặc refund
6. HotelAllotment usedRooms giảm tương ứng (admin update tay)
```

### Edge case 3: Inquiry expired (V-12)

```
1. InquiryRequest tạo status=NEW
2. 30 ngày sau, không update (no admin contact, no customer response)
3. Cron daily job set status=EXPIRED
4. Admin có thể manually re-open nếu khách quay lại
```

---

## Ranh giới ai làm gì

| Thực thể | Track ở đâu | Ai update | Phase 1 cách thức |
| --- | --- | --- | --- |
| Tour package | `tours`, `tour_itineraries`, `tour_options`, `tour_departures` | Content admin | Form admin chi tiết |
| Series Tour booking (khách) | `bookings` + `tour_bookings` + `payments` | Hệ thống tự động | Server Action + webhook |
| **Private Tour inquiry** | `inquiry_requests` | Khách submit + admin xử lý | **Form web → Server Action → admin manual workflow** |
| **Private Tour booking thực sự** | `bookings` (tạo tay sau khi chốt) + link `inquiry.convertedBookingId` | Ops admin | Tạo Booking + Departure riêng thủ công |
| Hotel info | `hotels`, `rooms` | Content admin | Form admin |
| Hotel allotment | `hotel_allotments` (monthly) | Ops admin | Form admin nhập tay đầu tháng |
| Hotel booking thực sự với hotel | (ngoài hệ thống) | Ops admin → call/email hotel | Phone/email — KHÔNG track trong DB Phase 1 |
| Refund khách khi cancel | (ngoài hệ thống) | Ops admin → VNPay/MoMo dashboard | Manual qua portal payment gateway |

> **Lưu ý (V-05 vĩnh viễn):** Vivu không trở thành OTA hotel kể cả Phase 2.
> Mọi tương tác khách-Vivu đều qua `Booking + TourBooking`. Tương tác
> Vivu-hotel (allocate phòng) đi qua `HotelAllotment` (admin nhập tay)
> + email/phone (ngoài hệ thống).

---

## Changelog

| Ngày | Version | Thay đổi |
| --- | --- | --- |
| 26/05/2026 | 0.1 DRAFT | Trích từ `03-thiet-ke-du-lieu-chi-tiet.md` v2.2 (lan man) để giải phóng file Data Detail. Cần refine khi vào Đợt 4 (Thiết kế cơ bản / Phân tích nghiệp vụ). |

---

*File này thuộc **Tier 2 (Functional Design) — DRAFT**. Sẽ được hoàn thiện
khi vào Đợt 4. Tham khảo:*

- *Vision & anchors: [`00-tam-nhin.md`](./00-tam-nhin.md)*
- *Personas & journey: [`00c-personas-user-journey.md`](./00c-personas-user-journey.md)*
- *Data ERD: [`02-so-do-du-lieu.md`](./02-so-do-du-lieu.md)*
- *Data Detail (DB schema): [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md)*
