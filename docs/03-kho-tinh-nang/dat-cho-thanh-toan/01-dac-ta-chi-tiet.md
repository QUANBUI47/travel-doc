# [Đặc tả BA] Module: Đặt chỗ & Thanh toán (Booking & Payment)

Đây là module mang lại doanh thu chính, yêu cầu sự chính xác tuyệt đối về logic và bảo mật.

## 1. Quy trình Đặt Tour (Tour Booking Flow)
- **Nền tảng**: Web Client & Mobile App.
- **Các bước (Steps)**:
    1. **Chọn Tour & Ngày**: Kiểm tra tính khả dụng (Availability).
    2. **Nhập thông tin hành khách**: Họ tên, Số điện thoại, Email, Ghi chú.
    3. **Áp mã giảm giá (Voucher)**: Kiểm tra hạn dùng, điều kiện áp dụng.
    4. **Thanh toán (Payment)**: Chuyển hướng sang cổng thanh toán.
    5. **Xác nhận (Confirmation)**: Gửi Email + Thông báo Push (App).

## 2. Quản lý Đơn hàng (Order Management)
- **Nền tảng**: Web Admin.
- **Trạng thái đơn (States)**:
    - `PENDING`: Chờ thanh toán.
    - `CONFIRMED`: Đã thanh toán, chờ khởi hành.
    - `COMPLETED`: Đã kết thúc tour.
    - `CANCELLED`: Đã hủy.
