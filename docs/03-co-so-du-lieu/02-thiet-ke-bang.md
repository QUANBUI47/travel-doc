# 02 — Thiết kế bảng (spec chi tiết)

> **Vai trò đọc**: DBA, dev cần biết field/type/constraint của bảng để viết query, service, migration.
> **Quy ước**:
> - Mọi ID là `UUID @db.Uuid` (ADR-003).
> - Mọi cờ visibility dùng `isActive` (không `isPublished`/`isVisible`).
> - Mọi `onDelete`/`onUpdate` khai báo tường minh — xem cascade matrix ở `01-erd-tong-quan.md`.
> - Index trên cờ `isActive` luôn dùng partial `WHERE is_active = true`.

> **Tổ chức**: 5 module — mỗi bảng theo template `Field → Type → Constraint → Lý do` + bảng phụ (CHECK, Index, Enum).

---

## Module 1 — Content CMS

### 1.1 Region

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `slug` | String | `@unique` | URL friendly |
| `nameVi` | String | NOT NULL | Tên hiển thị tiếng Việt |
| `nameEn` | String? | nullable | i18n EN (Phase 1.5+) |
| `sortOrder` | Int | default 0 | Thứ tự (mb=1, mt=2, mn=3) |

**Seed cứng** ở `prisma/seed.ts` — không CRUD admin, không có `isActive`.

### 1.2 Destination

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `regionId` | UUID | FK Region (`Cascade`) | — |
| `slug` | String | `@unique` | SEO URL |
| `nameVi` / `nameEn` | String / String? | — | i18n |
| `description` | String? | — | HTML/Markdown |
| `imageUrl` | String? | — | Cover (Cloudinary) |
| `imageUrls` | String[] | default `[]` | Gallery |
| `latitude` / `longitude` | Float? | — | Map embed |
| `isFeatured` | Boolean | default `false` | Hiển thị trang chủ |
| `isActive` | Boolean | default `true` | (N-02) |
| `sortOrder` | Int | default 0 | — |

**Indexes** (partial):
- `idx_destinations_active` — `WHERE is_active = true`
- `idx_destinations_active_region` — `(region_id) WHERE is_active = true`

### 1.3 Hotel

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `destinationId` | UUID | FK Destination (`Cascade`) | — |
| `slug` | String | `@unique` | SEO URL |
| `nameVi` / `nameEn` | String / String? | — | i18n |
| `address` | String? | — | Hiển thị + map |
| `starRating` | Int? | nullable, 1-5 | Hiển thị sao |
| `latitude` / `longitude` | Float? | — | Map |
| `amenities` | String[] | default `[]` | Wifi, pool, breakfast,… |
| `imageUrls` | String[] | default `[]` | Gallery |
| `priceFrom` | Decimal(14,0)? | — | Giá hiển thị tham khảo (không phải giá book) |
| `isActive` | Boolean | default `true` | (N-02) |

### 1.4 Room

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `hotelId` | UUID | FK Hotel (`Cascade`) | — |
| `roomType` | Enum `RoomType` | NOT NULL, default `STANDARD` | Standardize cho filter |
| `nameVi` / `nameEn` | String / String? | — | Tên marketing (vd "Deluxe Twin View Biển") |
| `maxGuests` | Int | NOT NULL | Sức chứa |
| `pricePerNight` | Decimal(14,0) | NOT NULL | Giá hiển thị/đêm (tham khảo) |
| `imageUrls` | String[] | default `[]` | — |
| `isActive` | Boolean | default `true` | — |

**Enum `RoomType`**:
```
STANDARD  SUPERIOR  DELUXE
JUNIOR_SUITE  SUITE  FAMILY_SUITE
CONNECTING  PRESIDENTIAL  OTHER
```

**Indexes**: `(hotel_id, room_type)` — query "Hotel X có loại phòng nào".

> Inventory tracking → `HotelAllotment` monthly (1.10). Không có `RoomInventory` per-date.

### 1.5 Tour

