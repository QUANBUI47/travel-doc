# [Client / App Specs] Sprint 2: Điểm đến (POI Display)

Đặc tả chi tiết giao diện và hiển thị Điểm đến dành cho Khách hàng tại Web Client và Mobile App.

## 1. Màn hình Trang chủ (Homepage)
- **Web Client**:
    - **Section**: "Điểm đến nổi bật".
    - **UI**: Carousel/Grid hiển thị Card Điểm đến.
    - **Card View**: Ảnh bao phủ toàn bộ thẻ (Glassmorphism overlay) với tên Vùng miền ở góc trái và tên Điểm đến ở trung tâm.
- **Mobile App**:
    - **Section**: "Khám phá Vùng miền".
    - **UI**: Horizontal Scroll View (3 Regions: Bắc, Trung, Nam).
    - **Component**: `DestCard.tsx` (Expo/React Native) với bóng đổ (Shadow) 3D, bo góc tròn 20dp.

## 2. Trang Danh mục Điểm đến (Destination Directory)
- **Logic**: Khi click vào một Điểm đến -> Chuyển hướng sang danh sách các Tour tương ứng.
- **Web Client**: `/[locale]/destinations/[slug]`
- **Mobile App**: `(tabs)/discovery/[id]`

## 3. Hiển thị Thông tin Chi tiết (Detail View) - Tương lai
- Hiển thị tên (Vi/En), mô tả ngắn, Gallery ảnh (Image Slider/Gallery Zoom).
- Tích hợp bản đồ vị trí (Latitude/Longitude).

## 4. Tối ưu Hiệu năng (Performance Tuning)
- **Image Optimization**: Sử dụng Cloudinary `f_auto,q_auto` để tự động chọn định dạng ảnh WebP/AVIF và chất lượng phù hợp với thiết bị.
- **Caching**: Dữ liệu danh sách được cache tại Client qua `swr` hoặc `react-query` trong vòng 10 phút.
- **Lazy Loading**: Các card điểm đến chỉ hiển thị khi user cuộn trang tới (`IntersectionObserver`).

---
*Tài liệu đặc tả Client/App cho Sprint 2.*
