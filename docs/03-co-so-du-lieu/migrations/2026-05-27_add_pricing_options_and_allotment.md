# Migration: `add_pricing_options_and_allotment` (2026-05-27)

> **Status**: ⏳ Pending (sẽ apply sau khi audit pass + Tech Lead sign-off)
> **Pre-req**: Phải xong TRƯỚC Sprint 4 Booking.
> **Loại**: Mixed (additive + destructive), 10 PART.

---

## Mục tiêu

Gộp **5 pivot scope** + **3 fix kỹ thuật** vào 1 migration để schema history dễ trace.

| Scope | Mô tả |
| --- | --- |
| ADR-001 (V-05) — Hotel Content Reference vĩnh viễn | DROP `HotelBooking` + `bookingType` + `Booking.checkIn/checkOut` |
| ADR-002 (V-09) — Pricing Pattern C | `priceAdult/Child/Infant/singleSupplement`, `TourOption`, `TourBooking.priceBreakdown` Json |
| ADR-006 (V-12) — Series + Private Tour split | Bảng mới `InquiryRequest` lead capture |
| ADR-007 (V-08) — Cost tracking chừa cửa L1/L2 | `Tour.estimatedCost`, `TourDeparture.actualCostPerPax` |
| V-10 — Allotment + payment hold | `HotelAllotment` monthly, `Booking.paymentDeadline` + cron auto-cancel |
| Fix kỹ thuật 1 (ADR-003) | TEXT → UUID native cho toàn schema (`@db.Uuid`) |
| Fix kỹ thuật 2 | `HotelAllotment.monthYear String` → `periodMonth DATE` + CHECK |
| Fix kỹ thuật 3 | `Profile → Booking/Review` Cascade → Restrict; full Boolean index → partial |

---

## Phạm vi — 10 PART

| PART | Loại | Nội dung |
| --- | --- | --- |
| **PART 0** | Destructive | TEXT → UUID cho toàn schema (chạy ĐẦU TIÊN) |
| **PART 1** | Additive | TourItinerary thêm `hotelId` + `roomTypeNote` + timestamps |
| **PART 2** | Additive | Cost tracking (`Tour.estimatedCost`, `TourDeparture.actualCostPerPax`) |
| **PART 3** | Mixed | Pricing per-pax + `TourOption` table + DROP `unitPrice` |
| **PART 4** | Additive | Risk management (`TourDeparture.minParticipants/cancellationDeadline/cancellationReason`, `Booking.paymentDeadline`, `HotelAllotment`) |
| **PART 5** | Additive | Standardize `Room.roomType` enum (9 giá trị) |
| **PART 6** | Mixed | Restructure tour duration: thêm `durationNights`, DROP `durationText` |
| **PART 7** | Additive | `InquiryRequest` lead capture |
| **PART 8** | Destructive | DROP `HotelBooking` + `bookingType` + `Booking.checkIn/checkOut` |
| **PART 9** | Destructive | Cascade fix `Profile → Booking/Review` (Cascade → Restrict) |
| **PART 10** | Destructive | Convert old `is_active` full indexes → partial |

> **Thứ tự bắt buộc**: PART 0 phải chạy TRƯỚC tất cả part khác. Các part 1-7 (additive) chạy được riêng, không phụ thuộc nhau. Part 8/9/10 (destructive) chạy cuối.

---

## Pre-flight audit script

> Chạy trên Supabase SQL Editor TRƯỚC khi apply migration. Tất cả query phải trả về `count = 0`.

