# Tech Specs: Khám phá & Tìm kiếm (Public Discovery)

## 1. Backend Tasks
- **Action:** `searchServices(query, filters, page)`: Trả về danh sách dịch vụ + meta phân trang.
- **Logic:** Sử dụng `prisma.$queryRaw` nếu cần full-text search phức tạp hoặc `prisma.tour.findMany({ where: { ... } })`.

## 2. Frontend Tasks
- **Filter State:** Quản lý qua URL Query Params (Sử dụng `useSearchParams` trong Next.js).
- **Components:** `RangeSlider` (Price), `CheckBoxGroup` (Utilities), `ServiceCard`.

## 3. SEO
- **Dynamic Meta:** Tự động tạo Title/Desc dựa trên kết quả tìm kiếm (VD: "Tìm thấy 20 Tour tại Đà Nẵng").
- **JSON-LD:** Danh sách kết quả dạng `ItemList`.