**Entity trung tâm** của Vivu.

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `destinationId` | UUID? | FK Destination (`SetNull`) nullable | Tour có thể đứng riêng (vd tour xuyên Việt) |
| `slug` | String | `@unique` | SEO URL |
| `nameVi` / `nameEn` | String / String? | — | i18n |
| `description` | String? | — | HTML/Markdown |
| `durationDays` | Int | NOT NULL, ≥1 | Số ngày — filter/sort |
| `durationNights` | Int | NOT NULL, default 0 | Số đêm |
| `departurePoint` | String? | — | "Hà Nội", "TP.HCM" |
| `transport` | String? | — | "Máy bay", "Ô tô" |
| `tourType` | String? | — | "Tour ghép", "Tour riêng" |
| `priceAdult` | Decimal(14,0) | NOT NULL | Giá người lớn ≥12 — pricing chính (ADR-002) |
| `priceChild` | Decimal(14,0)? | nullable | Giá trẻ em 5-11 (thường 75% adult). Null = "Liên hệ" |
| `priceInfant` | Decimal(14,0)? | nullable, default 0 | Giá em bé 0-4. Default 0 = free |
| `singleSupplement` | Decimal(14,0)? | nullable | Phụ thu phòng đơn. Null = không cho đi 1 người |
| `priceFrom` | Decimal(14,0)? | — | Giá từ (listing) — thường = priceAdult |
| `oldPrice` | Decimal(14,0)? | — | Giá gốc (để show % giảm) |
| `inclusions` | Json? | — | List "bao gồm" |
| `exclusions` | Json? | — | List "không bao gồm" |
| `policy` | Json? | — | Children + extra bed + cancellation tier (Zod validated) |
| `tags` | String[] | default `[]` | "Hot", "Giá tốt", "Mới" |
| `imageUrls` | String[] | default `[]` | — |
| `isActive` | Boolean | default `true` | (N-02) |
| `estimatedCost` | Decimal(14,0)? | — | Chi phí vốn ước tính per khách (chừa cửa L1/L2 — ADR-007) |

**CHECK**: `tours_duration_valid`:
```sql
duration_days >= 1 AND duration_nights >= 0 AND duration_nights <= duration_days
```

**Indexes** (partial):
- `(destination_id)` — filter điểm đến
- `idx_tours_active` — `WHERE is_active = true`
- `idx_tours_active_dest_price` — `(destination_id, price_adult) WHERE is_active = true`

### 1.6 TourItinerary

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour (`Cascade`) | — |
| `dayNumber` | Int | NOT NULL | Ngày thứ mấy (1, 2, 3...) |
| `title` | String | NOT NULL | "Ngày 1: Sài Gòn → Đà Lạt" |
| `description` | String? | — | Chi tiết hoạt động (HTML/MD) |
| `sortOrder` | Int | default 0 | — |
| `hotelId` | UUID? | FK Hotel (`SetNull`) nullable | Hotel khách ngủ đêm đó. Null = không qua đêm |
| `roomTypeNote` | String? | — | "Phòng Deluxe Twin", note text vì có thể đổi |
| `createdAt` / `updatedAt` | DateTime | default now / `@updatedAt` | Audit track |

### 1.7 TourDeparture

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour (`Cascade`) | — |
| `startDate` | Date | NOT NULL | Ngày khởi hành |
| `endDate` | Date? | — | Derive từ `tour.durationDays` được |
| `priceOverride` | Decimal(14,0)? | — | Giá riêng (vd cao điểm) |
| `maxParticipants` | Int? | — | Slot tối đa. Null = không giới hạn |
| `minParticipants` | Int? | — | Tối thiểu mới khởi hành (chống wash) |
| `bookedCount` | Int | default 0 | **Counter critical (N-03)** |
| `status` | Enum `DepartureStatus` | default `AVAILABLE` | AVAILABLE / FULL / CANCELLED |
| `cancellationDeadline` | DateTime? | — | Hạn Vivu quyết cancel nếu chưa đủ min |
| `cancellationReason` | String? | — | Email khách + audit |
| `notes` | String? | — | Note admin |
| `actualCostPerPax` | Decimal(14,0)? | — | Chi phí thực sau chuyến (chừa cửa L1/L2) |

**CHECK** (N-03):
- `tour_departures_booked_count_non_negative`: `bookedCount >= 0`
- `tour_departures_no_overbook`: `bookedCount <= COALESCE(maxParticipants, bookedCount)`

**Indexes**: `(tour_id, start_date)`.

> Concurrency lock + status transitions → `03-toan-ven-concurrency.md` + `../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md`.

### 1.8 TourOption (upsell)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID | FK Tour (`Cascade`) | — |
| `type` | Enum `TourOptionType` | NOT NULL | ROOM_UPGRADE / SINGLE_SUPPLEMENT / EXTRA_BED / SERVICE_ADDON |
| `nameVi` / `nameEn` | String / String? | — | Tên option |
| `description` | String? | — | Mô tả |
| `priceDelta` | Decimal(14,0) | NOT NULL | Cộng vào base (có thể âm cho discount) |
| `pricingUnit` | Enum `PricingUnit` | default `PER_PAX` | PER_PAX / PER_BOOKING / PER_ROOM |
| `isActive` | Boolean | default `true` | — |
| `sortOrder` | Int | default 0 | — |
| `createdAt` / `updatedAt` | — | — | — |

