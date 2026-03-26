# [Admin Specs] Sprint 3: Quản trị Tìm kiếm & Khám phá (Search Config)

Đặc tả chi tiết giao diện Admin dành cho việc cấu hình và quản trị bộ lọc tìm kiếm.

## 1. Màn hình Cập nhật "Featured" (Nổi bật)
- **Component**: `SortableList` (HeroUI/Dnd-kit).
- **Mục tiêu**: Cho phép Admin chọn tối đa 6 Điểm đến và 10 Tour để hiển thị tại Homepage "Featured Sections".
- **Hành động**: Kéo thả (Drag-and-drop) để thay đổi thứ tự hiển thị (`sortOrder`).

## 2. Cấu hình "Hot Search" (Từ khóa phổ biến)
- **Component**: `InputTags`.
- **Mục tiêu**: Nhập danh sách các từ khóa mà hệ thống sẽ gợi ý ngay khi người dùng chưa nhập gì vào ô Search (e.g. "Vịnh Hạ Long", "Phú Quốc", "Tour giá rẻ").
- **Hành động**: Thêm/Xóa tags từ khóa.

## 3. Quản lý Loại hình Du lịch (Tour Categories)
- **Component**: `Table` (CRUD Category).
- **Columns**: Tên (Vi/En), Icon (Lucide icon name), Trạng thái.
- **Mục đích**: Cung cấp dữ liệu cho bộ lọc "Loại hình" (e.g. Du lịch tâm linh, Mạo hiểm, Nghỉ dưỡng).

## 4. Đặc tả Quy trình (Admin Flows)
- **Analytics View**: Admin xem biểu đồ "Từ khóa được tìm kiếm nhiều nhất" (Search queries log) để điều chỉnh kế hoạch marketing.
- **Filter Refresh**: Sau khi Admin cập nhật Category, hệ thống tự động xóa cache (Purge Cache) cho bộ lọc ngoài Client.

---
*Tài liệu đặc tả Admin cho Sprint 3.*
