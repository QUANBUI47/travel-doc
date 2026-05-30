# Ma trận Tính năng Dự án (Feature Matrix)

Bản đồ khớp nối tính năng trên 3 nền tảng chính: Web Admin, Web Client, và Mobile App.

> **Trạng thái web:** [Trạng thái triển khai Web](../05-quan-ly-sprint/trang-thai-web.md) (cập nhật 30/05/2026)

| Tính năng | Web Admin | Web Client | Mobile App | Sprint | Web (`travel-web`) |
| :--- | :---: | :---: | :---: | :--- | :--- |
| Quản lý Điểm đến | CRUD | View | View | Sprint 2 | ✅ Done |
| Danh mục Vùng miền (3 miền) | Chọn (seed) | Lọc/Xem | View | Sprint 2 | ✅ Cố định, không CRUD |
| Quản lý Tour | CRUD | View + Search | View | Sprint 3 / 4 | 🔶 Done schema cũ, refactor Pattern C ở Sprint 4 |
| Tour Options (upsell tier) | CRUD | View + Choose | View | Sprint 4 | ❌ Sprint 4 |
| Hotel (content reference) | CRUD | View only | View | Sprint 3+ | 🔶 Schema có, public detail page chưa |
| Hotel Allotment (admin) | CRUD | — | — | Sprint 4+ | ❌ Sprint 4 (schema), UI chưa định lịch |
| Home Builder / CMS trang chủ | CRUD | View | — | Sprint 2 | ✅ Done |
| Search autocomplete | — | View | View | Sprint 5 | ❌ |
| Filter rating + tourType + cluster map | — | View | View | Sprint 5 | 🔶 Filter cơ bản có |
| **Đặt chỗ Series Tour (online)** | List + Update status | Multi-pax book | Search/Book | Sprint 4 + 6 | 🔶 Service skeleton, refactor Pattern C ở Sprint 4 |
| **InquiryRequest (Private/Corporate)** | List + Update status | Submit form | — | Sprint 4 | ❌ Sprint 4 |
| Thanh toán Online (VNPay/MoMo) | Config | Pay | Pay | Sprint 6 | ❌ |
| Email confirm booking (Resend) | — | Receive | Receive | Sprint 6 | ❌ |
| Cron auto-cancel deadline | — | — | — | Sprint 6 | ❌ |
| Auth (email, Google, reset) | — | Login | Login | Sprint 1+ | ✅ Done |
| Đánh giá (Reviews) | Moderation | Read/Write | Read/Write | Sprint 7 | ❌ |
| ~~Thành viên (Loyalty)~~ | ~~Admin UI~~ | ~~Dashboard~~ | ~~QR Member~~ | ~~Sprint 5~~ | ❌ **Defer Phase 2** |
| Bản đồ (Map) | — | Browsing | GPS Nav | Sprint 3 / 5 | 🔶 Embed/link, cluster ở Sprint 5 |
| Admin Dashboard L0 (operational) | View | — | — | Sprint 8 | ❌ |

---
*Ma trận này hỗ trợ PO/Dev xác định phạm vi công việc cho từng Sprint. Cột **Web** phản ánh code thực tế, không chỉ kế hoạch sprint.*
