# Sprint 4 — Migration Runbook

> **Mục đích**: hướng dẫn thực thi step-by-step cho story **S4-01 Apply migration**. Đọc file này trước khi chạm DB.
>
> **Đối tượng**: Tech Lead + dev có quyền access Supabase.
> **Khi đọc**: trước Day 1 của sprint, ôn lại Day 4 (apply prod).

---

## Phase 0 — Pre-flight (Day -2 đến Day 0)

### 0.1 Verify Supabase Pro plan + PITR enabled

PITR (Point-in-time recovery) chỉ available với Pro plan trở lên. Free tier chỉ có daily backup, **không đủ** cho rollback granular.

**Steps:**

1. Đăng nhập Supabase dashboard → Project prod
2. Settings → Billing → verify "Pro plan" hoặc upgrade
3. Database → Backups → verify "Point-in-time recovery: Enabled" với window ≥7 ngày
4. Nếu chưa enable → click Enable, đợi ~15 phút
5. Test PITR: tạo throwaway project + restore từ PITR snapshot mới nhất → confirm restore work

**Cost note**: Pro $25/tháng, PITR 7 ngày miễn phí Pro plan.

### 0.2 Tạo Supabase staging project

1. Supabase dashboard → New Project
2. Tên: `vivu-staging`, region cùng region với prod (latency tương tự)
3. Plan: Pro (để có Branching nếu cần sau này, hoặc Free nếu cost-conscious)
4. Wait ~2 phút deploy xong
5. Settings → Database → copy `Connection string (URI)` cho `.env.staging`:

```bash
# .env.staging (KHÔNG commit)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 0.3 Dump production + import staging

**Step A — Dump prod** (chạy ở máy local có quyền):

```bash
# Trong terminal prod-access
PGPASSWORD="$PROD_DB_PASSWORD" pg_dump \
  --host=db.[PROD_PROJECT].supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema=public \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=prod_dump_$(date +%Y%m%d_%H%M%S).dump

# File ~5-50 MB tuỳ data
```

**Step B — Restore vào staging:**

```bash
PGPASSWORD="$STAGING_DB_PASSWORD" pg_restore \
  --host=db.[STAGING_PROJECT].supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --no-owner \
  --no-acl \
  --clean --if-exists \
  prod_dump_xxx.dump

# Time: ~2-5 phút tuỳ size
```

**Step C — Verify staging**:

```sql
-- Connect staging DB qua Supabase SQL Editor
SELECT
  (SELECT COUNT(*) FROM profiles) AS profiles_count,
  (SELECT COUNT(*) FROM destinations) AS destinations_count,
  (SELECT COUNT(*) FROM tours) AS tours_count,
  (SELECT COUNT(*) FROM bookings) AS bookings_count,
  (SELECT COUNT(*) FROM hotels) AS hotels_count;
```

So sánh với prod (chạy cùng query) → row count phải khớp ±10 (tolerance cho data thay đổi giữa lúc dump).

### 0.4 Run pre-flight audit script trên staging

Mục đích: xác nhận data hiện tại không vi phạm constraint mới (UUID format, FK consistency).

```sql
-- Audit 1: All TEXT id phải đúng format UUID
SELECT 'profiles' AS table_name, id FROM profiles
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
UNION ALL
SELECT 'destinations', id FROM destinations
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
UNION ALL
SELECT 'tours', id FROM tours
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
UNION ALL
SELECT 'bookings', id FROM bookings
WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
-- Expected: 0 row. Nếu có row → ID không phải UUID → cần regen ID trước migration.

-- Audit 2: FK consistency — tất cả booking có user_id tồn tại trong profiles
SELECT 'orphan booking' AS issue, b.id
FROM bookings b
LEFT JOIN profiles p ON p.id = b.user_id
WHERE p.id IS NULL;
-- Expected: 0 row.

-- Audit 3: HotelBooking sẽ bị drop ở PART 8 — verify không có booking PENDING/PAID còn ref hotel
SELECT b.id, b.status FROM bookings b
INNER JOIN hotel_bookings hb ON hb.booking_id = b.id
WHERE b.status IN ('PENDING', 'PAID', 'CONFIRMED');
-- Expected: 0 row HOẶC nếu có thì manual settle/cancel trước migration.

