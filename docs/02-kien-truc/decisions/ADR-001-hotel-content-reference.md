# ADR-001: Hotel là Content Reference vĩnh viễn (Phase 1 + Phase 2)

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder

---

## Context

Trong design ban đầu schema có model `HotelBooking` + enum `BookingType` (HOTEL | TOUR), implies Vivu sẽ mở "hotel booking độc lập" như Agoda/Booking ở Phase 2.

Sau khi user thảo luận về use case "công ty 40 người" + risk scope creep, nhận ra:
- Vivu là **tour operator**, không phải OTA hotel.
- Build hotel booking độc lập sẽ kéo theo: hotel portal cho partner, inventory per-date, calendar UI, refund policy hotel, channel manager — toàn bộ stack riêng.
- Khách Vivu đến để "đi du lịch trọn gói", không phải "tìm hotel" — sai persona.
- Đối thủ phân khúc này (Agoda, Booking) đã quá mạnh, Vivu không có lợi thế.

---

## Decision

**Hotel chỉ là content reference trong tour package, không bao giờ bookable độc lập — cả Phase 1 lẫn Phase 2.**

Cụ thể:
1. DROP model `HotelBooking` khỏi schema (YAGNI)
2. DROP enum `BookingType` khỏi schema
3. DROP `Booking.bookingType`, `Booking.checkIn`, `Booking.checkOut` cột
4. `Booking + TourBooking` luôn 1:1 — không discriminator
5. Hotel info gắn vào tour qua `TourItinerary.hotelId` (per day) + `TourItinerary.roomTypeNote` (free-text)
6. Track allotment qua `HotelAllotment` monthly (admin nhập tay), không per-date
7. Hotel có trang public `/hotels/[slug]` chỉ để hiển thị info (gallery, amenities, location) — không có nút "Book"

→ Migration: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` PART 8.

---

## Consequences

### Tốt

- Schema gọn hơn: 21 bảng → 20 bảng
- UX khách hàng đơn giản hơn (không confuse "book tour" vs "book hotel")
- Brand Vivu rõ ràng: "tour operator", không loãng
- Phase 2 không phải migrate lại schema vì đã commit vĩnh viễn
- Polymorphic giảm từ 3 chỗ (Booking + Review + SeoPage) còn 2 (Review + SeoPage)

### Trade-off

- Mất khả năng "hotel-only revenue" — không vào được phân khúc OTA hotel
- Khách muốn book chỉ hotel sẽ phải dùng đối thủ → mất 1 phần market share
- Phase 3+ nếu pivot model thì migrate đắt (đã accept vì xác suất pivot thấp)

### Hệ quả kỹ thuật

- Hotel page `/hotels/[slug]` không có booking widget — chỉ gallery + amenities + tour list "Tour có ghé hotel này"
- Admin Hotel CMS focus vào content + allotment, không có booking management
- `Review` vẫn polymorphic 2 nhánh (Hotel | Tour) — vì khách review hotel đã ở trong tour, không phải book riêng

---

## Alternatives đã cân nhắc

### A. Giữ `HotelBooking` cho Phase 2 (rejected)
- Phải duy trì schema không dùng → tech debt
- Build Phase 1 phức tạp hơn vì phải nghĩ Phase 2

### B. Hotel "request to book" — submit form như InquiryRequest (rejected)
- Vẫn confuse persona — Vivu không có capacity vận hành hotel booking
- Trùng với `InquiryRequest` flow

### C. Vivu thành OTA hotel ở Phase 3 (rejected)
- Lệch core competency
- Đối thủ quá mạnh phân khúc này

---

## Liên kết

- Vision: `../../00-san-pham/01-tam-nhin.md` mục Non-Goals
- BR-PR (pricing): `../../01-nghiep-vu/02-quy-tac-nghiep-vu.md`
- Migration: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` PART 8
- Anchor cũ trace: V-01, V-05 (vĩnh viễn)
