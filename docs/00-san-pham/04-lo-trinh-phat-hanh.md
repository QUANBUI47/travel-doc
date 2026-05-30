# 04 — Lộ trình phát hành (Roadmap)

> **Vai trò đọc**: PO, PM, Scrum Master, Founder — biết "đang ở đâu trong timeline, sắp tới làm gì".
> **Cập nhật**: PM update sau mỗi sprint retro. Mọi pivot scope/sequence phải log vào `99-tham-khao/changelog.md`.

---

## Roadmap tổng (3 phase, 18 tháng)

```
2026 ────────────────────────────────────────────────────► 2027 ───►  2028+
 Q2          Q3            Q4              2027 Q1-Q2     Q3-Q4
 │           │             │               │              │
 │ Phase 1   │ Phase 1     │ Phase 1.5     │ Phase 2      │ Phase 3+
 │ MVP build │ MVP launch  │ EN + loyalty  │ Affiliate +  │ Hotel portal
 │           │ (beta)      │ + upsell      │ Mobile RN    │ lite, đa thị trường
 ▼           ▼             ▼               ▼              ▼
```

### Phase 1 — MVP (Q2-Q3/2026, 3-6 tháng)

**Mục tiêu**: Launch private beta tour operator B2C cho thị trường VN — book Series Tour online + lead capture Private Tour, có CMS đủ vận hành, SEO foundation, dashboard L0.

**Definition of Success**:
- ≥20 tour active trên web (Founder ký contract trước)
- Booking flow happy-path không lỗi với 3 user thật private beta
- SEO: sitemap động + 100% page có metadata + structured data
- Admin tạo 1 tour mới <5 phút (không cần dev support)
- Tháng 6 sau launch đạt ≥50 booking/tháng (target — có thể điều chỉnh)

### Phase 1.5 — Hoàn thiện & EN (Q4/2026)

**Mục tiêu**: Mở rộng audience + tăng AOV + chuẩn bị traffic Phase 2.

| Module | Lý do |
| --- | --- |
| EN landing + content tour quốc tế | Khách quốc tế ghé VN tăng → mở luồng EN |
| Loyalty cơ bản (point + voucher) | Repeat rate >20% → ROI cao hơn acquire mới |
| Upsell (bảo hiểm, room upgrade, sân bay riêng) | Tăng AOV 15-25% không cần thêm tour |
| Self-service cancel theo policy | Giảm load support |
| Admin Dashboard L1 (conversion, AOV, retention) | Đo lường hiệu quả marketing |

### Phase 2 — Scale (2027)

**Mục tiêu**: Tăng acquisition channel + chuyển mobile.

| Module | Lý do |
| --- | --- |
| Affiliate / KOL referral | Acquire mới qua người nổi tiếng — không marketplace |
| Mobile app (React Native) | Khi web mobile đã chứng minh retention |
| Inventory tinh chỉnh (per-date allotment tracking) | Khi volume đủ để vận hành chi tiết hơn |
| Admin Dashboard L2 (P&L tour, profit/tour) | Khi accounting đã ổn định |

### Phase 3+ — Mở rộng (2028+)

- Hotel portal lite (vẫn không OTA — chỉ partner self-update info)
- Đa thị trường (CN/JP nếu data ủng hộ)
- Multi-tenant admin nếu acquire công ty khác
- **Chưa committed** — phụ thuộc Phase 1+2 outcome.

---

## Sprint roadmap Phase 1

```
SPRINT 1 ──► SPRINT 2 ──► SPRINT 3 ──► SPRINT 4 ──► SPRINT 5 ──► SPRINT 6
Foundation  CMS         Discovery    Booking      Member       Optimize
(Done)      (Done)      (Doing)      (Upcoming)   (Upcoming)   (Upcoming)
```

### Tầng 1 — Foundation (Sprint 1-2, Done)

**Sprint 1 — Nền tảng & Hạ tầng** ✅
- Mono-repo (Web + App + Doc)
- Prisma + Supabase Auth + middleware admin/public
- Service layer convention

→ Chi tiết: `../05-quan-ly-sprint/sprint-1-nen-tang.md`

**Sprint 2 — Quản trị Nội dung & Điểm đến** ✅
- CRUD destination / tour / hotel / room / region
- Cloudinary upload + image management
- Audit log (`ActivityLog`)

→ Chi tiết: `../05-quan-ly-sprint/sprint-2-quan-tri-diem-den/`

### Tầng 2 — Đổi nền schema + Tạo doanh thu (Sprint 3 → 6)

**Sprint 3 — Khám phá & Tìm kiếm** 🔶 Tạm dừng (~40%)
- Trang danh sách tour + lọc cơ bản đã có
- Gợi ý từ khoá, lọc theo đánh giá, bản đồ gom điểm → đẩy sang **Sprint 5** (sau khi đổi nền schema)
- Đã hỗ trợ trang chạy server (SSR/ISR) + bộ nhớ đệm

→ Chi tiết: `../05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/`