**Enums**:
```
TourOptionType: ROOM_UPGRADE | SINGLE_SUPPLEMENT | EXTRA_BED | SERVICE_ADDON
PricingUnit:    PER_PAX | PER_BOOKING | PER_ROOM
```

**Indexes**:
- `(tour_id)` — query options của tour (admin)
- `idx_tour_options_active_tour` — `(tour_id) WHERE is_active = true` (public)

> Cách tính `priceBreakdown` → `../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md`.

### 1.9 HotelAllotment

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `hotelId` | UUID | FK Hotel (`Cascade`) | — |
| `periodMonth` | Date | NOT NULL, CHECK ngày 1 của tháng | Native DATE để dùng `date_trunc`/`+ interval '1 month'` |
| `contractedRooms` | Int | NOT NULL | Phòng-đêm contract trong tháng |
| `usedRooms` | Int | default 0 | Admin update khi confirm booking |
| `releasedRooms` | Int | default 0 | Trả hotel trước cut-off (no penalty) |
| `noShowFee` | Decimal(14,0)? | — | Phạt no-show |
| `notes` | String? | — | Ghi chú admin |
| `createdAt` / `updatedAt` | — | — | — |

**CHECK** (N-03):
- `hotel_allotments_no_overuse`: `usedRooms + releasedRooms <= contractedRooms`
- `hotel_allotments_period_first_day`: `EXTRACT(DAY FROM period_month) = 1`

**Unique**: `(hotelId, periodMonth)` — 1 hotel/tháng 1 record.

**Indexes**: `(period_month)` — query "tháng 6 tất cả hotel".

> Display "tháng 6/2026": format ở app layer `formatPeriodMonth(date, locale)`.

---

## Module 2 — Booking & Payment

### 2.1 Booking (parent)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID | FK Profile (`Restrict`) **NOT NULL** | Must-login (ADR-004). Restrict để giữ booking history khi user xoá |
| `status` | Enum `BookingStatus` | default `PENDING` | PENDING / PAID / CONFIRMED / CANCELLED / COMPLETED / REFUNDED |
| `totalAmount` | Decimal(14,0) | NOT NULL | Snapshot tổng tiền |
| `guestName` | String | NOT NULL | Người đi (có thể khác user) |
| `guestEmail` | String | NOT NULL | — |
| `guestPhone` | String | NOT NULL | — |
| `notes` | String? | — | Ghi chú khách |
| `tourStartDate` | Date? | — | Convenience field cho query |
| `paymentDeadline` | DateTime? | — | `= createdAt + 15min`. Cron auto-cancel sau deadline |
| `createdAt` / `updatedAt` | — | — | — |

**Indexes**:
- `(user_id)` — "đơn của tôi"
- `(status)` — admin filter
- `(created_at)` — admin sort
- `(status, payment_deadline) WHERE status = 'PENDING'` — cron auto-cancel query

> Status transitions + 15-min hold flow → `../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md`.

### 2.2 TourBooking (1:1 với Booking)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `bookingId` | UUID | FK Booking `@unique` (`Cascade`) | 1:1 |
| `tourId` | UUID | FK Tour (no cascade — FK only) | Không xoá tour khi có booking |
| `departureId` | UUID? | FK TourDeparture nullable | Null nếu request quote không gắn departure |
| `participants` | Int | NOT NULL, > 0 | Tổng = adults + children + infants |
| `adultsCount` | Int | default 1 | ≥12 tuổi |
| `childrenCount` | Int | default 0 | 5-11 tuổi |
| `infantsCount` | Int | default 0 | 0-4 tuổi |
| `priceBreakdown` | Json | NOT NULL | Chi tiết tính tiền (Zod validated) |

**CHECK**:
- `tour_bookings_participants_positive`: `participants > 0`
- `tour_bookings_participants_consistency`: `participants = adultsCount + childrenCount + infantsCount`
- `tour_bookings_at_least_one_adult`: `adultsCount >= 1`

> Cấu trúc Zod `PriceBreakdownSchema` → `03-toan-ven-concurrency.md`.

