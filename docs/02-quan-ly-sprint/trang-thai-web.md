# Trạng thái triển khai Web (`travel-web`)

> **Cập nhật:** 17/05/2026 — đồng bộ với codebase `travel-web` tại thời điểm hiện tại.

Tài liệu này là **nguồn sự thật** về tiến độ code web. Khi hoàn thành tính năng mới, cập nhật file này trước khi đóng sprint.

## Tổng quan sprint

| Sprint | Trạng thái doc | Tiến độ web ước lượng |
| :--- | :--- | :--- |
| Sprint 1 — Nền tảng | **Done** | **100%** |
| Sprint 2 — Điểm đến & CMS | **Done** | **~95%** (xem ghi chú SP2-02) |
| Sprint 3 — Khám phá & Tìm kiếm | **In Progress** | **~40%** |
| Sprint 4 — Đặt chỗ & Thanh toán | **Upcoming** | **~10%** |
| Sprint 5 — Thành viên & Đánh giá | **Upcoming** | **0%** |
| Sprint 6 — Tối ưu & Release | **Upcoming** | **~15%** (sitemap, SEO metadata) |

---

## Sprint 1 — Nền tảng (Done)

| Hạng mục | Web |
| :--- | :--- |
| Prisma schema + migrations | ✅ |
| Supabase Auth + `@supabase/ssr` | ✅ |
| Middleware phân tách Admin (`/portal/*`) / Public | ✅ |
| Service layer (`AuthService`, …) | ✅ |
| Admin login + role `ADMIN` | ✅ |
| Dual cookie session (`AUTH_COOKIES.ADMIN` / `PUBLIC`) | ✅ |

---

## Sprint 2 — Quản trị nội dung & Điểm đến (Done)

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| SP2-01 CRUD Điểm đến | ✅ | `admin/destinations`, Server Actions |
| SP2-02 Cloudinary upload | ✅ | Gallery điểm đến; AC nâng cao (WebP batch, progress) **chưa** |
| SP2-03 Vùng miền (Regions) | ✅ | **3 miền cố định** — seed `mb`/`mt`/`mn`, **không** CRUD admin |
| SP2-05 Validation & Toast | ✅ | Admin forms |
| SP2-06 Cài đặt hệ thống | ✅ | System + SEO settings, Home Builder |
| Home Builder modules | ✅ | Trending, map, collections, … |
| Dynamic sitemap | ✅ | `src/app/sitemap.ts` |

### Vùng miền (Regions) — quyết định sản phẩm

- Bảng `regions` trong DB: **Miền Bắc**, **Miền Trung**, **Miền Nam** (`prisma/seed.ts`).
- Admin **chọn** vùng khi tạo điểm đến (`getRegionsAction`); **không** có màn CRUD thêm/sửa/xóa miền.
- Không triển khai `POST/PUT/DELETE /api/v1/regions` (xem [API Design](./sprint-2-quan-tri-diem-den/05-api-design.md)).

---

## Sprint 3 — Khám phá & Tìm kiếm (In Progress)

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| SP3-01 UI Discovery | 🔶 | Trang `/diem-den`, `/tours`, Home modules |
| SP3-02 Search Autocomplete | ❌ | |
| SP3-03 Filter động | 🔶 | Lọc tour (search params); chưa đủ rating/loại hình |
| SP3-04 Interactive Map | 🔶 | Embed/link trên destination; chưa cluster map |
| SP3-05 API Search | 🔶 | `TourService.searchListings`, API `GET /api/v1/tours` |
| Quản lý Tour (admin + public) | ✅ | Đã có trước khi đóng hết backlog SP3 — xem ma trận tính năng |

---

## Sprint 4 — Đặt chỗ & Thanh toán (Upcoming)

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| SP4-01 Booking Engine | ❌ | Model có; không có `booking.create` |
| SP4-02 Checkout UI | ❌ | `booking-widget` chưa gắn action |
| SP4-03 VNPay/MoMo | ❌ | |
| SP4-04 Order Management (Admin) | 🔶 | List đọc-only `admin/bookings` |
| SP4-05 Email đặt chỗ | ❌ | Auth email qua Supabase SMTP |

---

## Auth khách hàng (bổ sung ngoài sprint cũ)

| Tính năng | Web |
| :--- | :--- |
| Đăng ký / đăng nhập email | ✅ `/dang-ky`, `/dang-nhap` |
| Xác nhận email + gửi lại | ✅ `/dang-ky/xac-nhan-email` |
| Quên / đặt lại mật khẩu | ✅ `/quen-mat-khau`, `/dat-lai-mat-khau` |
| Đăng nhập Google OAuth | ✅ Supabase + `/auth/callback` |
| Đồng bộ profile Prisma | ✅ `ensureUserProfile` (tên, avatar Google) |
| Tài khoản `/tai-khoan` | 🔶 | Xem thông tin; sửa profile **chưa** |
| Đơn của tôi `/don-dat` | 🔶 | Placeholder sau khi đăng nhập |

Chi tiết: [Bảo mật & Xác thực](../01-nen-tang-he-thong/04-bao-mat-xac-thuc.md).

---

## Chưa triển khai / placeholder

- Thanh toán, khách sạn (`/khach-san`), reviews, newsletter backend, liên hệ `/lien-he`
- CMS pháp lý admin (`LegalContent`) — trang public tĩnh i18n
- Mobile app (Phase 2 — Deferred)

---

*Ký hiệu: ✅ hoàn thành · 🔶 một phần · ❌ chưa có*