**Sprint 4 — Đổi nền Schema (Schema Pivot)** 🔥 ĐANG LÀM (2 tuần)
- Sprint chỉnh lại toàn bộ cấu trúc dữ liệu cho khớp các quyết định kiến trúc ADR-001..006 (Khách sạn = nội dung tham chiếu, Bảng giá theo đầu khách, ID kiểu UUID, Form yêu cầu tour riêng)
- Chạy migration `add_pricing_options_and_allotment` (10 phần)
- Chỉnh lại CRUD Tour + Service đặt chỗ + Widget đặt nhiều khách
- Lý do tồn tại: nếu đi thẳng Sprint 6 (Đặt chỗ) với cấu trúc dữ liệu cũ → chắc chắn phải làm lại

→ Chi tiết: `../05-quan-ly-sprint/sprint-4-schema-pivot/`

**Sprint 5 — Đóng nốt Tìm kiếm** ⏳ Sắp tới (1.5 tuần)
- Làm tiếp 60% Sprint 3 còn dở
- Gợi ý từ khoá, lọc theo đánh giá / loại tour, bản đồ gom điểm

→ Chi tiết: `../05-quan-ly-sprint/sprint-5-dong-tim-kiem/`

**Sprint 6 — Đặt chỗ & Thanh toán** ⏳ Sắp tới (3 tuần)
- **Sprint quan trọng nhất Phase 1** — sinh doanh thu
- Luồng đặt: chọn ngày → form khách → thanh toán → xác nhận (đã chỉnh xong cấu trúc ở Sprint 4)
- Khoá hàng đợi `TourDeparture.bookedCount` để tránh đặt trùng (đã có sẵn từ Sprint 4)
- Tích hợp VNPay + MoMo
- Form yêu cầu tour riêng `InquiryRequest` (đã làm ở Sprint 4)
- Tự động huỷ đặt chỗ chưa thanh toán quá 15 phút (job định kỳ)
- Email gửi xác nhận (Resend)

**Điều kiện cần trước** (Sprint 4 đã đảm bảo):
1. ✅ Migration `add_pricing_options_and_allotment` (Sprint 4 task S4-01)
2. ✅ Toàn bộ ID/khoá ngoại đã chuyển sang UUID (ADR-003) — Sprint 4 task S4-01
3. ✅ Khoá ngoại `Booking.userId` + `Review.userId` đổi sang `onDelete: Restrict` để không xoá nhầm (Sprint 4)
4. ✅ Bảng giá theo đầu khách đã sống (Sprint 4 task S4-03/04/05)
5. ✅ Tài liệu `03-co-so-du-lieu/03-toan-ven-concurrency.md` đã chốt

→ Chi tiết: `../05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/`

### Tầng 3 — Giữ chân khách & Ra mắt (Sprint 7-8)

**Sprint 7 — Đánh giá khách** ⏳ (1.5 tuần)
- Đánh giá đã xác minh (chỉ user đã đặt tour `COMPLETED` mới đánh giá được)
- Admin duyệt / từ chối đánh giá
- Hiển thị đánh giá trên trang chi tiết tour + đánh dấu Schema.org `aggregateRating` để Google hiểu
- Trang cá nhân `/tai-khoan/*` + đơn của tôi `/don-dat/*`

> ~~Tích điểm thành viên~~ — hoãn sang Phase 2.

→ Chi tiết: `../05-quan-ly-sprint/sprint-7-danh-gia/`

**Sprint 8 — Báo cáo + SEO + Ra mắt** ⏳ (2 tuần)
- Bảng tổng quan vận hành L0 (đơn hôm nay, doanh thu tuần, tour bán chạy, xuất CSV — xem ADR-007)
- Hoàn thiện SEO (Lighthouse >90, Core Web Vitals, ảnh chia sẻ mạng xã hội, Schema.org đầy đủ)
- Tối ưu hiệu năng + tinh chỉnh bộ nhớ đệm
- Danh sách kiểm tra trước khi ra mắt (tên miền, SSL, theo dõi, sao lưu, thông báo fanpage)

→ Chi tiết: `../05-quan-ly-sprint/sprint-8-quy-hoach-toi-uu/`

---

## Vì sao theo thứ tự này

| Quyết định | Lý do |
| --- | --- |
| **Sprint 4 Đổi nền trước Sprint 6 Đặt chỗ** | Cấu trúc dữ liệu cũ lệch ADR-001..006 ở 7 chỗ. Đi thẳng Sprint 6 với cấu trúc cũ chắc chắn phải làm lại. Đổi nền 2 tuần để cứu được 4-6 tuần làm lại |
| **Sprint 5 Đóng tìm kiếm sau Đổi nền** | Sprint 3 đã tạm dừng ở 40%. Sprint 5 dùng cấu trúc dữ liệu mới (bảng giá theo đầu khách, loại tour kiểu enum) cho lọc đánh giá + gợi ý |
| **Đặt chỗ trước Đánh giá** (Sprint 6 trước Sprint 7) | Sinh doanh thu. Đánh giá tuy có cấu trúc dữ liệu sẵn nhưng UI có thể hoãn 1 sprint mà không chặn ra mắt |
| **CMS trước Khám phá** | Admin cần tạo tour để có dữ liệu hiển thị; Sprint 3 dùng dữ liệu của Sprint 2 |
| **SEO ở Sprint 8, không phải Sprint 1** | Nền tảng SEO (thẻ meta, sitemap) đã có từ Sprint 1; tối ưu Lighthouse để Sprint 8 khi đã có đủ dữ liệu |
| **Tối ưu cuối cùng** | Đo hiệu năng cần dữ liệu giống thật → chạy trên dữ liệu thật |
| **Form yêu cầu tour riêng gộp vào Sprint 4 Đổi nền** | Cùng đụng tới đặt chỗ + email + thông báo admin — gộp tránh trùng việc |
| **Hoãn Tích điểm thành viên** | Khách Việt giai đoạn đầu ít quan tâm thẻ thành viên du lịch. Làm sau khi có 100-200 khách thật |

