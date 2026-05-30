# 03 — Personas & User Journey

> **Vai trò đọc**: PO, BA, designer, dev — biết "đang code cho ai" trước khi viết feature.
> **Quy tắc**: mỗi feature trong sprint phải serve ít nhất 1 persona. Không serve persona nào → tech-debt cleanup hoặc cần review.

> Persona đặt tên người Việt cụ thể (Anh Khoa, Chị Linh, Admin Vivu) để team dễ empathy. Không dùng tên abstract "User A / User B".

---

## 1. Ba personas chính

### 1.1 Anh Khoa — Family Decision Maker (Primary persona)

| Thuộc tính | Mô tả |
| --- | --- |
| Tuổi / Nghề | 32 tuổi, Kỹ sư phần mềm, TP.HCM |
| Gia đình | Vợ 29t + 2 con (6t, 3t), thỉnh thoảng dẫn ba mẹ đi cùng |
| Thu nhập | 30-50tr/tháng, ngân sách du lịch ~50tr/năm |
| Tần suất | 2-3 lần/năm (hè, Tết, lễ dài) |
| Tech savvy | Cao — quen Google + Klook + Airbnb |
| Device | Desktop khi research, mobile khi book/xem nhanh |
| Kênh discover | Google search "tour [địa điểm] [N ngày] gia đình", group FB "Du lịch cùng con" |

**Pain points:**
- Sợ tour "treo đầu dê bán thịt chó" (mô tả khác thực tế)
- Phải gọi/chat operator nhiều mới chốt được giá
- Lo trẻ con không hợp lịch trình (đi quá nhiều)
- Sợ chuyển khoản tay không an toàn

**Goals:**
- Tìm tour 4-6 ngày phù hợp gia đình có trẻ nhỏ
- So sánh 3-4 option nhanh
- Book online minh bạch, có hoá đơn

**Behavior:**
- Đọc kỹ itinerary từng ngày
- Filter theo "phù hợp trẻ em", "hotel 4★+"
- Đọc review verified (đặc biệt review có ảnh)
- Tham khảo vợ trước khi book → cần share link tour

**Quote:**
> *"Tôi muốn biết rõ mỗi ngày con tôi sẽ đi đâu, ăn gì, ngủ ở đâu — trước khi tôi quyết chi 30 triệu."*

**Feature ưu tiên cho Anh Khoa:**
- Detail page: gallery thực + itinerary từng ngày + thông tin hotel cụ thể + policy trẻ em + review verified
- Filter "phù hợp gia đình", "có trẻ em", "hotel ≥4★"
- Share link tour với OG image đẹp (preview khi paste Zalo/FB)
- Payment chính thống (VNPay/MoMo) + email hoá đơn

---

### 1.2 Chị Linh — Young Professional / Couple Traveler

| Thuộc tính | Mô tả |
| --- | --- |
| Tuổi / Nghề | 28 tuổi, Marketing Manager, Hà Nội |
| Gia đình | Single hoặc đi cùng bạn trai / nhóm bạn 4-6 người |
| Thu nhập | 20-30tr/tháng, ngân sách du lịch ~30tr/năm |
| Tần suất | 3-5 lần/năm (weekend escape + 1 chuyến lớn) |
| Tech savvy | Rất cao — mobile-first, IG/TikTok heavy user |
| Device | Mobile 80% — search, book, share đều trên điện thoại |
| Kênh discover | Instagram explore, TikTok aesthetic, Google quick search |

**Pain points:**
- Web travel tiếng Việt UX cũ, không mobile-friendly
- Tour package thường rườm rà với người không có gia đình
- Muốn flexibility (đổi ngày/hotel) nhưng operator không cho

**Goals:**
- Tìm weekend trip 2-3 ngày, vibe đẹp để post IG
- Book nhanh trên mobile
- Save trip "để xem sau"

**Behavior:**
- Lướt nhanh, scan ảnh nhiều hơn đọc
- Search by mood ("núi rừng", "biển vắng", "phố cổ")
- Quan tâm review về ảnh đẹp + food + nightlife
- Hay save trip rồi 1-2 tuần sau mới quyết