```sql
-- ============================================================
-- AUDIT PART 0 — Tất cả id + FK column đã ở UUID format
-- ============================================================
-- Regex chuẩn UUID: 8-4-4-4-12 hex chars
WITH uuid_regex AS (SELECT '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'::text AS pattern)
SELECT 'profiles.id_invalid' AS issue, COUNT(*) AS count
FROM profiles, uuid_regex
WHERE id !~ uuid_regex.pattern
UNION ALL
SELECT 'bookings.user_id_invalid', COUNT(*)
FROM bookings, uuid_regex
WHERE user_id !~ uuid_regex.pattern
UNION ALL
SELECT 'reviews.user_id_invalid', COUNT(*)
FROM reviews, uuid_regex
WHERE user_id !~ uuid_regex.pattern
UNION ALL
SELECT 'activity_logs.user_id_invalid', COUNT(*)
FROM activity_logs, uuid_regex
WHERE user_id IS NOT NULL AND user_id !~ uuid_regex.pattern;
-- Expected: tất cả 0. Nếu khác 0 → ABORT, fix row đó trước.

-- ============================================================
-- AUDIT PART 3 — Pricing migration readiness
-- ============================================================
SELECT 'tours_without_price_from' AS issue, COUNT(*) AS count
FROM tours WHERE price_from IS NULL;
-- Phase 1 chưa có tour production → expected 0.

SELECT 'tour_bookings_with_zero_unit_price' AS issue, COUNT(*) AS count
FROM tour_bookings WHERE unit_price = 0 OR unit_price IS NULL;
-- Expected 0.

-- ============================================================
-- AUDIT PART 9 — Verify cascade hiện tại đang là Cascade
-- ============================================================
SELECT tc.constraint_name, tc.table_name, rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_name IN ('bookings_user_id_fkey', 'reviews_user_id_fkey');
-- Expected (trước PART 9): delete_rule = 'CASCADE'
-- Expected (sau PART 9):   delete_rule = 'RESTRICT'

-- ============================================================
-- AUDIT PART 10 — Verify indexes cũ tồn tại trước khi DROP
-- ============================================================
SELECT indexname FROM pg_indexes
WHERE indexname IN (
  'destinations_is_active_idx',
  'destinations_region_id_is_active_idx',
  'tours_is_active_idx'
);
-- Note: idempotent — không error nếu index không tồn tại.
```

---

## SQL chi tiết

### PART 0 — Type alignment (TEXT → UUID)

> Lý do: Prisma schema init lỡ không khai báo `@db.Uuid` → tất cả id + FK column hiện là `TEXT`. Align sang `UUID` native để (1) type safety với Supabase `auth.users.id`, (2) index B-tree nhanh hơn ~30%, (3) storage 16 bytes vs 36 bytes.
> Phase 1 chưa launch production → không downtime đáng kể. Nếu Phase 1.5+ có data thật phải plan blue-green hoặc dual-column rollover.

```sql
-- 0a. Enable extension cho uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0b. ALTER tất cả id column TEXT → UUID
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
-- home_settings.id giữ TEXT (singleton "default")

-- 0c. ALTER FK column TEXT → UUID
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

-- 0d. SET DEFAULT uuid_generate_v4() — DB-side thay vì client-side
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
```

### PART 1 — TourItinerary: hotelId + roomTypeNote + timestamps

```sql
ALTER TABLE tour_itineraries
  ADD COLUMN hotel_id UUID REFERENCES hotels(id) ON DELETE SET NULL,
  ADD COLUMN room_type_note VARCHAR(255),
  ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX idx_tour_itineraries_hotel_id ON tour_itineraries(hotel_id);
```

### PART 2 — Cost tracking chừa cửa L1/L2

```sql
ALTER TABLE tours
  ADD COLUMN estimated_cost DECIMAL(14, 0);

ALTER TABLE tour_departures
  ADD COLUMN actual_cost_per_pax DECIMAL(14, 0);
```

### PART 3 — Pricing per-pax Pattern C + TourOption

```sql
-- 3a. Tour pricing fields
ALTER TABLE tours
  ADD COLUMN price_adult        DECIMAL(14, 0) NOT NULL DEFAULT 0,
  ADD COLUMN price_child        DECIMAL(14, 0),
  ADD COLUMN price_infant       DECIMAL(14, 0) DEFAULT 0,
  ADD COLUMN single_supplement  DECIMAL(14, 0);

-- Migrate priceFrom → priceAdult cho tour cũ
UPDATE tours SET price_adult = COALESCE(price_from, 0) WHERE price_adult = 0;
ALTER TABLE tours ALTER COLUMN price_adult DROP DEFAULT;

-- 3b. TourBooking — thêm fields mới + DROP unitPrice
ALTER TABLE tour_bookings
  ADD COLUMN adults_count    INT NOT NULL DEFAULT 1,
  ADD COLUMN children_count  INT NOT NULL DEFAULT 0,
  ADD COLUMN infants_count   INT NOT NULL DEFAULT 0,
  ADD COLUMN price_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Migrate unitPrice → priceBreakdown tối thiểu
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

-- 3c. CHECK constraints
ALTER TABLE tour_bookings
  ADD CONSTRAINT tour_bookings_participants_consistency
    CHECK (participants = adults_count + children_count + infants_count),
  ADD CONSTRAINT tour_bookings_at_least_one_adult
    CHECK (adults_count >= 1);

-- 3d. tour_options table
CREATE TYPE tour_option_type AS ENUM ('ROOM_UPGRADE', 'SINGLE_SUPPLEMENT', 'EXTRA_BED', 'SERVICE_ADDON');
CREATE TYPE pricing_unit     AS ENUM ('PER_PAX', 'PER_BOOKING', 'PER_ROOM');

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
-- Note: partial index `WHERE is_active = true` được tạo ở PART 10
```

