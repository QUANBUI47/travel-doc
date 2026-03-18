# Review & Kế hoạch Phát triển Travel App (Vietnam Travel - Future UI)

## 1. Đánh giá (Review) Thiết kế hiện tại

### 1.1. Prisma Database Schema
Schema của bạn được thiết kế **rất tốt và chuẩn xác** cho một hệ thống OTA (Online Travel Agency) như Expedia:
- **Tối ưu hóa đa dịch vụ:** Việc tách riêng `Booking`, `HotelBooking`, và `TourBooking` là một lựa chọn thông minh để dễ dàng mở rộng thêm các dịch vụ khác sau này (ví dụ: Thuê xe, Vé máy bay) mà không làm phình to bảng chính.
- **Relational Integrity:** Quan hệ ràng buộc giữa Vùng miền -> Điểm đến -> Khách sạn/Tour (Region -> Destination -> Hotel/Tour) rất chặt chẽ, dễ query.
- **Tích hợp Supabase Auth:** Sử dụng `Profile` map với bảng auth của supabase rất tiêu chuẩn cho Next.js architecture hiện đại.
- **Bảng chuyên dụng cho SEO và Đánh giá:** `SeoPage` và đa hình (Polymorphism) ảo ở bảng `Review` (`reviewableType`) bắt kịp thực tế yêu cầu nghiệp vụ khắt khe.

### 1.2. UI/UX & Theme (Tailwind v4 + HeroUI)
- Bạn đang sử dụng công nghệ bleeding-edge: **Next.js 15, Tailwind CSS v4, và HeroUI**. Quá tuyệt vời!
- Cấu hình [globals.css](file:///d:/Project/travel/travel-web/styles/globals.css) hỗ trợ tốt dark mode nội tại của Tailwind v4 cùng các custom properties với tone màu chính là Cyan/Slate kết hợp tạo ra một cảm giác **vừa hiện đại, vừa đáng tin cậy**, rất phù hợp cho ứng dụng đặt vé/du lịch.

## 2. Định hướng Thiết kế "Đậm chất Việt Nam, Hướng Tới Tương Lai"

Để mang lại cảm giác WOW cho người dùng như bạn mong muốn, chúng ta cần phối hợp các kỹ thuật hiện đại của Next 15 và Framer Motion:

1. **Giao diện Glassmorphism (Kính mờ):** Kết hợp các thẻ (Card) trượt trên nền các phong cảnh tuyệt đẹp của Việt Nam (Vịnh Hạ Long, Sapa sương mù, hang Sơn Đoòng).
2. **Micro-interactions (Hiệu ứng siêu nhỏ):** 
   - Khi hover vào một Tour hoặc Khách sạn, hình ảnh sẽ từ từ scale nhẹ, đồng thời có hiệu ứng ánh sáng lướt qua.
   - Các Button đặt vé sẽ có pulse effect lôi cuốn.
3. **Typography:** Dùng một font mang hơi hướng hiện đại nhưng thanh thoát (Inter hoặc Be Vietnam Pro) cho UI chính, và một font dạng Serif/Display mang tính chất truyền thống sang trọng vào các Tiêu đề bài viết du lịch.
4. **Scrollytelling:** Khi người dùng lướt xuống trang chủ, các Vùng Miền Việt Nam sẽ tự động fade-in lên dần dần thay vì hiện tĩnh ngắt.

## 3. Kế hoạch Phát triển (Lộ trình chi tiết)

Dự án sẽ chia làm 6 giai đoạn lớn (Đã được định nghĩa trong [task.md](file:///C:/Users/MinhBC/.gemini/antigravity/brain/b8ca52ba-c976-4992-b755-403cb2d5fe93/task.md)):

### Phase 1: Nền tảng & Authentication
* **Mục tiêu:** Ứng dụng kết nối thành công DB, Login/Signup chạy mượt mà.
* **Tác vụ:** Set up Prisma Client, cấu hình middleware bảo vệ route, kết nối Supabase, hoàn thiện bộ UI Base Components (nút bam, input, modal).

### Phase 2: Admin Dashboard
* **Mục tiêu:** Quản trị viên có công cụ thêm/sửa/xoá Vùng miền, Điểm đến, Khách sạn, Tour, Quản lý đơn hàng. Đảm bảo có dữ liệu thật để render ra trang web.
* **Tác vụ:** Xây dựng trang bảo mật `/admin/...`, áp dụng Table, Forms từ HeroUI.

### Phase 3: Giao diện Public (Customer Facing)
* **Mục tiêu:** Xây dựng mặt tiền thật đẹp, thật nghệ thuật.
* **Tác vụ:** 
  - Home Page: Header trong suốt, Auto-playing Hero Video, Thanh tìm kiếm Hero Search (giống Expedia).
  - Trang "Khám phá Việt Nam": Hiển thị các `Region` và `Destination`.

### Phase 4: Chi tiết Dịch vụ & Book Flow (Luồng đặt vé)
* **Mục tiêu:** Khách hàng có thể chọn ngày, xem giá tổng và thanh toán.
* **Tác vụ:** 
  - Logic tìm kiếm (Query Parameters) kết nối Prisma.
  - Trang Hotel Detail: Tabs chức năng cho Phòng, Đánh giá, Tiện ích.
  - Form Đặt vé tĩnh + Validation (bằng Zod / React Hook Form).
  - Kết nối DB insert `Booking`.

### Phase 5 & 6: Tính năng nâng cao
* **Mục tiêu:** Đưa User Dashboard, Review, và SEO vào mạch. Tối ưu performance.

## 4. Next Step (Bước tiếp theo)

Nếu bạn đồng ý với kế hoạch và bản Review trên, tôi sẽ bắt đầu tiến hành **Phase 1** ngay lập tức. Chúng ta sẽ bắt đầu bằng việc thiết lập connection tới Database, kiểm tra Prisma, sau đó xây dựng bộ khung Layout/Navigation dùng HeroUI cho phần giao diện Public trước. Bạn có thể chốt hoặc điều chỉnh bất kỳ phần nào nhé!
