# QA Output: Đặt chỗ & Thanh toán (Booking & Payment)

## 1. Test Cases
- [ ] Luồng đặt tour và thanh toán VNPay thành công.
- [ ] Luồng thanh toán thất bại (User bấm Hủy trên cổng thanh toán).
- [ ] Kiểm tra overbooking: Đặt quá số lượng tour hiện có.
- [ ] Kiểm tra email nhận được có đúng format và thông tin.

## 2. Security Test
- [ ] Thử thay đổi Price trong URL gateway (Phải bị chặn bởi Checksum).
- [ ] Thử truy cập trang `/booking/success` trực tiếp mà không có đơn hàng (Redirect).
