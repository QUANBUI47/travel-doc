# Personas & User Journey — Vivu Travel

> **Phiên bản:** 1.0 · **Ngày:** 26/05/2026 · **Tier:** 1 (Business)
>
> File này cụ thể hoá **WHO** trong [`00-tam-nhin.md`](./00-tam-nhin.md)
> thành 3 personas + journey map + service blueprint. Mỗi feature
> trong sprint phải serve ít nhất 1 persona — nếu không serve persona
> nào → có thể là tech-debt cleanup hoặc cần review.
>
> **Quy tắc:** persona đặt tên người Việt cụ thể (Anh Khoa, Chị Linh,
> Admin Vivu) để team dễ "tưởng tượng" và empathy. Không dùng tên
> abstract "User A / User B".

---

## 1. 3 personas chính

### 1.1 Anh Khoa — Family Decision Maker (Persona chính)

| Thuộc tính | Mô tả |
| --- | --- |
| **Tuổi / Nghề** | 32 tuổi, Kỹ sư phần mềm, TP.HCM |
| **Gia đình** | Vợ 29t + 2 con (6t, 3t), thỉnh thoảng dẫn ba mẹ đi cùng |
| **Thu nhập** | 30-50tr/tháng, ngân sách du lịch ~50tr/năm |
| **Tần suất đi tour** | 2-3 lần/năm (hè, Tết, lễ dài) |
| **Tech savvy** | Cao — dùng web + app thành thạo, có Google account, đã book Airbnb/Klook |
| **Device chính** | Desktop khi research, mobile khi book hoặc xem nhanh |
| **Kênh discover** | Google search "tour [địa điểm] [N ngày] cho gia đình", group FB "Du lịch cùng con" |
| **Pain points** | • Sợ tour "treo đầu dê bán thịt chó" (mô tả khác thực tế)<br>• Phải gọi/chat operator nhiều mới chốt được giá<br>• Lo trẻ con không hợp lịch trình (đi quá nhiều)<br>• Sợ chuyển khoản tay rủi ro |
| **Goals** | • Tìm tour 4-6 ngày phù hợp gia đình có trẻ nhỏ<br>• So sánh 3-4 option nhanh<br>• Book online minh bạch, có hoá đơn |
| **Behavior** | • Đọc kỹ itinerary từng ngày<br>• Filter theo "phù hợp trẻ em", "có hotel 4★+"<br>• Đọc review verified, đặc biệt review có ảnh<br>• Tham khảo vợ trước khi book → cần share link tour |
| **Quote** | *"Tôi muốn biết rõ mỗi ngày con tôi sẽ đi đâu, ăn gì, ngủ ở đâu — trước khi tôi quyết chi 30 triệu."* |

**Feature ưu tiên cho Anh Khoa:**

- Trang detail tour phải có: gallery ảnh thực + itinerary từng ngày
  + thông tin hotel cụ thể + chính sách trẻ em rõ ràng + review verified
- Filter "phù hợp gia đình", "có trẻ em", "hotel ≥4 sao"
- Share link tour (preview đẹp khi paste vào Zalo/FB)
- Payment chính thống (VNPay/MoMo) + email hoá đơn

---

### 1.2 Chị Linh — Young Professional / Couple Traveler

