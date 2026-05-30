# 03 — Thuật ngữ (Glossary)

> **Vai trò đọc**: ai mới vào dự án — đọc 1 lần để hiểu thuật ngữ trong doc + chat team.
> Sắp xếp theo nhóm thay vì alphabet để học theo ngữ cảnh.

---

## A. Kinh doanh — du lịch

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **B2C** | Bán trực tiếp cho khách lẻ (Business-to-Consumer) — Vivu Phase 1 |
| **B2B** | Bán cho doanh nghiệp/công ty (Business-to-Business) — Vivu Phase 1 chỉ qua `InquiryRequest` |
| **MICE** | Meetings, Incentives, Conferences, Exhibitions — du lịch sự kiện công ty. Vivu không làm Phase 1 |
| **Tour operator** | Công ty tự đóng gói tour + bán cho khách cuối (Vivu, Vietravel) — khác với OTA (Online Travel Agent — sàn như Klook, Booking) |
| **Tour package** | Tour trọn gói gồm xe + hotel + ăn + guide + vé tham quan. Khách trả 1 cục |
| **Series Tour** | Tour ghép — Vivu set sẵn ngày khởi hành + giá per-pax, khách lẻ book chung đoàn 15-20 người |
| **Private Tour** | Tour riêng cho 1 nhóm (gia đình, công ty) — không ghép, ngày tự do, quote riêng |
| **Departure** | 1 lịch khởi hành cụ thể của 1 tour (vd Tour Đà Lạt 4N3Đ ngày 15/06/2026) |
| **Itinerary** | Lịch trình chi tiết từng ngày của tour |
| **Allotment** | Phòng-đêm Vivu đã ký giữ trước với hotel (vd 100 phòng-đêm tháng 6) |
| **Cut-off date** | Hạn cuối Vivu phải release phòng không bán được (3-7 ngày trước check-in) |
| **Free-sale** | Mô hình ký allotment, Vivu được giữ phòng + bán tự do đến cut-off |
| **No-show** | Khách không xuất hiện → Vivu vẫn phải trả hotel theo HĐ |
| **Wash** | Tour không đủ số tối thiểu phải cancel → khách bực, brand giảm |

---

## B. Kinh tế đơn hàng

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **Markup** | Tiền chênh lệch giá vốn vs giá bán (lãi gộp) |
| **Revenue** | Doanh thu — tổng tiền khách trả |
| **COGS** (Cost of Goods Sold) | Giá vốn — tiền Vivu chi cho hotel/xe/guide/ăn |
| **Gross profit** | Lợi nhuận gộp = Revenue − COGS |
| **Net profit** | Lợi nhuận thực = Gross profit − lương − marketing − thuế − tất cả overhead |
| **Variable cost** | Chi phí biến đổi — phát sinh theo từng đơn (hotel/xe/guide) |
| **Fixed cost** | Chi phí cố định — trả đều mỗi tháng (lương, hosting, văn phòng) |
| **Break-even** | Điểm hoà vốn — gross profit = fixed cost (tháng đó không lỗ không lãi) |
| **Runway** | Số tháng tiền còn lại trước khi cạn vốn |
| **AOV** (Average Order Value) | Trung bình mỗi đơn bao nhiêu tiền |
| **CAC** (Customer Acquisition Cost) | Tốn bao nhiêu marketing để có 1 khách mới |
| **LTV** (Lifetime Value) | Tổng tiền 1 khách chi cho Vivu suốt vòng đời |
| **Conversion rate** | Tỉ lệ khách vào web → khách book |
| **Repeat rate** | Tỉ lệ khách book lần 2+ |
| **KPI** | Key Performance Indicator — chỉ số đo hiệu quả |
| **MVP** | Minimum Viable Product — phiên bản tối thiểu khả thi để launch |
| **YAGNI** | You Aren't Gonna Need It — đừng làm cái chưa cần (anti-scope-creep) |

---

## C. Tech & Architecture

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **Monorepo** | Nhiều project (web, app, doc) trong cùng 1 git repo |
| **App Router** | Cách routing mới của Next.js 13+ (folder-based, Server Components mặc định) |
| **RSC** (React Server Component) | Component chỉ chạy ở server, không gửi JS xuống browser |
| **Server Action** | Function chạy server gọi từ form/button client — thay cho REST API cho mutation đơn giản |
| **ORM** | Object-Relational Mapping — viết code thay cho SQL (Vivu dùng Prisma) |
| **Migration** | Script đổi schema DB (thêm bảng, đổi cột) version control |
| **Seed** | Data mẫu insert lúc setup (vd 3 miền `mb`/`mt`/`mn`) |
| **DDL** | Data Definition Language — SQL đổi schema (CREATE, ALTER, DROP) |
| **DML** | Data Manipulation Language — SQL đổi data (INSERT, UPDATE, DELETE) |
| **FK** | Foreign Key — liên kết giữa 2 bảng |
| **PK** | Primary Key — khoá chính (UUID) |
| **Cascade** | Khi parent xoá → child xoá theo |
| **Restrict** | Khi parent xoá nhưng còn child → reject xoá |
| **SetNull** | Khi parent xoá → child set FK = null |
| **CHECK constraint** | Quy tắc DB tự enforce (vd `rating BETWEEN 1 AND 5`) |
| **Index** | Cấu trúc data tăng tốc query (như mục lục sách) |
| **Partial index** | Index chỉ chứa subset row (vd `WHERE is_active = true`) |
| **B-tree** | Cấu trúc index mặc định Postgres |
| **Pessimistic lock** | Lock row trước khi đọc (`SELECT FOR UPDATE`) — chống race |
| **Optimistic lock** | Check version trước khi update — nhẹ hơn nhưng cần retry |
| **Transaction Serializable** | Mức cô lập cao nhất — chống mọi anomaly |
| **Polymorphic** | 1 entity tham chiếu nhiều loại target (vd Review → Hotel hoặc Tour) |
| **Exclusive Arc** | Pattern polymorphic chuẩn DB-level: nhiều FK nullable + CHECK ép đúng 1 non-NULL |

