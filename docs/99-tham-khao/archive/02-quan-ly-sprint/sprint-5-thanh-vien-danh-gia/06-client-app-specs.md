# [Client / App Specs] Sprint 5: Thành viên & Đánh giá (Loyalty & Reviews)

## 1. Màn hình Profile Thành viên (User Loyalty Dashboard)
- **Web Client**:
    - **UI**: Sidebar Profile menu (Thông tin cá nhân, Đơn hàng, Điểm & Hạng).
    - **Information**: Hiển thị tổng số điểm hiện tại và thanh ProgressBar đến hạng tiếp theo.
- **Mobile App**:
    - **UI**: Tab Profile với QR code định danh thẻ thành viên để Check-in tại quầy (Retail Partner).

## 2. Đặc tả Gửi Đánh giá (Submit Review Form)
- **Web Client & App**:
    - **Trigger**: Khi đơn tour chuyển sang `COMPLETED`, hiển thị Popup "Hãy đánh giá tour của bạn" và gửi Notification Push/Email.
    - **Form Elements**: (Rating Stars -> Textarea comment -> Upload image/video preview).
    - **Logic**: Yêu cầu quyền truy cập Camera/Gallery cho App.

## 3. Hệ thống Thông báo (Notification Bell UX)
- **UI**: Badge (Con số) đỏ hiển thị số lượng thông báo chưa đọc.
- **Content**:
    - "Bạn vừa được cộng +50 điểm cho đơn hàng BK_123".
    - "Chúc mừng bạn đã đạt hạng Gold!".

---
*Tài liệu đặc tả Client/App cho Sprint 5.*