| Thuộc tính | Mô tả |
| --- | --- |
| **Tuổi / Nghề** | 28 tuổi, Marketing Manager, Hà Nội |
| **Gia đình** | Single hoặc đi cùng bạn trai / nhóm bạn 4-6 người |
| **Thu nhập** | 20-30tr/tháng, ngân sách du lịch ~30tr/năm |
| **Tần suất đi tour** | 3-5 lần/năm (weekend escape + 1 chuyến lớn) |
| **Tech savvy** | Rất cao — mobile-first, IG/TikTok heavy user |
| **Device chính** | Mobile 80% — search, book, share đều trên điện thoại |
| **Kênh discover** | Instagram explore, TikTok "destination VN aesthetic", Google quick search |
| **Pain points** | • Web travel tiếng Việt UX cũ, không mobile-friendly<br>• Tour package thường rườm rà với người không có gia đình<br>• Muốn flexibility (đổi ngày, đổi hotel) nhưng operator không cho |
| **Goals** | • Tìm weekend trip 2-3 ngày, vibe đẹp để post IG<br>• Book nhanh trên mobile<br>• Có thể save trip "để xem sau" |
| **Behavior** | • Lướt nhanh, scan ảnh nhiều hơn đọc<br>• Search by mood ("núi rừng", "biển vắng", "phố cổ")<br>• Quan tâm review về ảnh đẹp + food + nightlife<br>• Hay save trip rồi 1-2 tuần sau mới quyết |
| **Quote** | *"Tôi muốn tour mà 30 giây nhìn ảnh là đã muốn book ngay, không phải đọc 5 trang mô tả."* |

**Feature ưu tiên cho Chị Linh:**

- Mobile-first responsive cực ngon, hero image rich
- Discovery theo "vibe" / collection (không chỉ filter theo địa lý)
- "Save / Wishlist" tour (Phase 1.5 có thể defer — Phase 1 chấp nhận
  bookmark browser)
- Booking flow tối ưu trên mobile (max 3 step, autofill, no friction)
- Share preview đẹp (OG image dynamic per tour)

---

### 1.3 Admin Vivu — Internal Operator (Persona đặc biệt)

| Thuộc tính | Mô tả |
| --- | --- |
| **Vai trò** | Operator nội bộ Vivu (Content, Ops, hoặc Founder kiêm) |
| **Số lượng dự kiến** | 3-5 người Phase 1 (Founder + Content + Ops + Dev) |
| **Tech savvy** | Trung bình - cao — quen với CMS như WordPress, Excel, Google Sheets |
| **Device chính** | Desktop (~90%), thỉnh thoảng tablet |
| **Kênh** | Trực tiếp vào `/portal/*` (admin zone) |
| **Pain points** | • CMS rườm rà, nhiều click để tạo 1 tour<br>• Sửa nội dung mà không biết ai sửa khi (cần audit log)<br>• Upload ảnh chậm hoặc fail<br>• Lỡ tay xoá tour / destination không thể khôi phục<br>• Không biết tour nào đang bán chạy, conversion ra sao |
| **Goals** | • Tạo / cập nhật tour nhanh, ít click<br>• Theo dõi đơn booking realtime<br>• Quản lý lịch khởi hành + slot còn lại<br>• Update content SEO không cần dev support |
| **Behavior** | • Mỗi ngày check booking + email khách<br>• Mỗi tuần publish 2-3 tour mới hoặc cập nhật<br>• Mỗi tháng review SEO ranking + traffic |
| **Quote** | *"Tôi muốn tạo 1 tour trong 5 phút, sửa ảnh trong 1 phút, và biết ngay tour nào đang được khách quan tâm nhất tuần này."* |

**Feature ưu tiên cho Admin Vivu:**

- Form CMS có validation Zod + toast error rõ ràng
- Bulk upload ảnh Cloudinary + drag-reorder
- Audit log (`ActivityLog`) cho mọi mutation
- Soft delete bằng `isActive` (không xoá cứng) — đã có anchor V-05 cascade
- Dashboard cơ bản: booking hôm nay, doanh thu tuần, tour hot
- SEO override per entity (`SeoPage` polymorphic — đã có schema)

---

## 2. User Journey — Anh Khoa book tour gia đình (Persona chính)

> Đây là **happy path B2C** — flow phải tối ưu cho 90% case. Edge case
> ở phần 4.

### 2.1 Journey overview (5 phase)

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ DISCOVER │ → │  BROWSE  │ → │  DETAIL  │ → │   BOOK   │ → │   POST   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   Google         Filter          Gallery        Form            Email
   Social         List            Itinerary      Payment         Tour
   Direct         Sort            Hotel info     Confirm         Review
                                  Review