**Quote:**
> *"Tôi muốn tour mà 30 giây nhìn ảnh là đã muốn book ngay, không phải đọc 5 trang mô tả."*

**Feature ưu tiên cho Chị Linh:**
- Mobile-first responsive cực ngon, hero image rich
- Discovery theo "vibe" / collection (không chỉ filter địa lý)
- Save/Wishlist (Phase 1 có thể defer → bookmark browser)
- Booking flow tối ưu mobile (max 3 step, autofill, no friction)
- Share preview đẹp (OG image dynamic per tour)

---

### 1.3 Admin Vivu — Internal Operator (Special persona)

| Thuộc tính | Mô tả |
| --- | --- |
| Vai trò | Operator nội bộ Vivu (Content / Ops / Founder kiêm) |
| Số lượng dự kiến | 3-5 người Phase 1 |
| Tech savvy | TB-cao — quen WordPress, Excel, Google Sheets |
| Device | Desktop ~90%, đôi khi tablet |
| Kênh | Trực tiếp vào `/portal/*` (admin zone) |

**Pain points:**
- CMS rườm rà, nhiều click để tạo 1 tour
- Không biết ai sửa nội dung khi (cần audit log)
- Upload ảnh chậm hoặc fail
- Lỡ tay xoá tour/destination không khôi phục được
- Không biết tour nào đang bán chạy

**Goals:**
- Tạo / cập nhật tour nhanh, ít click
- Theo dõi booking realtime
- Quản lý lịch khởi hành + slot còn lại
- Update SEO không cần dev support

**Behavior:**
- Mỗi ngày check booking + email khách
- Mỗi tuần publish 2-3 tour mới hoặc update
- Mỗi tháng review SEO ranking + traffic

**Quote:**
> *"Tôi muốn tạo 1 tour trong 5 phút, sửa ảnh trong 1 phút, và biết ngay tour nào đang được khách quan tâm nhất tuần này."*

**Feature ưu tiên cho Admin Vivu:**
- Form CMS có validation Zod + toast error rõ ràng
- Bulk upload ảnh Cloudinary + drag-reorder
- Audit log (`ActivityLog`) cho mọi mutation
- Soft delete bằng `isActive` (không xoá cứng)
- Dashboard L0: booking hôm nay, doanh thu tuần, tour hot
- SEO override per entity (`SeoPage` polymorphic)

---

## 2. User Journey — Anh Khoa book tour gia đình

> **Happy path B2C** — phải tối ưu cho 90% case. Edge case ở mục 4.

### 2.1 Journey overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ DISCOVER │ → │  BROWSE  │ → │  DETAIL  │ → │   BOOK   │ → │   POST   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
   Google         Filter         Gallery        Form           Email
   Social         List           Itinerary      Payment        Tour
   Direct         Sort           Hotel info     Confirm        Review
                                 Review
