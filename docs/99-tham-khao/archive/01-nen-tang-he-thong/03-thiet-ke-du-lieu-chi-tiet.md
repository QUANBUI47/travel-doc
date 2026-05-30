# Thiết Kế Cơ Sở Dữ Liệu Chi Tiết — Vivu Travel

> **Phiên bản:** 2.7 · **Ngày:** 27/05/2026 · **Tier:** 4 (Data)
>
> File này đặc tả **chi tiết từng module** trong database: tables,
> fields quan trọng, constraints, indexes, cascade behavior, edge case.
>
> **Source of truth thực tế** vẫn là [`travel-web/prisma/schema.prisma`](../../../travel-web/prisma/schema.prisma).
> File doc này tập trung vào **INTENT + DECISIONS** — không mirror
> schema dòng-by-dòng (để không bị lệch như phiên bản cũ).
>
> **Cách dùng:** đọc theo module bạn đang code. Mỗi module có template
> nhất quán (Tables → Relationships → Constraints → Indexes → Visibility
> → Cascade → Concurrency → Edge cases).

---

## Mục lục

- [Mở đầu — 4 nguyên tắc DB của Vivu](#mở-đầu--4-nguyên-tắc-db-của-vivu)
- [Module 1 — Content CMS](#module-1--content-cms)
- [Module 2 — Booking & Payment](#module-2--booking--payment)
- [Module 3 — Auth & User](#module-3--auth--user)
- [Module 4 — Review](#module-4--review)
- [Module 5 — Platform & Settings](#module-5--platform--settings)
- [Migration kế tiếp — `add_pricing_options_and_allotment`](#migration-kế-tiếp--add_pricing_options_and_allotment)
- [Changelog](#changelog)

> **Scope file:** 100% DB schema (tables, fields, types, constraints, indexes, cascade, FK, migration SQL). Luồng nghiệp vụ + status transitions + implementation plan ở các file Tier khác (xem footer).

---

## Mở đầu — 4 nguyên tắc DB của Vivu

Rút ra từ Issue 2-6 (xem [`00-blueprint-handoff-2026-05-26.md`](../00-blueprint-handoff-2026-05-26.md)
Phần III Tier 4). Mọi quyết định schema phải tuân thủ:

| # | Nguyên tắc | Hệ quả |
| --- | --- | --- |
| **N-01** | Polymorphic luôn dùng **Exclusive Arc + CHECK constraint** | Không bao giờ dùng string slug làm reference đa hình |
| **N-02** | Mọi entity public-facing có **`isActive`** + tách method admin vs public | Không dùng `isPublished` / `isVisible` cho mỗi nơi mỗi khác |
| **N-03** | Counters chia sẻ (booking slot) phải có **CHECK chặn overflow** + locking | DB-level safety net dù app có bug |
| **N-04** | **`onDelete` / `onUpdate` khai báo tường minh**, không dựa default Prisma | Self-documenting, dễ đọc lại 6 tháng sau |

### Index convention — Partial cho cờ `isActive`

> **Quy ước:** mọi index trên cột `is_active` (Boolean) phải là **partial
> index** `WHERE is_active = true`, KHÔNG phải index full column.

**Lý do:**
- Production sẽ có 99%+ row `is_active = true` → index Boolean full column có **selectivity rất thấp** → Postgres Query Planner sẽ bỏ qua index, fallback sang **Seq Scan**.
- Partial index `WHERE is_active = true` chỉ chứa active rows → kích thước nhỏ hơn nhiều, selectivity = 100% cho public query, planner luôn dùng.
- Admin query "thấy inactive" (rất hiếm) → cần index riêng `WHERE is_active = false` hoặc accept seq scan trên subset nhỏ.

```sql
-- ĐÚNG: partial index
CREATE INDEX idx_tours_active_destination
  ON tours(destination_id)
  WHERE is_active = true;

-- SAI: index full Boolean column (low selectivity, ignored by planner)
CREATE INDEX tours_is_active_idx ON tours(is_active);
```

**Naming pattern:** `idx_<table>_active[_<col>]` cho partial, KHÔNG dùng tên default `<table>_is_active_idx` (gây hiểu nhầm là index full column).

> Migration alignment (convert index full → partial): xem **PART 10** của
> migration `add_pricing_options_and_allotment`.

### Type convention — UUID toàn schema

> **Quy ước:** mọi PK + FK ID column dùng PostgreSQL **`UUID`** type, KHÔNG
> dùng `TEXT`. Prisma declaration phải có `@db.Uuid`.

```prisma
// ĐÚNG
id      String   @id @default(uuid()) @db.Uuid
userId  String   @map("user_id") @db.Uuid

// SAI (sinh ra cột TEXT — silent issue, mismatch khi join auth.users)
id      String   @id @default(uuid())
userId  String   @map("user_id")
```

**Lý do:**
- Match type với Supabase `auth.users.id` (UUID native) — join trực tiếp không cần CAST.
- Index UUID B-tree nhanh hơn ~30% so với TEXT.
- Storage 16 bytes vs 36 bytes (UUID native vs TEXT hex format).
- Type safety: PostgreSQL từ chối insert string không phải UUID format.

> Migration alignment (TEXT → UUID cho schema cũ): xem **PART 0** của
> migration `add_pricing_options_and_allotment` ở cuối file.

---

## Module 1 — Content CMS

### 1.1 Tables trong module

```
Region (3 cố định) ─┐
                    │ 1:N
                    ▼
              Destination ─┬──► Hotel ──► Room
              (isActive)   │   (isActive) (isActive)
                           │
                           └──► Tour ──┬──► TourItinerary ──► Hotel
                                       │    (per day)
                                       │
                                       └──► TourDeparture
                                            (lịch khởi hành + slot)
```

### 1.2 Region — Vùng miền

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `slug` | String | `@unique` | URL friendly + ổn định lâu dài |
| `nameVi` | String | NOT NULL | Tên hiển thị tiếng Việt |
| `nameEn` | String? | nullable | i18n EN — Phase 1.5+ |
| `sortOrder` | Int | default 0 | Thứ tự hiển thị (mb=1, mt=2, mn=3) |

**Note:** seed cứng `prisma/seed.ts` — không có `code`, không có `isActive`.

### 1.3 Destination — Điểm đến

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `regionId` | UUID | FK Region | `onDelete: Cascade` |
| `slug` | String | `@unique` | SEO URL ổn định |
| `nameVi` / `nameEn` | String / String? | NOT NULL / nullable | i18n |
| `description` | String? | nullable | HTML/Markdown |
| `imageUrl` | String? | nullable | Cover image (Cloudinary URL) |
| `imageUrls` | String[] | default `[]` | Gallery |
| `latitude` / `longitude` | Float? / Float? | nullable | Cho map embed |
| `isFeatured` | Boolean | default `false` | Hiển thị trang chủ |
| `isActive` | Boolean | default `true` | Cờ visibility (N-02) |
| `sortOrder` | Int | default 0 | — |

**Indexes (partial, xem Index convention):**
- `idx_destinations_active` — partial `WHERE is_active = true` cho hot path lọc public
- `idx_destinations_active_region` — partial `(region_id) WHERE is_active = true` cho "destination thuộc region X đang active"

**Cascade:**
- `Region → Destination`: `Cascade` (region xoá rất hiếm, seed cứng)
- `Destination → Hotel`: `Cascade`
- `Destination → Tour`: implicit `SetNull` (tour có thể đứng riêng)
- `Destination → SeoPage`: `Cascade` (SEO orphan-free)

> Visibility cascade hide (N-02) — xem [`09-chien-luoc-visibility.md`](./09-chien-luoc-visibility.md).

### 1.4 Hotel — Khách sạn partner

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `destinationId` | UUID | FK Destination | `Cascade` |
| `slug` | String | `@unique` | SEO URL |
| `nameVi` / `nameEn` | String / String? | — | i18n |
| `address` | String? | — | Hiển thị + map |
| `starRating` | Int? | nullable, 1-5 | Hiển thị sao |
| `latitude` / `longitude` | Float? | — | Map |
| `amenities` | String[] | default `[]` | Wifi, pool, breakfast,… |
| `imageUrls` | String[] | default `[]` | Gallery |
| `priceFrom` | Decimal(14,0)? | nullable | Giá từ (hiển thị, không phải giá book) |
| `isActive` | Boolean | default `true` | (N-02) |

**Cascade:**
- `Destination → Hotel`: `Cascade`
- `Hotel → Room`: `Cascade`
- `Hotel → SeoPage`: `Cascade`

### 1.5 Room — Loại phòng trong Hotel

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `hotelId` | UUID | FK Hotel | `Cascade` |
| **`roomType`** | Enum `RoomType` | NOT NULL, default `STANDARD` | Standardize cho filter/search |
| `nameVi` / `nameEn` | String / String? | — | Tên hiển thị marketing (vd "Deluxe Twin View Biển") — free-text |
| `maxGuests` | Int | NOT NULL | Sức chứa |
| `pricePerNight` | Decimal(14,0) | NOT NULL | Giá hiển thị/đêm (tham khảo, không phải giá book) |
| `imageUrls` | String[] | default `[]` | — |
| `isActive` | Boolean | default `true` | — |

**Enum `RoomType`:**

```prisma
enum RoomType {
  STANDARD  SUPERIOR  DELUXE
  JUNIOR_SUITE  SUITE  FAMILY_SUITE
  CONNECTING  PRESIDENTIAL  OTHER
}
```

**Indexes:**
- `(hotel_id, room_type)` — query nhanh "Hotel X có loại phòng nào", "Tất cả Deluxe trong khu vực"

> Inventory tracking dùng `HotelAllotment` monthly (Section 1.10). Không có `RoomInventory` per-date.

### 1.6 Tour — Sản phẩm tour package

Đây là **entity trung tâm** của Vivu.

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `destinationId` | UUID? | FK Destination nullable | Cho phép tour không thuộc destination cụ thể (vd tour xuyên Việt) |
| `slug` | String | `@unique` | SEO URL |
| `nameVi` / `nameEn` | String / String? | — | i18n |
| `description` | String? | — | HTML/Markdown |
| `durationDays` | Int | NOT NULL, ≥1 | Số ngày — dùng cho filter/sort |
| **`durationNights`** | Int | NOT NULL, default 0 | Số đêm. Thường = `durationDays - 1`. Edge: tour bay đêm = `durationDays` |
| ~~`durationText`~~ | ~~String?~~ | **DROP** | Thay bằng util `formatDuration(days, nights, locale)` ở app layer |
| `departurePoint` | String? | — | "Hà Nội", "TP.HCM" — cho filter |
| `transport` | String? | — | "Máy bay", "Ô tô" |
| `tourType` | String? | — | "Tour ghép", "Tour riêng" |
| **`priceAdult`** | Decimal(14,0) | NOT NULL | Giá người lớn ≥12 tuổi — pricing chính |
| **`priceChild`** | Decimal(14,0)? | nullable | Giá trẻ em 5-11 (thường 75% adult). Null = "Liên hệ" |
| **`priceInfant`** | Decimal(14,0)? | nullable, default 0 | Giá em bé 0-4. Default 0 = free |
| **`singleSupplement`** | Decimal(14,0)? | nullable | Phụ thu phòng đơn. Null = không cho đi 1 người |
| `priceFrom` | Decimal(14,0)? | nullable | Giá từ (hiển thị listing) — derived field (= priceAdult thường) |
| `oldPrice` | Decimal(14,0)? | nullable | Giá gốc (để show % giảm) |
| `inclusions` | Json? | — | List "bao gồm" — Json để flexible i18n (xem cấu trúc bên dưới) |
| `exclusions` | Json? | — | List "không bao gồm" |
| **`policy`** | Json? | nullable | Chính sách trẻ em + extra bed + cancellation tier (xem schema Zod bên dưới) |
| `tags` | String[] | default `[]` | "Hot", "Giá tốt", "Mới" |
| `imageUrls` | String[] | default `[]` | Gallery |
| `isActive` | Boolean | default `true` | (N-02) |
| **`estimatedCost`** | Decimal(14,0)? | nullable | Chi phí vốn ước tính per khách — chừa cửa L1/L2 |

**CHECK constraint:**
- `tours_duration_valid`: `duration_days >= 1 AND duration_nights >= 0 AND duration_nights <= duration_days`

> Cấu trúc Zod chi tiết của `Tour.policy` + util `formatDuration()` — xem
> [`06-quy-tac-toan-ven-du-lieu.md`](./06-quy-tac-toan-ven-du-lieu.md) (Tier 4
> Integrity rules) và [`11-quy-chuan-lap-trinh.md`](./11-quy-chuan-lap-trinh.md)
> (Tier 5 Code standards).

**Indexes (partial cho cờ active):**
- `(destination_id)` — filter theo điểm đến (cả admin lẫn public dùng)
- `idx_tours_active` — partial `WHERE is_active = true` cho public list
- `idx_tours_active_dest_price` — partial `(destination_id, price_adult) WHERE is_active = true` cho sort+filter (Phase 1.5)

**Cascade:**
- `Tour → TourItinerary`: `Cascade`
- `Tour → TourDeparture`: `Cascade`
- `Tour → TourBooking`: implicit (FK only — không xoá tour khi có booking)
- `Tour → Review`: `Cascade`
- `Tour → SeoPage`: `Cascade`

### 1.7 TourItinerary — Lịch trình từng ngày

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour `Cascade` | — |
| `dayNumber` | Int | NOT NULL | Ngày thứ mấy (1, 2, 3...) |
| `title` | String | NOT NULL | "Ngày 1: Sài Gòn → Đà Lạt" |
| `description` | String? | — | Chi tiết hoạt động ngày đó (HTML/MD) |
| `sortOrder` | Int | default 0 | — |
| **`hotelId`** | UUID? | FK Hotel? nullable | Hotel khách ngủ đêm đó. Null = không ngủ qua đêm (ngày đầu/cuối có thể không) |
| **`roomTypeNote`** | String? | nullable | "Phòng Deluxe Twin", note text vì có thể đổi |
| **`createdAt`** | DateTime | default now | Track audit (backlog #9) |
| **`updatedAt`** | DateTime | `@updatedAt` | — |

**Cascade:**
- `Tour → TourItinerary`: `Cascade`
- `Hotel → TourItinerary.hotel`: cần quyết định — **`SetNull`** (nếu
  hotel bị xoá thì itinerary vẫn giữ, admin update tay sau)

### 1.8 TourDeparture — Lịch khởi hành cụ thể

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour `Cascade` | — |
| `startDate` | Date | NOT NULL | Ngày khởi hành |
| `endDate` | Date? | nullable | Ngày kết thúc (derive từ `tour.durationDays` được) |
| `priceOverride` | Decimal(14,0)? | nullable | Giá cho departure này (vd cao điểm tăng giá) |
| `maxParticipants` | Int? | nullable | Slot tối đa. Null = không giới hạn |
| **`minParticipants`** | Int? | nullable | Số tối thiểu mới khởi hành. Null = không yêu cầu |
| `bookedCount` | Int | default 0 | **Counter critical (N-03)** |
| `status` | Enum `DepartureStatus` | default AVAILABLE | AVAILABLE / FULL / CANCELLED |
| **`cancellationDeadline`** | DateTime? | nullable | Hạn cuối Vivu quyết cancel nếu chưa đủ min |
| **`cancellationReason`** | String? | nullable | Lý do cancel — để email khách + audit |
| `notes` | String? | — | Note admin |
| **`actualCostPerPax`** | Decimal(14,0)? | nullable | Chi phí thực per khách sau tour — admin update sau chuyến |

**CHECK constraints (N-03):**
- `tour_departures_booked_count_non_negative`: `bookedCount >= 0`
- `tour_departures_no_overbook`: `bookedCount <= COALESCE(maxParticipants, bookedCount)`

**Indexes:**
- `(tour_id, start_date)` — query "departure của tour X từ ngày Y"

> Concurrency lock & status transitions — xem [`08-chien-luoc-concurrency.md`](./08-chien-luoc-concurrency.md) + [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md).

### 1.9 TourOption — Upsell options

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour `Cascade` | — |
| `type` | Enum `TourOptionType` | NOT NULL | ROOM_UPGRADE / SINGLE_SUPPLEMENT / EXTRA_BED / SERVICE_ADDON |
| `nameVi` / `nameEn` | String / String? | — | Tên option hiển thị |
| `description` | String? | — | Mô tả chi tiết |
| `priceDelta` | Decimal(14,0) | NOT NULL | Số tiền cộng vào base (có thể âm cho discount) |
| `pricingUnit` | Enum `PricingUnit` | default PER_PAX | PER_PAX / PER_BOOKING / PER_ROOM |
| `isActive` | Boolean | default `true` | Cờ visibility |
| `sortOrder` | Int | default 0 | Thứ tự hiển thị form |
| `createdAt` / `updatedAt` | — | — | — |

**Enum mới:**

```prisma
enum TourOptionType {
  ROOM_UPGRADE        // Nâng cấp loại phòng (Deluxe / Suite / View)
  SINGLE_SUPPLEMENT   // Phụ thu phòng đơn cho khách đi 1 mình
  EXTRA_BED           // Giường phụ cho người thứ 3 trong phòng
  SERVICE_ADDON       // Add-on: bảo hiểm, đưa đón sân bay, room service
}

enum PricingUnit {
  PER_PAX       // Tính theo mỗi khách (vd Deluxe upgrade)
  PER_BOOKING   // Tính 1 lần cho cả booking (vd đưa đón sân bay)
  PER_ROOM      // Tính theo số phòng (vd extra bed)
}
```

**Indexes (partial cho cờ active):**
- `(tour_id)` — query options của tour (cả admin)
- `idx_tour_options_active_tour` — partial `(tour_id) WHERE is_active = true` cho public — chỉ lấy options đang bật

**Cascade:**
- `Tour → TourOption`: `Cascade`
- Không có FK ngược `TourBooking → TourOption` (snapshot trong `priceBreakdown` JSON).

> Cách tính `priceBreakdown` — xem [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md).

### 1.10 HotelAllotment — Tracking phòng đã contract

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `hotelId` | UUID | FK Hotel `Cascade` | — |
| `periodMonth` | **DATE** | NOT NULL, CHECK `EXTRACT(DAY FROM ...) = 1` | Ngày đầu của tháng allotment (vd `2026-06-01`). Native DATE để dùng được `date_trunc`/`+ interval '1 month'` |
| `contractedRooms` | Int | NOT NULL | Số phòng-đêm đã contract trong tháng (vd 100) |
| `usedRooms` | Int | default 0 | Đã dùng cho booking (admin update khi confirm) |
| `releasedRooms` | Int | default 0 | Đã trả lại hotel trước cut-off (no penalty) |
| `noShowFee` | Decimal(14,0)? | nullable | Số tiền phạt no-show nếu có |
| `notes` | String? | — | Ghi chú admin (vd "Hotel đặc biệt giữ 20 phòng Twin") |
| `createdAt` / `updatedAt` | — | — | — |

**CHECK constraints (N-03):**
- `hotel_allotments_no_overuse`: `usedRooms + releasedRooms <= contractedRooms`
- `hotel_allotments_period_first_day`: `EXTRACT(DAY FROM period_month) = 1` — đảm bảo luôn lưu ngày 1 của tháng

**Unique constraint:**
- `@@unique([hotelId, periodMonth])` — 1 hotel/tháng chỉ có 1 record

> Display "tháng 6/2026" ở UI: format bằng util app-layer `formatPeriodMonth(date, locale)` → `"06/2026"` hoặc `"June 2026"`.

**Cascade:**
- `Hotel → HotelAllotment`: `Cascade` (xoá hotel → xoá allotment record)

**Indexes:**
- `(hotel_id, period_month)` — unique đã có index
- `(period_month)` — query "tháng 6 tất cả hotel"

---

## Module 2 — Booking & Payment

### 2.1 Tables trong module

```
Profile ──► Booking ──► TourBooking ──► TourDeparture
              │                          └► Tour
              │
              └► Payment (1:N)

InquiryRequest (Private Tour lead capture) ─[admin chốt deal]─► Booking
```

### 2.2 Booking — Đơn đặt chỗ (parent)

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID | FK Profile **NOT NULL** | Khách phải login mới book được |
| `status` | Enum `BookingStatus` | default PENDING | PENDING / PAID / CONFIRMED / CANCELLED / COMPLETED / REFUNDED |
| `totalAmount` | Decimal(14,0) | NOT NULL | Snapshot tổng tiền tại thời điểm book |
| `guestName` | String | NOT NULL | Tên người đi (có thể khác user) |
| `guestEmail` | String | NOT NULL | — |
| `guestPhone` | String | NOT NULL | — |
| `notes` | String? | — | Ghi chú khách |
| `tourStartDate` | Date? | nullable | Ngày bắt đầu tour — convenience field cho query |
| **`paymentDeadline`** | DateTime? | nullable | `= createdAt + 15min` khi tạo. Cron job auto-cancel sau deadline. |
| `createdAt` / `updatedAt` | — | — | — |

> Status transitions + payment hold 15-min flow — xem [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md).

**Cascade:**
- `Profile → Booking`: **`Restrict`** — không cho hard delete user khi còn booking. Vi phạm tax audit + accounting trail nếu cascade. Phase 1.5 thêm `Profile.deletedAt` + anonymize flow (clear PII, giữ Booking).
- `Booking → TourBooking` / `Payment`: `Cascade` — child entity, đi cùng booking.

**Indexes:**
- `(user_id)` — "đơn của tôi" query
- `(status)` — admin lọc theo status
- `(created_at)` — admin sort theo thời gian
- `(status, payment_deadline)` partial WHERE status=PENDING — cron auto-cancel query

### 2.3 TourBooking — Detail của Booking (luôn 1:1 với Booking)

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `bookingId` | UUID | FK Booking `@unique` `Cascade` | 1:1 với Booking |
| `tourId` | UUID | FK Tour | KHÔNG cascade — không xoá tour khi có booking |
| `departureId` | UUID? | FK TourDeparture nullable | Nullable vì có thể book tour không gắn departure cụ thể (request quote) |
| `participants` | Int | NOT NULL | Tổng số khách = adults + children + infants |
| **`adultsCount`** | Int | default 1 | Số người lớn (≥12 tuổi) |
| **`childrenCount`** | Int | default 0 | Số trẻ em (5-11 tuổi) |
| **`infantsCount`** | Int | default 0 | Số em bé (0-4 tuổi) |
| **`priceBreakdown`** | Json | NOT NULL | Chi tiết tính tiền (xem cấu trúc bên dưới) |
| ~~`unitPrice`~~ | ~~Decimal~~ | | Thay bằng priceBreakdown |

**CHECK constraints:**
- `tour_bookings_participants_positive`: `participants > 0`
- `tour_bookings_participants_consistency`: `participants = adultsCount + childrenCount + infantsCount`
- `tour_bookings_at_least_one_adult`: `adultsCount >= 1`

> Cấu trúc Zod `PriceBreakdownSchema` — xem [`06-quy-tac-toan-ven-du-lieu.md`](./06-quy-tac-toan-ven-du-lieu.md).

### 2.4 Payment — Giao dịch thanh toán

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `bookingId` | UUID | FK Booking `Cascade` | — |
| `amount` | Decimal(14,0) | NOT NULL | — |
| `method` | String | NOT NULL | "VNPAY", "MOMO", "BANK_TRANSFER" (manual) |
| `status` | Enum `PaymentStatus` | default PENDING | PENDING / SUCCESS / FAILED |
| `externalId` | String? | nullable | Transaction ID từ VNPay/MoMo |
| `createdAt` | — | — | — |

> Reconciliation webhook + idempotency — xem [`07-tich-hop-ben-thu-ba.md`](./07-tich-hop-ben-thu-ba.md).

### 2.5 InquiryRequest — Lead capture Private Tour

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID? | FK Tour `SetNull` | Optional — khách click từ trang tour cụ thể |
| `type` | Enum `InquiryType` | NOT NULL | PRIVATE_TOUR / CORPORATE_GROUP / CUSTOM_QUOTE |
| `contactName` | String | NOT NULL | Tên người liên hệ |
| `contactEmail` | String | NOT NULL | — |
| `contactPhone` | String | NOT NULL | — |
| `companyName` | String? | nullable | Tên công ty nếu là corporate |
| `groupSize` | Int | NOT NULL | Số người (vd 40) |
| `preferredDates` | String? | nullable | Ngày mong muốn (free-text "tuần 2 tháng 6") |
| `budget` | Decimal(14,0)? | nullable | Ngân sách dự kiến |
| `message` | String? | nullable | Yêu cầu chi tiết của khách |
| `status` | Enum `InquiryStatus` | default NEW | NEW → CONTACTED → QUOTED → CONFIRMED / REJECTED / EXPIRED |
| `assignedTo` | UUID? | FK Profile `SetNull` | Admin được assign xử lý |
| `adminNotes` | String? | nullable | Ghi chú nội bộ — không hiển thị khách |
| `convertedBookingId` | UUID? | FK Booking `SetNull` | Nếu chốt deal, link sang Booking đã tạo |
| `createdAt` / `updatedAt` | — | — | — |

**Enums:**

```prisma
enum InquiryType {
  PRIVATE_TOUR        // Cá nhân/gia đình muốn tour riêng
  CORPORATE_GROUP     // Công ty đi team-building, gala
  CUSTOM_QUOTE        // Yêu cầu custom khác
}

enum InquiryStatus {
  NEW                 // Vừa submit, chưa ai xử lý
  CONTACTED           // Admin đã liên hệ khách
  QUOTED              // Đã gửi báo giá
  CONFIRMED           // Khách OK, đã ký HĐ → có Booking
  REJECTED            // Không deal
  EXPIRED             // Quá lâu không phản hồi (30 ngày)
}
```

**Indexes:**
- `(status, created_at)` — admin query "inquiry mới nhất" / "đang quote"
- `(type)` — phân loại private vs corporate
- `(assigned_to) WHERE assigned_to IS NOT NULL` — query assignments của admin

> Status transitions + workflow admin xử lý + 30-day expiry rule — xem [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md).

---

## Module 3 — Auth & User

> Tables: Profile (mirror Supabase Auth), ActivityLog.

### 3.1 Profile — Mirror Supabase Auth

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | **UUID** | PK, KHÔNG `@default(uuid())` (id được set khi `ensureUserProfile()` từ Supabase) | Match `auth.users.id` (Supabase native UUID). Prisma: `String @id @db.Uuid` |
| `role` | Enum `Role` | default USER | USER / ADMIN |
| `displayName` | String? | nullable | Lấy từ Google OAuth hoặc user set |
| `avatarUrl` | String? | nullable | Cloudinary hoặc Google avatar |
| `phone` | String? | nullable | Cho booking flow |
| `createdAt` / `updatedAt` | — | — | — |

> **Lưu ý quan trọng:** `Profile.id` là UUID **không có default** — phải
> được set thủ công bằng `auth.users.id` từ Supabase khi user đăng ký.
> Nếu để `@default(uuid())` → mất khớp với Supabase Auth → vỡ login flow.

**Cascade từ Profile sang các bảng có FK userId:**

| FK trỏ Profile | onDelete | Lý do |
| --- | --- | --- |
| `Booking.userId` | **`Restrict`** | Không cho hard delete user nếu còn booking — vi phạm tax audit + revenue accounting. |
| `Review.userId` | **`Restrict`** | Giữ review của user — social proof + SEO content vẫn ở public surface. |
| `ActivityLog.userId` | `SetNull` | Audit log giữ lại nhưng anonymize user (compliance/forensic). |
| `InquiryRequest.assignedTo` | `SetNull` | Admin nghỉ việc → giữ inquiry, gỡ assignee. |

> **Account deletion procedure** (GDPR right-to-erasure): Phase 1 không
> support hard delete user — admin manual anonymize (clear PII fields,
> giữ Profile row). Phase 1.5 thêm `Profile.deletedAt` + cron job auto-
> anonymize sau X ngày inactive. Chi tiết: [`04-bao-mat-xac-thuc.md`](./04-bao-mat-xac-thuc.md).

### 3.2 ActivityLog — Audit trail

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID? | FK Profile **`onDelete: SetNull`** | User xoá vẫn giữ audit (Issue 2 fix) |
| `action` | String | NOT NULL | "CREATE_TOUR", "UPDATE_DESTINATION",... |
| `entity` | String? | nullable | "Tour", "Destination",... |
| `entityId` | String? | nullable | ID của entity affected |
| `details` | Json? | nullable | Payload chi tiết (before/after) |
| `createdAt` | DateTime | default now | — |

---

## Module 4 — Review

> Tables: Review (polymorphic Hotel | Tour).

### 4.1 Review — Đánh giá polymorphic

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID | FK Profile **`Restrict`** | Must-login. Không cascade khi xoá user (giữ review = social proof + SEO). |
| `reviewableType` | Enum `ReviewableType` | NOT NULL | HOTEL / TOUR (N-01) |
| `hotelId` | UUID? | FK Hotel nullable `Cascade` | Polymorphic arc |
| `tourId` | UUID? | FK Tour nullable `Cascade` | Polymorphic arc |
| `rating` | Int | NOT NULL, 1-5 | — |
| `title` | String? | — | — |
| `content` | String? | — | — |
| `isVerified` | Boolean | default `false` | True khi user đã hoàn thành booking |
| `createdAt` / `updatedAt` | — | — | — |

**CHECK constraints (N-01, N-03):**
- `reviews_target_exclusive`:
  ```
  (reviewableType=HOTEL AND hotelId IS NOT NULL AND tourId IS NULL)
   OR
  (reviewableType=TOUR  AND tourId IS NOT NULL AND hotelId IS NULL)
  ```
- `reviews_rating_range`: `rating BETWEEN 1 AND 5`

**Indexes đề xuất Phase 1.5:**
- `(reviewable_type, tour_id)` — query "review của tour X"
- `(reviewable_type, hotel_id)` — query "review của hotel Y"

---

## Module 5 — Platform & Settings

> Tables: SeoPage (polymorphic), HomeSetting, SystemSetting, LegalContent.

### 5.1 SeoPage — Metadata override polymorphic

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `targetType` | Enum `SeoTargetType` | NOT NULL | TOUR / DESTINATION / HOTEL / STATIC |
| `tourId` | UUID? | FK Tour `@unique` `Cascade` | Exclusive arc |
| `destinationId` | UUID? | FK Destination `@unique` `Cascade` | — |
| `hotelId` | UUID? | FK Hotel `@unique` `Cascade` | — |
| `customPath` | String? | `@unique` | "/lien-he", "/ve-chung-toi" (STATIC) |
| `metaTitle` | String | NOT NULL | — |
| `metaDescription` | String? | — | — |
| `ogImage` | String? | — | Open Graph preview |
| `canonicalUrl` | String? | — | — |
| `noIndex` | Boolean | default `false` | True để loại khỏi Google index |

**CHECK constraint (N-01):**
- `seo_pages_exclusive_target`: đúng 1 trong 4 cột (tourId, destinationId,
  hotelId, customPath) non-NULL, và phải khớp với `targetType`.

**Index:** `(target_type)`.

> Flow SEO + lý do exclusive arc — xem [`10-chien-luoc-seo.md`](./10-chien-luoc-seo.md).

### 5.2 HomeSetting — Cấu hình trang chủ

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | String | PK `@default("default")` | Singleton — chỉ 1 row |
| `content` | Json | NOT NULL | Schema cấu trúc Home Builder (modules + order) |
| `updatedAt` | — | — | — |

### 5.3 SystemSetting — Cấu hình key/value

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `group` | String | NOT NULL | Nhóm setting ("seo", "contact", "payment",...) |
| `key` | String | `@unique` | Key duy nhất |
| `value` | Json | NOT NULL | Flexible type |

**Index:** `(group)` — query setting theo group.

### 5.4 LegalContent — Trang pháp lý

| Field quan trọng | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `slug` | String | `@unique` | "terms-of-service", "privacy-policy" |
| `title` | String | NOT NULL | — |
| `content` | Json | NOT NULL | Nội dung (i18n trong cùng JSON) |
| `version` | String | default "1.0" | Version content khi update T&C |

---

## Migration kế tiếp — `add_pricing_options_and_allotment`

Gộp các thay đổi V-05 + V-08 + V-09 + V-10 + V-12 + Type alignment + Cascade fix + Partial index vào 1 migration (10 PART).

> **Lưu ý chạy theo thứ tự:** PART 0 phải chạy trước tất cả part khác vì
> các part sau đều assume cột ID là `UUID` type. Nếu PART 0 fail (vd
> có row với id không phải UUID format) → audit script PART 0 sẽ detect
> trước, không apply migration được.

### SQL preview

```sql
-- ============================================================
-- PART 0 — Type alignment: TEXT → UUID cho toàn schema
-- ============================================================
-- Lý do: Prisma schema init lỡ không khai báo @db.Uuid → tất cả id +
-- FK column hiện là TEXT. Align sang UUID native để (1) type safety
-- với Supabase auth.users.id (UUID), (2) index B-tree nhanh hơn ~30%,
-- (3) storage 16 bytes vs 36 bytes.
--
-- LƯU Ý: Phase 1 chưa launch production → migration này không downtime
-- đáng kể. Nếu có data thật (Phase 1.5+) phải plan blue-green hoặc
-- dual-column rollover.

-- 0a. Enable extension nếu chưa có (cần cho uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0b. ALTER tất cả id column từ TEXT → UUID
-- Pattern: USING id::uuid (require data hiện tại đã ở dạng UUID hex string)

ALTER TABLE profiles          ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE regions           ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE destinations      ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE hotels            ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE rooms             ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE tours             ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE tour_itineraries  ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE tour_departures   ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bookings          ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE tour_bookings     ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE payments          ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE reviews           ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE seo_pages         ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE system_settings   ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE legal_contents    ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE activity_logs     ALTER COLUMN id TYPE UUID USING id::uuid;
-- home_settings.id là "default" (singleton) → giữ TEXT, không align.

-- 0c. ALTER tất cả FK column trỏ tới id (TEXT → UUID)
ALTER TABLE destinations      ALTER COLUMN region_id      TYPE UUID USING region_id::uuid;
ALTER TABLE hotels            ALTER COLUMN destination_id TYPE UUID USING destination_id::uuid;
ALTER TABLE rooms             ALTER COLUMN hotel_id       TYPE UUID USING hotel_id::uuid;
ALTER TABLE tours             ALTER COLUMN destination_id TYPE UUID USING destination_id::uuid;
ALTER TABLE tour_itineraries  ALTER COLUMN tour_id        TYPE UUID USING tour_id::uuid;
ALTER TABLE tour_departures   ALTER COLUMN tour_id        TYPE UUID USING tour_id::uuid;
ALTER TABLE bookings          ALTER COLUMN user_id        TYPE UUID USING user_id::uuid;
ALTER TABLE tour_bookings     ALTER COLUMN booking_id     TYPE UUID USING booking_id::uuid;
ALTER TABLE tour_bookings     ALTER COLUMN tour_id        TYPE UUID USING tour_id::uuid;
ALTER TABLE tour_bookings     ALTER COLUMN departure_id   TYPE UUID USING departure_id::uuid;
ALTER TABLE payments          ALTER COLUMN booking_id     TYPE UUID USING booking_id::uuid;
ALTER TABLE reviews           ALTER COLUMN user_id        TYPE UUID USING user_id::uuid;
ALTER TABLE reviews           ALTER COLUMN hotel_id       TYPE UUID USING hotel_id::uuid;
ALTER TABLE reviews           ALTER COLUMN tour_id        TYPE UUID USING tour_id::uuid;
ALTER TABLE seo_pages         ALTER COLUMN tour_id        TYPE UUID USING tour_id::uuid;
ALTER TABLE seo_pages         ALTER COLUMN destination_id TYPE UUID USING destination_id::uuid;
ALTER TABLE seo_pages         ALTER COLUMN hotel_id       TYPE UUID USING hotel_id::uuid;
ALTER TABLE activity_logs     ALTER COLUMN user_id        TYPE UUID USING user_id::uuid;

-- 0d. Set default uuid_generate_v4() cho tất cả id (trừ profiles + home_settings)
-- Trước đây Prisma sinh client-side default, giờ chuyển sang DB-side để consistent.
ALTER TABLE regions           ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE destinations      ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE hotels            ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE rooms             ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE tours             ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE tour_itineraries  ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE tour_departures   ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE bookings          ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE tour_bookings     ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE payments          ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE reviews           ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE seo_pages         ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE system_settings   ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE legal_contents    ALTER COLUMN id SET DEFAULT uuid_generate_v4();
ALTER TABLE activity_logs     ALTER COLUMN id SET DEFAULT uuid_generate_v4();
-- profiles.id KHÔNG có default — phải set bằng auth.users.id từ Supabase

-- ============================================================
-- PART 1 — V-05: TourItinerary thêm hotelId + roomTypeNote + timestamps
-- ============================================================
ALTER TABLE tour_itineraries
  ADD COLUMN hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  ADD COLUMN room_type_note VARCHAR(255),
  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX idx_tour_itineraries_hotel_id ON tour_itineraries(hotel_id);

-- ============================================================
-- PART 2 — V-08: Cost tracking chừa cửa
-- ============================================================
ALTER TABLE tours
  ADD COLUMN estimated_cost DECIMAL(14, 0);

ALTER TABLE tour_departures
  ADD COLUMN actual_cost_per_pax DECIMAL(14, 0);

-- ============================================================
-- PART 3 — V-09: Pricing per-pax Pattern C
-- ============================================================
-- 3a. Tour pricing fields
ALTER TABLE tours
  ADD COLUMN price_adult        DECIMAL(14, 0) NOT NULL DEFAULT 0,
  ADD COLUMN price_child        DECIMAL(14, 0),
  ADD COLUMN price_infant       DECIMAL(14, 0) DEFAULT 0,
  ADD COLUMN single_supplement  DECIMAL(14, 0);

-- Migrate priceFrom → priceAdult (cho tour cũ)
UPDATE tours SET price_adult = COALESCE(price_from, 0) WHERE price_adult = 0;

-- Bỏ DEFAULT 0 sau migrate (force NOT NULL không default cho row mới)
ALTER TABLE tours ALTER COLUMN price_adult DROP DEFAULT;

-- 3b. TourBooking — thêm fields mới + DROP unitPrice
ALTER TABLE tour_bookings
  ADD COLUMN adults_count    INT NOT NULL DEFAULT 1,
  ADD COLUMN children_count  INT NOT NULL DEFAULT 0,
  ADD COLUMN infants_count   INT NOT NULL DEFAULT 0,
  ADD COLUMN price_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Migrate unitPrice → priceBreakdown tối thiểu cho row cũ
UPDATE tour_bookings 
SET price_breakdown = jsonb_build_object(
  'adultPrice', unit_price,
  'adultCount', participants,
  'baseSubtotal', unit_price * participants,
  'options', '[]'::jsonb,
  'optionsTotal', 0,
  'discount', 0,
  'grandTotal', unit_price * participants
)
WHERE price_breakdown = '{}'::jsonb;

ALTER TABLE tour_bookings DROP COLUMN unit_price;
ALTER TABLE tour_bookings ALTER COLUMN price_breakdown DROP DEFAULT;

-- 3c. CHECK constraints V-09
ALTER TABLE tour_bookings
  ADD CONSTRAINT tour_bookings_participants_consistency
    CHECK (participants = adults_count + children_count + infants_count),
  ADD CONSTRAINT tour_bookings_at_least_one_adult
    CHECK (adults_count >= 1);

-- 3d. tour_options table (V-09)
CREATE TYPE tour_option_type AS ENUM ('ROOM_UPGRADE', 'SINGLE_SUPPLEMENT', 'EXTRA_BED', 'SERVICE_ADDON');
CREATE TYPE pricing_unit AS ENUM ('PER_PAX', 'PER_BOOKING', 'PER_ROOM');

CREATE TABLE tour_options (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id      UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  type         tour_option_type NOT NULL,
  name_vi      VARCHAR(255) NOT NULL,
  name_en      VARCHAR(255),
  description  TEXT,
  price_delta  DECIMAL(14, 0) NOT NULL,
  pricing_unit pricing_unit NOT NULL DEFAULT 'PER_PAX',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tour_options_tour_id ON tour_options(tour_id);
CREATE INDEX idx_tour_options_tour_active ON tour_options(tour_id, is_active);

-- ============================================================
-- PART 4 — V-10: Operational Risk Management
-- ============================================================
-- 4a. TourDeparture risk fields
ALTER TABLE tour_departures
  ADD COLUMN min_participants     INT,
  ADD COLUMN cancellation_deadline TIMESTAMPTZ,
  ADD COLUMN cancellation_reason   TEXT;

-- 4b. Booking payment hold
ALTER TABLE bookings
  ADD COLUMN payment_deadline TIMESTAMPTZ;

CREATE INDEX idx_bookings_status_deadline ON bookings(status, payment_deadline)
  WHERE status = 'PENDING';

-- 4c. (đã DROP — V-05 không cần CHECK guard nữa, xem Part 8)

-- 4c. hotel_allotments table (V-10)
CREATE TABLE hotel_allotments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id          UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  period_month      DATE NOT NULL,        -- ngày 1 của tháng allotment, vd '2026-06-01'
  contracted_rooms  INT NOT NULL,
  used_rooms        INT NOT NULL DEFAULT 0,
  released_rooms    INT NOT NULL DEFAULT 0,
  no_show_fee       DECIMAL(14, 0),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT hotel_allotments_no_overuse
    CHECK (used_rooms + released_rooms <= contracted_rooms),
  CONSTRAINT hotel_allotments_period_first_day
    CHECK (EXTRACT(DAY FROM period_month) = 1),
  CONSTRAINT hotel_allotments_unique_hotel_month
    UNIQUE (hotel_id, period_month)
);

CREATE INDEX idx_hotel_allotments_period ON hotel_allotments(period_month);

-- ============================================================
-- PART 5 — Standardize Room types (enum cho filter/search)
-- ============================================================
CREATE TYPE room_type AS ENUM (
  'STANDARD', 'SUPERIOR', 'DELUXE',
  'JUNIOR_SUITE', 'SUITE', 'FAMILY_SUITE',
  'CONNECTING', 'PRESIDENTIAL', 'OTHER'
);

ALTER TABLE rooms
  ADD COLUMN room_type room_type NOT NULL DEFAULT 'STANDARD';

CREATE INDEX idx_rooms_hotel_type ON rooms(hotel_id, room_type);

-- ============================================================
-- PART 6 — Restructure tour duration (drop free-text)
-- ============================================================
ALTER TABLE tours
  ADD COLUMN duration_nights INT NOT NULL DEFAULT 0;

-- Migrate: default nights = days - 1 cho tour cũ có lưu trú
UPDATE tours
SET duration_nights = GREATEST(duration_days - 1, 0)
WHERE duration_nights = 0;

-- Drop free-text durationText
ALTER TABLE tours DROP COLUMN duration_text;

-- CHECK: nights <= days
ALTER TABLE tours
  ADD CONSTRAINT tours_duration_valid
    CHECK (duration_days >= 1 AND duration_nights >= 0 AND duration_nights <= duration_days);

-- ============================================================
-- PART 7 — V-12: InquiryRequest cho Private Tour / Corporate
-- ============================================================
CREATE TYPE inquiry_type AS ENUM (
  'PRIVATE_TOUR', 'CORPORATE_GROUP', 'CUSTOM_QUOTE'
);
CREATE TYPE inquiry_status AS ENUM (
  'NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'REJECTED', 'EXPIRED'
);

CREATE TABLE inquiry_requests (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id               UUID REFERENCES tours(id) ON DELETE SET NULL,
  type                  inquiry_type NOT NULL,
  contact_name          VARCHAR(255) NOT NULL,
  contact_email         VARCHAR(255) NOT NULL,
  contact_phone         VARCHAR(50) NOT NULL,
  company_name          VARCHAR(255),
  group_size            INT NOT NULL CHECK (group_size > 0),
  preferred_dates       VARCHAR(255),
  budget                DECIMAL(14, 0),
  message               TEXT,
  status                inquiry_status NOT NULL DEFAULT 'NEW',
  assigned_to           UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes           TEXT,
  converted_booking_id  UUID REFERENCES bookings(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiry_status_created ON inquiry_requests(status, created_at);
CREATE INDEX idx_inquiry_type ON inquiry_requests(type);
CREATE INDEX idx_inquiry_assigned ON inquiry_requests(assigned_to)
  WHERE assigned_to IS NOT NULL;

-- ============================================================
-- PART 8 — V-05 YAGNI cleanup: DROP HotelBooking + bookingType
-- ============================================================
-- 8a. Drop HotelBooking table (Phase 1 chưa wire — rỗng data)
DROP TABLE IF EXISTS hotel_bookings;

-- 8b. Drop bookingType column từ bookings
ALTER TABLE bookings DROP COLUMN IF EXISTS booking_type;

-- 8c. Drop hotel-specific fields ở Booking
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS check_in,
  DROP COLUMN IF EXISTS check_out;

-- 8d. Drop CHECK guard (đã không cần — không có discriminator)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_phase1_tour_only;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_type_consistency;

-- 8e. Drop BookingType enum (không còn ai dùng)
DROP TYPE IF EXISTS "BookingType";

-- ============================================================
-- PART 9 — Cascade fix: Profile→Booking & Profile→Review (Cascade → Restrict)
-- ============================================================
-- Lý do: Cascade khi xoá user = mất toàn bộ booking history + review.
-- Vi phạm tax audit + accounting trail. Chuyển sang Restrict — không
-- cho hard delete user nếu còn booking/review. Account deletion phải
-- qua procedure anonymize (clear PII, giữ row), không hard delete.

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;
ALTER TABLE reviews
  ADD CONSTRAINT reviews_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- PART 10 — Convert is_active indexes sang partial
-- ============================================================
-- Lý do: 99%+ row sẽ active → index full Boolean low selectivity, planner
-- bỏ qua. Partial index `WHERE is_active = true` selectivity 100% với
-- query public, size nhỏ hơn nhiều.

-- 10a. Drop indexes full Boolean cũ
DROP INDEX IF EXISTS destinations_is_active_idx;
DROP INDEX IF EXISTS destinations_region_id_is_active_idx;
DROP INDEX IF EXISTS tours_is_active_idx;
-- (hotels & rooms is_active chưa có index → skip)

-- 10b. Create partial indexes
CREATE INDEX idx_destinations_active
  ON destinations(id)
  WHERE is_active = true;

CREATE INDEX idx_destinations_active_region
  ON destinations(region_id)
  WHERE is_active = true;

CREATE INDEX idx_tours_active
  ON tours(id)
  WHERE is_active = true;

CREATE INDEX idx_tours_active_destination
  ON tours(destination_id)
  WHERE is_active = true;

CREATE INDEX idx_hotels_active
  ON hotels(id)
  WHERE is_active = true;

CREATE INDEX idx_hotels_active_destination
  ON hotels(destination_id)
  WHERE is_active = true;

CREATE INDEX idx_rooms_active_hotel
  ON rooms(hotel_id)
  WHERE is_active = true;

CREATE INDEX idx_tour_options_active_tour
  ON tour_options(tour_id)
  WHERE is_active = true;
```

### Pre-flight audit script

```sql
-- ============================================================
-- AUDIT PART 0 — Type alignment readiness (MUST PASS trước khi apply)
-- ============================================================
-- Tất cả id + FK column phải chứa string đúng UUID format trước khi
-- ALTER TYPE. PostgreSQL sẽ throw "invalid input syntax for type uuid"
-- nếu có 1 row sai format.

-- Regex chuẩn UUID v4: 8-4-4-4-12 hex chars
-- ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$

SELECT 'profiles_invalid_uuid' AS issue, COUNT(*) AS count
FROM profiles
WHERE id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
UNION ALL
SELECT 'bookings_invalid_user_id', COUNT(*)
FROM bookings
WHERE user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
UNION ALL
SELECT 'activity_logs_invalid_user_id', COUNT(*)
FROM activity_logs
WHERE user_id IS NOT NULL
  AND user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
UNION ALL
SELECT 'reviews_invalid_user_id', COUNT(*)
FROM reviews
WHERE user_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
-- Expected toàn bộ: 0. Nếu khác 0 → ABORT migration + investigate row đó.

-- ============================================================
-- AUDIT PART 3 — Pricing migration readiness
-- ============================================================
-- Đảm bảo migrate priceFrom → priceAdult không mất data
SELECT 
  'tours_without_price_from' AS issue, 
  COUNT(*) AS count
FROM tours 
WHERE price_from IS NULL;
-- Phase 1 chưa có tour production → count = 0

-- Đảm bảo tour_bookings cũ migrate được sang priceBreakdown
SELECT 
  'tour_bookings_with_zero_unit_price' AS issue,
  COUNT(*) AS count
FROM tour_bookings 
WHERE unit_price = 0 OR unit_price IS NULL;
-- Expected: 0

-- ============================================================
-- AUDIT PART 9 — Profile→Booking/Review Cascade fix readiness
-- ============================================================
-- Verify constraint hiện tại đang là Cascade (sẽ DROP và tái tạo Restrict)
SELECT 
  tc.constraint_name,
  tc.table_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_name IN (
  'bookings_user_id_fkey',
  'reviews_user_id_fkey'
);
-- Expected (trước PART 9): delete_rule = 'CASCADE'
-- Expected (sau PART 9):  delete_rule = 'RESTRICT'

-- ============================================================
-- AUDIT PART 10 — Partial index readiness (no pre-check needed)
-- ============================================================
-- Verify indexes cũ tồn tại trước khi DROP (idempotent, không error nếu thiếu)
SELECT indexname FROM pg_indexes
WHERE indexname IN (
  'destinations_is_active_idx',
  'destinations_region_id_is_active_idx',
  'tours_is_active_idx'
);
```

### Prisma schema delta (rút gọn)

> **PART 0 alignment:** mọi `String @id @default(uuid())` thêm `@db.Uuid`,
> mọi FK `String` ID thêm `@db.Uuid`. Profile.id KHÔNG có default. Mẫu
> dưới đây áp dụng pattern này cho mọi model — không liệt kê lại toàn bộ
> schema (chỉ liệt kê model mới / model có thay đổi field).

```prisma
// Profile — id không default, set từ Supabase auth.users.id
model Profile {
  id           String        @id @db.Uuid
  role         Role          @default(USER)
  // ... rest unchanged
  // PART 9: relation Booking + Review chuyển sang Restrict (xem từng model)
}

// Review — PART 9: Cascade → Restrict cho relation user
model Review {
  id              String          @id @default(uuid()) @db.Uuid
  userId          String          @map("user_id") @db.Uuid
  // ... existing fields
  profile         Profile         @relation(fields: [userId], references: [id], onDelete: Restrict)
}

model Tour {
  id                String        @id @default(uuid()) @db.Uuid
  destinationId     String?       @map("destination_id") @db.Uuid
  // ... existing fields
  priceAdult        Decimal       @map("price_adult") @db.Decimal(14, 0)
  priceChild        Decimal?      @map("price_child") @db.Decimal(14, 0)
  priceInfant       Decimal?      @map("price_infant") @db.Decimal(14, 0)
  singleSupplement  Decimal?      @map("single_supplement") @db.Decimal(14, 0)
  estimatedCost     Decimal?      @map("estimated_cost") @db.Decimal(14, 0)
  durationDays      Int           @map("duration_days")
  durationNights    Int           @default(0) @map("duration_nights")
  // DROP: durationText
  options           TourOption[]
}

model TourItinerary {
  id            String    @id @default(uuid()) @db.Uuid
  tourId        String    @map("tour_id") @db.Uuid
  hotelId       String?   @map("hotel_id") @db.Uuid
  roomTypeNote  String?   @map("room_type_note")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  hotel         Hotel?    @relation(fields: [hotelId], references: [id], onDelete: SetNull)
  @@index([hotelId])
}

model TourDeparture {
  id                   String    @id @default(uuid()) @db.Uuid
  tourId               String    @map("tour_id") @db.Uuid
  // ... existing fields
  minParticipants      Int?      @map("min_participants")
  cancellationDeadline DateTime? @map("cancellation_deadline")
  cancellationReason   String?   @map("cancellation_reason")
  actualCostPerPax     Decimal?  @map("actual_cost_per_pax") @db.Decimal(14, 0)
}

model Booking {
  id               String     @id @default(uuid()) @db.Uuid
  userId           String     @map("user_id") @db.Uuid
  // ... existing fields (DROP: bookingType, checkIn, checkOut)
  paymentDeadline  DateTime?  @map("payment_deadline")
  // PART 9: Cascade → Restrict cho relation user → giữ booking khi user delete
  profile          Profile    @relation(fields: [userId], references: [id], onDelete: Restrict)
  @@index([status, paymentDeadline])
}

// DROP model HotelBooking — V-05 YAGNI
// DROP enum BookingType — V-05 YAGNI

model TourBooking {
  id              String  @id @default(uuid()) @db.Uuid
  bookingId       String  @unique @map("booking_id") @db.Uuid
  tourId          String  @map("tour_id") @db.Uuid
  departureId     String? @map("departure_id") @db.Uuid
  // ... existing fields (DROP unitPrice)
  adultsCount     Int     @default(1) @map("adults_count")
  childrenCount   Int     @default(0) @map("children_count")
  infantsCount    Int     @default(0) @map("infants_count")
  priceBreakdown  Json    @map("price_breakdown")
}

model TourOption {
  id           String          @id @default(uuid()) @db.Uuid
  tourId       String          @map("tour_id") @db.Uuid
  type         TourOptionType
  nameVi       String          @map("name_vi")
  nameEn       String?         @map("name_en")
  description  String?
  priceDelta   Decimal         @map("price_delta") @db.Decimal(14, 0)
  pricingUnit  PricingUnit     @default(PER_PAX) @map("pricing_unit")
  isActive     Boolean         @default(true) @map("is_active")
  sortOrder    Int             @default(0) @map("sort_order")
  createdAt    DateTime        @default(now()) @map("created_at")
  updatedAt    DateTime        @updatedAt @map("updated_at")
  tour         Tour            @relation(fields: [tourId], references: [id], onDelete: Cascade)

  @@index([tourId])
  @@index([tourId, isActive])
  @@map("tour_options")
}

model HotelAllotment {
  id                String   @id @default(uuid()) @db.Uuid
  hotelId           String   @map("hotel_id") @db.Uuid
  periodMonth       DateTime @map("period_month") @db.Date  // luôn ngày 1 (CHECK ở DB)
  contractedRooms   Int      @map("contracted_rooms")
  usedRooms         Int      @default(0) @map("used_rooms")
  releasedRooms     Int      @default(0) @map("released_rooms")
  noShowFee         Decimal? @map("no_show_fee") @db.Decimal(14, 0)
  notes             String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  hotel             Hotel    @relation(fields: [hotelId], references: [id], onDelete: Cascade)

  @@unique([hotelId, periodMonth])
  @@index([periodMonth])
  @@map("hotel_allotments")
}

model Hotel {
  // ... existing fields (id String @id @default(uuid()) @db.Uuid)
  tourItineraries  TourItinerary[]
  allotments       HotelAllotment[]
}

model Room {
  // ... existing (id + hotelId thêm @db.Uuid)
  roomType  RoomType  @default(STANDARD) @map("room_type")
  @@index([hotelId, roomType])
}

model InquiryRequest {
  id                    String         @id @default(uuid()) @db.Uuid
  tourId                String?        @map("tour_id") @db.Uuid
  type                  InquiryType
  contactName           String         @map("contact_name")
  contactEmail          String         @map("contact_email")
  contactPhone          String         @map("contact_phone")
  companyName           String?        @map("company_name")
  groupSize             Int            @map("group_size")
  preferredDates        String?        @map("preferred_dates")
  budget                Decimal?       @db.Decimal(14, 0)
  message               String?
  status                InquiryStatus  @default(NEW)
  assignedTo            String?        @map("assigned_to") @db.Uuid
  adminNotes            String?        @map("admin_notes")
  convertedBookingId    String?        @map("converted_booking_id") @db.Uuid
  createdAt             DateTime       @default(now()) @map("created_at")
  updatedAt             DateTime       @updatedAt @map("updated_at")
  tour                  Tour?          @relation(fields: [tourId], references: [id], onDelete: SetNull)
  assignedAdmin         Profile?       @relation("InquiryAssignee", fields: [assignedTo], references: [id], onDelete: SetNull)
  convertedBooking      Booking?       @relation(fields: [convertedBookingId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@index([type])
  @@map("inquiry_requests")
}

enum TourOptionType { ROOM_UPGRADE  SINGLE_SUPPLEMENT  EXTRA_BED  SERVICE_ADDON }
enum PricingUnit     { PER_PAX  PER_BOOKING  PER_ROOM }
enum RoomType {
  STANDARD  SUPERIOR  DELUXE
  JUNIOR_SUITE  SUITE  FAMILY_SUITE
  CONNECTING  PRESIDENTIAL  OTHER
}
enum InquiryType    { PRIVATE_TOUR  CORPORATE_GROUP  CUSTOM_QUOTE }
enum InquiryStatus  { NEW  CONTACTED  QUOTED  CONFIRMED  REJECTED  EXPIRED }
```

### Áp dụng migration

1. Chạy audit script trên Supabase SQL Editor.
2. Apply migration SQL.
3. `npx prisma generate`.

> Quy trình migration chi tiết — xem [`12-quy-trinh-migration.md`](./12-quy-trinh-migration.md).
> Implementation plan (services, crons, UI) — xem [`01-chien-luoc-tong-the.md`](./01-chien-luoc-tong-the.md).

---

## Changelog

| Ngày | Version | Thay đổi |
| --- | --- | --- |
| (cũ) | 1.0 | Stub lệch code: Region.code (đã drop), thiếu Hotel/Room/Booking polymorphism, thiếu Itinerary/Departure/Review/SeoPage |
| 26/05/2026 | 2.0 | **Viết lại từ đầu** theo schema thật + 4 nguyên tắc N-01→N-04. Đặc tả 18 tables, 3 polymorphic exclusive arc, cascade matrix. Spec migration kế tiếp `add_tour_combo_and_cost_tracking` (5 gap fix). Trace V-01 → V-08. |
| 26/05/2026 | 2.1 | **Pivot Plan A → Plan A+** sau user research industry. Thêm section **Operating Model** chi tiết flow 4 bước Tour↔Hotel↔Booking + 2 edge cases (timeout / cancel departure). Thêm Tour pricing per-pax (V-09) + Tour.policy Zod schema (V-10). Thêm `TourDeparture.minParticipants/cancellationDeadline/cancellationReason` (V-10). Thêm `Booking.paymentDeadline` + cron 15-min hold (V-10). Refactor TourBooking: DROP `unitPrice` → `adultsCount/childrenCount/infantsCount/priceBreakdown` (V-09) + 3 CHECK. 2 tables mới: **TourOption** (V-09) + **HotelAllotment** (V-10). Migration đổi tên thành **`add_pricing_options_and_allotment`** với SQL đầy đủ + audit + Prisma delta. **Schema hygiene:** Standardize `Room.roomType` (enum 9 giá trị) + restructure `Tour.duration` thành `durationDays + durationNights` (DROP `durationText` free-text) + CHECK constraint duration valid. Tổng schema: 20 tables, 4 CHECK constraints. |
| 26/05/2026 | 2.2 | **Thêm Module 2.6 InquiryRequest (V-12)** sau khi user raise case "công ty 40 người không ghép đoàn được". Phân biệt rõ Series Tour (book online qua TourDeparture) vs Private Tour / Corporate Group (lead capture form → admin manual workflow). Thêm 2 phần vào **Operating Model**: 2 loại tour table + Flow Private Tour 3 bước. Thêm Migration Part 7 SQL + Prisma delta. Thêm InquiryService + 2 cron jobs + Admin UI `/portal/inquiries` + Public form "Đặt tour cho nhóm riêng". Tổng schema: **21 tables**, 4 CHECK constraints. |
| 26/05/2026 | 2.3 | **YAGNI pivot (V-05 vĩnh viễn)** sau khi user push back về `bookingType`. Vivu không trở thành OTA hotel kể cả Phase 2. **DROP `HotelBooking` model + `bookingType` enum + `Booking.checkIn/checkOut` + CHECK `bookings_phase1_tour_only`**. Section 2.1 simplify flow diagram. Section 2.2 Booking rewrite — bỏ discriminator logic, đổi sang "4 lý do giữ Booking parent + TourBooking 1:1". Section 2.3 mark DROP với rationale. Migration Part 8 cleanup SQL. Schema còn **20 tables**. Booking không còn polymorphic. |
| 26/05/2026 | 2.4 | **Refactor focus DB-only** sau user feedback "file lan man". Tách Operating Model + Flow Tour↔Hotel↔Booking 4 bước + Flow Private Tour + Edge cases + Bảng ranh giới + Use case ví dụ + Zod schemas TypeScript + Status transitions chi tiết + Implementation plan (services, crons, UIs) **ra file mới** [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md) (DRAFT Tier 2 Functional). File `03` giảm từ ~1300 → ~700 dòng, chỉ chứa pure DB schema. Thêm cross-link tới `01b-luong-nghiep-vu.md` + `06-quy-tac-toan-ven-du-lieu.md` + `01-chien-luoc-tong-the.md`. |
| 26/05/2026 | 2.5 | **Strip nốt rationale & V-XX trace** sau user feedback "sao lại có Quyết định lock (V-05) gì gì nhỉ". Xoá toàn bộ block `**Quyết định lock:**`, `**Lý do …:**`, `**Edge case nghiệp vụ:**`, `**Status transitions:**` (giữ link sang `01b`), `**Bounded context + Trace V-XX:**` ở từng module. Xoá phần dẫn nhập `HotelBooking DROP V-05 YAGNI` (chỉ giữ nguyên trong changelog cho history). Rút gọn enum `RoomType` (xoá comment dài + bảng "Cách dùng roomType vs nameVi"). Rút gọn ghi chú migration. File còn ~970 dòng — chỉ còn: tables / fields / types / constraints / indexes / cascade / migration SQL. |
| 27/05/2026 | 2.6 | **Fix Type Alignment TEXT → UUID** sau user phát hiện lệch type trong doc (Profile.id `String` nhưng FK userId `UUID`). Reality check schema thật: toàn bộ ID đang là `TEXT` vì Prisma `String @id` không có `@db.Uuid` (Prisma không sinh UUID column trừ khi tường minh). Quyết định Option A — align toàn schema sang `UUID` native: (1) Thêm section "Type convention — UUID toàn schema" ở phần Mở đầu (rule + lý do + ví dụ đúng/sai). (2) Update Section 3.1 Profile: `id` ghi rõ `String @id @db.Uuid` + lưu ý không có `@default(uuid())`. (3) Thêm **PART 0 — Type alignment** vào migration `add_pricing_options_and_allotment`: ALTER COLUMN TYPE UUID cho 16 bảng id + ~18 FK column + SET DEFAULT `uuid_generate_v4()` ở DB-side. (4) Audit script PART 0 regex check tất cả id/FK đã ở UUID format trước khi ALTER. (5) Prisma schema delta thêm `@db.Uuid` cho mọi `String @id @default(uuid())` + mọi FK String ID column. |
| 27/05/2026 | 2.7 | **3 fix sau AI review** — (1) **HotelAllotment.monthYear `String "YYYY-MM"` → `periodMonth DATE`** + CHECK `EXTRACT(DAY) = 1`: tiết kiệm storage, dùng được date functions, B-tree DATE index tối ưu hơn. (2) **Index convention — Partial cho cờ `isActive`**: thêm section ở Mở đầu, đổi tất cả `(is_active)` index trong các section (Destination/Tour/TourOption) thành partial `WHERE is_active = true`. PART 10 mới chuyển index cũ sang partial. Naming pattern `idx_<table>_active[_<col>]`. (3) **Profile → Booking/Review Cascade → Restrict**: chống mất booking + revenue audit khi xoá user. Phase 1.5 thêm `Profile.deletedAt` + anonymize flow. Section 3.1 Profile thêm bảng cascade từ Profile sang 4 child + note "Account deletion procedure" link `04-bao-mat-xac-thuc.md`. PART 9 mới ALTER FK constraint Cascade → Restrict. Audit script PART 9 verify trước/sau. Migration giờ có 10 PART. |

---

*File này thuộc **Tier 4 (Data) — Detail**. Tham khảo:*

- *Overview ERD: [`02-so-do-du-lieu.md`](./02-so-do-du-lieu.md)*
- *Luồng nghiệp vụ (Operating Model, flow, edge cases): [`01b-luong-nghiep-vu.md`](./01b-luong-nghiep-vu.md)*
- *Integrity rules (Zod schemas, CHECK detail): [`06-quy-tac-toan-ven-du-lieu.md`](./06-quy-tac-toan-ven-du-lieu.md)*
- *Concurrency: [`08-chien-luoc-concurrency.md`](./08-chien-luoc-concurrency.md)*
- *Visibility: [`09-chien-luoc-visibility.md`](./09-chien-luoc-visibility.md)*
- *SEO: [`10-chien-luoc-seo.md`](./10-chien-luoc-seo.md)*
- *Code standards (util functions): [`11-quy-chuan-lap-trinh.md`](./11-quy-chuan-lap-trinh.md)*
- *Migration discipline: [`12-quy-trinh-migration.md`](./12-quy-trinh-migration.md)*
- *Strategy (sprint plan, service layer): [`01-chien-luoc-tong-the.md`](./01-chien-luoc-tong-the.md)*
