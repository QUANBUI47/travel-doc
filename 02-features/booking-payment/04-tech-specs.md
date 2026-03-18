# Tech Specs: Đặt chỗ & Thanh toán (Booking & Payment)

## 1. Backend Tasks
- **Action:** `initiateBooking(data)`: Tạo bản ghi `Booking` với status `PENDING`.
- **Logic:** `prisma.$transaction([])` để đảm bảo trừ số lượng chỗ (Inventory) và tạo đơn đồng thời.
- **Payment Library:** `lib/payments/vnpay.ts` để hash URL và verify checksum.

## 2. Infrastructure
- **Cron Job:** Tự động hủy các đơn `PENDING` quá 30 phút mà không có giao dịch.
- **Service:** Tích hợp `Resend` hoặc `SendGrid` để gửi mail HTML.

## 3. Security
- **JWT Protection:** Chỉ user đã đăng nhập mới được tạo booking.
- **Verification:** Kiểm tra checksum trả về từ VNPay trước khi cập nhật DB.