-- Audit 4: Booking type = 'TOUR' phải có tour_booking; type = 'HOTEL' phải có hotel_booking
SELECT b.id, b.booking_type FROM bookings b
LEFT JOIN tour_bookings tb ON tb.booking_id = b.id
LEFT JOIN hotel_bookings hb ON hb.booking_id = b.id
WHERE (b.booking_type = 'TOUR' AND tb.id IS NULL)
   OR (b.booking_type = 'HOTEL' AND hb.id IS NULL);
-- Expected: 0 row.

-- Audit 5: Booking PENDING/PAID/CONFIRMED còn open — sẽ bị ảnh hưởng bởi schema change
-- (drop bookingType, drop checkIn/checkOut, rename TourBooking.unitPrice/participants → priceBreakdown)
SELECT
  b.id,
  b.status,
  b.booking_type,
  b.created_at,
  b.guest_name,
  b.guest_email
FROM bookings b
WHERE b.status IN ('PENDING', 'PAID', 'CONFIRMED');
-- Expected: 0 row LÝ TƯỞNG.
-- Nếu có row > 0:
--   * PENDING quá 24h → admin manual cancel trên prod TRƯỚC migration
--   * PAID/CONFIRMED → KHÔNG được drop. Phải migrate priceBreakdown cho các row này
--     (xem Phase 1.X "Backfill data" bước 4)
--   * Nếu booking_type = 'HOTEL' và status PAID/CONFIRMED → STOP. Liên hệ
--     khách settle trước migration (refund hoặc convert sang tour booking).

-- Audit 6: Tour cũ có priceFrom NULL không?
SELECT COUNT(*) FROM tours WHERE price_from IS NULL OR price_from = 0;
-- Expected: 0. Nếu > 0 → admin nhập lại priceFrom trước migration
-- (vì sẽ backfill priceAdult từ priceFrom).
```

**Quyết định:**
- ✅ Tất cả audit pass → tiếp Phase 1
- ❌ Có row vi phạm → fix trên prod TRƯỚC khi pivot (vd: regen ID, settle hotel booking pending), rồi re-dump vào staging

---

## Phase 0.5 — Data backfill plan (Day 0)

> **Lý do**: Schema mới có field NOT NULL (`tours.price_adult`) hoặc thay đổi semantics (`TourBooking.unitPrice/participants` → `priceBreakdown`). Data cũ phải được backfill TRONG migration để không break booking flow ngay sau apply.

### 0.5.1 Tour pricing backfill (sau PART 3, trước PART 8)

Migration file `migration.sql` sẽ có thứ tự:

```
PART 0: TEXT → UUID
PART 1: TourItinerary.hotelId
PART 2: Cost tracking
PART 3: Add pricing fields (priceAdult/Child/Infant/singleSupplement) — NULLABLE để backfill
**PART 3.5: BACKFILL** ← thêm bước này
PART 4: Risk management
... (các PART khác)
PART 8: Drop HotelBooking + bookingType
... (các PART còn lại)
PART 11: ALTER COLUMN priceAdult NOT NULL ← thêm sau PART 3.5
```

**SQL backfill (PART 3.5)**:

```sql
-- Backfill priceAdult, priceChild, priceInfant, singleSupplementPrice từ priceFrom cũ
-- Default ratio: child = 70% adult, infant = 0, single supplement = 40% adult
UPDATE tours
SET
  price_adult              = COALESCE(price_from, 0),
  price_child              = ROUND(COALESCE(price_from, 0) * 0.7),
  price_infant             = 0,
  single_supplement_price  = ROUND(COALESCE(price_from, 0) * 0.4)
WHERE price_adult IS NULL;

-- Verify
SELECT COUNT(*) AS tours_with_null_price_adult
FROM tours WHERE price_adult IS NULL;
-- Expected: 0
```

**SQL constraint (PART 11)**:

```sql
ALTER TABLE tours ALTER COLUMN price_adult SET NOT NULL;
ALTER TABLE tours ALTER COLUMN price_child SET NOT NULL;
ALTER TABLE tours ALTER COLUMN price_infant SET NOT NULL;
-- single_supplement_price giữ nullable (tour không bắt buộc có)

