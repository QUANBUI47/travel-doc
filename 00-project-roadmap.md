# Lộ trình Phát triển Dự án (Hybrid Web/Mobile Roadmap)

Dự án Vivu Travel hiện được triển khai theo mô hình **Hybrid Delivery**, phát triển đồng thời các tính năng trên cả nền tảng Web (Admin/Customer) và Mobile (Customer App) để đảm bảo tiến độ đồng nhất.

---

## 📅 Tổng quan các Sprints

### Sprint 1: Nền tảng & Cấu trúc (Completed)
- **Web**: Khởi tạo Next.js, Prisma, Supabase. Thiết kế DB Schema.
- **Mobile**: Khởi tạo Expo, NativeWind, kiến trúc thư mục.

### Sprint 2: Quản trị Hệ thống & Định danh (Current)
- **Web (Admin)**: 
  - ✅ Dashboard Overview (Real-time counts).
  - ✅ Quản lý Tour, Booking, Khách hàng (List view).
  - ✅ Cấu hình hệ thống (Home, SEO, Legal).
- **Mobile (Customer)**:
  - ✅ Giao diện Home (Premium UI).
  - ✅ Luồng Auth (Login/Register Screens).
  - ✅ Trang Profile & Điều hướng (Tabs).

### Sprint 3: Khám phá & Tìm kiếm (Next)
- **Web**: Giao diện Search kết quả, Bộ lọc (Price, Rating, Category).
- **Mobile**: Trang Search chuyên sâu, Hiệu ứng chuyển cảnh (Shared Element Transition) từ List sang Detail.
- **Shared**: Logic lọc dữ liệu từ Supabase/Prisma.

### Sprint 4: Chi tiết sản phẩm & Đặt chỗ
- **Web**: Trang Tour Detail (Booking widget), Đánh giá (Reviews).
- **Mobile**: Trang Tour Detail (Skia animations), Quy trình đặt chỗ (Multi-step Booking).
- **Shared**: Tích hợp thanh toán (Stripe/Momo placeholder).

### Sprint 5: Chăm sóc & Cá nhân hóa
- **Web**: Chat hỗ trợ, Quản lý Wishlist, Lịch sử tích điểm.
- **Mobile**: Push Notifications, Chat trực tuyến, QR Code Check-in.

### Sprint 6: Tối ưu & Bàn giao (QA)
- **Both**: Hiệu năng (Image caching), SEO/App Store Optimization.
- **Web**: Deployment (Vercel).
- **Mobile**: EAS Build & OTA Updates.

---

## 🎯 Nguyên tắc triển khai
1.  **Shared Tokens**: Sử dụng file `mobile-tokens.json` đồng bộ với CSS variables của bản Web.
2.  **Parallel DEV**: Luôn phát triển Backend (Supabase/Prisma) đáp ứng chuẩn cho cả 2 nền tảng cùng lúc.
3.  **Cross-test**: Kiểm tra đồng bộ dữ liệu (Ví dụ: Đặt chỗ trên App -> Admin Web thấy ngay).
