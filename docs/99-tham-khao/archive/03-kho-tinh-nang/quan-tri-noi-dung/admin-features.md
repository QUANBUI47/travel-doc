# [Admin] Kho tính năng: Quản trị Nội dung (Content CMS)

| Phiên bản | Ngày | Sprint | Nội dung thay đổi | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | 26/03/2026 | [Sprint 2](../../02-quan-ly-sprint/sprint-2-quan-tri-diem-den/01-yeu-cau-nghiep-vu) | Khởi tạo đặc tả nội dung Admin ban đầu | PO |

---

Hệ thống quản trị nội dung trung tâm cho phép cấu hình toàn bộ dữ liệu nền của Vivu Travel.

## 1. Quản lý Vùng miền (Regional Management)
- **Tính năng**: Thêm/Sửa/Xóa danh mục vùng miền (Miền Bắc, Trung, Nam, Cao nguyên...).
- **Quy trình**: Định nghĩa mã vùng (Region Code) để dùng cho việc lọc (Filter) tại Client.

## 2. Quản lý Điểm đến (Destination CRUD)
- **Tính năng**: 
    - Quản lý metadata (Tên, mô tả, slug).
    - Quản lý tọa độ Map (Lat/Long).
    - Quản lý Media (Cloudinary multi-upload).
- **Quy tắc**: Không xóa điểm đến khi có Tour đang Active.

## 3. Quản lý Tour & Giá (Tour Management)
- **Tính năng**: 
    - Tạo lịch trình Tour (Day-by-day itineraries).
    - Cấu hình bảng giá theo loại khách (Người lớn, Trẻ em).
    - Quản lý trạng thái Tour (Active/Inactive/Draft).

## 4. Quản lý Hình ảnh (Media Center)
- **Tính năng**: Thư viện ảnh tập trung, hỗ trợ gắn tag và tìm kiếm ảnh theo điểm đến.