### PART 4 — Risk management

```sql
-- 4a. TourDeparture
ALTER TABLE tour_departures
  ADD COLUMN min_participants     INT,
  ADD COLUMN cancellation_deadline TIMESTAMPTZ,
  ADD COLUMN cancellation_reason   TEXT;

-- 4b. Booking payment hold 15 phút
ALTER TABLE bookings
  ADD COLUMN payment_deadline TIMESTAMPTZ;

CREATE INDEX idx_bookings_status_deadline ON bookings(status, payment_deadline)
  WHERE status = 'PENDING';

-- 4c. hotel_allotments table
CREATE TABLE hotel_allotments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id          UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  period_month      DATE NOT NULL,         -- ngày 1 của tháng, vd '2026-06-01'
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
  CONSTRAINT hotel_allotments_unique_hotel_period
    UNIQUE (hotel_id, period_month)
);

CREATE INDEX idx_hotel_allotments_period ON hotel_allotments(period_month);
```

### PART 5 — Standardize Room types

```sql
CREATE TYPE room_type AS ENUM (
  'STANDARD', 'SUPERIOR', 'DELUXE',
  'JUNIOR_SUITE', 'SUITE', 'FAMILY_SUITE',
  'CONNECTING', 'PRESIDENTIAL', 'OTHER'
);

ALTER TABLE rooms
  ADD COLUMN room_type room_type NOT NULL DEFAULT 'STANDARD';

CREATE INDEX idx_rooms_hotel_type ON rooms(hotel_id, room_type);
```

### PART 6 — Restructure tour duration

```sql
ALTER TABLE tours
  ADD COLUMN duration_nights INT NOT NULL DEFAULT 0;

-- Migrate: default nights = days - 1 cho tour cũ có lưu trú
UPDATE tours
SET duration_nights = GREATEST(duration_days - 1, 0)
WHERE duration_nights = 0;

-- Drop free-text durationText
ALTER TABLE tours DROP COLUMN duration_text;

-- CHECK
ALTER TABLE tours
  ADD CONSTRAINT tours_duration_valid
    CHECK (duration_days >= 1 AND duration_nights >= 0 AND duration_nights <= duration_days);
```

### PART 7 — InquiryRequest (Private Tour / Corporate)

```sql
CREATE TYPE inquiry_type   AS ENUM ('PRIVATE_TOUR', 'CORPORATE_GROUP', 'CUSTOM_QUOTE');
CREATE TYPE inquiry_status AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'REJECTED', 'EXPIRED');

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
CREATE INDEX idx_inquiry_type            ON inquiry_requests(type);
CREATE INDEX idx_inquiry_assigned        ON inquiry_requests(assigned_to)
  WHERE assigned_to IS NOT NULL;
```

### PART 8 — DROP HotelBooking + bookingType (ADR-001 YAGNI)

```sql
-- 8a. Drop HotelBooking table (Phase 1 chưa wire, rỗng data)
DROP TABLE IF EXISTS hotel_bookings;

-- 8b. Drop bookingType column từ bookings
ALTER TABLE bookings DROP COLUMN IF EXISTS booking_type;

-- 8c. Drop hotel-specific fields ở Booking
ALTER TABLE bookings
  DROP COLUMN IF EXISTS check_in,
  DROP COLUMN IF EXISTS check_out;

-- 8d. Drop CHECK guard cũ (không còn discriminator)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_phase1_tour_only;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_type_consistency;

-- 8e. Drop BookingType enum
DROP TYPE IF EXISTS "BookingType";
```

### PART 9 — Cascade fix Profile → Booking/Review

