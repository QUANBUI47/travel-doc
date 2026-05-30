# [Thiết kế Chi tiết] Module: Khám phá & Tìm kiếm (Functional Specs)

Tài liệu thiết kế chi tiết (Detailed Design Document) cho module Discovery & Search, hỗ trợ Dev/QA/BA kiểm soát logic vận hành.

## 1. Công cụ Tìm kiếm (Search Engine Logic)

### Thuật toán khớp kết quả (Matching Algorithm):
- **Phạm vi search**: Search theo `nameVi`, `nameEn`, `description`, và `tags`.
- **Độ ưu tiên (Priority Index)**: 
    - Khớp chính xác `name` -> 50 điểm.
    - Khớp một phần `name` -> 30 điểm.
    - Khớp `tags` -> 15 điểm.
    - Khớp trong `description` -> 5 điểm.
- **Dấu tiếng Việt**: Hỗ trợ tìm kiếm theo cả tiếng Việt có dấu và không dấu (Fuzzy Search).

## 2. Đặc tả Bộ lọc (Filter Components)

### Thanh trượt giá (Price Slider):
- **Range**: Từ 0 đến giá cao nhất của tour đang có trong hệ thống (Max Price).
- **Behavior**: Kết quả tự động thay đổi sau mỗi 300ms (Debouncing) khi người dùng di chuyển thanh trượt.

### Xếp hạng của Tour (Rating Stars):
- **Input**: User chọn biểu tượng sao (1 sao trở lên).
- **Logic**: Chỉ hiển thị các tour có Rating trung bình `>=` số sao đã chọn.

## 3. Trạng thái và Phản hồi UI (UX States)

### Trạng thái "Trống" (Empty States):
- **UI**: Hiển thị ảnh minh họa (SVG mẫu) và thông điệp: "Chưa có Tour phù hợp".
- **Gợi ý**: Đề xuất các Tour "Hot" nhất hoặc các điểm đến thuộc Vùng miền khác.

### Màn hình Chờ (Loading States):
- **UI**: Sử dụng **Skeleton screens** (UI giả lập) cho các card tour thay vì spinner đơn điệu.
- **Skeleton Layout**: Bao gồm 1 khối ảnh lớn, 2 dòng text tiêu đề, 1 badge giá tiền.

## 4. Xử lý Lỗi & Ràng buộc (Edge Cases)

- **Lỗi Mạng (Network Error)**: Hiển thị Toast "Kết nối bị gián đoạn, vui lòng kiểm tra tín hiệu mạng".
- **Lỗi Query (Timeout)**: Hủy bỏ request sau 5 giây nếu không có phản hồi và hiển thị "Hệ thống đang bận, vui lòng thử lại sau".

---
*Tài liệu chi tiết được định nghĩa bởi BA cho Sprint 3.*
