# Tech Specs: Trải nghiệm Người dùng (User Experience)

## 1. Backend Tasks
- **Action:** `submitReview(data)`: Tạo bản ghi `Review` và cập nhật `averageRating` của Tour.
- **Action:** `toggleWishlist(tourId)`: Thêm/Xóa liên kết trong bảng `Wishlist`.
- **Logic:** Tính toán Rank dựa trên tổng số tiền của các `Booking` có status `COMPLETED`.

## 2. Frontend Tasks
- **Component:** `ReviewList`, `WishlistButton`, `ProfileForm`.
- **State:** Sử dụng `React Context` để chia sẻ trạng thái Wishlist trên toàn site.

## 3. Assets
- Lưu trữ ảnh review tại `/reviews` bucket trên Supabase Storage.