### 2.3 Payment

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `bookingId` | UUID | FK Booking (`Cascade`) | — |
| `amount` | Decimal(14,0) | NOT NULL | — |
| `method` | String | NOT NULL | "VNPAY", "MOMO", "BANK_TRANSFER" |
| `status` | Enum `PaymentStatus` | default `PENDING` | PENDING / SUCCESS / FAILED |
| `externalId` | String? | — | Transaction ID từ VNPay/MoMo |
| `createdAt` | — | — | — |

### 2.4 InquiryRequest (Private Tour lead)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `tourId` | UUID? | FK Tour (`SetNull`) | Optional — khách click từ trang tour cụ thể |
| `type` | Enum `InquiryType` | NOT NULL | PRIVATE_TOUR / CORPORATE_GROUP / CUSTOM_QUOTE |
| `contactName` | String | NOT NULL | — |
| `contactEmail` | String | NOT NULL | — |
| `contactPhone` | String | NOT NULL | — |
| `companyName` | String? | — | Nếu corporate |
| `groupSize` | Int | NOT NULL | Số người (vd 40) |
| `preferredDates` | String? | — | Free-text "tuần 2 tháng 6" |
| `budget` | Decimal(14,0)? | — | Ngân sách dự kiến |
| `message` | String? | — | Yêu cầu chi tiết |
| `status` | Enum `InquiryStatus` | default `NEW` | NEW → CONTACTED → QUOTED → CONFIRMED / REJECTED / EXPIRED |
| `assignedTo` | UUID? | FK Profile (`SetNull`) | Admin xử lý |
| `adminNotes` | String? | — | Note nội bộ |
| `convertedBookingId` | UUID? | FK Booking (`SetNull`) | Nếu chốt deal |
| `createdAt` / `updatedAt` | — | — | — |

**Enums**:
```
InquiryType:   PRIVATE_TOUR | CORPORATE_GROUP | CUSTOM_QUOTE
InquiryStatus: NEW | CONTACTED | QUOTED | CONFIRMED | REJECTED | EXPIRED
```

**Indexes**:
- `(status, created_at)` — admin query
- `(type)` — phân loại
- `(assigned_to) WHERE assigned_to IS NOT NULL` — assignments của admin

> Workflow + 30-day expiry → `../01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md`.

---

## Module 3 — Auth & User

### 3.1 Profile

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK, **KHÔNG `@default(uuid())`** | Match `auth.users.id` (Supabase). Set thủ công khi `ensureUserProfile()` |
| `role` | Enum `Role` | default `USER` | USER / ADMIN |
| `displayName` | String? | — | Từ Google OAuth hoặc user set |
| `avatarUrl` | String? | — | Cloudinary hoặc Google |
| `phone` | String? | — | Pre-fill booking form |
| `createdAt` / `updatedAt` | — | — | — |

> **Lưu ý quan trọng**: `Profile.id` UUID không có default — phải set bằng `auth.users.id`. Nếu để `@default(uuid())` → vỡ login flow (mất mapping).

**FK trỏ Profile** (cascade matrix):

| FK | onDelete | Lý do |
| --- | --- | --- |
| `Booking.userId` | `Restrict` | Tax audit + revenue accounting |
| `Review.userId` | `Restrict` | Social proof + SEO |
| `ActivityLog.userId` | `SetNull` | Audit giữ lại, anonymize user |
| `InquiryRequest.assignedTo` | `SetNull` | Admin nghỉ việc gỡ assignee |

**Account deletion**: Phase 1 không support hard delete user. Admin manual anonymize (clear PII, giữ Profile row). Phase 1.5 thêm `Profile.deletedAt` + cron auto-anonymize. Chi tiết → `../04-phat-trien/04-bao-mat-xac-thuc.md`.

### 3.2 ActivityLog

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID? | FK Profile (`SetNull`) | User xoá vẫn giữ audit |
| `action` | String | NOT NULL | "CREATE_TOUR", "UPDATE_DESTINATION",... |
| `entity` | String? | — | "Tour", "Destination",... |
| `entityId` | String? | — | ID entity affected |
| `details` | Json? | — | Payload before/after |
| `createdAt` | DateTime | default now | — |

---

## Module 4 — Review

### 4.1 Review (polymorphic Hotel | Tour)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `userId` | UUID | FK Profile (`Restrict`) | Must-login. Giữ review khi user xoá |
| `reviewableType` | Enum `ReviewableType` | NOT NULL | HOTEL / TOUR (N-01) |
| `hotelId` | UUID? | FK Hotel (`Cascade`) | Polymorphic arc |
| `tourId` | UUID? | FK Tour (`Cascade`) | Polymorphic arc |
| `rating` | Int | NOT NULL, 1-5 | — |
| `title` | String? | — | — |
| `content` | String? | — | — |
| `isVerified` | Boolean | default `false` | True khi user đã `COMPLETED` booking |
| `createdAt` / `updatedAt` | — | — | — |

