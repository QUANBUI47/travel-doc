# [API Design] Sprint 5: Thành viên & Đánh giá (Members & Reviews)

Tài liệu thiết kế chi tiết các Endpoint API phục vụ cho module Thành viên và Đánh giá trên Web/App.

## 1. Endpoints Chi tiết

### 1.1. API Quản lý Thành viên (Member Info)
- **Endpoint**: `GET /me/loyalty`
- **Auth**: Required.
- **Response**: Trả về `currentPoints`, `memberTier` (Silver/Gold), `pointHistory[]`.

### 1.2. API Gửi Đánh giá (Submit Review)
- **Endpoint**: `POST /reviews`
- **Auth**: Required (User JWT).
- **Request Body**:
```json
{
  "bookingId": "BK_123",
  "rating": 5,
  "comment": "Rất hài lòng!",
  "images": ["url1", "url2"]
}
```
- **Note**: Backend kiểm tra `bookingStatus == COMPLETED` và user đã từng đi tour này.

### 1.3. API Lấy danh sách Đánh giá (Review Feed)
- **Endpoint**: `GET /tours/:tourId/reviews`
- **Query Params**: `rating` (1-5), `withMedia` (bool), `page`, `limit`.
- **Response**: Trả về mảng các đánh giá của tour tương ứng.

### 1.4. API Phản hồi Đánh giá (Admin/Tour Operator)
- **Endpoint**: `POST /reviews/:reviewId/reply`
- **Auth**: Admin/Manager Required.

---

## 2. Bảo mật & Quy tắc (Security & Validation)
- **Media Scan**: Tự động quét nội dung ảnh nhạy cảm khi upload qua Cloudinary/AI.
- **Duplicate Check**: Mỗi đơn hàng chỉ được phép đánh giá tối đa 01 lần.
