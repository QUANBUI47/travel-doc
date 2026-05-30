# [API Design] Sprint 4: Đặt chỗ & Thanh toán (Booking & Payment)

Tài liệu thiết kế chi tiết các Endpoint API phục vụ cho quy trình giao dịch, thanh toán và quản lý đơn hàng.

## 1. Endpoints Chi tiết

### 1.1. API Khởi tạo Đơn hàng (Create Booking)
- **Endpoint**: `POST /bookings`
- **Auth**: Required (User JWT).
- **Request Body**:
```json
{
  "tourId": "tour_01",
  "departureDate": "2026-05-15",
  "passengers": [
    { "type": "adult", "name": "Nguyễn Văn A", "pid": "123456789" },
    { "type": "child", "name": "Nguyên Văn B", "age": 5 }
  ],
  "contactInfo": {
    "name": "Nguyễn Văn A",
    "phone": "0987654321",
    "email": "a@example.com"
  },
  "voucherCode": "VIVU2026"
}
```
- **Response (201 Created)**: Trả về `bookingId` và `orderStatus = PENDING`.

### 1.2. API Thanh toán (Payment Initiation)
- **Endpoint**: `POST /payments/initiate`
- **Request Body**: `{ "bookingId": "BK_123", "method": "vnpay" | "momo" }`
- **Response**: Trả về `paymentUrl` để redirect người dùng sang cổng thanh toán.

### 1.3. API Xử lý Kết quả (Payment Webhook/Callback)
- **Endpoint**: `POST /payments/webhook/:gateway`
- **Logic**:
    1. Verify checksum/signature từ cổng thanh toán.
    2. Cập nhật `orderStatus = PAID` nếu thành công.
    3. Trừ đi 1 slot trong bảng `Inventory/TourAvailability`.

### 1.4. API Lịch sử Đơn hàng (User Profile)
- **Endpoint**: `GET /me/bookings`
- **Response**: Danh sách các đơn hàng của User đang login.

### 1.5. API Admin: Quản lý Đơn hàng
- **Endpoint**: `GET /admin/bookings`
- **Query Params**: `status`, `dateRange`, `searchKeyword`.
- **Response**: Danh sách toàn bộ đơn hàng hệ thống.

---

## 2. Bảo mật & Quy tắc (Security & Validation)
- **Idempotency Key**: Bắt buộc sử dụng `bookingId` để tránh thanh toán trùng lặp.
- **Transaction Log**: Tất cả thay đổi trạng thái đơn hàng phải được ghi log (Audit trail).
- **Expiration**: Đơn hàng tự động hủy nếu sau 15 phút không nhận được IPN (Instant Payment Notification).