**CHECK** (N-01):
- `reviews_target_exclusive`:
  ```sql
  (reviewableType='HOTEL' AND hotelId IS NOT NULL AND tourId IS NULL)
   OR
  (reviewableType='TOUR'  AND tourId  IS NOT NULL AND hotelId IS NULL)
  ```
- `reviews_rating_range`: `rating BETWEEN 1 AND 5`

**Indexes** (Phase 1.5):
- `(reviewable_type, tour_id)` — review của tour X
- `(reviewable_type, hotel_id)` — review của hotel Y

---

## Module 5 — Platform & Settings

### 5.1 SeoPage (polymorphic 4 target)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `targetType` | Enum `SeoTargetType` | NOT NULL | TOUR / DESTINATION / HOTEL / STATIC |
| `tourId` | UUID? | FK Tour `@unique` (`Cascade`) | Exclusive arc |
| `destinationId` | UUID? | FK Destination `@unique` (`Cascade`) | — |
| `hotelId` | UUID? | FK Hotel `@unique` (`Cascade`) | — |
| `customPath` | String? | `@unique` | "/lien-he", "/ve-chung-toi" (STATIC) |
| `metaTitle` | String | NOT NULL | — |
| `metaDescription` | String? | — | — |
| `ogImage` | String? | — | Open Graph preview |
| `canonicalUrl` | String? | — | — |
| `noIndex` | Boolean | default `false` | Loại khỏi Google index |

**CHECK** (N-01): `seo_pages_exclusive_target` — đúng 1 trong 4 cột non-NULL, khớp với `targetType`.

**Index**: `(target_type)`.

> Flow SEO + lý do exclusive arc → `../02-kien-truc/decisions/ADR-005-seo-polymorphic-page.md` (sẽ viết).

### 5.2 HomeSetting (singleton)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | String | PK, `@default("default")` | Singleton — chỉ 1 row |
| `content` | Json | NOT NULL | Schema Home Builder (modules + order) |
| `updatedAt` | — | — | — |

> `id` là String "default", KHÔNG UUID — singleton pattern.

### 5.3 SystemSetting (key/value)

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `group` | String | NOT NULL | "seo", "contact", "payment",... |
| `key` | String | `@unique` | — |
| `value` | Json | NOT NULL | Flexible type |

**Index**: `(group)`.

### 5.4 LegalContent

| Field | Type | Constraint | Lý do |
| --- | --- | --- | --- |
| `id` | UUID | PK | — |
| `slug` | String | `@unique` | "terms-of-service", "privacy-policy" |
| `title` | String | NOT NULL | — |
| `content` | Json | NOT NULL | i18n trong cùng JSON |
| `version` | String | default "1.0" | Khi update T&C |

---

## Enums tổng hợp

```prisma
enum Role               { USER  ADMIN }
enum RoomType           { STANDARD SUPERIOR DELUXE JUNIOR_SUITE SUITE FAMILY_SUITE CONNECTING PRESIDENTIAL OTHER }
enum DepartureStatus    { AVAILABLE  FULL  CANCELLED }
enum TourOptionType     { ROOM_UPGRADE  SINGLE_SUPPLEMENT  EXTRA_BED  SERVICE_ADDON }
enum PricingUnit        { PER_PAX  PER_BOOKING  PER_ROOM }
enum BookingStatus      { PENDING  PAID  CONFIRMED  CANCELLED  COMPLETED  REFUNDED }
enum PaymentStatus      { PENDING  SUCCESS  FAILED }
enum InquiryType        { PRIVATE_TOUR  CORPORATE_GROUP  CUSTOM_QUOTE }
enum InquiryStatus      { NEW  CONTACTED  QUOTED  CONFIRMED  REJECTED  EXPIRED }
enum ReviewableType     { HOTEL  TOUR }
enum SeoTargetType      { TOUR  DESTINATION  HOTEL  STATIC }
```

---

## Liên kết

- ERD overview: `01-erd-tong-quan.md`
- Toàn vẹn + concurrency + visibility: `03-toan-ven-concurrency.md`
- Quy trình migration: `04-quy-trinh-migration.md`
- Migration kế tiếp: `migrations/2026-05-27_add_pricing_options_and_allotment.md`
- ADR: `../02-kien-truc/decisions/ADR-001` (hotel), `ADR-002` (pricing), `ADR-003` (UUID), `ADR-007` (reporting)
