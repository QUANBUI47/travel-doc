# PO Plan: Đặt chỗ & Thanh toán (Booking & Payment)

## 1. Thứ tự Ưu tiên
1. **P0:** Core Booking Logic (Tạo đơn, Lưu DB).
2. **P0:** VNPay Integration (Primary payment gateway).
3. **P1:** Email Confirmation System.
4. **P2:** MoMo & Stripe Integration.

## 2. Acceptance Criteria
- [ ] Tổng tiền phải được tính toán server-side trước khi thanh toán.
- [ ] Trạng thái chuyển thành `PAID` ngay khi nhận được callback từ Gateway.
- [ ] Email phải có đủ link hóa đơn và thông tin khởi hành.

## 3. Quản lý Rủi ro
- **Rủi ro:** Khách thanh toán thành công nhưng mạng bị ngắt khiến đơn chưa cập nhật status.
- **Giảm thiểu:** Sử dụng Webhook để sync trạng thái thanh toán bất chấp client disconnect.
