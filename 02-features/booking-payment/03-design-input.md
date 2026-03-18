# Design Inputs: Đặt chỗ & Thanh toán (Booking & Payment)

## 1. Booking Wizard (UI)
- **Step 1:** Form nhập (Tên, SĐT, Email, Số lượng người/phòng).
- **Step 2:** Danh sách Icon phương thức thanh toán (VNPay, MoMo...).
- **Step 3:** Màn hình Success (Mã đơn, Icon tick xanh, Nút "Về trang chủ").

## 2. Summary Card
- Luôn hiển thị ở bên phải (Desktop) hoặc Floating Bar (Mobile).
- Hiển thị rõ: Giá gốc, Giảm giá, Tổng phải trả.

## 3. Interactions
- Skeleton loading khi đang tạo session thanh toán.
- Modal xác nhận hủy đơn nếu người dùng bấm back khi đang thanh toán.
