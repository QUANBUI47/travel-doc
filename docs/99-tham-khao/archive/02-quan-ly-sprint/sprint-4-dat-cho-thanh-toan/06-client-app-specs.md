# [Client / App Specs] Sprint 4: Đặt chỗ & Thanh toán (Checkout UX)

Đặc tả chi tiết giao diện và hiển thị quy trình đặt chỗ dành cho Khách hàng trên Web/App.

## 1. Màn hình Chi tiết Tour (Pre-Checkout)
- **Web Client**:
    - **UI**: Panel bên trái hiển thị ảnh, chính giữa là content, panel bên phải (Sticky) là Form chọn ngày & đặt chỗ.
    - **Interaction**: Khi chọn ngày (Calendar) -> Hệ thống tự động fetch và hiển thị số lượng người còn được phép đặt (Remaining slots).
- **Mobile App**:
    - **UI**: Nút "Đặt ngay" (Blue primary) dính dưới cùng màn hình (Sticky Footer). Khi click -> Mở trang Checkout.

## 2. Quy trình Thanh toán 3 Bước (3-Step Checkout UX)
- **Bước 1 (Thông tin)**:
    - **Header**: Thanh tiến trình (Step Indicator) dán phía trên.
    - **Form**: `Input` thông tin liên hệ, SĐT, Email (Sử dụng regex validate).
    - **Component**: Chọn số lượng Người lớn (Adults), Trẻ em (Children).
- **Bước 2 (Thanh toán)**:
    - **UI**: Danh sách `RadioList` chọn Phương thức thanh toán (MoMo, VNPay, Chuyển khoản).
    - **Summary Card**: Hiển thị chiết khấu từ Voucher, Phí dịch vụ (nếu có), Tổng cộng.
- **Bước 3 (Kết quả)**:
    - **Màn hình thành công**: Ảnh minh họa "Happy Party", Mã đơn hàng (Booking ID), Mã QR đơn hàng.
    - **Màn hình thất bại**: Thông điệp lỗi chi tiết (e.g. "Số dư thẻ không đủ"), Nút "Thử lại thanh toán".

## 3. Quản lý Đơn hàng của Tôi (My Bookings UI)
- **Web Client (Profile)**: Danh sách các đơn đã đặt, cho phép click xem chi tiết vé điện tử (E-Voucher).
- **Mobile App (Tab Bookings)**:
    - Hiển thị theo dạng Card ngang. Có tab lọc Trạng thái.
    - Thông báo đẩy (Push notification) khi đơn hàng chuyển từ `PENDING` sang `PAID`.

## 4. Đặc tả Biên nhận (Receipt & E-Voucher)
- **E-Voucher**: Chứa mã QR định danh đơn hàng để nhân viên soát vé tại điểm khởi hành (Web dashboard check).

---
*Tài liệu đặc tả Client/App cho Sprint 4.*
