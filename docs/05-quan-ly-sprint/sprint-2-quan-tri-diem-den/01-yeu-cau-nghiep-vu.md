# Sprint 2: Quản trị nội dung & Điểm đến (Implementation)

Sprint này thực hiện việc hiện thực hóa các tính năng cốt lõi của CMS để chuẩn bị dữ liệu cho toàn hệ thống.

## 1. Phạm vi & Liên kết nghiệp vụ
Các tính năng triển khai trong Sprint này được đặc tả chi tiết tại Product Backlog:
- [Hành vi Admin: Quản lý Điểm đến & Tour](../../03-kho-tinh-nang/quan-tri-noi-dung/admin-features)
- [Hành vi Client: Hiển thị Nội dung](../../03-kho-tinh-nang/quan-tri-noi-dung/client-app-display)

## 2. Acceptance Criteria (AC) - Tiêu chí nghiệm thu

### Task 2.1: Danh mục vùng miền (cố định) — [UPDATED 17/05/2026]

> **Quyết định sản phẩm:** Chỉ **3 vùng miền** (Miền Bắc, Miền Trung, Miền Nam). Không CRUD admin.

- **AC1**: Bảng `regions` được seed sẵn (`mb` / `mt` / `mn`, slug `mien-bac` | `mien-trung` | `mien-nam`).
- **AC2**: Admin chọn vùng miền bắt buộc khi tạo/sửa điểm đến (dropdown).
- **AC3**: Client và API lọc điểm đến theo `regionId` hoặc slug vùng.
- ~~AC cũ (CRUD thêm miền)~~ — **không áp dụng**.

### Task 2.2: Quản lý Điểm đến (POI)
- **AC1**: Upload ảnh lên Cloudinary thành công và lưu URL vào DB.
- **AC2**: Form validation: Tên điểm đến > 5 ký tự, Slug tự động tạo và không dấu.
- **AC3**: Xóa điểm đến phải có confirm modal và check ràng buộc dữ liệu.

### Task 2.3: Tích hợp API v1
- **AC1**: Toàn bộ dữ liệu được fetch thông qua Server Actions / API Routes đã thiết kế.
- **AC2**: Handle lỗi 404, 500 với giao diện Toast thông báo cho Admin.

### Task 2.4: Trang Cài đặt Hệ thống (System Settings)
- **AC1**: Admin có thể cấu hình thông tin chung (Logo, liên hệ), Hero Section, Stats và SEO.
- **AC2**: Dữ liệu cài đặt được lưu trữ theo dạng key-value vào bảng `SystemSetting`.
- **AC3**: Mọi thay đổi ở form được lưu bằng Server Actions và phản ánh ngay ngoài frontend (Client).

---
*Ghi chú: Lịch trình chi tiết và Task phân rã nằm trong [Backlog chi tiết](../backlog-chi-tiet.md).*
