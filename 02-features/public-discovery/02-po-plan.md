# PO Plan: Khám phá & Tìm kiếm (Public Discovery)

## 1. Thứ tự Ưu tiên
1. **P0:** Search Engine (Prisma full-text search).
2. **P1:** Sidebar Filters (Price, Region, Star).
3. **P1:** Top Destinations grid on Homepage.
4. **P2:** Autocomplete suggestions.

## 2. Acceptance Criteria
- [ ] Tìm "ha long" phải ra kết quả "Hạ Long".
- [ ] Filter giá hoạt động chính xác với giá cuối cùng (đã trừ khuyến mãi).
- [ ] Trang danh sách phải load tối đa 12 items/page.

## 3. Quản lý Rủi ro
- **Rủi ro:** Dữ liệu lớn dẫn đến search chậm.
- **Giảm thiểu:** Đánh index các trường `name`, `city`, `description` trong DB.
