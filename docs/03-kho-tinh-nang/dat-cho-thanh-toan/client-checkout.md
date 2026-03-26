# [Client/App] Kho tính năng: Luồng Checkout (Booking UX)

| Phiên bản | Ngày | Sprint | Nội dung thay đổi | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 26/03/2026 | [Sprint 4](../../02-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/01-yeu-cau-nghiep-vu) | Khởi tạo mô tả luồng Checkout & Thanh toán | PO |

---

Quy trình giao dịch được tối ưu hóa cho tỷ lệ chuyển đổi (Conversion).

## 1. Chọn Lịch & Giá (Booking Selector)
- **Tính năng**: 
    - Lịch chọn ngày linh hoạt (Calendar).
    - Hiển thị giá tour theo loại hành khách (Người lớn/Trẻ em).
- **Phản hồi**: Kiểm tra slot trống theo thời gian thực (Real-time availability check).

## 2. Thông tin Hành khách (Passenger Info)
- **Tính năng**: 
    - Nhập thông tin liên hệ (SĐT, Email, Tên).
    - Form nhập liệu cho trẻ em (Tuổi, ghi chú ăn uống/dị ứng).

## 3. Cổng Thanh toán (Payment Gateway Logic)
- **Tính năng**: 
    - Thanh toán VNPay (QR Pay, ATM, Credit Card).
    - Thanh toán MoMo (App-to-app, QR Scan).
    - Hiển thị thông báo khi thanh toán thất bại kèm lỗi chi tiết từ cổng.

## 4. Xác nhận Đơn (E-Voucher Display)
- **Tính năng**: 
    - Mã đơn hàng (Booking ID) duy nhất.
    - Mã QR định danh đơn hàng tại app.
- **Engagment**: Gửi Email + Notification xác nhận ngay sau khi IPN trả về thành công.

---
*Giao diện đặt tour cho khách hàng.*
