# BA Requirements: Đặt chỗ & Thanh toán (Booking & Payment)

## 1. Mục tiêu
Cung cấp quy trình đặt tour/phòng mượt mà, minh bạch về giá cả và tích hợp thanh toán trực tuyến an toàn.

## 2. User Stories
- **US-B.1:** Là khách hàng, tôi muốn đặt tour/khách sạn một cách nhanh chóng qua 3 bước.
- **US-B.2:** Là khách hàng, tôi muốn chọn phương thức thanh toán linh hoạt (VNPay, MoMo, Chuyển khoản).
- **US-B.3:** Là khách hàng, tôi muốn nhận được email xác nhận ngay sau khi thanh toán thành công.

## 3. Yêu cầu Chức năng
- **FR-B.1:** Multi-step Booking Form (Thông tin -> Thanh toán -> Hoàn tất).
- **FR-B.2:** Tích hợp Gateway thanh toán bên thứ ba (VNPay/MoMo).
- **FR-B.3:** Tự động gửi Email thông qua Template (Booking ID, Chi tiết, Giá).
- **FR-B.4:** Quản lý số chỗ còn lại (Inventory) để tránh Overbooking.

## 4. Yêu cầu Phi chức năng
- **NFR-B.1:** Đảm bảo giao dịch ACID (Dữ liệu nhất quán ngay cả khi lỗi mạng).
- **NFR-B.2:** Bảo mật thông tin thanh toán (Không lưu số thẻ trực tiếp trong DB).
- **NFR-B.3:** Timeout thanh toán (Tự động hủy đơn nếu không trả tiền sau 15 phút).
