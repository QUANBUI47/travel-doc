# [Admin Specs] Sprint 4: Quản trị Đơn hàng (Order Management)

Đặc tả chi tiết giao diện Admin dành cho việc quản lý các giao dịch đặt chỗ và thanh toán.

## 1. Màn hình Dashboard Đơn hàng (Order List)
- **Component**: `Table` với bộ lọc trạng thái (Status Filter Tabs).
- **Tabs Trạng thái**: [Tất cả] [Chờ thanh toán] [Đã thanh toán] [Đã xác nhận] [Đã hủy] [Đã hoàn tiền].
- **Columns**:
    - **Mã đơn**: BK_123 (Có link click sang chi tiết).
    - **Tên Tour**: "Vịnh Hạ Long 2 ngày 1 đêm".
    - **Khách hàng**: Tên + SĐT.
    - **Tổng tiền**: Định dạng VNĐ (e.g. 1.200.000 VNĐ).
    - **Ngày đặt**: 15:30 20/03/2026.
    - **Trạng thái**: Chip màu tương ứng (e.g. PAID: Green, PENDING: Yellow).

## 2. Trang Chi tiết Đơn hàng (Order Details)
- **Component**: `Card` layout chia 3 phần.
- **Phần 1: Thông tin Tour**: Ngày khởi hành, người tham gia (Adult/Child).
- **Phần 2: Thông tin Thanh toán**: Phương thức (VNPay), Mã giao dịch cổng (Transaction ID).
- **Phần 3: Lịch sử Trạng thái (Timeline)**: Hiển thị dòng thời gian đơn hàng từ lúc đặt đến lúc hoàn thành.
- **Hành động Admin**:
    - Nút "Xác nhận giữ chỗ" (Dành cho thanh toán chuyển khoản).
    - Nút "Hủy đơn & Hoàn tiền" (Hủy đơn và gọi API hoàn tiền sang cổng).

## 3. Quản lý Slot & Lịch khởi hành (Inventory)
- **Component**: `Calendar View`.
- **Mục tiêu**: Admin thiết lập số lượng slot tối đa cho mỗi ngày của từng Tour.
- **Cảnh báo**: Hiển thị tooltip đỏ khi số lượng slot trống sắp hết.

## 4. Đặc tả Quy trình (Admin Flows)
- **Exporting**: Xuất danh sách khách hàng tham gia tour theo ngày (File Excel) để cung cấp cho hướng dẫn viên.
- **Refund Logic**: Khi Admin Refund, hệ thống phải cập nhật `Inventory` (Nhả slot) và cập nhật trạng thái đơn hàng.

---
*Tài liệu đặc tả Admin cho Sprint 4.*
