# [Thiết kế Chi tiết] Module: Đặt chỗ & Thanh toán (Order State Machine)

Tài liệu thiết kế chi tiết (Detailed Design Document) cho module Booking & Payment, phục vụ việc xử lý logic đặt chỗ và thanh toán.

## 1. Vòng đời đơn hàng (Order State Machine)

Hệ thống quản lý trạng thái đơn hàng (Order States) theo sơ đồ sau:

| Trạng thái | Mã định danh | Mô tả |
| :--- | :--- | :--- |
| **Chờ thanh toán** | `PENDING` | Khởi tạo đơn hàng, chờ phản hồi từ Cổng thanh toán |
| **Đã thanh toán** | `PAID` | Nhận tín hiệu thành công từ cổng thanh toán |
| **Đã xác nhận** | `CONFIRMED` | Hệ thống kiểm tra slot và xác nhận giữ chỗ thành công |
| **Hoàn thành** | `COMPLETED` | Sau khi ngày khởi hành tour đã kết thúc |
| **Đã hủy** | `CANCELLED` | User chủ động hủy hoặc hết hạn chờ thanh toán (Timeout) |
| **Đã hoàn tiền** | `REFUNDED` | Admin đã thực hiện hoàn trả tiền cho khách hàng |

### Logic Chuyển đổi Trạng thái (Transitions):
- `PENDING` -> `PAID`: Nhận tín hiệu (Webhook/Callback) thành công.
- `PENDING` -> `CANCELLED`: Sau 15 phút chưa thanh toán thành công.
- `PAID` -> `REFUNDED`: Admin thực hiện hoàn tiền.

## 2. Đặc tả Xác thực & Kiểm tra (Validation Logic)

### Kiểm tra Slot (Inventory Check):
- Trước khi chuyển từ Step 1 sang Step 2, hệ thống phải gọi API kiểm tra: `remaining_slots >= requested_slots`.
- Nếu không đủ slot, hiển thị thông báo: "Rất tiếc, tour đã hết chỗ vào ngày này. Vui lòng chọn ngày khác."

### Quy tắc Voucher:
- Mỗi đơn hàng chỉ áp dụng tối đa 01 mã giảm giá.
- Nếu mã đã hết lượt dùng hoặc hết hạn, hiển thị: "Mã giảm giá không hợp lệ hoặc đã hết lượt sử dụng".

## 3. Xử lý Lỗi & Rủi ro (Edge Cases)

- **Lỗi Dual-Payment**: User nhấn thanh toán 2 lần -> Backend kiểm tra trạng thái đơn hàng `!= PENDING` thì từ chối xử lý tiếp.
- **Lỗi Call-back/Webhook**: Cổng thanh toán gửi tín hiệu trễ. Khi nhận tín hiệu PAID cho đơn hàng đã CANCELLED (do hết hạn 15p), hệ thống phải đưa vào hàng đợi (Queue) để Admin xử lý hoàn tiền thủ công.

## 4. Đặc tả UI/UX Chi tiết

- **Thanh tiến trình (Progress Bar)**: Hiển thị 3 chấm (Info -> Payment -> Done) giúp user biết đang ở đâu.
- **Tóm tắt đơn hàng (Sticky Summary)**: Luôn hiển thị tổng tiền ở góc màn hình khi user cuộn trang.

---
*Tài liệu chi tiết được định nghĩa bởi BA cho Sprint 4.*
