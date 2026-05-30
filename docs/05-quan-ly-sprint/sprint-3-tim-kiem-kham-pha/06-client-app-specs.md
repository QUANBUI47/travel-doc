# [Client / App Specs] Sprint 3: Khám phá & Tìm kiếm (Discovery UX)

Đặc tả chi tiết giao diện và hiển thị các công cụ Tìm kiếm, Bộ lọc dành cho Khách hàng.

## 1. Thanh Tìm kiếm Đa năng (Omni-Search UX)
- **Web Client**:
    - **UI**: Thanh search trung tâm tại Homepage (hero section).
    - **Interaction**: Khi click vào ô input -> Pop-over hiển thị "Từ khóa xu hướng" (Hot keywords). Khi nhập 1+ ký tự -> Autocomplete xổ xuống danh sách Tour/Điểm đến.
- **Mobile App**:
    - **UI**: Icon Search tại góc phải thanh Header hoặc Tab Discovery riêng biệt.
    - **Interaction**: Bàn phím tự động hiển thị nút "Tìm" (Search action).

## 2. Bộ lọc Thông minh (Smart Filter Specs)
- **Web Client (Sidebar)**:
    - **Price**: Thanh trượt (Range Slider) từ 0 VNĐ - 100.000.000 VNĐ.
    - **Stars**: Danh sách checkbox: [x] 5 sao, [ ] 4 sao, [ ] 3 sao.
    - **Region**: Tabs hoặc Radio buttons: [Tất cả] [Miền Bắc] [Miền Trung] [Miền Nam].
- **Mobile App (Floating Sheet)**:
    - **UI**: Nút "Lọc" (FAB) hiển thị số lượng bộ lọc đang áp dụng (e.g. "Lọc (2)").
    - **Sheet Content**: Các accordion thu gọn cho từng nhóm lọc.

## 3. Màn hình Kết quả (Search Result Grid)
- **Layout**: Grid 3-4 cột (Web), 1-2 cột (App).
- **Sorting Options**: Mới nhất, Giá thấp -> cao, Giá cao -> thấp, Đánh giá tốt nhất.
- **Micro-interaction**: Hiệu ứng Hover card (Web) và Hiệu ứng Scale nhấn (App).

## 4. Đặc tả Bản đồ (Map View UI)
- **Component**: `Google Maps` / `Leaflet`.
- **UI**: Các Pin (Marker) hiển thị giá tiền của tour (e.g. 1.2M).
- **Interaction**: Khi click vào Pin -> Info window nhỏ hiển thị ảnh & tên tour -> Click trỏ vào Detail.

---
*Tài liệu đặc tả Client/App cho Sprint 3.*
