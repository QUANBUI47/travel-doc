# Sprint 2: Quản trị nội dung & Điểm đến (Implementation)

Sprint này thực hiện việc hiện thực hóa các tính năng cốt lõi của CMS để chuẩn bị dữ liệu cho toàn hệ thống.

## 1. Phạm vi & Liên kết nghiệp vụ
Các tính năng triển khai trong Sprint này được đặc tả chi tiết tại Product Backlog:
- [Hành vi Admin: Quản lý Điểm đến & Tour](../../03-kho-tinh-nang/quan-tri-noi-dung/admin-features)
- [Hành vi Client: Hiển thị Nội dung](../../03-kho-tinh-nang/quan-tri-noi-dung/client-app-display)

## 2. Acceptance Criteria (AC) - Tiêu chí nghiệm thu

### Task 2.1: CRUD Danh mục vùng miền
- **AC1**: Admin có thể tạo mới vùng miền với Tên và Mã vùng.
- **AC2**: Không cho phép trùng Mã vùng.
- **AC3**: Cập nhật Tên vùng miền sẽ phản ánh ngay lập tức trên các Tour liên quan.

### Task 2.2: Quản lý Điểm đến (POI)
- **AC1**: Upload ảnh lên Cloudinary thành công và lưu URL vào DB.
- **AC2**: Form validation: Tên điểm đến > 5 ký tự, Slug tự động tạo và không dấu.
- **AC3**: Xóa điểm đến phải có confirm modal và check ràng buộc dữ liệu.

### Task 2.3: Tích hợp API v1
- **AC1**: Toàn bộ dữ liệu được fetch thông qua Server Actions / API Routes đã thiết kế.
- **AC2**: Handle lỗi 404, 500 với giao diện Toast thông báo cho Admin.

---
*Ghi chú: Lịch trình chi tiết và Task phân rã nằm trong [Backlog chi tiết](../backlog-chi-tiet).*