ALTER TABLE tours
ADD CONSTRAINT tours_pricing_positive_check
CHECK (price_adult > 0 AND price_child >= 0 AND price_infant >= 0);
```

> **Note**: Sau backfill, admin nên rà soát lại các tour và điều chỉnh `priceChild` thực tế nếu khác 70% (vd các tour đặc biệt). Đây là task cleanup sau Sprint 4, không block migration.

### 0.5.2 TourBooking backfill (sau PART 3.5)

`TourBooking.unitPrice × participants` → `priceBreakdown` JSON.

Strategy: **Giữ cột cũ, thêm cột mới, KHÔNG drop cột cũ trong sprint này** (đảm bảo backward compat trong giai đoạn rollout).

```sql
-- PART 3.6: Add priceBreakdown JSON column nullable
ALTER TABLE tour_bookings ADD COLUMN price_breakdown JSONB;
ALTER TABLE tour_bookings ADD COLUMN adults INT;
ALTER TABLE tour_bookings ADD COLUMN children INT DEFAULT 0;
ALTER TABLE tour_bookings ADD COLUMN infants INT DEFAULT 0;
ALTER TABLE tour_bookings ADD COLUMN option_id UUID REFERENCES tour_options(id);
ALTER TABLE tour_bookings ADD COLUMN is_single_supplement BOOLEAN DEFAULT FALSE;

-- Backfill: assume tất cả participants cũ là adults
UPDATE tour_bookings tb
SET
  adults = tb.participants,
  children = 0,
  infants = 0,
  is_single_supplement = FALSE,
  price_breakdown = jsonb_build_object(
    'adults', jsonb_build_object(
      'count', tb.participants,
      'unitPrice', tb.unit_price,
      'subtotal', tb.unit_price * tb.participants
    ),
    'children', jsonb_build_object('count', 0, 'unitPrice', 0, 'subtotal', 0),
    'infants', jsonb_build_object('count', 0, 'unitPrice', 0, 'subtotal', 0),
    'option', NULL,
    'singleSupplement', NULL,
    'total', tb.unit_price * tb.participants,
    '_backfilled', true
  )
WHERE adults IS NULL;

ALTER TABLE tour_bookings ALTER COLUMN adults SET NOT NULL;
ALTER TABLE tour_bookings ALTER COLUMN price_breakdown SET NOT NULL;