> Lý do: Cascade khi xoá user = mất toàn bộ booking history + review. Vi phạm tax audit + accounting trail. Chuyển sang Restrict — không cho hard delete user nếu còn booking/review. Account deletion phải qua procedure anonymize (clear PII, giữ row).

```sql
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
```

### PART 10 — Convert is_active full index → partial

> Lý do: 99%+ row sẽ active → index full Boolean low selectivity, planner bỏ qua. Partial index `WHERE is_active = true` selectivity 100% với query public, size nhỏ hơn nhiều.

```sql
-- 10a. Drop indexes full Boolean cũ
DROP INDEX IF EXISTS destinations_is_active_idx;
DROP INDEX IF EXISTS destinations_region_id_is_active_idx;
DROP INDEX IF EXISTS tours_is_active_idx;
-- (hotels & rooms is_active chưa có index → skip)

-- 10b. Create partial indexes mới
CREATE INDEX idx_destinations_active
  ON destinations(id) WHERE is_active = true;

CREATE INDEX idx_destinations_active_region
  ON destinations(region_id) WHERE is_active = true;

CREATE INDEX idx_tours_active
  ON tours(id) WHERE is_active = true;

CREATE INDEX idx_tours_active_destination
  ON tours(destination_id) WHERE is_active = true;

CREATE INDEX idx_hotels_active
  ON hotels(id) WHERE is_active = true;

CREATE INDEX idx_hotels_active_destination
  ON hotels(destination_id) WHERE is_active = true;

CREATE INDEX idx_rooms_active_hotel
  ON rooms(hotel_id) WHERE is_active = true;

CREATE INDEX idx_tour_options_active_tour
  ON tour_options(tour_id) WHERE is_active = true;
```

---

## Prisma schema delta (rút gọn — chỉ liệt kê field thay đổi)

> PART 0 alignment: mọi `String @id @default(uuid())` thêm `@db.Uuid`, mọi FK String ID thêm `@db.Uuid`. Profile.id KHÔNG có default. Pattern này áp dụng cho mọi model — dưới đây chỉ liệt kê model mới / có thay đổi field.

