# Sprint 4: Thanh toán & Đặt chỗ (Implementation)

Sprint này tập trung vào việc hiện thực hóa luồng Checkout an toàn và tích hợp các cổng thanh toán (Payment Gateways).

## 1. Phạm vi & Liên kết nghiệp vụ
Các tính năng triển khai trong Sprint này được đặc tả chi tiết tại Product Backlog:
- [Hành vi Admin: Quản lý Đơn hàng (OMS)](../../03-kho-tinh-nang/dat-cho-thanh-toan/admin-oms)
- [Hành vi Client: Luồng Checkout](../../03-kho-tinh-nang/dat-cho-thanh-toan/client-checkout)

## 2. Acceptance Criteria (AC) - Tiêu chí nghiệm thu

### Task 4.1: Luồng Checkout 3 bước
- **AC1**: Người dùng có thể chọn Ngày khởi hành và số lượng hành khách (Người lớn/Trẻ em).
- **AC2**: Tự động tính toán Tổng tiền (Total Price) dựa trên bảng giá và số lượng hành khách.
- **AC3**: Voucher được áp dụng ngay lập tức và hiển thị số tiền trừ trực tiếp trên màn hình Checkout.

### Task 4.2: Tích hợp Thanh toán (VNPay/MoMo)
- **AC1**: Redirect thành công sang trang thanh toán của VNPay/MoMo.
- **AC2**: Webhook (IPN) xử lý chính xác trạng thái thanh toán từ cổng trả về để cập nhật trạng thái Đơn hàng sang "Paid".
- **AC3**: Xử lý trường hợp người dùng hủy thanh toán (User Cancel) bằng cách quay lại trang thanh toán nhưng vẫn giữ nguyên thông tin đơn hàng.

### Task 4.3: Quản lý trạng thái Đơn hàng (Order State Machine)
- **AC1**: Đơn hàng tự động chuyển sang "Cancelled" sau 15 phút nếu chưa thanh toán (Cron Job).
- **AC2**: Admin có thể cập nhật trạng thái thủ công (Confirm/Reject) kèm ghi chú cho khách hàng.

---
*Ghi chú: Lịch trình chi tiết và Task phân rã nằm trong [Backlog chi tiết](../backlog-chi-tiet).*
