# Design Inputs: Khám phá & Tìm kiếm (Public Discovery)

## 1. Màn hình Discovery (Search Results)
- **Layout:** 2 cột (Left: Sidebar filter 280px, Right: Main Grid).
- **Cards:** Ảnh 16:9, Tên (Bold), Rating (Star icon), Giá (Màu nổi bật).
- **Mobile:** Nút "Bộ lọc" cố định ở Bottom Bar, mở ra Full-screen modal.

## 2. Navigation
- Thanh tìm kiếm lớn tại Hero Section của Homepage.
- Breadcrumbs: Home > Khám phá > [Tên Vùng].

## 3. Interaction
- Filter cập nhật kết quả ngay lập tức (Debounce 300ms) không cần reload trang.
- Smooth scroll lên đầu trang khi chuyển trang.