```

### 2.2 Journey chi tiết (touchpoint × emotion × backend)

| Bước | Touchpoint | Emotion | Backend cần |
| --- | --- | --- | --- |
| 1. Discover | Google search → click Vivu | Curious | SEO metadata + structured data + sitemap |
| 2. Browse | `/tours` lọc destination + giá + thời gian + "gia đình" | Comparing | `TourService.searchListings`, filter index, cache |
| 3. Detail | `/tours/[slug]` xem gallery, itinerary, hotel, review | Considering | `TourService.getBySlug` + itinerary + hotel + review verified |
| 3.5 Compare | Mở 2-3 tab, share link cho vợ qua Zalo | Validating | OG image dynamic, page load nhanh |
| 4. Pick date | Chọn departure còn slot | Deciding | `TourDeparture` với slot availability, anti-overbook |
| 5. Login | Redirect đăng nhập / đăng ký (must-login) | Slight friction | Auth flow tối ưu — Google OAuth 1-click |
| 6. Booking form | Điền tên/SDT/email/số người/ghi chú | Focused | Validation Zod + pre-fill profile, snapshot pricing |
| 7. Payment | VNPay / MoMo redirect, trả tiền, redirect back | Anxious | Payment service, webhook idempotency, transaction safety |
| 8. Confirmation | Trang cảm ơn + email + mã đơn | Relief | Email transactional, `Booking` saved, `ActivityLog` |
| 9. Pre-tour | Email reminder 7 ngày + 1 ngày trước | Excited | Cron / scheduled email |
| 10. Tour | Đi thực tế | (offline) | — |
| 11. Post-tour | Email mời review verified | Satisfied / Disappointed | Review service (chỉ user `COMPLETED` booking) |

### 2.3 Hotspot — chỗ dễ rớt (drop-off)

| Phase | Drop-off risk | Mitigation Phase 1 |
| --- | --- | --- |
| Browse → Detail | Page load chậm | SSR/ISR + image optimize |
| Detail → Pick date | Không có departure phù hợp | Suggest departure khác / destination tương tự |
| Pick date → Login | **Cao nhất** — friction must-login | Google OAuth 1-click, save state khi login để không mất context |
| Form → Payment | Form quá dài / lỗi validation | Pre-fill từ profile, realtime validation, error rõ |
| Payment → Confirm | VNPay timeout / huỷ | Webhook retry + status PENDING + email recovery |

---

## 3. Service Blueprint — Booking flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ FRONTSTAGE (Customer thấy)                                          │
│                                                                     │
│  Detail page → Booking widget → Form modal → Payment redirect       │
│      ↓              ↓                ↓               ↓              │
│ ════════════════════════════════════════════════════════════════════│
│ BACKSTAGE (Vivu xử lý)                                              │
│                                                                     │
│  TourService    BookingService    AuthCheck    Payment Provider     │
│  .getBySlug    .createBooking    requireUser   VNPay/MoMo SDK       │
│      ↓              ↓                ↓               ↓              │
│  Prisma query  Pessimistic lock  Supabase     Webhook listener      │
│                TourDeparture     session      update status         │
│      ↓              ↓                ↓               ↓              │
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
| Payment VNPay timeout | Booking PENDING → email "thử lại" + admin thấy trong dashboard |
| Khách book xong muốn huỷ | Phase 1: form contact admin; Phase 1.5: self-service theo policy |
| Khách quên password | Forgot password flow đã có |
| Admin xoá tour có booking pending | Block xoá (FK constraint) hoặc soft delete `isActive=false` |
| Admin xoá destination | Cascade hide cả tour/hotel xuống public |
| SEO: tour đổi slug | `SeoPage` polymorphic theo entity ID → không orphan |
| Email khách không đến | Resend từ admin dashboard |
| Tour đang chạy hotel huỷ allotment | Manual: admin liên hệ khách swap hotel; không tự động |

---

## 5. Persona → Feature priority matrix

| Feature | Anh Khoa | Chị Linh | Admin Vivu |
| --- | :---: | :---: | :---: |
| Tour list + filter | 🟢 | 🟢 | 🟡 |
| Tour detail gallery | 🟢 | 🟢 | — |
| Itinerary từng ngày | 🟢 | 🟡 | 🟢 |
| Hotel info trong tour | 🟢 | 🟡 | 🟢 |
| Filter "phù hợp gia đình" | 🟢 | ⚪ | — |
| Mobile-first responsive | 🟡 | 🟢 | 🟡 |
| OG image dynamic | 🟡 | 🟢 | — |
| Save / Wishlist | 🟡 | 🟢 | — |
| Payment chính thống | 🟢 | 🟢 | 🟢 |
| Email confirm + reminder | 🟢 | 🟢 | 🟢 |
| Review verified | 🟢 | 🟡 | 🟢 |
| Audit log | — | — | 🟢 |
| SEO override per entity | — | — | 🟢 |
| Loyalty point (P1.5) | 🟡 | 🟢 | 🟡 |

Legend: 🟢 critical · 🟡 nice-to-have · ⚪ không cần · — không áp dụng

---

## Liên kết

- Vision: `01-tam-nhin.md`
- Mô hình kinh doanh: `02-mo-hinh-kinh-doanh.md`
- Lộ trình: `04-lo-trinh-phat-hanh.md`
- Ma trận tính năng tổng: `../01-nghiep-vu/04-ma-tran-tinh-nang.md`
