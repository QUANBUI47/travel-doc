# [Yêu cầu Nghiệp vụ] Sprint 5: Thành viên & Đánh giá (Members & Reviews)

Quản lý hệ thống khách hàng thân thiết (Loyalty) và cơ chế đánh giá/phản hồi (Review system).

## 1. Mục tiêu (Objectives)
- Xây dựng cộng đồng khách hàng tin cậy qua hệ thống Đánh giá 5 sao.
- Giữ chân người dùng qua hệ thống Tích điểm & Hạng thành viên (Silver/Gold/Platinum).
- Kiểm duyệt nội dung (Moderation) để tránh spam/phản cảm.

## 2. Đặc tả Chức năng (Functional Specs)

### A. Hệ thống Thành viên (Loyalty System)
- **Tích điểm (Points)**: Tự động cộng điểm dựa trên số tiền đã thanh toán (e.g. 100k = 1 điểm).
- **Hạng thành viên**: Phân cấp dựa trên tổng chi tiêu.
- **Quyền lợi (Benefits)**: Chiết khấu tự động cho hạng Gold trở lên.

### B. Đánh giá & Phản hồi (Reviews & Ratings)
- **Viết đánh giá**: Chỉ khách hàng đã hoàn thành tour (`COMPLETED`) mới được đánh giá.
- **Nội dung**: Số sao (1-5), văn bản mô tả, tối đa 3 ảnh/video.
- **Phản hồi**: Chủ tour/Admin có quyền trả lời đánh giá của khách.

## 3. Quy tắc Nghiệp vụ (Business Rules)
- **Kiểm duyệt**: Đánh giá chứa từ khóa nhạy cảm (cấu hình trong Admin) sẽ chuyển sang trạng thái `PENDING` chờ duyệt.
- **Hủy tour**: Hủy tour sẽ không được tích điểm và không được đánh giá.

---
*Tài liệu nghiệp vụ bởi PO cho Sprint 5.*
