# Trạng thái triển khai Web (`travel-web`)

> **Cập nhật:** 30/05/2026 — sau khi renumber sprint (Option B) và drop Loyalty khỏi MVP. Sprint 4 = Schema Pivot (NOW). Tích điểm thành viên defer Phase 2.

Tài liệu này là **nguồn sự thật** về tiến độ code web. Khi hoàn thành tính năng mới, cập nhật file này trước khi đóng sprint.

## Tổng quan sprint

| Sprint | Trạng thái | Tiến độ web | Effort | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| Sprint 1 — Nền tảng | ✅ Done | 100% | 2 tuần | Auth, middleware, profile, dual cookie |
| Sprint 2 — CMS & Điểm đến | ✅ Done | ~95% | 3 tuần | Destination CRUD, Cloudinary, Home Builder |
| Sprint 3 — Khám phá & Tìm kiếm | ⏸ Pause | ~40% | đã 2 tuần | Pause để chạy Sprint 4. 60% còn lại đẩy sang Sprint 5 |
| **Sprint 4 — Schema Pivot** | 🔥 **NOW** | 0% | 2 tuần | Refactor schema + booking core theo ADR-001..006 |
| Sprint 5 — Đóng Tìm kiếm | ⏳ Upcoming | 0% | 1.5 tuần | Autocomplete + filter rating + cluster map |
| Sprint 6 — Đặt tour & Thanh toán | ⏳ Upcoming | ~10% | 3 tuần | `BookingService` skeleton có sẵn, đợi Sprint 4 |
| Sprint 7 — Đánh giá khách | ⏳ Upcoming | 0% | 1.5 tuần | Review + moderation (drop Loyalty → Phase 2) |
| Sprint 8 — Báo cáo + SEO + Launch | ⏳ Upcoming | ~15% | 2 tuần | Sitemap, SEO metadata đã có; thêm L0 Dashboard, perf tuning |

**Tổng còn lại tới launch MVP**: ~10 tuần ≈ 2.5 tháng.

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

## Sprint 3 — Khám phá & Tìm kiếm (Pause)

> **Trạng thái**: Đã làm 40%, paused để chạy Sprint 4. Việc còn lại sẽ làm ở Sprint 5.

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| SP3-01 UI Discovery | 🔶 | Trang `/diem-den`, `/tours`, Home modules — đã có |
| SP3-02 Search Autocomplete | ❌ | → Sprint 5 |
| SP3-03 Filter động | 🔶 | Cơ bản có; cần thêm rating + tourType — Sprint 5 |
| SP3-04 Interactive Map | 🔶 | Embed/link có; cluster — Sprint 5 |
| SP3-05 API Search | 🔶 | `TourService.searchListings`, API `GET /api/v1/tours` — đã có |
| Quản lý Tour (admin + public) | ✅ | Đã có trước backlog SP3 — sẽ refactor Pattern C ở Sprint 4 |

---

## 🔥 Sprint 4 — Schema Pivot (NOW)

> **Lý do**: audit code phát hiện schema `travel-web` lệch 7 chỗ với ADR-001..006. Phải pivot trước Sprint 6 Booking.
> **Kế hoạch**: 2 tuần (10 ngày làm việc), 7 stories.
> **Doc spec**: `sprint-4-schema-pivot/{00-tong-quan,01-stories,02-runbook,03-test-plan,04-wireframes}.md`

| Story | Effort | Trạng thái |
| :--- | :--- | :--- |
| S4-01 Apply migration `add_pricing_options_and_allotment` (10 PARTs) | 2 ngày | ❌ Chưa start |
| S4-02 Drop HotelBooking + bookingType refs | 0.5 ngày | ❌ |
| S4-03 Refactor Tour CRUD theo Pricing Pattern C | 2-3 ngày | ❌ |
| S4-04 Refactor BookingService Pattern C | 1-2 ngày | ❌ |
| S4-05 Booking widget multi-pax | 2-3 ngày | ❌ |
| S4-06 InquiryRequest (Series + Private split) | 1-2 ngày | ❌ |
| S4-07 Doc sync + sprint pivot logging | 0.5 ngày | ❌ |

**Pre-req checklist trước Day 1**:
- [ ] Supabase Pro plan + PITR enabled trên prod
- [ ] Tạo Supabase staging project mới
- [ ] Dump prod + import staging (≤24h trước Day 1)
- [ ] Pre-flight audit pass trên staging (6 SQL check)
- [ ] Vercel preview deployment cho branch `sprint-4/migration-pivot`
- [ ] Wireframe Booking widget reviewed (xem `sprint-4-schema-pivot/04-wireframes.md`)