```prisma
// Profile — id KHÔNG default, set từ Supabase auth.users.id
model Profile {
  id          String   @id @db.Uuid
  role        Role     @default(USER)
  // ... existing fields
  // PART 9: relation Booking + Review chuyển sang Restrict
}

// Tour — thêm pricing per-pax + cost tracking + durationNights, DROP durationText
model Tour {
  id                String    @id @default(uuid()) @db.Uuid
  destinationId     String?   @map("destination_id") @db.Uuid
  // ... existing fields
  priceAdult        Decimal   @map("price_adult") @db.Decimal(14, 0)
  priceChild        Decimal?  @map("price_child") @db.Decimal(14, 0)
  priceInfant       Decimal?  @map("price_infant") @db.Decimal(14, 0)
  singleSupplement  Decimal?  @map("single_supplement") @db.Decimal(14, 0)
  estimatedCost     Decimal?  @map("estimated_cost") @db.Decimal(14, 0)
  durationDays      Int       @map("duration_days")
  durationNights    Int       @default(0) @map("duration_nights")
  // DROP: durationText
  options           TourOption[]
}

// TourItinerary — thêm hotelId + roomTypeNote + timestamps
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

// TourDeparture — thêm risk fields + actualCostPerPax
model TourDeparture {
  id                    String    @id @default(uuid()) @db.Uuid
  tourId                String    @map("tour_id") @db.Uuid
  // ... existing fields
  minParticipants       Int?      @map("min_participants")
  cancellationDeadline  DateTime? @map("cancellation_deadline")
  cancellationReason    String?   @map("cancellation_reason")
  actualCostPerPax      Decimal?  @map("actual_cost_per_pax") @db.Decimal(14, 0)
}

// Booking — DROP bookingType/checkIn/checkOut, thêm paymentDeadline
model Booking {
  id               String     @id @default(uuid()) @db.Uuid
  userId           String     @map("user_id") @db.Uuid
  // ... existing fields (DROP: bookingType, checkIn, checkOut)
  paymentDeadline  DateTime?  @map("payment_deadline")
  // PART 9: Cascade → Restrict
  profile          Profile    @relation(fields: [userId], references: [id], onDelete: Restrict)
  @@index([status, paymentDeadline])
}

// TourBooking — DROP unitPrice, thêm participants breakdown + priceBreakdown JSON
model TourBooking {
  id              String  @id @default(uuid()) @db.Uuid
  bookingId       String  @unique @map("booking_id") @db.Uuid
  tourId          String  @map("tour_id") @db.Uuid
  departureId     String? @map("departure_id") @db.Uuid
  participants    Int
  adultsCount     Int     @default(1) @map("adults_count")
  childrenCount   Int     @default(0) @map("children_count")
  infantsCount    Int     @default(0) @map("infants_count")
  priceBreakdown  Json    @map("price_breakdown")
}

// TourOption — bảng mới (upsell)
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
  @@map("tour_options")
}

// HotelAllotment — bảng mới (monthly tracking)
model HotelAllotment {
  id               String   @id @default(uuid()) @db.Uuid
  hotelId          String   @map("hotel_id") @db.Uuid
  periodMonth      DateTime @map("period_month") @db.Date   // luôn ngày 1
  contractedRooms  Int      @map("contracted_rooms")
  usedRooms        Int      @default(0) @map("used_rooms")
  releasedRooms    Int      @default(0) @map("released_rooms")
  noShowFee        Decimal? @map("no_show_fee") @db.Decimal(14, 0)
  notes            String?
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")
  hotel            Hotel    @relation(fields: [hotelId], references: [id], onDelete: Cascade)

  @@unique([hotelId, periodMonth])
  @@index([periodMonth])
  @@map("hotel_allotments")
}

// InquiryRequest — bảng mới (Private Tour lead)
model InquiryRequest {
  id                  String         @id @default(uuid()) @db.Uuid
  tourId              String?        @map("tour_id") @db.Uuid
  type                InquiryType
  contactName         String         @map("contact_name")
  contactEmail        String         @map("contact_email")
  contactPhone        String         @map("contact_phone")
  companyName         String?        @map("company_name")
  groupSize           Int            @map("group_size")
  preferredDates      String?        @map("preferred_dates")
  budget              Decimal?       @db.Decimal(14, 0)
  message             String?
  status              InquiryStatus  @default(NEW)
  assignedTo          String?        @map("assigned_to") @db.Uuid
  adminNotes          String?        @map("admin_notes")
  convertedBookingId  String?        @map("converted_booking_id") @db.Uuid
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")
  tour                Tour?          @relation(fields: [tourId], references: [id], onDelete: SetNull)
  assignedAdmin       Profile?       @relation("InquiryAssignee", fields: [assignedTo], references: [id], onDelete: SetNull)
  convertedBooking    Booking?       @relation(fields: [convertedBookingId], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
  @@index([type])
  @@map("inquiry_requests")
}

// Review — PART 9: Cascade → Restrict cho relation user
model Review {
  id        String          @id @default(uuid()) @db.Uuid
  userId    String          @map("user_id") @db.Uuid
  // ... existing fields
  profile   Profile         @relation(fields: [userId], references: [id], onDelete: Restrict)
}

// Room — thêm roomType enum
model Room {
  // ... existing (id + hotelId thêm @db.Uuid)
  roomType  RoomType  @default(STANDARD) @map("room_type")
  @@index([hotelId, roomType])
}

// Hotel — thêm relation TourItinerary + HotelAllotment
model Hotel {
  // ... existing (id + destinationId thêm @db.Uuid)
  tourItineraries  TourItinerary[]
  allotments       HotelAllotment[]
}

// DROP model HotelBooking
// DROP enum BookingType

// Enums mới
enum TourOptionType { ROOM_UPGRADE  SINGLE_SUPPLEMENT  EXTRA_BED  SERVICE_ADDON }
enum PricingUnit    { PER_PAX  PER_BOOKING  PER_ROOM }
enum RoomType {
  STANDARD  SUPERIOR  DELUXE
  JUNIOR_SUITE  SUITE  FAMILY_SUITE
  CONNECTING  PRESIDENTIAL  OTHER
}
enum InquiryType    { PRIVATE_TOUR  CORPORATE_GROUP  CUSTOM_QUOTE }
enum InquiryStatus  { NEW  CONTACTED  QUOTED  CONFIRMED  REJECTED  EXPIRED }
```

---

## Smoke test plan (sau khi apply)

