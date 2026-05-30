# Sprint 2 Close Checklist (Web + Admin)

> **Trạng thái:** Sprint 2 **đã đóng** (17/05/2026). Vùng miền: 3 miền cố định (seed), không CRUD. Chi tiết: [Trạng thái triển khai Web](./trang-thai-web.md).

## Mục tiêu đóng Sprint 2
- Ổn định kiến trúc quản trị theo hướng `Server Actions + Service Layer`.
- Loại bỏ các lỗi/rủi ro logic dữ liệu mức cao (đặc biệt API filter và settings persistence).
- Hoàn thiện tối thiểu trải nghiệm Home Builder để bàn giao nội bộ.

## Checklist theo file (ưu tiên từ cao đến thấp)

### P0 - Rủi ro cao (phải xong trước khi đóng sprint)
- [x] `travel-web/src/app/api/v1/destinations/route.ts`
  - Sửa filter `regionId` đang gọi nhầm `getByIds([regionId])`.
  - Chuẩn hoá parse query params và xử lý lỗi không dùng `any`.
- [x] `travel-web/src/services/destination.service.ts`
  - Thêm method filter đúng theo `regionId` (không tái sử dụng method theo `id`).
- [x] `travel-web/src/services/home.service.ts`
  - Xoá cast `as any` khi ghi JSON `homeSetting.content`.
  - Dùng kiểu Prisma JSON input rõ ràng.
- [x] `travel-web/src/services/system.service.ts`
  - Xoá cast `as any` khi upsert system settings value.
  - Chuẩn hoá kiểu dữ liệu cho transaction update/create.

### P1 - Rủi ro trung bình (nên xong trong sprint close)
- [x] `travel-web/src/components/admin/builder/module-editor.tsx`
  - Bổ sung editor cho các module còn fallback “Chưa có trình chỉnh sửa” (`TRENDING`, `MAP_EXPLORATION`, `SOCIAL_FEED`, `CURATED_COLLECTIONS`, `NEWSLETTER`).
- [x] `travel-web/src/components/admin/builder/editors/*`
  - Đồng bộ contract `onUpdate` theo `Partial<...Content>` không dùng cast vòng ngoài.
- [x] `travel-web/src/app/(main)/home-client.tsx`
  - Xoá `allDestinations: any[]`, thay bằng kiểu `Destination[]`.

### P2 - Chất lượng đóng sprint (nếu còn thời gian)
- [x] `travel-web/src/app/sitemap.ts`
  - Hoàn thiện dynamic sitemap (tour/destination) thay TODO/static list.
- [x] `travel-web/src/app/layout.tsx`
  - Metadata runtime lấy từ SEO settings (`siteTitle`, `metaDescription`, `faviconUrl`) có fallback an toàn.
- [x] `travel-web/src/components/admin/*settings-form.tsx`
  - Chuẩn hoá loading/error toast theo cùng pattern `handleError`.
- [x] `travel-web/src/messages/vi.json`, `travel-web/src/messages/en.json`
  - Bổ sung key lỗi/toast admin còn hardcoded.

## Definition of Done (Sprint 2)
- Không còn `any` ở đường đi critical: `services/*settings*`, `api/v1/destinations`.
- Luồng Admin Home Builder: load, edit, save, preview chạy ổn định.
- API destinations filter theo vùng trả dữ liệu đúng.
- Lint sạch ở các file chỉnh sửa trong sprint close.
