# Hướng dẫn Tích hợp Bên thứ ba (3rd Party Integrations)

Tài liệu đặc tả cấu hình và luồng tích hợp với các dịch vụ ngoại vi cho Vivu Travel.

## 1. Lưu trữ Hình ảnh (Cloudinary)

Hệ thống sử dụng Cloudinary để lưu trữ và tối ưu hóa hình ảnh.

### Cấu hình:
- **Cloud Name**: (Lấy từ env)
- **Upload Preset**: `vivu_travel_preset`
- **Folder Structure**: 
    - `destinations/`: Chứa ảnh các địa điểm.
    - `tours/`: Chứa ảnh các tour du lịch.
    - `profiles/`: Chứa ảnh đại diện người dùng.

### Quy trình:
1. Client (Admin/App) gọi `Cloudinary Upload API` với `upload_preset`.
2. Cloudinary trả về `secure_url`.
3. Lưu `secure_url` vào database (Bảng Destination/Tour).

---

## 2. Cổng Thanh toán (VNPAY / Momo)

Tích hợp cổng thanh toán trong Sprint 4.

### Luồng Thanh toán (Payment Flow):
1. **Khởi tạo**: User nhấn thanh toán -> Backend tạo đơn hàng `PENDING` -> Gọi API VNPAY tạo link thanh toán.
2. **Redirect**: Redirect người dùng sang trang VNPAY.
3. **Phản hồi (IPN/Webhook)**: VNPAY gửi tín hiệu kết quả về API `/api/payment/vnpay-return`.
4. **Xử lý**: 
    - Nếu thành công: Cập nhật `Booking.status = PAID` -> Gửi Email xác nhận.
    - Nếu thất bại: Hiển thị lỗi -> Cho phép User thử lại.

---

## 3. Bản đồ & Địa điểm (Google Maps SDK)

### Tính năng:
- **Web**: Sử dụng `Google Maps Embed API` để hiển thị vị trí Tour/Destination.
- **Mobile**: Sử dụng `react-native-maps` để hiển thị bản đồ tương tác.

### Cấu hình:
- Cần đăng ký `API Key` trên Google Cloud Console.
- Giới hạn (Restrict) API Key theo tên miền (Web) và App ID (Mobile/Android/iOS).

---
*Tài liệu kỹ thuật v1.0*
