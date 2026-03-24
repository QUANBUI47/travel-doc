# [Đặc tả BA] Module: Quản trị Nội dung (Content Management)

Module này chịu trách nhiệm quản lý toàn bộ "Sản phẩm" và "Dữ liệu nguồn" của Vivu Travel. 

## 1. Quản lý Điểm đến (Destinations)
- **Nền tảng**: Web Admin.
- **Mục tiêu**: Định danh các địa danh và vùng miền.
- **Chi tiết trường dữ liệu**:
    - `Region`: Miền Bắc, Miền Trung, Miền Nam.
    - `Destination Name`: Tên địa danh (Hạ Long, Đà Lạt...).
    - `Lat/Long`: Tọa độ thực để hiển thị bản đồ trên Mobile.
    - `Gallery`: Bộ sưu tập ảnh (Hỗ trợ kéo thả upload).
- **Business Rule**: Tên điểm đến + Vùng miền phải là duy nhất. Khi xóa điểm đến, hệ thống phải kiểm tra xem có Tour nào đang sử dụng không.

## 2. Quản lý Tour du lịch (Tours)
- **Nền tảng**: Web Admin.
- **Mục tiêu**: Tạo sản phẩm kinh doanh chính.
- **Cấu trúc Tour**:
    - **Thông tin cơ bản**: Tên tour, Giá gốc, Giá khuyến mãi.
    - **Lịch trình (Itinerary)**: Nhập liệu theo Ngày (Ngày 1: ..., Ngày 2: ...).
    - **Phân loại (Tags)**: Gia đình, Mạo hiểm, Nghỉ dưỡng.
    - **Chính sách**: Quy định hoàn hủy, Bao gồm/Không bao gồm.
- **Business Rule**: Tour phải thuộc về 1 Destination. Tour có thể có "Ngày khởi hành" linh hoạt (Fixed date hoặc Daily).

## 3. Khách sạn & Media
- Quản lý Hạng sao, Tiện ích, Loại phòng.
- Thư viện Media tập trung, tự động tối ưu WebP cho Mobile.