---

## Sprint 5 — Đóng Tìm kiếm (Upcoming)

> Tiếp nối 60% còn lại của Sprint 3. Spec: `sprint-5-dong-tim-kiem/00-tong-quan.md`.

| Story | Effort | Trạng thái |
| :--- | :--- | :--- |
| S5-01 Search autocomplete | 3 ngày | ❌ |
| S5-02 Filter rating + tourType + price + duration | 2 ngày | ❌ |
| S5-03 Cluster map | 2-3 ngày | ❌ |

---

## Sprint 6 — Đặt tour & Thanh toán (Upcoming)

> Spec cũ ở `sprint-6-dat-cho-thanh-toan/` (rename từ "sprint-4" cũ — sẽ được audit + update theo schema mới ở task S4-07).

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| Booking flow E2E (login → multi-pax → checkout → payment) | ❌ | Tích hợp các thành phần đã có ở Sprint 4 |
| VNPay integration | ❌ | Webhook, signature verification |
| MoMo integration | ❌ | (optional, ưu tiên VNPay) |
| Email confirm booking (Resend) | ❌ | Template `booking-confirmed.tsx` |
| Cron auto-cancel quá deadline 15 phút | ❌ | Vercel Cron + service `BookingService.cancelExpired()` |
| Admin OMS (Order Management) update status | 🔶 | List đọc-only đã có; cần action duyệt/hủy |
| `/don-dat` của user | 🔶 | Placeholder; cần list booking + detail |

---

## Sprint 7 — Đánh giá khách (Upcoming)

> Drop Loyalty (tích điểm thành viên) — defer Phase 2.

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| User submit review sau tour | ❌ | Form rating 1-5 + content + photos |
| Admin moderation (approve / reject) | ❌ | Filter PENDING, bulk action |
| Review hiển thị trên tour detail | ❌ | Pagination, sort by rating |
| JSON-LD `aggregateRating` | ❌ | SEO Schema.org Review |
| Verified review (chỉ user đã đặt tour mới review được) | ❌ | Check `Booking.userId` |

---

## Sprint 8 — Báo cáo + SEO + Launch (Upcoming)

| Task | Web | Ghi chú |
| :--- | :--- | :--- |
| Admin Dashboard L0 (operational) | ❌ | Đơn hôm nay, doanh thu tuần, top tour, export CSV (xem ADR-007) |
| SEO finalize | 🔶 | Sitemap có; cần meta description + OG image cho mọi page |
| Performance optimize | ❌ | Image optimization, lazy load, bundle size |
| Launch checklist | ❌ | Domain, SSL, monitoring, backup, fanpage announce |

---

## Auth khách hàng (bổ sung ngoài sprint cũ)

| Tính năng | Web |
| :--- | :--- |
| Đăng ký / đăng nhập email | ✅ `/dang-ky`, `/dang-nhap` |
| Xác nhận email + gửi lại | ✅ `/dang-ky/xac-nhan-email` |
| Quên / đặt lại mật khẩu | ✅ `/quen-mat-khau`, `/dat-lai-mat-khau` |
| Đăng nhập Google OAuth | ✅ Supabase + `/auth/callback` |
| Đồng bộ profile Prisma | ✅ `ensureUserProfile` (tên, avatar Google) |
| Tài khoản `/tai-khoan` | 🔶 Xem thông tin; sửa profile **chưa** |
| Đơn của tôi `/don-dat` | 🔶 Placeholder sau khi đăng nhập |

Chi tiết: [Bảo mật & Xác thực](../04-phat-trien/04-bao-mat-xac-thuc.md).

---

## Defer Phase 2 (sau khi launch MVP)

- **Tích điểm thành viên** (Loyalty) — tier, points, redeem voucher → defer (build sau khi có 100-200 khách thật)
- **Mobile app** — React Native hoặc Flutter
- **L1/L2 reporting nâng cao** — conversion funnel, AOV, CAC, P&L
- **Voice search / Image search**
- **Saved searches / search history per user**
- **CMS pháp lý admin** (`LegalContent`) — hiện tại trang public tĩnh i18n
- **Advanced map** — heatmap, custom layer

---

## Đã quyết định drop khỏi MVP

- ~~Hotel booking riêng lẻ `/khach-san`~~ — ADR-001 (Hotel = content reference, không bookable)
- ~~Newsletter backend~~ — không quan trọng MVP, dùng form Mailchimp embed sau

---

*Ký hiệu: ✅ hoàn thành · 🔶 một phần · ❌ chưa có*
