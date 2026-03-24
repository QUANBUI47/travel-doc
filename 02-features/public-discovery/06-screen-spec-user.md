# Đặc tả Màn hình Khách hàng (User/Customer Screen Specs)

Trải nghiệm người dùng tập trung vào sự tinh tế, mượt mà và tối ưu hóa chuyển đổi đặt dịch vụ.

---

## 1. Trang chủ (Home Page)
- **Đường dẫn:** `/`
- **Phong cách:** **Modern Immersive & Full-bleed**. Sử dụng HeroUI.
- **Chức năng:**
  - **Hero Section:** Banner tràn viền (Full-screen width), cao 850px, bo tròn đáy mềm mại (rounded-b-[4rem]). Hỗ trợ cả video và ảnh.
  - **Stats Section:** Thẻ thống kê nổi (Float) đè lên banner hero, hiển thị độ uy tín.
  - **Destinations (Top Picks):** Thiết kế dạng **Bento Grid (4 cột)** với bố cục phân cấp (Khối chính chiếm 50% ngang), chiều cao lưới 850px.
  - **Why Vivu:** Giới thiệu giá trị cốt lõi với layout 2 cột thoáng đạt, tràn màn hình.
  - **Storytelling (Cảm hứng lữ hành):** Trích dẫn người dùng (Testimonials) dạng thẻ tối giản, cân đối.
- **Thiết kế:** Loại bỏ container 1280px truyền thống để tối ưu cho màn hình rộng, khoảng cách (gap) và đệm (padding) được chuẩn hóa để mang lại cảm giác premium.

---

## 2. Tìm kiếm & Kết quả (Discovery) - *Sắp triển khai*
- **Đường dẫn:** `/tours`
- **Chức năng:**
  - Danh sách tour theo grid.
  - Bộ lọc Sidebar: Giá, Đánh giá (Star ratings), Thời gian tour.
  - Sort theo: Phổ biến nhất, Giá thấp đến cao.

---

## 3. Chi tiết Tour (Tour Details) - *Giai đoạn Sprint 4*
- **Đường dẫn:** `/tours/[slug]`
- **Chức năng:**
  - Image Gallery (Carousel).
  - Tour Header: Tên tour, rating, giá.
  - Booking Summary Widget: Chọn ngày, chọn số người -> Hiển thị giá tạm tính.
  - Tab nội dung: Lịch trình, Giá bao gồm/không bao gồm, Lưu ý.
  - Reviews: Đánh giá từ khách đã đi.

---

## 4. Tài khoản Cá nhân (User Profile)
- **Đường dẫn:** `/profile`
- **Chức năng:**
  - Thống kê cá nhân: Đơn hàng thành công, lịch sử đi tour.
  - Quản lý thông tin profile cá nhân.
  - Danh sách yêu thích (Wishlist).

---

## 🎨 Ngôn ngữ thiết kế (Mobile & Web)
- **Vibrant & Clean:** Sử dụng nhiều khoảng trắng (Whitespace), font chữ rõ ràng (Inter/Sans-serif).
- **Premium Images:** Hình ảnh điểm đến phải sắc nét, sử dụng hiệu ứng Glassmorphism cho các overlay.
- **Animation:** Dùng `framer-motion` cho web và `Skia` cho mobile để tạo cảm giác mượt mà (Fade-in, slide transitions).