-- KHÔNG drop unit_price + participants ở sprint này (defer Sprint 4 cuối khi confidence cao)
```

> **Decision**: Cột `unit_price` + `participants` được giữ lại làm "shadow" trong Sprint 4. Sau Sprint 4 confirm flow ổn định ≥2 tuần thì mới drop. Đây là pattern **expand-contract** migration để giảm risk.

### 0.5.3 Booking PENDING active

Nếu Audit 5 phát hiện booking PENDING active:

| Status | Hành động trước migration |
| --- | --- |
| PENDING > 24h | Auto-cancel trên prod (`UPDATE bookings SET status = 'CANCELLED' WHERE status = 'PENDING' AND created_at < NOW() - INTERVAL '24 hours'`) |
| PENDING < 24h | Đợi user complete hoặc manual contact |
| PAID/CONFIRMED | Backfill priceBreakdown bình thường (nội dung schema cũ vẫn map được) |

---

## Phase 1 — Apply migration trên staging (Day 1)

### 1.1 Update Prisma schema

```bash
cd travel-web
git checkout -b sprint-4/migration-pivot
```

Update `prisma/schema.prisma` theo Prisma delta trong file:
`travel-doc/docs/03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` mục "Prisma schema delta".

Highlight:
- Mọi `String @id` → `String @id @db.Uuid @default(...)`
- Mọi FK `String @map("..._id")` → `String @db.Uuid @map("..._id")`
- Drop `HotelBooking` model + relation Booking.hotelBooking
- Drop `BookingType` enum
- Drop fields `Booking.bookingType`, `Booking.checkIn`, `Booking.checkOut`
- Add Tour fields `priceAdult/priceChild/priceInfant/singleSupplementPrice/estimatedCost`
- Add `TourOption` model
- Add `TourDeparture.minParticipants/cancellationDeadline/actualCostPerPax`
- Drop `Tour.priceFrom/durationText/tourType` (string)
- Add `Tour.tourType` (enum TourType: SERIES/PRIVATE/CORPORATE)
- Add `InquiryRequest` model + enums InquiryStatus, InquiryTourType
- Add `HotelAllotment` model
- Add `Room.roomType` enum
- Add `TourBooking` fields `adults/children/infants/optionId/priceBreakdown/isSingleSupplement`
- Add `Booking.paymentDeadline`
- Drop `TourBooking.unitPrice/participants` (replace bằng adults/children/infants + breakdown)
- Convert `Profile→Booking/Review` từ Cascade → Restrict

### 1.2 Generate migration SQL

```bash
# KHÔNG dùng prisma migrate dev (sẽ lose data)
# Tạo migration manual với SQL từ migration spec
mkdir -p prisma/migrations/20260601000000_add_pricing_options_and_allotment
cp ../travel-doc/docs/03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md /tmp/migration-spec.md
# Copy phần SQL từ PART 0..10 vào file:
nano prisma/migrations/20260601000000_add_pricing_options_and_allotment/migration.sql
```

**Quan trọng**: SQL phải theo thứ tự **PART 0 → 1 → 2 → ... → 10**. PART 0 là TYPE conversion, các PART khác phụ thuộc vào nó.

### 1.3 Apply trên staging

```bash
# Set env
export DATABASE_URL="$STAGING_DATABASE_URL"
export DIRECT_URL="$STAGING_DIRECT_URL"

# Dry run xem SQL nào sẽ chạy (không thực sự apply)
pnpm prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Apply
pnpm prisma migrate deploy

# Generate Prisma Client mới
pnpm prisma generate
```

**Dự kiến time**: 2-10 phút tuỳ data size (PART 0 ALTER COLUMN TYPE UUID là chậm nhất).

### 1.4 Smoke test trên staging

→ Xem `03-test-plan.md` mục "Migration smoke test" (10 case).

### 1.5 Soak test 48h

- Deploy `travel-web` lên Vercel preview với env staging
- Chạy thật trong 48h: admin login, browse, tạo 1 inquiry, tạo 1 tour mới
- Monitor Supabase logs: nếu có error 500 hoặc constraint violation → debug, fix migration
- Monitor Vercel logs: same

**Pass condition**: 48h không có error blocking + tất cả smoke test re-run vẫn pass.

---

## Phase 2 — Apply migration trên production (Day 2)

### 2.1 Schedule maintenance window

- Chọn thời điểm low traffic (vd: 2-3 giờ sáng VN)
- Estimate downtime: ~30-60 phút (production có ít data, sẽ nhanh hơn staging vì data thật còn nhỏ)
- Announce trên fanpage Vivu Travel + email subscriber: "Bảo trì hệ thống từ 2h-3h sáng [ngày]"
- Update status page (nếu có) hoặc landing page banner: "Đang bảo trì"

### 2.2 Pre-deploy checklist

- [ ] PITR snapshot taken (verify trên Supabase dashboard, ngay trước khi apply)
- [ ] Vercel: ENABLE maintenance mode (env `MAINTENANCE_MODE=true`) → middleware redirect tới `/bao-tri`
- [ ] Notify team Slack/Telegram: "Migration starting"
- [ ] Backup `prod_dump_pre_migration_<date>.dump` lưu offline (S3 hoặc local)
- [ ] DNS không thay đổi
- [ ] Vercel deployment đã build xong với code branch `sprint-4/migration-pivot` ở preview

### 2.3 Apply

```bash
export DATABASE_URL="$PROD_DATABASE_URL"
export DIRECT_URL="$PROD_DIRECT_URL"

# Re-run pre-flight audit lần cuối trên prod
psql "$PROD_DATABASE_URL" -f /path/to/preflight-audit.sql
# Verify all 4 audits return 0 row

# Apply migration
pnpm prisma migrate deploy

