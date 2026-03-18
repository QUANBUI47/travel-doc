# BA Requirements: Khám phá & Tìm kiếm (Public Discovery)

## 1. Mục tiêu
Giúp khách hàng dễ dàng tìm thấy các sản phẩm du lịch (Tour, Khách sạn) phù hợp thông qua bộ lọc thông minh và công cụ tìm kiếm mạnh mẽ.

## 2. User Stories
- **US-D.1:** Là khách hàng, tôi muốn tìm kiếm theo tên thành phố để xem các dịch vụ tại đó.
- **US-D.2:** Là khách hàng, tôi muốn lọc theo khoảng giá để phù hợp với ngân sách.
- **US-D.3:** Là khách hàng, tôi muốn xem các "Điểm đến hàng đầu" ngay tại trang chủ.

## 3. Yêu cầu Chức năng
- **FR-D.1:** Công cụ tìm kiếm hỗ trợ tiếng Việt không dấu.
- **FR-D.2:** Bộ lọc Sidebar: Vùng miền, Hạng sao, Tiện ích.
- **FR-D.3:** Hiển thị danh sách kết quả dạng Grid/List kèm Pagination.
- **FR-D.4:** Tự động gợi ý (Autocomplete) khi khách hàng nhập từ khóa.

## 4. Yêu cầu Phi chức năng
- **NFR-D.1:** Tốc độ phản hồi tìm kiếm < 500ms.
- **NFR-D.2:** SEO-friendly URLs (VD: `/search?region=mien-bac`).
- **NFR-D.3:** UI mượt mà với Skeleton Loading khi đang fetch dữ liệu.
