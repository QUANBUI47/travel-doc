# [Admin] Kho tính năng: Quản lý Đơn hàng (OMS)

| Phiên bản | Ngày | Sprint | Nội dung thay đổi | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 26/03/2026 | [Sprint 4](../../02-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/01-yeu-cau-nghiep-vu) | Khởi tạo mô tả hệ thống OMS Admin | PO |

---

Hệ thống quản lý trạng thái, dòng tiền (Order Management System) dành cho Quản trị viên.

## 1. Bản quản trị Đơn hàng (Order Dashboard)
- **Tính năng**: 
    - Danh sách đơn hàng toàn hệ thống.
    - Lọc theo trạng thái (Pending/Paid/Confirmed/Cancelled/Refunded).
    - Tìm kiếm theo mã đơn, SĐT khách, Tên tour.

## 2. Quản lý Thanh toán (Payment Reconciliation)
- **Tính năng**: 
    - Đối soát (Reconcile) mã giao dịch ngân hàng/cổng thanh toán.
    - Xác nhận thanh toán thủ công cho trường hợp Chuyển khoản (Bank Transfer).

## 3. Hoàn tiền & Hủy đơn (Refunds & Cancellations)
- **Tính năng**: 
    - Hệ thống phê duyệt yêu cầu hoàn tiền cho khách.
    - Tự động hoàn lại slot trống vào Inventory sau khi hủy.

## 4. Quản lý Voucher (Vouchers & Discount CMS)
- **Tính năng**: 
    - Tạo mã giảm giá (Code: VIVU10, VN2026).
    - Thiết lập hạn mức (Max uses) và thời gian hiệu lực.

---
*Hệ thống back-office cho vận hành.*