- [ ] Login với Supabase Auth (đặc biệt: `auth.users.id::uuid` join với `profiles.id::uuid` không lỗi)
- [ ] Admin CRUD destination/hotel/tour (UUID default từ DB)
- [ ] Tạo `TourOption` mới qua admin
- [ ] Tạo `HotelAllotment` 1 tháng → query theo `period_month`
- [ ] Tạo Booking với `priceBreakdown` JSON → verify CHECK pass
- [ ] Submit `InquiryRequest` từ public form
- [ ] Verify `EXPLAIN ANALYZE` cho query public tour: dùng `idx_tours_active_destination` (Index Scan, không Seq Scan)
- [ ] Test cascade: thử xoá Profile có booking → expect `RESTRICT` error (không cascade)
- [ ] Test cron auto-cancel: tạo Booking PENDING với `paymentDeadline = NOW() - 1 minute` → cron chạy → status `CANCELLED` + `bookedCount` decrement

---

## Rollback plan

> Strategy: từng PART có script rollback riêng. Chạy theo thứ tự **ngược lại** (10 → 9 → 8 → ... → 0).

```sql
-- ROLLBACK PART 10: partial index → full Boolean
DROP INDEX IF EXISTS idx_destinations_active;
DROP INDEX IF EXISTS idx_destinations_active_region;
DROP INDEX IF EXISTS idx_tours_active;
DROP INDEX IF EXISTS idx_tours_active_destination;
DROP INDEX IF EXISTS idx_hotels_active;
DROP INDEX IF EXISTS idx_hotels_active_destination;
DROP INDEX IF EXISTS idx_rooms_active_hotel;
DROP INDEX IF EXISTS idx_tour_options_active_tour;

CREATE INDEX destinations_is_active_idx              ON destinations(is_active);
CREATE INDEX destinations_region_id_is_active_idx    ON destinations(region_id, is_active);
CREATE INDEX tours_is_active_idx                     ON tours(is_active);

-- ROLLBACK PART 9: Restrict → Cascade
ALTER TABLE bookings DROP CONSTRAINT bookings_user_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT reviews_user_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ROLLBACK PART 8: KHÔNG khả thi (recreate hotel_bookings cần lấy lại từ backup)
-- → Nếu cần rollback Part 8, restore từ pg_dump backup trước migration.

-- ROLLBACK PART 0: UUID → TEXT
-- → KHÔNG khuyến nghị rollback. Nếu bắt buộc:
--   ALTER TABLE profiles ALTER COLUMN id TYPE TEXT USING id::text;
--   (lặp cho 16 bảng + 18 FK)
--   Mất performance + type safety. Chỉ làm khi production critical.
```

---

## Notes vận hành

- **Downtime estimate**: < 5 phút (Phase 1 chưa có data lớn). Nếu Phase 1.5+ apply lại migration tương tự, plan blue-green hoặc dual-column rollover.
- **Risk note**:
  - PART 0 phải chạy đầu — KHÔNG được skip
  - PART 3b UPDATE `tour_bookings.price_breakdown` chỉ chạy lần đầu khi `price_breakdown = '{}'` — idempotent
  - PART 6 UPDATE `tour_departures.duration_nights` cũng idempotent
  - PART 8 destructive — nếu có ai đó đã insert vào `hotel_bookings` thì backup trước
- **Code task phát sinh** (sau migration):
  - Update `prisma/schema.prisma` thêm `@db.Uuid` cho mọi `String @id` + FK ID (16 model + ~18 FK column)
  - `npx prisma generate`
  - Update service layer dùng `priceBreakdown` thay vì `unitPrice`
  - Build cron `auto-cancel-pending-bookings` chạy mỗi 1 phút
  - Build admin UI `/portal/inquiries` cho InquiryRequest
  - Build public form "Đặt tour cho nhóm riêng" → InquiryRequest

---

## Liên kết

- Quy trình migration tổng: `../04-quy-trinh-migration.md`
- ERD overview: `../01-erd-tong-quan.md`
- Spec bảng: `../02-thiet-ke-bang.md`
- Toàn vẹn + concurrency: `../03-toan-ven-concurrency.md`
- ADR: `../../02-kien-truc/decisions/ADR-001`, `ADR-002`, `ADR-003`, `ADR-006`, `ADR-007`
