# [Admin Specs] Sprint 5: Quản trị Thành viên & Đánh giá (Loyalty & Reviews)

## 1. Màn hình Quản trị Thành viên (Users & Loyalty)
- **Component**: `Table` với phân trang 10-20-50-100 dòng.
- **Mục tiêu**: Xem lịch sử tích điểm và đổi thưởng của người dùng.
- **Hành động Admin**:
    - Chỉnh sửa thủ công điểm tích lũy của khách hàng.
    - Ban/Unban tài khoản vĩnh viễn.

## 2. Màn hình Kiểm duyệt Đánh giá (Review Moderation)
- **Component**: `Card View` với bộ lọc Trạng thái (Pending/Approved/Rejected).
- **Hành động Admin**:
    - Nút "Duyệt" (Approve) dể hiển thị ra Client.
    - Nút "Từ chối" (Reject) dể ẩn vĩnh viễn và gửi email tới khách hàng lý do từ chối.
    - Ô "Trả lời" (Reply) dể Admin phản hồi trực tiếp đánh giá.

## 3. Cấu hình Cấu trúc Loyalty (Settings)
- **Component**: `Form`.
- **Mô tả**: Thiết lập tỷ lệ tích điểm (e.g. 1 VNĐ = 0.0001 Points) và ngữ ngưỡng nâng hạng thành viên.

---
*Tài liệu đặc tả Admin cho Sprint 5.*
