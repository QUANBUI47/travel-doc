# [API Design] Sprint 2: Quản trị Điểm đến (POI)

Tài liệu thiết kế chi tiết các Endpoint API phục vụ cho module Quản lý Điểm đến, tuân thủ chuẩn RESTful API.

## 1. Base URL
`https://api.vivutravel.vn/api/v1`

## 2. Authentication
- Header: `Authorization: Bearer <JWT_TOKEN>` (Supabase Auth).
- Yêu cầu: Quyền `Admin` cho các phương thức POST, PUT, DELETE.

---

## 3. Endpoints Chi tiết

### 3.1. Lấy danh sách điểm đến
- **Endpoint**: `GET /destinations`
- **Query Params**:
    - `regionId` (Optional): Lọc theo vùng miền.
    - `keyword` (Optional): Tìm kiếm theo tên (VI, EN, Slug).
    - `page` (Default: 1): Trang hiện tại.
    - `limit` (Default: 10): Số lượng bản ghi/trang.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "dest_001",
      "nameVi": "Vịnh Hạ Long",
      "nameEn": "Ha Long Bay",
      "slug": "vinh-ha-long",
      "region": { "id": "reg_01", "nameVi": "Miền Bắc" },
      "imageUrl": "https://cloudinary.com/vinhhalong.webp",
      "sortOrder": 1
    }
  ],
  "meta": {
    "total": 125,
    "page": 1,
    "lastPage": 13
  }
}
```

### 3.2. Tạo mới Điểm đến (Admin Only)
- **Endpoint**: `POST /destinations`
- **Request Body**:
```json
{
  "nameVi": "Đà Lạt",
  "nameEn": "Da Lat City",
  "slug": "da-lat",
  "regionId": "reg_02",
  "imageUrl": "https://cloudinary.com/.../dalat.jpg",
  "gallery": ["url1", "url2"],
  "description": "Thành phố mộng mơ...",
  "sortOrder": 5
}
```
- **Error Codes**:
    - `409 Conflict`: Slug đã tồn tại.
    - `400 Bad Request`: Thiếu trường bắt buộc.

### 3.3. Cập nhật Điểm đến
- **Endpoint**: `PUT /destinations/:id`
- **Request Body**: (Partial update supported)
```json
{
  "nameVi": "Đà Lạt (Cập nhật)",
  "sortOrder": 1
}
```

### 3.4. Xóa Điểm đến
- **Endpoint**: `DELETE /destinations/:id`
- **Logic**: Kiểm tra ràng buộc tour. Nếu có tour active gắn liền -> `403 Forbidden`.

### 3.5. Lấy danh sách Vùng miền (Public)
- **Endpoint**: `GET /regions`
- **Response**: Trả về mảng danh sách các vùng miền (Bắc, Trung, Nam) để đổ vào Dropdown Admin/Filter Client.
