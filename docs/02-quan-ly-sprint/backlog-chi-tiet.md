# [PO/BA] Backlog Chi Tiết & Sprint Planning

Bảng kế hoạch chi tiết các Task cho từng Sprint, phân rã từ Roadmap tổng thể. Mỗi task đi kèm với Acceptance Criteria (AC) để Dev/Tester dễ dàng kiểm soát.

## 📅 Sprint 2: Quản trị Nội dung & Điểm đến (In Progress)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP2-01** | CRUD Điểm đến (Admin) | Feature | Thêm/Sửa/Xóa điểm đến kèm bộ lọc Vùng miền | Done |
| **SP2-02** | Tích hợp Cloudinary Multi-upload | Infra | Hỗ trợ upload gallery ảnh cho điểm đến | In Progress |
| **SP2-03** | Quản lý Vùng miền (Regions) | Setup | CRUD danh lục Vùng miền (Bắc/Trung/Nam) | In Progress |
| **SP2-04** | API v1: Đồng bộ dữ liệu | API | Cung cấp endpoint cho Client/Mobile | Todo |
| **SP2-05** | Form Validation & Toast | UI/UX | Thông báo trạng thái lưu/lỗi cho Admin | Done |

### AC (Acceptance Criteria) cho SP2-02:
- [ ] Cho phép chọn nhiều ảnh cùng lúc (max 10 ảnh).
- [ ] Ảnh phải được resize và convert sang WebP trước khi lên Cloudinary.
- [ ] Hiển thị progress bar khi đang upload.

---

## 📅 Sprint 3: Khám phá & Tìm kiếm (Upcoming)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP3-01** | Thiết kế UI/UX Discovery | Design | UI cho màn hình Khám phá vùng miền trên App | Todo |
| **SP3-02** | Search Autocomplete | Feature | Gợi ý địa danh/tour khi user nhập từ khóa | Todo |
| **SP3-03** | Hệ thống Filter động | Logic | Lọc theo giá, đánh giá, loại hình du lịch | Todo |
| **SP3-04** | Interactive Map (Bản đồ) | Map | Hiển thị vị trí tour trên bản đồ Google/Leaflet | Todo |
| **SP3-05** | API Search + Lat/Long | Backend | Xây dựng query search tối ưu | Todo |

---

## 📅 Sprint 4: Đặt chỗ & Thanh toán (Upcoming)

| Task ID | Tên Task | Phân loại | Mô tả | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **SP4-01** | Booking Engine Core | Logic | Xây dựng logic tính giá, kiểm tra slot trống | Todo |
| **SP4-02** | Checkout UI Multi-step | UI | Quy trình 3 bước: Thông tin -> Thanh toán -> Xong | Todo |
| **SP4-03** | Tích hợp VNPay/MoMo | Payment | Kết nối môi trường Sandbox của cổng thanh toán | Todo |
| **SP4-04** | Order Management (Admin) | Admin | Dashboard quản lý đơn hàng cho Admin | Todo |
| **SP4-05** | Email Notification Service | System | Gửi email xác nhận đặt chỗ tự động | Todo |
