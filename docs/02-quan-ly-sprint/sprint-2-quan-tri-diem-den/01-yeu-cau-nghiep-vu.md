# [Sprint 2] Yêu cầu Nghiệp vụ: Quản lý Điểm đến (Destination Management)

Tài liệu này xác định mục tiêu và chức năng chi tiết cho hệ thống quản lý địa danh du lịch.

## 1. Mục tiêu (Objectives)
- Xây dựng kho dữ liệu các địa điểm du lịch trên toàn Việt Nam.
- Cung cấp dữ liệu nguồn cho module Quản lý Tour.
- Hiển thị danh sách điểm đến nổi bật trên Homepage của Client & Mobile.

## 2. Đặc tả Chức năng (Functional Specs)

### A. Web Admin (Quản trị)
- **CRUD Điểm đến**: Thêm, sửa, xóa, xem danh sách.
- **Mapping Vùng miền**: Phân loại điểm đến theo Miền Bắc, Trung, Nam.
- **Upload Gallery**: Hỗ trợ upload nhiều ảnh cùng lúc, tự động tối ưu WebP qua Cloudinary.
- **Tọa độ Map**: Nhập Lat/Long để lấy vị trí chính xác trên bản đồ Mobile.

### B. Client / Mobile (Người dùng)
- **Discovery**: Khám phá các điểm đến theo vùng miền.
- **Featured Sections**: Hiển thị ảnh bìa và mô tả ngắn gọn về địa danh.

## 3. Quy tắc Nghiệp vụ (Business Rules)
- Không được xóa điểm đến nếu đang có Tour đang Active gắn liền với nó.
- Tên địa danh không được phép trùng lặp trong cùng một Vùng miền.
- Ảnh đại diện là bắt buộc đối với mỗi bản ghi Điểm đến.
