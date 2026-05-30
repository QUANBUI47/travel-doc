# Chiến Lược Triển Khai — Vivu Travel

> **Phiên bản:** 2.2 · **Ngày:** 27/05/2026 · **Tier:** 2 (Strategy)
>
> File này trả lời câu hỏi **HOW DELIVER** — đi từ 11 anchor V-01 → V-12
> (đã chốt ở [`00-tam-nhin.md`](./00-tam-nhin.md)) xuống đầu việc cụ thể
> theo sprint, kèm trade-off, risk, KPI, và Definition of Done.
>
> **Không phải:** business strategy (đã ở `00b-mo-hinh-kinh-doanh.md`),
> không phải architecture (ở `01-kien-truc-he-thong.md`), không phải
> data design (ở `03-thiet-ke-du-lieu-chi-tiet.md`).
>
> **Quy tắc:** mọi thay đổi sprint scope / sequencing / KPI phải update
> file này TRƯỚC khi đẩy vào sprint folder. Treat như "battle plan".

---

## Mục lục

- [Tóm tắt 1 trang](#tóm-tắt-1-trang)
- [Trạng thái hiện tại](#trạng-thái-hiện-tại)
- [Phương pháp luận triển khai](#phương-pháp-luận-triển-khai)
- [Plan A+ — chiến lược sequencing](#plan-a--chiến-lược-sequencing)
- [Sprint roadmap Phase 1](#sprint-roadmap-phase-1)
- [Risk register chiến lược](#risk-register-chiến-lược)
- [KPI Phase 1 — đo lường thành công](#kpi-phase-1--đo-lường-thành-công)
- [Build vs Buy](#build-vs-buy)
- [Definition of Done — per tier](#definition-of-done--per-tier)
- [Resource allocation](#resource-allocation)
- [Changelog](#changelog)

---

## Tóm tắt 1 trang

**Mục tiêu Phase 1 (Q2-Q3/2026, 3–6 tháng):** Launch private beta tour
operator B2C trực tuyến cho thị trường VN — book Series Tour online +
lead capture Private Tour, có CMS admin đủ vận hành, SEO foundation
đầy đủ, dashboard L0.

**Cách tiếp cận:** doc-before-code, design freeze trước sprint, 1
migration lớn cho mỗi pivot scope (V-09/V-10/V-12), 4 nguyên tắc DB
(N-01 → N-04) là rào chắn cuối ở DB-level.

**Sequencing 3 tầng:**

| Tầng | Mục tiêu | Sprint |
| --- | --- | --- |
| **Tầng 1 — Foundation** | DB schema + Auth + CMS đủ tạo tour | Sprint 1-2 (Done) |
| **Tầng 2 — Revenue path** | Tour discovery → Booking → Payment → Inquiry | Sprint 3-4 (In Progress + Upcoming) |
| **Tầng 3 — Retention & SEO** | Review + Loyalty cơ bản + SEO tối ưu | Sprint 5-6 |

**3 quyết định chiến lược lớn:**

1. **Booking-first**, không feature-first. Sprint 4 Booking là sprint
   đáng đầu tư nhất vì sinh revenue. Mọi feature khác (loyalty, search
   nâng cao, mobile) đều subordinate.
2. **Iterate qua migration lớn**, không nhiều migration nhỏ. Mỗi pivot
   scope (V-09 pricing, V-10 risk, V-12 inquiry) gộp 1 migration để
   schema history dễ trace.
3. **Doc Tier 0-4 phải freeze TRƯỚC sprint**, không vừa code vừa viết
   doc. Lý do: design DB sai sẽ migrate đau hơn nhiều so với delay 1-2
   ngày để chốt doc.

---

## Trạng thái hiện tại

> Snapshot ngày 27/05/2026 — đồng bộ với [`trang-thai-web.md`](../02-quan-ly-sprint/trang-thai-web.md).

### Code `travel-web`

| Sprint | Trạng thái | Tiến độ | Ghi chú |
| --- | --- | --- | --- |
| Sprint 1 Foundation | ✅ Done | 100% | Prisma + Supabase Auth + middleware admin/public + service layer |
| Sprint 2 CMS | ✅ Done | ~95% | CRUD destination/tour/hotel/room/region; Cloudinary upload AC nâng cao chưa |
| Sprint 3 Discovery | 🔶 In Progress | ~40% | Tour listing + filter cơ bản OK; autocomplete + map cluster chưa |
| Sprint 4 Booking | 🔶 Stub | ~10% | booking-widget UI có; chưa wire `BookingService.createTourBooking` |
| Sprint 5 Review | ❌ Upcoming | 0% | Schema có; UI chưa |
| Sprint 6 Optimize | 🔶 Partial | ~15% | Sitemap động + SEO metadata cơ bản |

### Doc `travel-doc`

| Tier | File | Phiên bản | Trạng thái |
| --- | --- | --- | --- |
| 0 Vision | `00-tam-nhin.md` | v1.4 | ✅ Đã chốt — 11 anchor V-01 → V-12 |
| 1 Business | `00b-mo-hinh-kinh-doanh.md` | v2.0 | ✅ Đã chốt — plain language |
| 1 Personas | `00c-personas-user-journey.md` | v1.0 | ✅ Đã chốt — 3 personas + 11-step journey |
| 2 Strategy | `01-chien-luoc-tong-the.md` | v2.0 | 🔶 File này — đang viết |
| 2 Functional | `01b-luong-nghiep-vu.md` | v0.1 DRAFT | 🔶 Tách từ Data Detail, refine ở Đợt 4 |
| 3 Architecture | `01-kien-truc-he-thong.md` | (cũ) | ❌ Còn outdated, Đợt 3 |
| 4 Data Overview | `02-so-do-du-lieu.md` | v2.3 | ✅ ERD 20 tables |
| 4 Data Detail | `03-thiet-ke-du-lieu-chi-tiet.md` | v2.5 | ✅ Pure DB schema |
| 4 Integrity | `06-quy-tac-toan-ven-du-lieu.md` | — | ❌ Đợt 2.3 |
| 4 Concurrency | `08-chien-luoc-concurrency.md` | — | ❌ Đợt 2.4 |
| 4 Visibility | `09-chien-luoc-visibility.md` | — | ❌ Đợt 2.5 |
| 4 SEO | `10-chien-luoc-seo.md` | — | ❌ Đợt 2.6 |
| 5 Migration | `12-quy-trinh-migration.md` | — | ❌ Đợt 5.1 |
| 5 Code standard | `11-quy-chuan-lap-trinh.md` | (cũ) | 🔶 Đợt 5.2 |

### Gap chính cần đóng trước Sprint 4

1. **Migration `add_pricing_options_and_allotment` (10 PART)** — gộp V-05/V-08/V-09/V-10/V-12 + PART 0 Type alignment + PART 9 Cascade fix + PART 10 Partial index (xem [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md) Migration kế tiếp).
2. **Schema fix `@db.Uuid`** — thêm `@db.Uuid` vào mọi `String @id` + FK ID trong `prisma/schema.prisma` (16 model + ~18 FK column). Pre-req cho PART 0.
3. **Schema fix Cascade → Restrict** — `Booking.userId` + `Review.userId` relation đổi `onDelete: Restrict`. Pre-req cho PART 9.
4. **Service layer mới:** `BookingService.createTourBooking()` (Pessimistic lock), `PaymentService`, `InquiryService`.
5. **Cross-cutting doc:** Concurrency + Visibility + SEO + Integrity (Đợt 2.3-2.6).
6. **Cron job:** Auto-cancel booking quá `paymentDeadline` (15 phút).

---

## Phương pháp luận triển khai

### Doc-before-code

Mọi sprint mới chỉ start sau khi:

1. **Tier 0-4 đã freeze** cho scope sprint đó (vision không đổi, ERD ổn định, integrity rule có).
2. **Sprint folder có đủ 4 file:**
   - `01-yeu-cau-nghiep-vu.md` (user story + AC)
   - `02-thiet-ke-co-ban.md` (flow + state machine)
   - `03-thiet-ke-chi-tiet.md` (entity changes + edge case)
   - `04-api-design.md` (request/response schema)
3. **Migration plan có sẵn** nếu sprint cần schema change.

> Lý do: lessons learned từ Issue 2-6 — fix DB sau khi production có data
> đắt gấp 10 lần fix DB ở thời điểm design.

### 4 nguyên tắc DB (N-01 → N-04)

Là rào chắn cuối ở DB-level — code reviewer dùng làm checklist.

| Nguyên tắc | Thực thi ở |
| --- | --- |
| **N-01** — Polymorphic Exclusive Arc + CHECK | `Review`, `SeoPage` (xem [`06-quy-tac-toan-ven-du-lieu.md`](./06-quy-tac-toan-ven-du-lieu.md)) |
| **N-02** — Visibility `isActive` + cascade hide | Hotel, Tour, Destination, Room, TourOption (xem [`09-chien-luoc-visibility.md`](./09-chien-luoc-visibility.md)) |
| **N-03** — Counter có CHECK + locking | `TourDeparture.bookedCount`, `HotelAllotment.usedRooms` (xem [`08-chien-luoc-concurrency.md`](./08-chien-luoc-concurrency.md)) |
| **N-04** — `onDelete`/`onUpdate` tường minh | Toàn bộ schema |

### Service layer kỷ luật

```
Page (RSC / Client Component)
   │
   ├──► Server Action ──┐
   │                    ├──► Service (BookingService, TourService, …)
   └──► API Route ──────┘            │
                                     ├──► Prisma ──► PostgreSQL
                                     └──► External (VNPay, Cloudinary, Resend)
```

**Rule cứng:** page/component KHÔNG gọi Prisma trực tiếp. Mọi mutation
phải đi qua Service → đảm bảo:

- Transaction boundary (đặc biệt với booking).
- ActivityLog audit tự động.
- I18n error message (Domain Error class).
- Testable không cần render UI.

### Iterate qua migration lớn

Thay vì 5 migration nhỏ cho V-09, gộp 1 migration `add_pricing_options_and_allotment` cover V-05/V-08/V-09/V-10/V-12. Lý do:

- Schema history dễ trace (1 PR = 1 migration lớn = 1 scope pivot).
- Audit script chạy 1 lần xác nhận tất cả CHECK constraint cùng lúc.
- Rollback đơn giản hơn (1 migration revert).

> Quy trình chi tiết: [`12-quy-trinh-migration.md`](./12-quy-trinh-migration.md) (sẽ viết Đợt 5.1).

---

## Plan A+ — chiến lược sequencing

Trace tới anchor [`00-tam-nhin.md`](./00-tam-nhin.md):

```
┌──────────────────────────────────────────────────────────────┐
│ TẦNG 1 — FOUNDATION (Done)                                   │
│ V-04 must-login, V-06 team-size, N-01..N-04 DB principles    │
│ → Prisma + Supabase Auth + middleware + CMS cơ bản           │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ TẦNG 2 — REVENUE PATH (In Progress + Upcoming)               │
│ V-01 tour-only, V-09 pricing, V-10 risk mgmt, V-12 split     │
│ → Discovery → Booking (Series) → Payment → Inquiry (Private) │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ TẦNG 3 — RETENTION & SEO (Upcoming)                          │
│ V-03 SEO-first, V-07 Phase 2 chừa cửa, V-08 reporting L0     │
│ → Review + Loyalty cơ bản + SEO tối ưu + Dashboard L0        │
└──────────────────────────────────────────────────────────────┘
```

### Vì sao theo thứ tự này

| Lý do | Hệ quả |
| --- | --- |
| **Booking-first sinh revenue** | Sprint 4 ưu tiên trên Sprint 5 dù Review schema có sẵn |
| **SEO cần data ổn định trước** | SEO override polymorphic chỉ wire khi tour/destination ổn định (Sprint 6) |
| **Loyalty cần user base** | Có booking flow chạy 1-2 tháng mới có data để design loyalty rule |
| **Mobile cần web data chứng minh retention** | Defer Phase 2 — không spend sớm |

### Cụ thể hoá Plan A+ qua scope adjustment

Plan A nguyên bản đã chốt MVP tour booking. Plan A+ thêm 4 scope sau pivot industry research:

| Anchor | Scope thêm | Sprint nào absorb |
| --- | --- | --- |
| **V-09 Pricing Pattern C** | `priceAdult/Child/Infant/singleSupplement` + `TourOption` upsell | Sprint 4 |
| **V-10 Risk Management** | `Booking.paymentDeadline` 15-min hold + `TourDeparture.minParticipants/cancellationDeadline` + `HotelAllotment` | Sprint 4 + 4.5 |
| **V-12 Private Tour split** | `InquiryRequest` lead capture + admin workflow `/portal/inquiries` | Sprint 4.5 |
| **V-08 Reporting L0** | `/portal/dashboard` operational metrics | Sprint 4.5 hoặc đầu Sprint 5 |

**Sprint 4.5** = mini-sprint chèn giữa Sprint 4 (Booking core) và Sprint 5
(Review). Lý do: Plan A+ scope quá nặng cho Sprint 4 thuần, tách ra để
không phá rhythm sprint.

---

## Sprint roadmap Phase 1

> Phiên bản chi tiết task: xem [`roadmap.md`](../roadmap.md) +
> [`backlog-chi-tiet.md`](../02-quan-ly-sprint/backlog-chi-tiet.md).
> File này chỉ cấp **strategic intent** + dependency chain.

### Sprint 1 — Foundation (Done, ~3 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| Mono-repo + DB + Auth | Prisma schema v1, Supabase Auth, middleware admin/public, dual cookie | V-04, V-06 |

### Sprint 2 — Quản trị nội dung (Done, ~4 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| CMS đủ tạo tour/destination/hotel | Admin CRUD, Cloudinary upload, Home Builder, sitemap động | V-01, V-03, V-06 |

### Sprint 3 — Discovery & Search (In Progress, ~3 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| Public tour discovery + filter | `/tours` list + filter + detail page, SEO metadata cơ bản | V-01, V-03 |

**Sprint 3 close criteria:**
- Filter theo region/giá/thời gian works.
- Tour detail page có gallery + itinerary + booking widget UI (chưa wire action).
- Lighthouse SEO score ≥ 80 cho `/tours` và `/tours/[slug]`.

### Sprint 4 — Booking core (Upcoming, ~4 tuần) ⭐ ưu tiên cao nhất

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| Series Tour book online end-to-end | BookingService với Pessimistic lock, VNPay/MoMo integration, email confirm, admin OMS | V-01, V-04, V-09 |

**Sprint 4 close criteria:**
- Khách book được tour Series → trả tiền VNPay → nhận email → admin thấy đơn ở `/portal/bookings`.
- CHECK constraint `tour_departures_no_overbook` active.
- Pessimistic lock chạy được dưới concurrent load test (10 req/s cùng departure).

### Sprint 4.5 — Plan A+ scope (Upcoming, ~2 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| Risk mgmt + Private Tour + Dashboard L0 | Cron auto-cancel 15-min, `InquiryRequest` form + admin UI, `/portal/dashboard` | V-10, V-12, V-08 |

**Sprint 4.5 close criteria:**
- Cron job xử lý booking PENDING quá deadline đúng (test với 100 đơn fake).
- Form "Đặt tour cho nhóm riêng" có chống spam (rate limit + honeypot).
- Dashboard L0 hiển thị: đơn hôm nay, doanh thu tuần, top 5 tour, export CSV.

### Sprint 5 — Review & Loyalty cơ bản (Upcoming, ~3 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| Khách review tour đã đi + voucher cơ bản | Review form (chỉ khách `COMPLETED`), aggregate rating, voucher code cho khách quay lại | V-04, V-07 |

**Sprint 5 close criteria:**
- Verify rule: chỉ khách có `Booking.status = COMPLETED` review được.
- Rating aggregate hiển thị trên tour listing + detail.
- Voucher code 1 dùng / khách (chưa phải full loyalty system).

### Sprint 6 — SEO & Release (Upcoming, ~3 tuần)

| Mục tiêu | Output | Trace anchor |
| --- | --- | --- |
| SEO production-ready + launch beta | SeoPage admin UI, JsonLd component, OpenGraph, Lighthouse ≥ 90, robots/sitemap final | V-03 |

**Sprint 6 close criteria:**
- Admin override metadata cho mọi entity (Tour/Destination/Hotel/Static).
- Google Search Console không có Critical error.
- 10 khách thật book được tour mà không hỗ trợ technical.

### Dependency chain

```
Sprint 1 ─► Sprint 2 ─► Sprint 3 ─► Sprint 4 ─┬─► Sprint 4.5 ─► Sprint 5 ─► Sprint 6
                          │                    │
                          └─ Migration ────────┘
                            add_pricing_options_and_allotment
                            (V-05 + V-08 + V-09 + V-10 + V-12)
```

**Critical path:** Migration `add_pricing_options_and_allotment` phải
apply TRƯỚC khi start Sprint 4 (booking dùng `priceBreakdown`,
`paymentDeadline`).

---

## Risk register chiến lược

> Risk cấp chiến lược (ảnh hưởng phase, không phải bug cấp PR). Mỗi
> risk có owner + mitigation + trigger.

| # | Risk | Impact | Likelihood | Mitigation | Trigger |
| --- | --- | --- | --- | --- | --- |
| **R-01** | Concurrency booking sai → overbook | Cao | Trung | Pessimistic lock + CHECK constraint + load test trước launch | 1 case overbook trên staging |
| **R-02** | VNPay/MoMo webhook miss → đơn PAID nhưng status PENDING | Cao | Cao | Idempotency key + reconcile cron + manual override UI | 1% đơn webhook miss |
| **R-03** | Hotel allotment over-commit → đoàn không có phòng | Cao | Trung | `HotelAllotment.contracted - used - released ≥ 0` CHECK + warning UI 80% | Booking confirm xong nhưng hotel báo full |
| **R-04** | Tour không đủ `minParticipants` → phải refund đoàn | Trung | Cao | `cancellationDeadline` rõ ràng + email notification + refund policy trong `Tour.policy` | 1 tour đến deadline chưa đủ min |
| **R-05** | Schema migration làm hỏng production data | Rất cao | Thấp | Audit script chạy TRƯỚC + staging mirror + backup 1h trước migrate | Production có data thật |
| **R-06** | SEO indexing chậm → traffic không lên | Trung | Cao | Sitemap động từ Sprint 2 + structured data từ Sprint 3 + GSC monitor | 1 tháng sau launch traffic < 1k uv/tháng |
| **R-07** | Team 2-3 dev burnout do scope creep | Cao | Cao | Non-Goals nghiêm + sprint review hằng tuần + nói NO với feature ngoài Plan A+ | 2 sprint liên tiếp slip >1 tuần |
| **R-08** | Doc-before-code thành bottleneck → code chậm | Trung | Trung | Mỗi doc Tier 4 timebox 2-3 ngày, doc Tier 5 (sprint) chỉ 1 ngày | 1 sprint delay vì chờ doc |
| **R-09** | Khách hủy đơn sau khi PAID → refund tay | Trung | Cao | Cancellation policy structure trong `Tour.policy` + hướng dẫn admin manual refund | 1 case refund đầu tiên |
| **R-10** | Private Tour lead không được follow-up | Trung | Trung | `InquiryRequest.status` transition rule + cron warn admin sau 48h NEW | 1 lead bị bỏ quên |
| **R-11** | Cloudinary quota free tier hết | Thấp | Trung | Monitor usage tháng, plan upgrade trước 80% | Quota đạt 80% |
| **R-12** | Supabase free tier limit (50k MAU, 500MB DB) | Thấp | Trung | Monitor MAU + plan upgrade Pro trước 80% | Vượt 40k MAU hoặc 400MB |
| **R-13** | Type mismatch silent — toàn schema dùng `TEXT` thay vì `UUID` (Prisma không khai `@db.Uuid`) | Trung | Đã xảy ra | Fix Option A: PART 0 migration ALTER COLUMN TYPE UUID + update Prisma schema thêm `@db.Uuid` (xem [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md) PART 0). Phải fix TRƯỚC Sprint 4. | Đã trigger 27/05/2026 |
| **R-14** | Index `is_active` full Boolean — low selectivity (99% TRUE), Postgres bỏ qua → Seq Scan | Trung | Đã xảy ra | Migration PART 10 convert sang partial `WHERE is_active = true`. Sửa Index convention trong doc 03. | Đã trigger 27/05/2026 |
| **R-15** | `Profile → Booking/Review` Cascade — xoá user mất doanh thu + review (vi phạm tax audit) | **Rất cao** | Trung | Migration PART 9 đổi Cascade → Restrict. Phase 1.5 thêm `Profile.deletedAt` + anonymize procedure. Hard delete user chỉ khi đã clear toàn bộ booking. | Đã trigger 27/05/2026 |

### Risk priority matrix

```
Impact ↑
 Rất cao │             R-05                              R-15
    Cao │   R-01  R-02  R-03  R-07
   Trung│   R-04  R-06  R-08  R-09  R-10  R-13  R-14
    Thấp│                            R-11  R-12
        └────────────────────────────────────────────────────►
          Thấp    Trung    Cao    Rất cao   Đã xảy ra
                Likelihood
```

→ **Top risk cần đầu tư mitigation ngay** (theo thứ tự):
1. **R-15** (Cascade history loss — Rất cao impact, đã trigger 27/05)
2. **R-13** (type mismatch — đã trigger 27/05)
3. **R-14** (partial index — đã trigger 27/05)
4. **R-02** (webhook miss)
5. **R-07** (scope creep)
6. **R-01** (concurrency overbook)

Cả 3 risk đầu là silent technical debt đã catch sớm (trước Sprint 4) —
fix chung trong migration `add_pricing_options_and_allotment` (PART 0,
9, 10).

---

## KPI Phase 1 — đo lường thành công

> Mỗi KPI có **target conservative** và **target stretch**. Conservative
> = "đủ để gọi Phase 1 success". Stretch = "có dấu hiệu PMF".

### Sản phẩm

| KPI | Conservative | Stretch | Đo bằng |
| --- | --- | --- | --- |
| Booking thật / tháng | 30 | 100 | `Booking WHERE status IN (PAID, CONFIRMED, COMPLETED)` |
| Revenue / tháng | 100 triệu VND | 500 triệu VND | `SUM(Booking.totalAmount) WHERE status >= PAID` |
| Conversion rate (view → book) | 0.5% | 2% | GA4 event funnel |
| Khách hoàn thành tour | 90% | 95% | `COMPLETED / (COMPLETED + CANCELLED)` |
| Review rate / booking COMPLETED | 20% | 40% | `Review COUNT / Booking COMPLETED COUNT` |

### Kỹ thuật

| KPI | Target | Đo bằng |
| --- | --- | --- |
| Lighthouse score (Mobile) | ≥ 90 toàn site | Lighthouse CI |
| LCP | < 2.5s | Web Vitals |
| Booking success rate | ≥ 99% | `PAID / (PAID + FAILED)` |
| Webhook reconcile rate | 100% (≤ 1h delay) | Cron job report |
| Uptime | ≥ 99.5% | Vercel + Supabase status |

### Vận hành

| KPI | Target | Đo bằng |
| --- | --- | --- |
| Admin trả lời Inquiry trong | < 4h working hour | `InquiryRequest.contactedAt - createdAt` |
| Email confirm gửi | < 30s sau PAID | Resend log |
| Bug critical / sprint | 0 | Linear / GitHub issue tag |
| Tour active đầu Phase 1 | ≥ 20 | `Tour WHERE isActive = true` |

### Tài chính (informal Phase 1)

| Khoản | Conservative budget |
| --- | --- |
| Supabase Pro (sau khi hết free) | $25 / tháng |
| Cloudinary Plus (sau khi hết free) | $99 / tháng |
| Resend (email) | $20 / tháng |
| Vercel Hobby/Pro | $0-20 / tháng |
| Domain + SSL | $30 / năm |
| **Tổng infra Phase 1** | **~$170 / tháng peak** |

---

## Build vs Buy

> Mọi tính năng có sẵn SaaS rẻ → buy. Tự build chỉ khi (a) core business
> logic, (b) SaaS không cover, (c) cost > $200/tháng cho SaaS.

| Domain | Quyết định | Lý do |
| --- | --- | --- |
| **Auth** | BUY — Supabase Auth | OAuth Google, magic link, SMTP sẵn. Tự build = 2-3 tuần phí |
| **DB** | BUY — Supabase Postgres | Managed, backup, RLS optional, free tier đủ MVP |
| **Image storage** | BUY — Cloudinary | Transform on-the-fly, CDN, free tier đủ MVP |
| **Email transactional** | BUY — Resend (Phase 1.5) | Phase 1 dùng Supabase SMTP miễn phí (auth email), Resend khi cần transaction email đẹp |
| **Payment** | BUY — VNPay + MoMo | Self-host SDK của họ, không dùng aggregator |
| **Analytics** | BUY — GA4 + Vercel Analytics | Đủ cho Phase 1 |
| **Error monitoring** | BUY — Sentry free tier (Phase 1.5) | Phase 1 console.log + Vercel log đủ |
| **CMS** | BUILD — admin CMS trong Next.js | Core business; SaaS CMS (Strapi/Sanity) coupling lỏng không đáng |
| **Search** | BUILD — Postgres ILIKE + index Phase 1, Algolia Phase 2 | Phase 1 ≤ 100 tour, không cần Algolia |
| **i18n** | BUY (library) — next-intl | RSC-compatible, free, không bị lock |
| **Map** | BUY — embed Google Maps (Phase 1.5 — Mapbox nếu cần custom) | Phase 1 chỉ cần show location |
| **Cron** | BUY — Vercel Cron (free tier) | Phase 1 chỉ 2-3 job (auto-cancel, inquiry warn) |
| **Cache** | BUY — Next cache + tags + TanStack Query | Free, sẵn trong stack |
| **Loyalty system** | BUILD (Phase 1.5+) | Phase 1 chỉ voucher đơn giản |
| **AI chatbot** | DEFER Phase 2+ | Chưa có data để train |

---

## Definition of Done — per tier

> Khi nào "đủ" để chuyển tier sau? Tránh perfectionism nhưng cũng tránh
> half-done.

### Tier 0 — Vision (`00-tam-nhin.md`)

✅ DONE khi có đủ:
- WHY/WHO/WHAT/HOW/WHERE/WHEN (7 phần)
- Non-Goals (≥ 8 dòng cố ý không làm)
- Anchor V-XX có ID + trace tới mục content
- Founder sign-off (ghi vào Changelog)

### Tier 1 — Business + Personas

✅ DONE khi:
- BMC 9 ô (`00b`) có content cụ thể, không chung chung
- 3 personas (`00c`) có demographic + goals + frustrations + journey
- User journey 11 bước có decision point + emotion curve

### Tier 2 — Strategy + Functional

✅ DONE khi:
- File này có sprint roadmap với close criteria
- `01b-luong-nghiep-vu.md` có Operating Model + flow Tour↔Hotel↔Booking + edge cases
- `02-thiet-ke-co-ban.md` có sitemap + module map (chưa có — Đợt 4)

### Tier 3 — Architecture

✅ DONE khi:
- Tech stack table có lý do mỗi choice
- Layer diagram (Page → Action → Service → Prisma)
- Cross-cutting concerns spec (auth/i18n/cache/log/error)

### Tier 4 — Data (NGHIÊM nhất)

✅ DONE khi:
- ERD ổn định (`02-so-do-du-lieu.md`)
- Mỗi table có spec module trong `03-thiet-ke-du-lieu-chi-tiet.md`
- Integrity rule (`06-`), Concurrency (`08-`), Visibility (`09-`), SEO (`10-`) đều có file
- 4 nguyên tắc N-01 → N-04 audit pass

### Tier 5 — Sprint detail (per sprint)

✅ DONE khi sprint folder có:
- `01-yeu-cau-nghiep-vu.md`
- `02-thiet-ke-co-ban.md`
- `03-thiet-ke-chi-tiet.md`
- `04-api-design.md`
- `05-test-plan.md` (mới)

---

## Resource allocation

> Team 2-3 dev (1 fullstack chính + 1 frontend phụ + founder làm sản phẩm/test).

### Phân chia trách nhiệm

| Vai trò | Ai | Phụ trách |
| --- | --- | --- |
| **Tech Lead / Fullstack** | Dev chính | Schema, Service layer, migration, Booking core, integration VNPay/MoMo |
| **Frontend / UI** | Dev phụ | Public UI (Discovery, Booking widget, Inquiry form), Admin UI (CMS, Dashboard, OMS) |
| **Product / QA** | Founder | Doc, sprint review, test thật, customer support thử nghiệm, content tour seed |

### Effort allocation theo sprint (estimate)

| Sprint | Tech Lead | Frontend | Founder | Tổng dev-week |
| --- | --- | --- | --- | --- |
| Sprint 3 (còn lại) | 1 tuần | 2 tuần | 1 tuần | 4 |
| Sprint 4 Booking | 3 tuần | 2 tuần | 1 tuần | 6 |
| Sprint 4.5 Plan A+ | 1.5 tuần | 1 tuần | 0.5 tuần | 3 |
| Sprint 5 Review | 1 tuần | 2 tuần | 1 tuần | 4 |
| Sprint 6 SEO & Release | 1 tuần | 1.5 tuần | 1.5 tuần | 4 |
| **Tổng còn lại** | **7.5** | **8.5** | **5** | **~21 dev-week** |

→ Với 3 người làm parallel: **~7-8 tuần effort thực tế** (Q3/2026 reasonable).

### Anti-pattern cần tránh

| Anti-pattern | Tác hại |
| --- | --- |
| Tech Lead làm cả UI + service | Bottleneck, frontend rảnh chờ |
| Founder code feature thay vì làm content/QA | Không ai test sản phẩm |
| Code parallel migration | Conflict prisma schema, merge đau |
| Skip doc-before-code "để code nhanh" | 1-2 tuần sau migrate lại đau gấp 10 |

---

## Changelog

| Ngày | Version | Thay đổi | Người duyệt |
| --- | --- | --- | --- |
| (cũ) | 1.0 | Stub 22 dòng — chỉ có high-level vision Next.js 14, 3 sprint. Outdated. | — |
| 27/05/2026 | 2.0 | **Viết lại từ đầu** thành Tier 2 Strategy đầy đủ. Cấu trúc: Tóm tắt 1 trang + Trạng thái hiện tại + Phương pháp luận + Plan A+ sequencing + Sprint roadmap với close criteria (Sprint 3-6 + Sprint 4.5 mini) + Risk register 12 risk + KPI Phase 1 (sản phẩm/kỹ thuật/vận hành/tài chính) + Build vs Buy 15 dòng + Definition of Done per tier + Resource allocation 2-3 dev. Trace tới 11 anchor V-01 → V-12 và liên kết tới các file Tier 4. | Founder |
| 27/05/2026 | 2.1 | **Thêm R-13** vào risk register sau khi user phát hiện type mismatch TEXT vs UUID trong doc 03 v2.5. Cập nhật "Top risk cần mitigation ngay" thành Top 4 (R-13 ưu tiên 1). Thêm 2 dòng vào "Gap chính cần đóng trước Sprint 4": (1) Migration PART 0 Type alignment, (2) Schema fix `@db.Uuid` cho 16 model + ~18 FK. | Founder |
| 27/05/2026 | 2.2 | **Thêm R-14, R-15** sau 3 góp ý AI review. R-14 (index `is_active` full Boolean low selectivity) trigger PART 10 partial index. R-15 (Cascade Profile→Booking mất doanh thu — Rất cao impact) trigger PART 9 đổi sang Restrict. Cập nhật risk priority matrix + Top risk: R-15 vọt lên #1 vì impact Rất cao. Thêm dòng "Schema fix Cascade → Restrict" vào Gap section. | Founder |

---

*File này thuộc **Tier 2 (Strategy)** trong framework
[`00-blueprint-handoff-2026-05-26.md`](../00-blueprint-handoff-2026-05-26.md)
Phần III. Liên kết tới các tier khác:*

- *Tier 0 Vision: [`00-tam-nhin.md`](./00-tam-nhin.md)*
- *Tier 1 Business: [`00b-mo-hinh-kinh-doanh.md`](./00b-mo-hinh-kinh-doanh.md)*
- *Tier 1 Personas: [`00c-personas-user-journey.md`](./00c-personas-user-journey.md)*
- *Tier 2 Functional: [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md)*
- *Tier 3 Architecture: [`01-kien-truc-he-thong.md`](./01-kien-truc-he-thong.md)*
- *Tier 4 Data Overview: [`02-so-do-du-lieu.md`](./02-so-do-du-lieu.md)*
- *Tier 4 Data Detail: [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md)*
- *Roadmap (sprint folder): [`../roadmap.md`](../roadmap.md)*
- *Trạng thái web: [`../02-quan-ly-sprint/trang-thai-web.md`](../02-quan-ly-sprint/trang-thai-web.md)*
