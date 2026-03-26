# [Thiết kế Cơ bản] Module: Khám phá & Tìm kiếm (User Flow & IA)

Tài liệu thiết kế cơ bản cho module Discovery & Search, mô tả luồng người dùng (User Stories) và kiến trúc thông tin (Information Architecture).

## 1. Luồng Người dùng (User Flow)

### Story 1: Tìm kiếm theo Vùng miền & Tour nổi bật
- **Actor**: Khách hàng vãng lai.
- **Quy trình**:
    1. Truy cập **Homepage**.
    2. Một danh sách "Điểm đến tiêu biểu" (với ảnh Cloudinary lung linh) xuất hiện.
    3. Click vào card **Vịnh Hạ Long**.
    4. Chuyển sang màn hình **Discovery**. Hiển thị bản đồ vị trí Quảng Ninh và danh sách tour xuất phát tại đây.

### Story 2: Lọc Tour theo Khoảng giá & Loại hình
- **Actor**: Khách hàng có nhu cầu cụ thể.
- **Quy trình**:
    1. Nhập từ khóa "Nghỉ dưỡng" tại ô **Search**.
    2. Nhấn nút "Lọc" (Filter).
    3. Điều chỉnh thanh Slider cho khoảng giá từ 0 - 5.000.000 VNĐ.
    4. Chọn loại hình "Biển đảo".
    5. Nhấn "Áp dụng". Kết quả lọc ngay lập tức thay đổi.

## 2. Kiến trúc Thông tin (Information Architecture)

### Màn hình Kết quả Tìm kiếm (Search Result Page)
- **Header**: Thanh search thu gọn (Sticky).
- **Sidebar (Left)**: Bộ lọc lọc theo Region, Price, Rate, Categories.
- **Main Area (Center)**: Grid view các Card Tour & Destination.
- **View Switcher**: Chuyển đổi giữa View dạng Danh sách, Grid hoặc Bản đồ (Map).

## 3. Đặc tả Điều hướng (Navigation Logic)

- **Back behavior**: Nút quay lại giữ nguyên các lựa chọn filter trước đó.
- **Deeplink**: Mỗi bộ lọc được phản ánh lên URL (e.g. `?region=north&price_max=5000000`). Giúp người dùng dễ dàng chia sẻ kết quả tìm kiếm qua mạng xã hội.

---
*Bản thiết kế sơ bộ bởi PO/BA cho Sprint 3.*
