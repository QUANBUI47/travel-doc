# [API Design] Sprint 3: Khám phá & Tìm kiếm (Search & Discovery)

Tài liệu thiết kế chi tiết các Endpoint API phục vụ cho module Tìm kiếm & Khám phá trên Web/App.

## 1. Endpoints Chi tiết

### 1.1. API Tìm kiếm đa năng (Omni-Search)
- **Endpoint**: `GET /search`
- **Query Params**:
    - `q` (Required): Từ khóa tìm kiếm (Tên tour, tên điểm đến, tên vùng miền).
    - `type` (Optional): `all` (Mặc định), `tour`, `destination`.
- **Logic**:
    - Hệ thống thực hiện tìm kiếm mờ (Fuzzy search) trên toàn bộ DB.
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "destinations": [ { "id": "1", "name": "Hạ Long", "slug": "ha-long" } ],
    "tours": [ { "id": "1", "name": "Vịnh Hạ Long 2 ngày", "price": 1500000 } ]
  }
}
```

### 1.2. API Lọc Tour (Discovery Discovery)
- **Endpoint**: `GET /tours`
- **Query Params**:
    - `regionId`: Lọc theo vùng miền.
    - `priceMin`, `priceMax`: Khoảng giá.
    - `rating`: Số sao tối thiểu (1.0 - 5.0).
    - `types`: Loại hình (Array, e.g. `?types=beach,adventure`).
    - `categoryId`: Lọc theo chủ đề (Danh lục).
- **Meta (Pagination)**:
    - `page`, `limit`, `sort` (e.g. `?sort=price_asc,newest`).
- **Response**: Trả về danh sách tour khớp với bộ lọc kèm theo metadata phân trang.

### 1.3. API Gợi ý Autocomplete
- **Endpoint**: `GET /search/autocomplete`
- **Query Params**: `q` (Min 1 ký tự).
- **Response**: Mảng các string đơn giản hoặc object nhỏ để hiển thị popup dropdown gợi ý.

### 1.4. API Bản đồ (Geo-Search)
- **Endpoint**: `GET /search/map`
- **Query Params**:
    - `lat`, `lng`: Trung tâm bản đồ.
    - `radius` (Default: 50km): Bán kính tìm kiếm.
- **Response**: Trả về danh sách tour có tọa độ trong bán kính chỉ định.

---

## 2. Bảo mật & Giới hạn (Security & Limits)
- **Rate Limit**: Tối đa 60 request/phút mỗi IP đối với `/search`.
- **Public access**: Tất cả API trong module này đều có thể truy cập công khai (Public).
