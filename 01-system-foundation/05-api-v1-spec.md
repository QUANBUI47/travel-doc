# Tài liệu Đặc tả API (V1 Specifications)

> **Cơ sở hạ tầng:** Next.js Route Handlers (App Router)  
> **Xác thực:** Supabase Auth (JWT)  
> **Cấu trúc URL:** `/api/v1/{resource}`

---

## 1. Authentication (Xác thực)
*Hiện tại hệ thống sử dụng phiên (session) từ Supabase qua Middleware/SSR.*

### API endpoints (Kế hoạch):
- `POST /api/v1/auth/login`: Xác thực và cấp phiên.
- `POST /api/v1/auth/register`: Đăng ký tài khoản mới.
- `GET /api/v1/auth/me`: Lấy thông tin phiên hiện tại.

---

## 2. Regions & Destinations (Vùng miền & Điểm đến)

### `GET /api/v1/regions`
- **Mô tả:** Lấy danh sách tất cả các vùng miền (Bắc, Trung, Nam).
- **Phản hồi:** 
  ```json
  [
    { "id": "uuid", "slug": "mien-bac", "nameVi": "Miền Bắc", "imageUrl": "..." }
  ]
  ```

### `GET /api/v1/destinations`
- **Mô tả:** Lấy danh sách điểm đến.
- **QueryParams:** 
  - `regionId`: Lọc theo vùng.
  - `featured`: (Boolean) Chỉ lấy các điểm đến nổi bật.
- **Phản hồi:** Danh sách object `Destination`.

### `GET /api/v1/destinations/[id]`
- **Mô tả:** Thông tin chi tiết một điểm đến kèm danh sách Tour/Hotel liên quan.

---

## 3. Quản trị Hệ thống (Settings)

### `GET /api/v1/settings/home`
- **Mô tả:** Lấy thông tin cấu hình trang chủ (Banner, Stats, Sections).
- **Phản hồi:** Đối tượng `HomeSetting` dạng JSON.

### `GET /api/v1/settings/system`
- **Mô tả:** Các cấu hình chung như SEO, Hotline, Social links.

---

## 4. Tours & Bookings (Nghiệp vụ - Sắp triển khai)

### `GET /api/v1/tours`
- **Mô tả:** Tìm kiếm và liệt kê Tour.
- **Filters:** `destinationSlug`, `priceRange`, `duration`.

### `POST /api/v1/bookings`
- **Mô tả:** Tạo đơn đặt chỗ mới.
- **Body:** 
  ```json
  {
    "bookingType": "TOUR",
    "tourId": "uuid",
    "guestName": "...",
    "guestEmail": "...",
    "participants": 2,
    "tourStartDate": "2024-10-10"
  }
  ```

---

## 📝 Quy tắc phát triển API
1.  **Response Format:** Luôn trả về dữ liệu trong field `data` (Ví dụ: `{ "data": [...] }`).
2.  **Error Handling:** Sử dụng chuẩn HTTP Status Codes (400, 401, 403, 404, 500).
3.  **Validation:** Dùng **Zod** schema để validate body request tại server.
4.  **Security:** Các API ghi dữ liệu (POST/PUT/DELETE) phải có check session/role.
