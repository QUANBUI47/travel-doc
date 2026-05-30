# [PO/BA] Backlog Chi Tiết & Sprint Planning

Bảng kế hoạch chi tiết các Task cho từng Sprint, phân rã từ Roadmap tổng thể. Mỗi task đi kèm với Acceptance Criteria (AC) để Dev/Tester dễ dàng kiểm soát.

> **Trạng thái code web:** [Trạng thái triển khai Web](./trang-thai-web.md) · **Roadmap:** [../roadmap.md](../roadmap.md)

---

## 📅 Sprint 2: Quản trị Nội dung & Điểm đến (Done)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP2-01** | CRUD Điểm đến (Admin) | Feature | Thêm/Sửa/Xóa điểm đến kèm bộ lọc Vùng miền | Done |
| **SP2-02** | Tích hợp Cloudinary Multi-upload | Infra | Hỗ trợ upload gallery ảnh cho điểm đến | Done |
| **SP2-03** | Danh mục Vùng miền (Regions) | Setup | **3 miền cố định** (Bắc/Trung/Nam) — seed DB, dropdown admin | Done |
| **SP2-05** | Form Validation & Toast | UI/UX | Thông báo trạng thái lưu/lỗi cho Admin | Done |
| **SP2-06** | Trang Cài đặt Hệ thống (Admin) | Feature | Quản lý cấu hình chung (logo, liên hệ, API keys, email) | Done |

### Ghi chú SP2-03 (Regions) — [UPDATED 17/05/2026]

- **Không** triển khai CRUD admin cho bảng `regions` — danh mục **cố định** theo thị trường VN.
- Dữ liệu: `prisma/seed.ts` (`mien-bac`, `mien-trung`, `mien-nam`).
- Admin chọn vùng khi tạo điểm đến; client lọc theo `regionId` / slug.

### AC (Acceptance Criteria) cho SP2-02 — tùy chọn sau

- [ ] Cho phép chọn nhiều ảnh cùng lúc (max 10 ảnh).
- [ ] Ảnh phải được resize và convert sang WebP trước khi lên Cloudinary.
- [ ] Hiển thị progress bar khi đang upload.

*Upload cơ bản đã có; các AC trên là nâng cao, không chặn đóng Sprint 2.*

---

## 📅 Sprint 3: Khám phá & Tìm kiếm (In Progress)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP3-00** | CRUD Tour (Admin + Client) | Feature | Admin tours, public `/tours`, chi tiết tour | Done (web) |
| **SP3-01** | Thiết kế UI/UX Discovery | Design | UI khám phá vùng miền / điểm đến trên Web Client | In Progress |
| **SP3-02** | Search Autocomplete | Feature | Gợi ý địa danh/tour khi user nhập từ khóa | Todo |
| **SP3-03** | Hệ thống Filter động | Logic | Lọc theo giá, đánh giá, loại hình du lịch | In Progress |
| **SP3-04** | Interactive Map (Bản đồ) | Map | Hiển thị vị trí tour trên bản đồ Google/Leaflet | Todo |
| **SP3-05** | API Search + Lat/Long | Backend | Query search tối ưu | In Progress |

---

## 📅 Sprint 4: Đặt chỗ & Thanh toán (Upcoming)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP4-01** | Booking Engine Core | Logic | Xây dựng logic tính giá, kiểm tra slot trống | Todo |
| **SP4-02** | Checkout UI Multi-step | UI | Quy trình 3 bước: Thông tin -> Thanh toán -> Xong | Todo |
| **SP4-03** | Tích hợp VNPay/MoMo | Payment | Kết nối môi trường Sandbox của cổng thanh toán | Todo |
| **SP4-04** | Order Management (Admin) | Admin | Dashboard quản lý đơn hàng cho Admin | In Progress |
| **SP4-05** | Email Notification Service | System | Gửi email xác nhận đặt chỗ tự động | Todo |

*SP4-04: web đã có danh sách đơn read-only; chưa tạo đơn từ client.*

---

## 🔐 Auth khách hàng (đã triển khai trên web)

| Task | Mô tả | Trạng thái |
| :--- | :--- | :--- |
| **AUTH-01** | Đăng ký / đăng nhập email + xác nhận email | Done |
| **AUTH-02** | Quên mật khẩu / đặt lại mật khẩu | Done |
| **AUTH-03** | Đăng nhập Google (Supabase OAuth) | Done |
| **AUTH-04** | Đồng bộ `profiles` (Prisma) sau auth | Done |

---

## 📱 Phase 2: Mobile App (Deferred)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **APP-01** | API v1: Đồng bộ dữ liệu | API | Cung cấp endpoint RESTful cho Expo App | Todo |
| **APP-02** | Tích hợp React Query | Infra | Setup React Query và Zustand trên Mobile | Todo |
| **APP-03** | Màn hình Home & Discovery | UI | Hiển thị Vùng miền & Điểm đến nổi bật | Todo |
