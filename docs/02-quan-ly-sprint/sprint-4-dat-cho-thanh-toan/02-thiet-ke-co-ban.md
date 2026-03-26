# [Thiết kế Cơ bản] Module: Đặt chỗ & Thanh toán (Checkout Flow)

Tài liệu thiết kế cơ bản cho module Booking & Payment, mô tả luồng đặt chỗ (Checkout Steps) và kiến trúc quy trình (Transaction Process).

## 1. Luồng Thanh toán (Checkout Steps Flow)

### Step 1: Booking Information (Thông tin)
- **Actor**: Khách hàng.
- **Quy trình**:
    1. Chọn **Ngày khởi hành** (Calendar).
    2. Chọn **Số lượng khách** (Adult/Children).
    3. Nhập **Họ tên**, **SĐT**, **Email**.
    4. Nhấn "Tiếp tục".
- **Validation**: Đảm bảo ngày chọn còn slot (Inventory check). SĐT/Email đúng định dạng regex.

### Step 2: Order Summary & Payment (Tổng quan & Thanh toán)
- **Actor**: Khách hàng.
- **Quy trình**:
    1. Xem tóm tắt **Tên tour**, **Ngày đi**, **Tổng tiền**.
    2. Nhập **Mã giảm giá** (nếu có).
    3. Chọn **Phương thức thanh toán** (VNPay/MoMo/Chuyển khoản).
    4. Nhấn "Thanh toán ngay". Chuyển hướng tới Cổng thanh toán.

### Step 3: Payment Callback & Result (Kết quả)
- **Actor**: Hệ thống.
- **Quy trình**:
    1. Nhận tín hiệu (Call back) từ Cổng thanh toán.
    2. Xử lý logic tại Backend.
    3. Nếu Thành công -> Hiển thị màn hình "Đặt chỗ thành công". Gửi Email.
    4. Nếu Thất bại -> Hiển thị "Thanh toán không thành công" kèm hướng dẫn thử lại.

## 2. Đặc tả Điều hướng (Navigation Logic)

- **Back behavior**: Nút quay lại tại Step 2 giữ nguyên các lựa chọn tại Step 1.
- **Session management**: Dữ liệu đặt chỗ được lưu vào Session/Local storage để tránh mất dữ liệu khi refresh trang.

---
*Bản thiết kế sơ bộ bởi PO/BA cho Sprint 4.*
