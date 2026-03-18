# BA Requirements: Hệ thống Quản trị (Admin System)

> **Role:** Business Analyst (BA)  
> **Status:** Finalized

## 1. Mục tiêu (Product Vision)
Cung cấp bộ công cụ quản trị tập trung cho phép người điều hành kiểm soát toàn bộ nội dung website, quản lý khách hàng và theo dõi tình trạng kinh doanh theo thời gian thực.

## 2. Danh sách User Stories

| ID | Vai trò | Mong muốn | Lợi ích |
|---|---|---|---|
| US-A.1 | Admin | Đăng nhập bằng tài khoản Quản trị riêng | Bảo mật hệ thống, tách biệt với khách hàng. |
| US-A.2 | Admin | Cập nhật thông tin trang chủ (Banner, Slogan) | Thay đổi nội dung marketing nhanh chóng. |
| US-A.3 | Admin | Quản lý danh mục Tour và Điểm đến | Cập nhật kho sản phẩm du lịch. |
| US-A.4 | Admin | Xem và cập nhật trạng thái đơn đặt chỗ | Theo dõi dòng tiền và dịch vụ. |
| US-A.5 | Admin | Biên tập Điều khoản & Chính sách | Đảm bảo tính pháp lý của website. |

## 3. Yêu cầu Chức năng (Functional Requirements)
- **FR-A.1:** Hệ thống phải có trang login riêng tách biệt với public site.
- **FR-A.2:** Dashboard phải hiển thị các chỉ số thống kê (Tours, Bookings, Revenue).
- **FR-A.3:** Hỗ trợ CRUD (Thêm, Sửa, Xóa, Liệt kê) cho: Tour, Khách sạn, Điểm đến, Khách hàng.
- **FR-A.4:** Tích hợp bộ soạn thảo Rich Text (WYSIWYG) cho mô tả Tour và Legal.

## 4. Yêu cầu Phi chức năng (Non-Functional Requirements)
- **NFR-A.1 (Security):** Mọi action admin phải được kiểm tra role `ADMIN` tại Server-side.
- **NFR-A.2 (UX):** Dashboard phải responsive trên cả Mobile/Tablet để quản lý từ xa.
- **NFR-A.3 (Performance):** Tải bảng dữ liệu (Table) với hơn 1000 bản ghi phải có phân trang (Pagination).
