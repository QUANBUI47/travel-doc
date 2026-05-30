# Ma trận Tính năng Dự án (Feature Matrix)

Bản đồ khớp nối tính năng trên 3 nền tảng chính: Web Admin, Web Client, và Mobile App.

> **Trạng thái web:** [Trạng thái triển khai Web](../02-quan-ly-sprint/trang-thai-web.md) (17/05/2026)

| Tính năng | Web Admin | Web Client | Mobile App | Sprint | Web (`travel-web`) |
| :--- | :---: | :---: | :---: | :--- | :--- |
| Quản lý Điểm đến | CRUD | View | View | Sprint 2 | ✅ Done |
| Danh mục Vùng miền (3 miền) | Chọn (seed) | Lọc/Xem | View | Sprint 2 | ✅ Cố định, không CRUD |
| Quản lý Tour | CRUD | View + Search | View | Sprint 3 | ✅ Done |
| Home Builder / CMS trang chủ | CRUD | View | — | Sprint 2 | ✅ Done |
| Đặt chỗ (Booking) | List | — | Search/Book | Sprint 4 | 🔶 Admin list only |
| Thanh toán Online | Config | Pay | Pay | Sprint 4 | ❌ |
| Auth (email, Google, reset) | — | Login | Login | Sprint 1+ | ✅ Done |
| Thành viên (Loyalty) | Admin UI | Dashboard | QR Member | Sprint 5 | ❌ |
| Đánh giá (Reviews) | Moderation | Read/Write | Read/Write | Sprint 5 | ❌ |
| Bản đồ (Map) | — | Browsing | GPS Nav | Sprint 3 | 🔶 Embed/link |

---
*Ma trận này hỗ trợ PO/Dev xác định phạm vi công việc cho từng Sprint. Cột **Web** phản ánh code thực tế, không chỉ kế hoạch sprint.*
