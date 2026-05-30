# Vivu Travel — Blueprint Bàn Giao Thiết Kế

> **Phiên bản:** 1.0 · **Ngày:** 26/05/2026
> **Mục đích:** Tài liệu tổng hợp các quyết định kỹ thuật đã chốt trong giai
> đoạn code review (Issue 2-6), snapshot DB hiện tại, và khung tư duy
> "ý tưởng → thiết kế → triển khai" để phục vụ rework toàn bộ tài liệu
> thiết kế trong `travel-doc/docs/`.
>
> **Cách dùng:** đây là **bản nháp gốc**. Copy sang `travel-doc/docs/` rồi
> cắt nhỏ thành các file theo mapping ở **Phần IV**. Không treat như doc
> chính thức — chính thức là sau khi user phân rã.

---

## Mục lục

- [Phần 0 — Vì sao có doc này](#phần-0--vì-sao-có-doc-này)
- [Phần I — Recap các quyết định đã chốt (Issue 2-6)](#phần-i--recap-các-quyết-định-đã-chốt-issue-2-6)
- [Phần II — Snapshot DB sau các fix](#phần-ii--snapshot-db-sau-các-fix)
- [Phần III — Khung tư duy "Startup: Idea → Implement"](#phần-iii--khung-tư-duy-startup-idea--implement)
- [Phần IV — Mapping vào `/docs` hiện có](#phần-iv--mapping-vào-docs-hiện-có)
- [Phần V — Migration Discipline](#phần-v--migration-discipline)
- [Phụ lục A — Danh sách migration hiện tại](#phụ-lục-a--danh-sách-migration-hiện-tại)
- [Phụ lục B — Schema source-of-truth](#phụ-lục-b--schema-source-of-truth)
- [Phụ lục C — Checklist Pre-Sprint](#phụ-lục-c--checklist-pre-sprint)

---

## Phần 0 — Vì sao có doc này

### Bối cảnh

Trong quá trình code review tuần 25-26/05/2026, đội đã đi review từng module
**theo chiều "phát hiện vấn đề → fix ngay"**. Cách này nhanh và sửa được
nhiều bug data integrity quan trọng, nhưng tới Issue 5-6 lộ ra điểm yếu:
**không có map tổng thể** → mỗi decision tách rời, dễ đi lệch hướng dài
hạn, và tiềm năng phải migration lại khi thêm feature mới.

### Lessons learned

1. **Reactive review ≠ thiết kế.** Sửa từng issue không cho ra một thiết kế
   tổng thể. Cần một bước "design freeze" trước khi vào sprint.
2. **DB design là phần đắt nhất khi migrate sau.** Mọi quyết định polymorphism,
   visibility, concurrency phải có trước khi viết code.
3. **Doc kỹ thuật cũ đã outdated.** `docs/02-so-do-du-lieu.md` và
   `03-thiet-ke-du-lieu-chi-tiet.md` ở `travel-doc` vẫn nói Region.code,
   Next.js 14, không có polymorphism — không phản ánh code hiện tại.
4. **Cần "1 trang vision" làm neo.** Mọi quyết định technical phải quote
   về business intent — không thì dễ lan man.

### Sản phẩm bàn giao

Doc này là **gói nguyên liệu** cho user mang sang `travel-doc/docs` để
viết lại các file thiết kế chuẩn. Gồm:

- ✅ Recap đầy đủ quyết định 5 issue đã fix (lý do, scope, file)
- ✅ ERD + integrity rules hiện tại
- ✅ Framework 5 tier "idea → detail design"
- ✅ Mapping vào file structure hiện có của `travel-doc/docs`
- ✅ Bộ quy tắc migration discipline để không phải migrate lại

---

## Phần I — Recap các quyết định đã chốt (Issue 2-6)

### Issue 2 — `ActivityLog.profile` thiếu `onDelete`

| Aspect | Chi tiết |
| --- | --- |
| **Vấn đề** | Relation `ActivityLog.profile` không khai báo `onDelete`, dựa vào Prisma default (SetNull khi nullable). Người đọc schema sau không biết intent. |
| **Quyết định** | Khai báo tường minh `onDelete: SetNull`. |
| **Scope** | Chỉ thay đổi schema declaration — không thay đổi SQL thực tế. |
| **Lý do** | Self-documenting. Tránh dependency vào framework default. |
| **Files** | `prisma/schema.prisma` |

### Issue 3 — Polymorphism CHECK constraints (Booking, Review)

| Aspect | Chi tiết |
| --- | --- |
| **Vấn đề** | `Booking` polymorphic theo `bookingType` (HOTEL/TOUR) nhưng không có constraint chặn data inconsistent (booking type=HOTEL nhưng có TourBooking attached). Tương tự `Review` với `targetType`. |
| **Quyết định** | Thêm CHECK constraints DB-level. |
| **Constraints thêm** | <ul><li>`bookings_type_consistency`: HOTEL ↔ HotelBooking, TOUR ↔ TourBooking (mutually exclusive)</li><li>`reviews_target_exclusive`: HOTEL ↔ hotel_id NOT NULL, TOUR ↔ tour_id NOT NULL</li><li>`reviews_rating_range`: rating BETWEEN 1 AND 5</li><li>`tour_bookings_participants_positive`: participants > 0</li><li>`tour_departures_booked_count_non_negative`: booked_count >= 0</li><li>`tour_departures_no_overbook`: booked_count <= max_participants</li></ul> |
| **Lý do** | App code có thể có bug. DB-level CHECK là last line of defense → không corrupt được data dù app lỗi. |
| **Tool đi kèm** | `scripts/audit-data-integrity.sql` — chạy TRƯỚC khi apply để detect existing violations (refactor sang `UNION ALL` để Supabase SQL Editor show 1 result). |
| **Files** | `prisma/migrations/20260525223449_add_data_integrity_checks/migration.sql`, `scripts/audit-data-integrity.sql` |

### Issue 4 — `TourDeparture` race condition

| Aspect | Chi tiết |
| --- | --- |
| **Vấn đề** | Lost Update problem: nhiều booking concurrent đọc-tăng-ghi `bookedCount` → có thể overbook quá `maxParticipants`. |
| **Quyết định** | **Solution A — Pessimistic Locking** (chọn vì correctness > performance ở MVP, lock acceptable cho UI booking). |
| **Cách triển khai** | <ul><li>`prisma.$transaction(..., { isolationLevel: Serializable })`</li><li>`$queryRaw<...>` với `SELECT ... FOR UPDATE` trên `tour_departures` row</li><li>Validate slot availability AFTER acquiring lock</li><li>Snapshot pricing (departure override hoặc tour priceFrom) ngay trong transaction</li><li>Auto-update status: AVAILABLE → FULL khi đủ chỗ; FULL → AVAILABLE khi cancel</li></ul> |
| **Domain Error** | `BookingError` class với i18n key. 10 message key mới `VIVU_BOOKING_*` trong `en.json`/`vi.json`. |
| **Safety net** | Issue 3 CHECK constraints chặn `booked_count > max_participants` ở DB level dù app lỗi. |
| **Methods triển khai** | `BookingService.createTourBooking()`, `BookingService.cancelTourBooking()` |
| **Files** | `src/services/booking.service.ts`, `src/messages/en.json`, `src/messages/vi.json` |

### Issue 5 — `Destination.isActive` (cascade hide)

| Aspect | Chi tiết |
| --- | --- |
| **Vấn đề** | Destination thiếu cờ visibility (Tour và Hotel đã có `isActive` rồi). Không thể "tạm ẩn" destination theo mùa mà không xóa cứng. |
| **Quyết định chính** | Thêm `isActive Boolean @default(true)` + cascade hide xuống Tour/Hotel. |
| **3 sub-quyết định** | <ul><li>**Cascade visibility**: Option A — destination inactive ẩn luôn tour/hotel của nó ở public surface</li><li>**Soft delete**: chỉ `isActive`, KHÔNG thêm `deletedAt` (audit log đã track)</li><li>**API naming**: rename rõ — `getAll/getPaginated/getBySlug` là public (lọc active); `getAllForAdmin/...` là admin (thấy hết)</li></ul> |
| **Cascade points** | `tour.service.ts`: `searchListings`, `getFeatured`, `getBySlug`, `getById`, `getAll`, `getPaginated` thêm filter `destination: { isActive: true }`.<br>`sitemap.ts` filter cả `destinations` và `tours`. |
| **Indexes mới** | `destinations(is_active)`, `destinations(region_id, is_active)` |
| **UI mới** | Switch "Đang hoạt động" trong form admin destination |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/20260525230000_add_destination_is_active/migration.sql`, `src/services/destination.service.ts`, `src/services/tour.service.ts`, `src/actions/destination.actions.ts`, `src/actions/tour.actions.ts`, `src/app/sitemap.ts`, `src/app/admin/destinations/page.tsx`, `src/lib/validations/schemas.ts`, `src/messages/admin/*.json` |

### Issue 6 — SEO slug orphan

| Aspect | Chi tiết |
| --- | --- |
| **Vấn đề** | `SeoPage.slug String @unique` không có FK link tới Tour/Destination/Hotel. Đổi entity slug → SeoPage orphan. Hiện tại model chưa được consume bởi app nhưng schema sẽ thành bẫy khi wire up. |
| **Quyết định** | **Option A — Polymorphic Exclusive Arc** (đầy đủ, đúng chuẩn PostgreSQL). |
| **Schema mới** | <ul><li>Enum `SeoTargetType` (TOUR \| DESTINATION \| HOTEL \| STATIC)</li><li>4 cột nullable unique: `tourId? / destinationId? / hotelId? / customPath?`</li><li>3 FK với `onDelete: Cascade` → entity bị xóa thì SeoPage tự dọn</li><li>CHECK `seo_pages_exclusive_target`: đúng 1 cột non-NULL khớp với `targetType`</li></ul> |
| **Lý do chọn Exclusive Arc** | Postgres không thể FK trỏ về nhiều bảng từ 1 cột. Multiple nullable FK + CHECK là pattern chuẩn cho polymorphic giữ được referential integrity ở DB level (cascade native, không cần trigger). |
| **Reverse relation** | `seoPage SeoPage?` thêm vào Tour/Destination/Hotel |
| **Out of scope (sprint riêng)** | Wire `generateMetadata()` đọc SeoPage; build SeoService; rewrite admin/seo từ placeholder sang CRUD thật |
| **⚠️ Migration TRUNCATE** | Schema cũ ↔ mới không tương thích. Migration TRUNCATE bảng (table chưa được dùng nên OK — đã grep verify zero usage). |
| **Files** | `prisma/schema.prisma`, `prisma/migrations/20260526000000_seo_polymorphic/migration.sql`, `src/messages/admin/*.json` |

### Sửa khác (không đánh số Issue)

- **README + ARCHITECTURE**: cập nhật Next.js 14 → 15, mô tả `lib/` đúng intent (không chỉ third-party config).
- **middleware.ts refactor**: tách thành helper function single-responsibility (`isAdminZone`, `isGuestAuthPath`, `handleAdminZone`, ...). Matcher loại trừ `/api/*` và static assets (`.avif`, `.ico`, `robots.txt`, `sitemap.xml`, `manifest.json`) → giảm số lần `supabase.auth.getUser()` được gọi.
- **Region.code drop**: redundancy với `slug` → migration `20260525215917_drop_region_code`.

### Backlog low priority (chưa làm)

| # | Issue | Mức độ |
| --- | --- | --- |
| 7 | `Tour.durationDays` (Int) vs `durationText` (String) redundancy — chọn 1 hay derive? | LOW |
| 8 | Composite indexes — audit thêm `(targetType, targetId)` cho reviews, `(userId, status, createdAt)` cho bookings | LOW-MEDIUM |
| 9 | `TourItinerary` thiếu `createdAt/updatedAt` → audit không track | LOW |
| 10 | Promotion handling — `tags`/`oldPrice` rải rác, chưa có model `Promotion` trung tâm | LOW |

---

## Phần II — Snapshot DB sau các fix

### ERD overview

```
┌──────────┐  1:N  ┌─────────────┐  1:N  ┌──────┐   1:N  ┌──────┐
│ Region   ├──────►│ Destination ├──────►│ Tour ├───────►│Review│
└──────────┘       │   isActive  │       │isActive       └──────┘
                   └──────┬──────┘       └──┬───┘  ◄──┐
                          │1:N              │1:N      │polymorphic
                          ▼                 ▼         │(exclusive arc)
                       ┌──────┐         ┌──────────┐  │
                       │Hotel │         │Departure │  │
                       │isAct │         │bookedCnt │  │
                       └──┬───┘         └─────┬────┘  │
                          │1:N                │1:N    │
                          ▼                   ▼       │
                       ┌──────┐    Booking polymorphic
                       │Room  │   ┌────────┐
                       └──┬───┘   │Booking ├──┬─► HotelBooking (HOTEL)
                          │1:N    │ type   │  └─► TourBooking  (TOUR)
                          └─────► └────────┘     (CHECK exclusive)
                                       │1:1
                                       ▼
                                  ┌─────────┐
                                  │ Payment │
                                  └─────────┘

SeoPage (polymorphic exclusive arc) ─► one of: Tour | Destination | Hotel | custom_path

User (Profile) ─► Booking, Review, ActivityLog (SetNull on delete)
```

### Bounded contexts

| Context | Entities | Notes |
| --- | --- | --- |
| **Content CMS** | Region · Destination · Hotel · Tour · TourItinerary · TourDeparture | `isActive` ở Hotel/Tour/Destination. Cascade hide design. |
| **Booking & Payment** | Booking · HotelBooking · TourBooking · Payment | Polymorphic + CHECK + pessimistic locking |
| **User & Auth** | Profile · Role enum · ActivityLog | Profile mirror Supabase, sync qua `ensureUserProfile` |
| **Reviews** | Review (polymorphic) | Hotel \| Tour, rating 1-5 |
| **SEO & Settings** | SeoPage (polymorphic) · SystemSetting (kv) · HomeSetting | SeoPage exclusive arc |

### Integrity rules đang enforce ở DB

| Rule | Where | Loại |
| --- | --- | --- |
| Booking polymorphic | CHECK `bookings_type_consistency` | App + DB |
| Review polymorphic + rating range | CHECK `reviews_target_exclusive`, `reviews_rating_range` | DB |
| TourBooking participants > 0 | CHECK `tour_bookings_participants_positive` | DB |
| Departure bookedCount ≥ 0 | CHECK `tour_departures_booked_count_non_negative` | DB |
| Departure không overbook | CHECK `tour_departures_no_overbook` | DB |
| SeoPage exclusive target | CHECK `seo_pages_exclusive_target` | DB |
| Cascade delete Destination → Hotel/Tour | FK `onDelete: Cascade` | DB |
| Cascade delete Entity → SeoPage | FK `onDelete: Cascade` | DB |
| Concurrency TourDeparture | `SELECT FOR UPDATE` + Serializable tx | App |

### Naming convention đang áp dụng

- Model **PascalCase**, field **camelCase**
- `@map("snake_case")` ở DB cho mọi field
- `@@map("snake_case_plural")` cho table name
- `created_at` / `updated_at` ở mọi mutable entity (trừ một số junction table tạm thời)
- ID = **UUID** (`@default(uuid())`)
- Slug khi cần SEO URL — không reuse cho mục đích khác
- Boolean visibility = **`isActive`** (không dùng `isPublished`, `isVisible`, ...)

---

## Phần III — Khung tư duy "Startup: Idea → Implement"

### Tier 0 — Vision (1 trang, không quá)

**Câu hỏi:** Sản phẩm này tồn tại để giải quyết vấn đề gì?

```
WHY    — Người Việt đặt tour qua Facebook/Zalo, không có nền tảng
         tập trung minh bạch giá / đánh giá / hành trình.
WHO    — Khách lẻ B2C 25-45 tuổi, có thu nhập, đã từng đi tour.
WHAT   — Marketplace tour combo + booking trực tuyến với hệ sinh thái
         web admin nội bộ + web client SEO + (sau) app mobile.
HOW    — Single brand "Vivu Travel" giai đoạn 1 (B2C trực tiếp);
         giai đoạn 2 mở affiliate/livestream sales (TikTok/FB).
WHERE  — Việt Nam, đa ngôn ngữ VI/EN (EN dành cho khách quốc tế sau).
WHEN   — MVP: tour + booking + payment; combo hotel display
         (chưa cho đặt riêng hotel ở Phase 1).
```

> **Quy tắc:** vision không bao giờ dài quá 1 trang. Mọi quyết định
> technical về sau phải quote về đây — nếu không justify được tới WHY,
> đó là sign chệch hướng.

**Output:** `00-tam-nhin.md` ở root mục `01-nen-tang-he-thong/`.

### Tier 1 — Business Model & Personas

**Business Model Canvas** (rút gọn):

| Block | Vivu Travel |
| --- | --- |
| Customer Segments | B2C tour-shopper VN; (P2) Affiliate creator |
| Value Proposition | Tour minh bạch giá/lịch trình/đánh giá; đặt online 24/7 |
| Channels | Web SEO, Google Ads, (P2) TikTok/FB live |
| Revenue Streams | Markup tour, (P2) affiliate commission |
| Key Resources | Tour inventory, content team, dev team |
| Cost Structure | Operator wholesale, payment gateway fee, hosting |
| Key Activities | Curate tour, content production, customer support |

**Personas chính (3):**

- **Anh Khoa** (32, kỹ sư, HCM) — book tour cho gia đình, ưu tiên review + giá tốt → cần filter mạnh, ảnh đẹp.
- **Chị Linh** (28, marketing, HN) — book solo/cùng bạn, dùng mobile chính → cần app responsive, save trip ý tưởng.
- **Admin Vivu** (operator nội bộ) — quản inventory, đẩy promotion, theo dõi đơn → cần CMS ergonomic, audit log.

**User journey chính (B2C tour):**

```
Discover (SEO/Ads) → Browse (filter) → Detail (gallery + itinerary)
  → Pick departure date → Booking form → Pay (VNPay/Momo)
  → Email confirm → (operator confirm) → Travel → Review
```

**Output:** `00b-mo-hinh-kinh-doanh.md` + `00c-personas-user-journey.md`.

### Tier 2 — Functional Design (WHAT)

**Sitemap public:**

```
/                       Home
/diem-den               Destinations list
/diem-den/[slug]        Destination detail
/tours                  Tours list (filter)
/tours/[slug]           Tour detail (+ booking widget)
/khach-san              Hotels list (display only Phase 1)
/khach-san/[slug]       Hotel detail
/khuyen-mai             Promotions
/cam-hung               Inspiration
/lien-he                Contact
/ve-chung-toi           About
/dang-ky, /dang-nhap    Auth
/tai-khoan              Profile
/don-dat                My bookings
```

**Sitemap admin** (`/portal/*` để giấu zone):

```
/portal/login           Admin login
/portal/                Dashboard
/portal/destinations    Destination CMS
/portal/tours           Tour CMS (+ itineraries, departures)
/portal/hotels          Hotel CMS
/portal/bookings        Order management
/portal/users           User list
/portal/settings/*      System/SEO/Home
/portal/seo             SEO override (when wired)
/portal/activity        Audit log
```

**Module decomposition (bounded contexts):**

```
┌─────────────────────────────────────────────────────────┐
│  CONTENT          BOOKING         AUTH         PLATFORM │
│  ───────          ───────         ────         ──────── │
│  Region           Booking         Profile      Settings │
│  Destination      HotelBooking    Role         SeoPage  │
│  Hotel/Room       TourBooking     ActivityLog  HomeSet  │
│  Tour             Payment                      Sitemap  │
│  Itinerary                                              │
│  Departure                                              │
│  Review                                                 │
└─────────────────────────────────────────────────────────┘
```

Mỗi context có service layer riêng (`destination.service`, `tour.service`,
`booking.service`, `auth.service`, `system.service`). Page/component KHÔNG
gọi Prisma trực tiếp — luôn qua Service.

**Output:** `02-thiet-ke-co-ban.md` (sitemap + module map + journey mapping).

### Tier 3 — System Design (HOW the system works)

**Tech stack decisions (đã record + justify):**

| Layer | Choice | Lý do |
| --- | --- | --- |
| Framework | Next.js 15 App Router | RSC + Server Actions + built-in i18n routing → single codebase cho admin + public + SEO |
| DB | PostgreSQL via Supabase | ACID + JSON + CHECK + Free tier |
| ORM | Prisma | Type-safe, migration tool tốt, raw SQL khi cần (FOR UPDATE) |
| Auth | Supabase Auth | OAuth Google sẵn, SMTP sẵn |
| Storage | Cloudinary | Image transform on-the-fly, free tier đủ MVP |
| Payment | VNPay + MoMo | Cover thị trường VN |
| UI | HeroUI + Tailwind 4 | Component sẵn + utility-first |
| i18n | next-intl | RSC compatible |
| Cache | TanStack Query (client) + Next cache (server) | Tự nhiên với App Router |

**Architecture layers (rule cứng trong codebase):**

```
Page (RSC/Client) ─┬─► Server Action ─┐
                   │                  ├─► Service ──► Prisma ──► PostgreSQL
                   └─► API Route ─────┘
                              │
                              └─► Supabase Auth (SSR)
```

**Cross-cutting concerns:**

- **Auth & Authz:** middleware refresh session; `requireAdmin()` guard trong action/api.
- **i18n:** 2 locale VI/EN; messages chia theo namespace (`Common`, `Auth`, `Admin.*`, `Tours`, ...).
- **Cache:** Static page với `revalidate`; dynamic data dùng `next.cache.tags` (Cache Components).
- **SEO:** `generateMetadata` + sitemap động + JsonLd component per entity.
- **Logging:** `ActivityService.log` cho mọi mutation admin.
- **Error handling:** Domain error class (e.g. `BookingError`) với i18n key.

**Output:** `01-kien-truc-he-thong.md` (cập nhật) + `02-cross-cutting.md`.

### Tier 4 — Data Design (phải freeze NGHIÊM trước khi code)

Đây là phần đắt nhất khi sai → quy tắc cứng.

**4 nguyên tắc thiết kế DB** (rút ra từ Issue 2-6):

1. **Polymorphic luôn dùng Exclusive Arc + CHECK**, không bao giờ string slug.
2. **Visibility (`isActive`) phải có ở mọi entity public-facing** + tách method admin vs public.
3. **Concurrency-prone counters phải có constraint chặn overflow** (như `booked_count ≤ max_participants`).
4. **Referential action (`onDelete`/`onUpdate`) phải khai báo tường minh**, không dựa vào Prisma default.

**Per-module schema spec template:**

```
Module: <Tên>
Tables:  <list>
Relationships: <ASCII diagram>
Constraints: <CHECK / UNIQUE / FK>
Indexes: <list, justify hot path>
Visibility rules: <isActive / soft delete>
Cascade behavior: <onDelete / onUpdate matrix>
Concurrency: <locking strategy nếu có>
```

**Output:**

- `03-thiet-ke-du-lieu-chi-tiet.md` viết lại từ đầu (file cũ outdated).
- `06-quy-tac-toan-ven-du-lieu.md` (CHECK constraints + audit script).
- `08-chien-luoc-concurrency.md` (locking + transaction isolation).
- `09-chien-luoc-visibility.md` (isActive + cascade + soft delete policy).
- `10-chien-luoc-seo.md` (SeoPage polymorphic + metadata flow).

### Tier 5 — Detailed Spec (per sprint)

Mỗi sprint cần 5 file (template trong `sprint-3-tim-kiem-kham-pha/`):

- `01-yeu-cau-nghiep-vu.md` — User story + AC
- `02-thiet-ke-co-ban.md` — Flow + state machine
- `03-thiet-ke-chi-tiet.md` — Entity changes + API contract + edge case
- `04-api-design.md` — Request/Response schema
- `05-test-plan.md` (thêm mới) — Happy path + edge case + integrity test

---

## Phần IV — Mapping vào `/docs` hiện có

### File hiện có ở `travel-doc/docs/`

| File | Trạng thái | Cần làm |
| --- | --- | --- |
| `index.md` | OK | Cập nhật ngày |
| `roadmap.md` | OK nhưng nói NextJS 14 | Đổi 14 → 15 |
| `01-nen-tang-he-thong/00-ke-hoach-khoi-tao.md` | Có | Cập nhật reference |
| `01-nen-tang-he-thong/00-huong-dan-cap-nhat-doc.md` | OK | Giữ |
| `01-nen-tang-he-thong/01-chien-luoc-tong-the.md` | Stub 1 trang | Expand thành Vision đầy đủ (Tier 0+1) |
| `01-nen-tang-he-thong/01-kien-truc-he-thong.md` | Có content | Cập nhật stack + thêm cross-cutting (Tier 3) |
| `01-nen-tang-he-thong/02-so-do-du-lieu.md` | Stub, **lệch code** | Replace bằng ERD diagram mới (Phần II của doc này) |
| `01-nen-tang-he-thong/03-thiet-ke-du-lieu-chi-tiet.md` | **Lệch code** (Region.code, thiếu Hotel/Booking/SeoPage polymorphism) | **Viết lại từ đầu** theo schema hiện tại |
| `01-nen-tang-he-thong/03-he-thong-thiet-ke.md` | Có | Giữ (design system) |
| `01-nen-tang-he-thong/04-bao-mat-xac-thuc.md` | Có content | Cập nhật dual-cookie (admin/public) |
| `01-nen-tang-he-thong/05-dac-ta-api-v1.md` | Stub | Spec public REST (`/api/v1/tours`, `/api/v1/destinations`) |
| `01-nen-tang-he-thong/07-tich-hop-ben-thu-ba.md` | Có | Bổ sung VNPay/MoMo plan |
| `01-nen-tang-he-thong/11-quy-chuan-lap-trinh.md` | Có | Bổ sung 4 nguyên tắc DB ở Tier 4 |

### File cần TẠO MỚI

```
docs/01-nen-tang-he-thong/
  00-tam-nhin.md                       (Tier 0 — Vision 1 trang)
  00b-mo-hinh-kinh-doanh.md            (Tier 1 — BMC + Revenue model)
  00c-personas-user-journey.md         (Tier 1 — 3 personas + journey)
  02b-thiet-ke-co-ban.md               (Tier 2 — sitemap + module map)
  06-quy-tac-toan-ven-du-lieu.md       (CHECK constraints + audit scripts)
  08-chien-luoc-concurrency.md         (Locking + transaction isolation)
  09-chien-luoc-visibility.md          (isActive + cascade + soft delete policy)
  10-chien-luoc-seo.md                 (SeoPage polymorphic + metadata flow)
  12-quy-trinh-migration.md            (xem Phần V)
```

### Thứ tự ưu tiên viết

1. **Tier 0** — `00-tam-nhin.md` (vision 1 trang, nhanh, làm neo)
2. **Tier 4** — `03-thiet-ke-du-lieu-chi-tiet.md` viết lại (vì code đã chạy, cần ground truth)
3. **Tier 4** — `06-quy-tac-toan-ven-du-lieu.md` (lock 4 nguyên tắc)
4. **Tier 1** — `00b-mo-hinh-kinh-doanh.md`, `00c-personas-user-journey.md` (làm neo business)
5. **Tier 3** — `01-kien-truc-he-thong.md` cập nhật + `02-cross-cutting.md`
6. **Tier 4** — các strategy doc (concurrency, visibility, seo, migration)
7. **Tier 2** — sitemap + module map (cập nhật khi đã có vision rõ)
8. **Tier 5** — per sprint docs (đã có template, chỉ cần fill)

---

## Phần V — Migration Discipline

User explicit muốn **"tránh phải migration lại"** → đây là phần kỷ luật
quan trọng nhất.

### 5 quy tắc vàng

**1. Data design freeze trước khi mở Sprint**

Trước khi viết 1 dòng code trong sprint mới, phải có:

- ERD section cho module sprint đó
- Đã chạy qua checklist 4 nguyên tắc (Tier 4)
- Reviewer khác xác nhận
- Doc spec đã merge vào `travel-doc`

**2. Migration phải đi kèm audit script**

Mọi migration thêm CHECK / UNIQUE / NOT NULL constraint phải kèm
`scripts/audit-<name>.sql` để detect violation trong data hiện có
TRƯỚC khi apply (như cách làm với Issue 3).

**3. Không bao giờ tái sử dụng field cho intent khác**

Ví dụ Region.code đã có nhưng `slug` cũng có → cuối cùng phải drop.

**Quy tắc:** trước khi add field, hỏi "đã có field nào diễn đạt
được intent này chưa?"

**4. Polymorphic phải đi đường Exclusive Arc, không string reference**

SeoPage cũ dùng `slug String` là chốt cứng cho orphan bug. Phải
always FK với onDelete behavior tường minh.

**5. Migration name = `<verb>_<scope>`**

Format: `<timestamp>_<verb>_<scope>` ví dụ:

- `add_destination_is_active`
- `drop_region_code`
- `seo_polymorphic`

Đọc tên migration phải hiểu ngay đang làm gì → giảm sửa nhầm.

### Pre-sprint checklist (template)

```
[ ] Vision quote — sprint này serve WHY nào?
[ ] ERD module này đã update trong doc?
[ ] Mọi entity public-facing có isActive?
[ ] Mọi polymorphic dùng Exclusive Arc + CHECK?
[ ] Mọi counter có constraint chặn overflow?
[ ] Mọi onDelete/onUpdate khai báo tường minh?
[ ] Reverse relation đã thêm vào parent?
[ ] Index cho hot query path?
[ ] Migration name self-documenting?
[ ] Audit script kèm theo nếu add constraint?
[ ] Naming convention nhất quán?
[ ] Service layer split admin vs public?
[ ] i18n message key đã định nghĩa cho domain error?
```

### Anti-patterns đã gặp (đừng lặp lại)

| Anti-pattern | Issue gặp | Cách tránh |
| --- | --- | --- |
| Polymorphic bằng string slug | Issue 6 SeoPage | Exclusive Arc + CHECK |
| Counter không có upper bound CHECK | Issue 4 Departure | CHECK ngay từ migration đầu |
| Visibility flag inconsistent across entities | Issue 5 Destination | Add `isActive` cho mọi entity public-facing từ đầu |
| Reactive `onDelete` (dựa default Prisma) | Issue 2 ActivityLog | Khai báo tường minh trong schema |
| Field redundancy (code + slug) | Region.code drop | Lock convention "1 field = 1 intent" |
| Service không phân biệt public vs admin | Issue 5 cascade hide | Naming convention `*ForAdmin` từ đầu |

---

## Phụ lục A — Danh sách migration hiện tại

```
20260326071259_init_database
20260516093506_add_performance_indexes
20260516120000_add_destination_gallery
20260525215917_drop_region_code              (Region.code redundancy)
20260525223449_add_data_integrity_checks    (Issue 3 — CHECK constraints)
20260525230000_add_destination_is_active    (Issue 5 — visibility)
20260526000000_seo_polymorphic              (Issue 6 — exclusive arc)
```

**Đã chạy (cần verify với user)** vs **chưa apply**: user nói đã chạy
xong tới `20260525223449_add_data_integrity_checks`. Các migration sau
chưa apply, cần Supabase SQL Editor.

---

## Phụ lục B — Schema source-of-truth

File schema chính: `prisma/schema.prisma`.

**Để regenerate type sau khi pull schema:**

```bash
npx prisma generate
```

**Để apply migration mới (production via Supabase Studio):**

1. Mở Supabase SQL Editor
2. Paste nội dung migration `.sql` tương ứng
3. (Recommended) chạy `scripts/audit-*.sql` trước nếu là migration constraint

**Để apply migration local (nếu có dev DB local):**

```bash
npx prisma migrate deploy
```

---

## Phụ lục C — Checklist Pre-Sprint

Sao chép checklist này vào doc spec mỗi sprint trước khi start.

```
SPRINT: <Tên>
START DATE: <YYYY-MM-DD>

VISION ALIGNMENT
[ ] Sprint goal quote về WHY nào trong vision?
[ ] Output có serve user persona nào? (chỉ định)

FUNCTIONAL DESIGN
[ ] User story đã viết theo template
[ ] Acceptance Criteria measurable
[ ] Edge case đã enumerate
[ ] Failure mode đã enumerate

DATA DESIGN
[ ] Entity mới đã được ERD?
[ ] Constraint plan (CHECK/UNIQUE/FK)?
[ ] Cascade behavior matrix?
[ ] Indexes for hot query path?
[ ] Polymorphic dùng Exclusive Arc nếu có?
[ ] Visibility (isActive) đã decide?
[ ] Concurrency strategy nếu cần?

API DESIGN
[ ] Endpoint contract đã viết
[ ] Auth requirement rõ ràng
[ ] Validation schema (Zod) đã spec
[ ] Error response key đã define

UI / UX
[ ] Component reuse opportunity check
[ ] i18n message key list
[ ] Loading / empty / error state

OBSERVABILITY
[ ] ActivityLog event cần log?
[ ] Audit script trước khi migrate?

TEST PLAN
[ ] Happy path scenario
[ ] Edge case scenario
[ ] Concurrency test (nếu liên quan)
[ ] Integrity test (CHECK constraint trigger)

DELIVERY
[ ] Migration name follow `<verb>_<scope>`?
[ ] Code review checklist updated?
[ ] Doc updated TRƯỚC khi merge code?
```

---

*End of blueprint.*
