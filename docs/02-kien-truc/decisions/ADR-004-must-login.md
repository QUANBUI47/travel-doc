# ADR-004: Must-login để book tour (không guest checkout)

- **Status**: Accepted
- **Ngày**: 2026-05-26
- **Người duyệt**: Founder

---

## Context

Câu hỏi "có cho guest checkout không?" xuất hiện sớm trong design. Trade-off:

| Có guest checkout | Bắt buộc login |
| --- | --- |
| Giảm friction → conversion cao hơn | Friction cao hơn → drop-off chỗ "Pick date → Login" |
| Khó verify identity → fake booking | Verify identity rõ ràng |
| Khó build loyalty | Loyalty trực tiếp từ ngày 1 |
| Email dispute khó vì không có account | Account-based dispute, dễ tracking |
| Review không verified được | Review verified (linked với booking) |
| Schema `Booking.userId` nullable | `Booking.userId` NOT NULL — sạch hơn |

---

## Decision

**Phase 1 bắt buộc login để book tour. Không guest checkout.**

Cụ thể:
1. `Booking.userId` NOT NULL trong schema
2. Middleware redirect tới `/auth/login` khi click "Thanh toán" mà chưa login
3. Login flow preserve state (departure, options đã chọn) bằng `?from=<encoded>&action=book&departureId=...`
4. Hỗ trợ Google OAuth 1-click để giảm friction (Persona Anh Khoa & Chị Linh đều quen Google)
5. Pre-fill booking form từ `Profile.displayName`, `email`, `phone` để giảm thao tác

---

## Consequences

### Tốt

- **Loyalty từ ngày 1**: mọi booking có userId → repeat rate trackable
- **Verified review**: chỉ user có `Booking.status=COMPLETED` mới review được
- **Dispute resolution dễ**: khách + admin có lịch sử booking đầy đủ qua account
- **Fake booking giảm**: spam booking khó hơn vì cần email verify hoặc Google OAuth
- **Email transactional chuẩn**: gửi đúng email account, không nhập sai
- **Schema sạch**: `Booking.userId` không nullable → query đơn giản

### Trade-off

- **Drop-off chỗ login**: dự kiến 5-15% khách bỏ ngang ở bước login (industry benchmark)
- **Khách lần đầu không thấy "test booking flow"** trước khi register

### Mitigation cho drop-off

- Google OAuth 1-click (đa số khách đã có Google account)
- Email register quick: chỉ cần email + password, không yêu cầu phone ở bước register
- Save trip wishlist không cần login (Phase 1.5) — chỉ booking cần
- A/B test login screen Phase 1.5 nếu conversion < target

---

## Alternatives đã cân nhắc

### A. Guest checkout với email verify (rejected)

- Phải build dual flow (guest + login) → schema + service phức tạp
- Booking history cho khách quên password vẫn cần tìm theo email — fragile
- Loyalty Phase 1.5 phải migrate guest→account → đau

### B. Magic link (passwordless) cho Phase 1 (defer)

- UX tốt nhưng phụ thuộc email delivery (spam folder)
- Phase 1.5 cân nhắc nếu conversion login thấp

### C. Login modal inline (không redirect) (defer)

- UX mượt hơn nhưng dev effort cao
- Phase 1 redirect đơn giản chấp nhận trade-off

---

## Hệ quả kỹ thuật

- `BookingService.createTourBooking()` đầu tiên check `requireUser()` → throw `UnauthorizedError` nếu không login
- Middleware bắt route `/tours/[slug]` với query `?book=1` → redirect login nếu chưa
- Cookie public 30 days TTL (xem `02-cross-cutting.md`)
- Phase 1.5: add "Quick guest form" cho khách lazy nhập, sau confirm tạo account auto

---

## Liên kết

- Vision Non-Goals: `../../00-san-pham/01-tam-nhin.md`
- Auth flow: `../02-cross-cutting.md` mục Auth
- Personas drop-off risk: `../../00-san-pham/03-personas-user-journey.md` mục Hotspot
- Anchor cũ trace: V-04
