# [Admin Specs] Sprint 2: Quản trị Điểm đến (POI Management)

Đặc tả chi tiết giao diện và tương tác dành cho Quản trị viên tại hệ thống `/admin/destinations`.

## 1. Giao diện Danh sách (List View)
- **Component**: `Table` (HeroUI).
- **Columns**:
    - **Tên**: Avatar ảnh đại diện, Tên tiếng Việt/Anh bên dưới.
    - **Vùng miền**: Chip (Miền Bắc: blue, Miền Trung: orange, Miền Nam: green).
    - **Slug**: Code block mini màu xám nhạt (`bg-slate-100`).
    - **Trạng thái**: Switch (Active/Hidden) cập nhật trực tiếp qua API.
    - **Hành động**: Tooltip (Edit, Delete).
- **Search Bar**: Ô tìm kiếm phía trên bảng, hỗ trợ tìm theo `name` hoặc `slug`.
- **Add New Button**: Nút "Thêm điểm đến mới" màu primary, icon `Plus`.

## 2. Form Thêm mới/Chỉnh sửa (Modal View)
- **Component**: `Modal` (HeroUI), kích thước `3xl`, scroll-behavior `inside`.
- **Layout**: 2 cột trên desktop, 1 cột trên mobile.
- **Phần nhập liệu (Form Fields)**:
    - **BilingualInput**: Hộp nhập song ngữ VI/EN.
    - **Slug Generator**: Khi nhập `nameVi`, `slug` tự động sinh ra nhưng cho phép edit.
    - **ImageUploader**: Kéo thả ảnh. Sau khi upload, hiển thị ảnh preview kèm nút xóa (x).
    - **RegionSelect**: Dropdown chọn Vùng miền (3 miền cố định — `getRegionsAction` / seed DB).
- **Validation (Client-side)**:
    - `nameVi` không được trống.
    - `regionId` phải được chọn.
    - `slug` không được chứa ký tự đặc biệt, chỉ `a-z`, `0-9`, `-`.

## 3. Quy trình Tương tác (Interaction Flows)
- **Thao tác Sửa**: Mở Modal -> Đổ dữ liệu cũ vào form -> Nhấn "Lưu" -> Gọi `PUT /api/v1/destinations/:id` -> Toast thông báo thành công -> Re-fetch data table.
- **Thao tác Xóa**: Click Delete -> Alert confirm -> Gọi `DELETE /api/v1/destinations/:id` -> Nếu lỗi 403 (do có tour liên quan) -> Hiển thị Modal thông báo chi tiết lỗi ràng buộc.
- **Tối ưu UX**: Hiển thị `Skeleton` khi table đang load data từ API.

## 4. Trang Cài đặt Hệ thống (System Settings)
- **Đường dẫn**: `/admin/settings/system` (và các module con như `/admin/settings/homepage`, `/admin/settings/seo`).
- **Mục đích**: Quản lý trạng thái vận hành và các thiết lập toàn cục của hệ thống.
- **Giao diện**:
    - Sử dụng các Form component chia theo từng nhóm (General, Hero Section, Stats, SEO).
    - Lưu trữ dữ liệu dạng key-value vào bảng `SystemSetting` trong database.
- **Tính năng chính**:
    - **Cài đặt chung (General)**: Quản lý logo, thông tin liên hệ, trạng thái bảo trì.
    - **Cấu hình Trang chủ (Homepage)**: Thay đổi banner (Hero Section), câu khẩu hiệu, hiển thị thống kê.
    - **SEO & Metadata**: Cấu hình `siteTitle`, `metaDescription`, `favicon`, thẻ OpenGraph.
- **Lưu ý kỹ thuật**: Dữ liệu cài đặt được load từ Prisma và xử lý form thông qua Next.js Server Actions.

---
*Tài liệu đặc tả Admin cho Sprint 2 (Đã cập nhật bổ sung Cài đặt hệ thống).*