---

## D. SEO & Marketing tech

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **SEO** | Search Engine Optimization — tối ưu để hiện top Google miễn phí |
| **SERP** | Search Engine Results Page — trang kết quả Google |
| **Organic traffic** | Khách vào web từ search Google không qua Ads |
| **Paid traffic** | Khách vào từ quảng cáo (Google Ads, FB Ads) |
| **Metadata** | Thông tin về trang gửi cho Google (title, description, og:image) |
| **Structured data** | JSON-LD schema.org — đánh dấu loại nội dung (Tour, Hotel) cho Google hiểu |
| **Sitemap** | File XML liệt kê tất cả URL → Google biết crawl gì |
| **Canonical URL** | URL "chuẩn" của 1 trang → tránh duplicate content |
| **Slug** | Phần URL friendly (vd `/tours/tour-da-lat-4-ngay`) |
| **OG image** | Open Graph image — preview khi share FB/Zalo |
| **CTR** (Click-Through Rate) | Tỉ lệ người thấy link → click |
| **Bounce rate** | Tỉ lệ khách vào → out ngay không tương tác |
| **Lighthouse** | Tool Google đo performance/accessibility/SEO của 1 page (score 0-100) |
| **Core Web Vitals** | 3 metric chính Google đánh giá UX page: LCP, FID, CLS |

---

## E. Auth & Security

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **Supabase Auth** | Service Supabase quản user — Vivu dùng để xử login |
| **OAuth** | Login qua bên 3 (Google) — không lưu password |
| **JWT** | Token xác thực — chứa info user, hết hạn sau 1 thời gian |
| **Session** | Phiên đăng nhập — Vivu lưu trong cookie HTTPS-only |
| **CSRF** | Cross-Site Request Forgery — attack giả request từ site khác |
| **XSS** | Cross-Site Scripting — attack inject JS vào page |
| **PII** | Personally Identifiable Information — info cá nhân (tên, SDT, email) |
| **GDPR** | Luật bảo vệ data EU — yêu cầu right-to-erasure (xoá data theo yêu cầu) |
| **Rate limiting** | Giới hạn số request/phút từ 1 IP — chống bot |

---

## F. Operational

| Thuật ngữ | Định nghĩa đời thường |
| --- | --- |
| **Cron job** | Task chạy định kỳ (vd auto-cancel 1 phút/lần) |
| **Webhook** | URL bên ngoài gọi vào server mình khi có sự kiện (VNPay → mình khi khách trả tiền) |
| **Idempotency** | Property: gọi lại 1 request 2 lần → kết quả như 1 lần (chống duplicate khi retry) |
| **Snapshot** | Lưu bản sao state tại thời điểm — vd `priceBreakdown` snapshot giá khi book |
| **Audit log** | Bản ghi mọi thay đổi data (`ActivityLog`) — cho compliance + debug |
| **Service layer** | Tầng business logic giữa page và DB — page chỉ gọi service, service mới gọi Prisma |
| **DTO** (Data Transfer Object) | Object đóng gói data truyền giữa các layer |

---

## G. Vivu-specific

| Thuật ngữ | Định nghĩa |
| --- | --- |
| **Vivu** | Tên brand — tour operator B2C trực tuyến cho thị trường VN |
| **Phase 1 / 1.5 / 2 / 3+** | Mốc thời gian roadmap (xem `../00-san-pham/04-lo-trinh-phat-hanh.md`) |
| **ADR** | Architectural Decision Record — file ghi 1 quyết định technical lớn |
| **`travel-web`** | Repo code Next.js của Vivu |
| **`travel-doc`** | Repo doc (file này nằm trong đây) |
| **Dashboard L0/L1/L2** | 3 tier admin reporting (ADR-007). L0 operational (Phase 1). L1 business metric (Phase 1.5). L2 P&L (Phase 2) |
| **N-01 → N-04** | 4 nguyên tắc DB của Vivu (xem `../03-co-so-du-lieu/03-toan-ven-concurrency.md`) |
| **BR-XX** | Business Rule ID (xem `02-quy-tac-nghiep-vu.md`) |
| **Anh Khoa / Chị Linh / Admin Vivu** | 3 personas chính (xem `../00-san-pham/03-personas-user-journey.md`) |

---

## Liên kết

- Luồng nghiệp vụ: `01-luong-nghiep-vu-cot-loi.md`
- Quy tắc nghiệp vụ: `02-quy-tac-nghiep-vu.md`
- Ma trận tính năng: `04-ma-tran-tinh-nang.md`
- Mô hình kinh doanh: `../00-san-pham/02-mo-hinh-kinh-doanh.md`
