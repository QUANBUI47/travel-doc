# Đặc tả API v1 (System Specs)

Giao thức giao tiếp trung tâm giữa Admin, Web Client và Mobile App.

## 1. Authentication
- **Base URL**: `/api/v1/auth`
- **Endpoints**:
    - `POST /login`: Xác thực và trả về JWT/Session.
    - `POST /logout`: Hủy session.
    - `GET /me`: Lấy thông tin user hiện tại.

## 2. Destinations & Tours
- **Filter Query**: `?region=Northern&limit=10&page=1`
- **Response Standard**:
```json
{
  "success": true,
  "data": [],
  "meta": { "total": 100, "page": 1 }
}
```

## 3. Rate Limiting & Security
- Giới hạn 100 requests/phút cho mỗi IP Client.
- Các API POST/PUT/DELETE yêu cầu Header: `Authorization: Bearer <token>`.