---

## Mốc & Sản phẩm bàn giao

| Tháng | Mốc | Sản phẩm |
| --- | --- | --- |
| **M1** (now) | Sprint 4 Đổi nền xong | Cấu trúc dữ liệu UUID + 10 phần migration đã chạy + Bảng giá theo đầu khách đã sống + Form yêu cầu tour riêng đã sống |
| **M2** | Sprint 5 đóng | Gợi ý từ khoá + lọc theo đánh giá + bản đồ gom điểm |
| **M3** | Sprint 6 đóng | Luồng đặt tour đầu cuối + 3 user thử + VNPay + email |
| **M4** | Sprint 7 đóng | Đánh giá đã xác minh đi vào hoạt động, trang cá nhân |
| **M5** | Sprint 8 đóng | Lighthouse >90, Bảng tổng quan vận hành L0, danh sách kiểm tra trước ra mắt |
| **M6** | **Ra mắt nội bộ (private beta)** | 20 tour + 3-5 user thật + Founder go-live |

---

## Rủi ro về tiến độ

| Rủi ro | Tác động | Cách phòng ngừa |
| --- | --- | --- |
| Migration `add_pricing_options_and_allotment` hỏng phải khôi phục | Chặn Sprint 6 → mất 1-2 tuần | Test trên Supabase staging với bản dump prod trước, chạy script kiểm tra trước khi áp dụng, có sao lưu PITR |
| VNPay/MoMo sandbox không ổn định | Chặn nghiệm thu Sprint 6 | Dùng sandbox sớm cuối Sprint 5, có phương án giả lập dự phòng |
| Lượng truy cập SEO không lên đúng kỳ vọng | Phase 1.5 lùi | Dồn ngân sách quảng cáo bù 6-12 tháng đầu |
| Hotel partner không đủ 20 tour | Phase 1 launch trì hoãn | Founder track contract weekly, có buffer 30% |
| Team scale: 2 dev không kịp | Sprint trễ 2-3 tuần | Đã chấp nhận trade-off scope, không scope creep |

---

## Build vs Buy — quyết định Phase 1

| Module | Build / Buy | Lý do |
| --- | --- | --- |
| Auth | **Buy** (Supabase Auth) | Free tier đủ, không build custom — security risk |
| Payment | **Buy** (VNPay + MoMo SDK) | Bắt buộc — không có lựa chọn build |
| Email transactional | **Buy** (Resend) | Free tier 3k/tháng đủ phase 1 |
| Image hosting | **Buy** (Cloudinary) | Free tier đủ, optimize tự động |
| Analytics | **Buy** (PostHog free / Plausible) | Build từ 0 mất 2-3 sprint |
| Search | **Build** (Postgres full-text) | Phase 1 chưa cần Algolia/Meilisearch — Postgres đủ với <1k tour |
| CMS | **Build** (Next.js admin portal) | Off-the-shelf CMS không hợp model tour |
| Dashboard L0 | **Build** | Đơn giản, query Prisma + render. L1/L2 sau cân nhắc buy |

---

## Resource Phase 1

| Vai trò | FTE | Trách nhiệm |
| --- | --- | --- |
| Founder | 1.0 | Vision, contract hotel/partner, sales, GTM |
| Tech Lead / Senior Dev | 1.0 | Architecture, DB, code review, mentor |
| Dev (mid/junior) | 1-2 | Feature implementation theo sprint |
| Content / Ops (part-time) | 0.5 | Upload tour, viết SEO content, hỗ trợ khách |
| Designer (freelance) | 0.2 | UI Figma + component spec |

**Tổng**: 3-5 FTE Phase 1. Phase 1.5 cân nhắc thêm 1 marketer + 1 customer support.

---

## Liên kết

- Vision: `01-tam-nhin.md`
- Mô hình kinh doanh: `02-mo-hinh-kinh-doanh.md`
- Personas: `03-personas-user-journey.md`
- Sprint folders: `../05-quan-ly-sprint/`
- Trạng thái triển khai web: `../05-quan-ly-sprint/trang-thai-web.md`
- Backlog chi tiết: `../05-quan-ly-sprint/backlog-chi-tiet.md`
