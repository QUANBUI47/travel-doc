# Sprint 3: Khám phá & Tìm kiếm (Implementation)

Sprint này tập trung vào việc hiện thực hóa bộ công cụ tìm kiếm và lọc dữ liệu thông minh để tăng trải nghiệm người dùng.

## 1. Phạm vi & Liên kết nghiệp vụ
Các tính năng triển khai trong Sprint này được đặc tả chi tiết tại Product Backlog:
- [Hành vi Admin: Cấu hình Search & Tag](../../03-kho-tinh-nang/tim-kiem-kham-pha/admin-configs)
- [Hành vi Client: Công cụ Tìm kiếm](../../03-kho-tinh-nang/tim-kiem-kham-pha/client-search-tools)

## 2. Acceptance Criteria (AC) - Tiêu chí nghiệm thu

### Task 3.1: Phát triển Omni-Search (Thanh tìm kiếm)
- **AC1**: Tự động gợi ý (Autocomplete) từ khóa khi người dùng nhập tối thiểu 3 ký tự.
- **AC2**: Hiển thị tối đa 5 kết quả gợi ý (Tour/Điểm đến) kèm Thumbnail.
- **AC3**: Click vào kết quả gợi ý chuyển hướng đúng tới trang Detail.

### Task 3.2: Bộ lọc thông minh (Dynamic Filters)
- **AC1**: Slider khoảng giá (Minimum/Maximum) hoạt động mượt mà.
- **AC2**: Lọc theo Rating (Số sao) kết hợp với lọc theo Vùng miền mà không gây lỗi conflict dữ liệu.
- **AC3**: Khi thay đổi bộ lọc, danh sách kết quả được cập nhật tự động (Auto-refresh) mà không cần tải lại toàn trang.

### Task 3.3: Tích hợp Bản đồ (Map Integration)
- **AC1**: Hiển thị Cluster các điểm đến trên bản đồ Google Maps/MapBox.
- **AC2**: Click vào Pin trên bản đồ hiển thị Popup thông tin ngắn gọn của Tour.

---
*Ghi chú: Lịch trình chi tiết và Task phân rã nằm trong [Backlog chi tiết](../backlog-chi-tiet).*