# Wait until exit 0 — DO NOT INTERRUPT
```

### 2.4 Post-deploy verification (≤15 phút)

```sql
-- Verify 1: tất cả ID column type = uuid
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name LIKE '%id%'
  AND table_schema = 'public'
  AND data_type = 'text';
-- Expected: 0 row (tất cả phải là 'uuid')

-- Verify 2: HotelBooking table dropped
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'hotel_bookings'
);
-- Expected: false

-- Verify 3: New tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tour_options', 'inquiry_requests', 'hotel_allotments');
-- Expected: 3 row

-- Verify 4: New columns trên Tour
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tours'
  AND column_name IN ('price_adult', 'price_child', 'price_infant', 'single_supplement_price', 'estimated_cost');
-- Expected: 5 row

-- Verify 5: Partial indexes created
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%_active';
-- Expected: ≥3 row (destinations, tours, hotels)

-- Verify 6: CHECK constraints created
SELECT conname FROM pg_constraint
WHERE contype = 'c' AND conname LIKE '%_check';
-- Expected: ≥6 row (review_target_exclusive, seo_pages_exclusive_target, departure_no_overbooking, etc.)
```

### 2.5 Smoke test prod (≤15 phút)

- Đăng nhập admin → list tours → load OK
- Tạo 1 destination test → save → verify DB
- Public page `/diem-den` load OK
- Public page `/tours` load OK
- Logout → đăng ký user mới → login OK

**Pass condition**: 5/5 smoke pass + Verify 1-6 đều OK.

### 2.6 Disable maintenance mode

```bash
# Vercel
vercel env rm MAINTENANCE_MODE production
# Hoặc set MAINTENANCE_MODE=false
vercel deploy --prod
```

### 2.7 Post-deploy monitoring (24h)

- Slack alert error rate > 1% → page Tech Lead
- Sentry watchlist: any new error type
- Supabase dashboard: query slow > 500ms

---

## Rollback (CHỈ dùng khi migration fail)

### Quy tắc:
- KHÔNG rollback nếu migration đã chạy 100% và chỉ smoke test fail. Fix forward.
- CHỈ rollback nếu migration fail giữa chừng (PART X SQL error) → DB nửa nạc nửa mỡ.

### Trigger rollback:
- 🔴 Migration báo error giữa chừng + DB không nhất quán
- 🔴 Smoke test fail >50% case
- 🔴 Application crash 5xx > 30% trong 10 phút sau deploy

### Steps:

#### Phương án A: PITR (recommended cho prod)

1. Tech Lead announce Slack: "Rollback initiating"
2. Vercel: ENABLE maintenance mode lại
3. Supabase dashboard → Database → Backups → Point-in-time recovery
4. Chọn timestamp **ngay TRƯỚC khi apply migration** (vd: 2h30 nếu apply lúc 2h35)
5. Click Restore → confirm
6. Wait ~5-10 phút Supabase restore
7. Update Vercel env DATABASE_URL nếu Supabase đổi (thường không)
8. Verify post-restore: row count = trước migration, hotel_bookings table tồn tại lại
9. Revert code Vercel: `vercel rollback` về commit trước branch pivot
10. Disable maintenance mode
11. Slack post-mortem: nguyên nhân, fix migration, plan retry

**Time**: 15-30 phút.

#### Phương án B: pg_restore (nếu PITR không work)

1. `psql "$PROD_DATABASE_URL" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`
2. `pg_restore` từ `prod_dump_pre_migration_<date>.dump`
3. Steps 8-11 như A

**Time**: 30-60 phút (chậm hơn PITR).

---

## Lessons learned template

Sau khi sprint xong, fill phần này vào `04-retro.md`:

```markdown
## What went well
- ...

## What didn't
- ...

## Action items cho lần sau
- ...

## Migration time actual
- Staging apply: X phút
- Prod apply: Y phút
- Total downtime: Z phút
```

---

## Liên kết

- Migration spec đầy đủ SQL: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Quy trình migration tổng thể: `../../03-co-so-du-lieu/04-quy-trinh-migration.md`
- Test plan: `03-test-plan.md`
- Stories: `01-stories.md`