```

### 2.2 Journey chi tiết (touchpoint × emotion × backend)

| Phase | Touchpoint (frontend) | Emotion | Vivu backend cần |
| --- | --- | --- | --- |
| **1. Discover** | Google search "tour Đà Lạt 4 ngày gia đình" → click vào Vivu | Curious 🤔 | SEO metadata + structured data + sitemap (anchor V-03) |
| **2. Browse** | Trang `/tours` lọc theo destination + giá + thời gian + "phù hợp gia đình" | Comparing 🧐 | TourService.searchListings, filter index, cache page |
| **3. Detail** | Trang `/tours/[slug]` xem gallery, đọc itinerary từng ngày, xem hotel mỗi đêm, đọc review | Considering 🤓 | TourService.getBySlug + itinerary + hotel info + review verified |
| **3.5 Compare** | Mở 2-3 tab so sánh tour, share link cho vợ qua Zalo | Validating 👫 | OG image dynamic, page load nhanh, share preview đẹp |
| **4. Pick date** | Chọn lịch khởi hành (departure) còn slot phù hợp | Deciding 🗓️ | TourDeparture với slot availability, anti-overbook |
| **5. Login / Register** | Bị redirect đăng nhập / đăng ký (anchor V-04 must-login) | Slight friction 😐 | Auth flow tối ưu — Google OAuth 1-click, register 2-step |
| **6. Booking form** | Điền thông tin (tên, SDT, email, số người, ghi chú) | Focused ✍️ | Validation Zod + pre-fill profile, snapshot pricing |
| **7. Payment** | VNPay / MoMo redirect, trả tiền, redirect back | Anxious 😰 | Payment service, webhook idempotency, transaction safety |
| **8. Confirmation** | Trang cảm ơn + email confirm + mã đơn | Relief 😌 | Email transactional, `Booking` saved, ActivityLog |
| **9. Pre-tour** | Email reminder 7 ngày + 1 ngày trước chuyến | Excited 🎒 | Cron / scheduled email |
| **10. Tour** | Đi tour thực tế | (offline) | — |
| **11. Post-tour** | Email mời review + link verified review | Satisfied / Disappointed | Review service (chỉ user đã COMPLETED booking) |

### 2.3 Hotspot — chỗ dễ rớt (drop-off risk)

| Phase | Drop-off risk | Mitigation Phase 1 |
| --- | --- | --- |
| Browse → Detail | Page load chậm | SSR/ISR + image optimize |
| Detail → Pick date | Không có departure phù hợp | Suggest departure khác / destination tương tự |
| Pick date → Login | **Cao nhất** — friction must-login (V-04) | Google OAuth 1-click, save state khi login để không mất context |
| Booking form → Payment | Form quá dài / lỗi validation | Pre-fill từ profile, validation realtime, error rõ ràng |
| Payment → Confirm | VNPay timeout / huỷ | Webhook retry + status PENDING + email recovery |

---

## 3. Service Blueprint — Booking flow chi tiết

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTSTAGE (Customer thấy)                                          │
│                                                                     │
│  Trang detail   →  Booking widget  →  Form modal  →  Payment redirect│
│      ↓                  ↓                ↓                 ↓        │
│ ════════════════════════════════════════════════════════════════════│
│ BACKSTAGE (Vivu xử lý)                                              │
│                                                                     │
│  TourService     BookingService    AuthCheck      Payment Provider  │
│  .getBySlug      .createTour       requireUser    VNPay/MoMo SDK    │
│      ↓           Booking()             ↓                ↓           │
│  Prisma          Pessimistic lock   Supabase      Webhook listener │
│  query          TourDeparture        session       update status    │
│      ↓                ↓                 ↓                ↓          │
│ ════════════════════════════════════════════════════════════════════│
│ SUPPORT (Cross-cutting)                                             │
│                                                                     │
│  i18n message · ActivityLog · Email service · Cache invalidation    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Edge cases & failure modes

| Scenario | Behavior cần có Phase 1 |
| --- | --- |
| 2 khách book cùng 1 slot cuối | Pessimistic lock → 1 win + 1 báo "hết slot, chọn departure khác" |
| Payment VNPay timeout | Booking PENDING → email khách "thử lại" + admin thấy trong dashboard |
| Khách book xong muốn huỷ | Phase 1: form contact admin (không tự huỷ); Phase 1.5: self-service theo policy |
| Khách quên password | Forgot password flow đã có |
| Admin xoá tour mà có booking pending | **Block xoá** (FK constraint) hoặc soft delete `isActive=false` (V-05) |
| Admin xoá destination | Cascade hide cả tour/hotel xuống public (đã có cascade isActive) |
| SEO: tour đổi slug | SeoPage polymorphic theo entity ID (anchor V-03) → không orphan |
| Email khách không đến | Resend từ admin dashboard |
| Tour đang chạy thì hotel huỷ allotment | Manual: admin liên hệ khách swap hotel; không có flow tự động |

---

## 5. Persona → Feature priority matrix

| Feature | Anh Khoa (Family) | Chị Linh (Young) | Admin Vivu |
| --- | :---: | :---: | :---: |
| Tour list + filter | 🟢 | 🟢 | 🟡 (admin list) |
| Tour detail gallery | 🟢 | 🟢 | — |
| Itinerary từng ngày | 🟢 critical | 🟡 | 🟢 (CMS) |
| Hotel info gắn tour | 🟢 critical | 🟡 | 🟢 (CMS) |
| Filter "phù hợp gia đình" | 🟢 critical | ⚪ | — |
| Mobile-first responsive | 🟡 | 🟢 critical | 🟡 |
| OG image dynamic share | 🟡 | 🟢 critical | — |
| Save / Wishlist | 🟡 | 🟢 | — |
| Payment chính thống | 🟢 critical | 🟢 | 🟢 |
| Email confirm + reminder | 🟢 | 🟢 | 🟢 (template CMS) |
| Review verified | 🟢 critical | 🟡 | 🟢 (moderation) |
| Audit log | — | — | 🟢 critical |
| SEO override per entity | — | — | 🟢 critical |
| Loyalty point (Phase 1.5) | 🟡 | 🟢 | 🟡 |

Legend: 🟢 critical · 🟡 nice-to-have · ⚪ không cần · — không áp dụng

---

## 6. Mapping persona → Anchor decisions trong Vision

| Anchor | Phục vụ persona | Cách thể hiện |
| --- | --- | --- |
| **V-01** (MVP tour-only) | Tất cả 3 personas | Cả family + young đều book tour, không phải hotel |
| **V-02** (B2C direct) | Anh Khoa, Chị Linh | Trust signal — book trực tiếp với Vivu, không qua trung gian |
| **V-03** (SEO-first) | Anh Khoa | Tìm tour qua Google search là kênh chính của Khoa |
| **V-04** (Must-login) | Tất cả | Trade-off friction để có loyalty + verified review |
| **V-05** (Hotel content reference) | Anh Khoa | Khoa muốn biết hotel cụ thể nào → cần content info, không cần book riêng |
| **V-06** (Team 2-3 dev) | Admin Vivu | Admin Vivu là team nội bộ — UX admin cần ergonomic vì team nhỏ làm nhiều việc |
| **V-07** (Phase 2 loyalty/affiliate) | Chị Linh, Anh Khoa | Loyalty serve repeat customers — cả 2 đều đi nhiều lần/năm |

---

## Changelog

| Ngày | Version | Thay đổi |
| --- | --- | --- |
| 26/05/2026 | 1.0 | Khởi tạo 3 personas (Khoa/Linh/Admin) + journey map B2C + service blueprint + persona-feature matrix |

---

*File này thuộc **Tier 1 (Business)**. References:*

- *Vision: [`00-tam-nhin.md`](./00-tam-nhin.md)*
- *BMC: [`00b-mo-hinh-kinh-doanh.md`](./00b-mo-hinh-kinh-doanh.md)*
- *Strategy: [`01-chien-luoc-tong-the.md`](./01-chien-luoc-tong-the.md)*
- *Functional design: [`02b-thiet-ke-co-ban.md`](./02b-thiet-ke-co-ban.md) (sitemap + module map)*
