# Sprint 4 — Hướng dẫn chạy migration (Path A — chưa có khách thật)

> **Bối cảnh chọn Path A**: production hiện chưa có booking thật của khách. Vì vậy đi đường ngắn — reset DB + chạy migration mới + seed lại dữ liệu mẫu. Không cần Pro plan + PITR + staging riêng + script đồng bộ dữ liệu cũ.
>
> **Khi nào dùng phiên bản đầy đủ?** Sau khi Sprint 6 (Đặt chỗ) đóng và ra mắt nội bộ → có booking khách thật → đọc `02-runbook-luc-da-co-khach.md` cho lần migration tiếp theo.

---

## Tổng quan thời gian

| Giai đoạn | Thời gian | Khi nào |
| --- | --- | --- |
| Giai đoạn 0 — Chuẩn bị | ~20 phút | Trước khi chạy |
| Giai đoạn 1 — Sửa schema + chạy migration local | ~2 tiếng | Day 1 sáng |
| Giai đoạn 2 — Sửa lại file seed | ~1 tiếng | Day 1 chiều |
| Giai đoạn 3 — Chạy migration trên Supabase production | ~15 phút | Day 1 cuối ngày |
| **Tổng** | **~3-4 tiếng** | |

---

## Giai đoạn 0 — Chuẩn bị (~20 phút)

### 0.1 Tạo branch git mới

```bash
cd travel-web
git checkout main
git pull
git checkout -b sprint-4/schema-pivot
```

### 0.2 Backup nhanh dữ liệu hiện tại (an toàn ~5 phút)

Dù chưa có khách thật, vẫn nên dump 1 bản về máy phòng khi cần xem lại:

```bash
# Lấy DATABASE_URL từ Supabase dashboard → Settings → Database → Connection string
PGPASSWORD="$SUPABASE_DB_PASSWORD" pg_dump \
  --host=db.[PROJECT].supabase.co \
  --port=5432 \
  --username=postgres \
  --dbname=postgres \
  --schema=public \
  --no-owner \
  --no-acl \
  --format=custom \
  --file=backups/before_sprint4_$(date +%Y%m%d).dump
```

File backup giữ trong `backups/` (đã có trong `.gitignore`). Nếu lỡ tay xoá dữ liệu nội bộ quan trọng, vẫn có thể `pg_restore`.

### 0.3 Verify Postgres local đang chạy

```bash
psql --version    # Đảm bảo Postgres ≥14
psql -h localhost -U postgres -d postgres -c "SELECT version();"
```

Nếu psql kết nối được → OK.

---

## Giai đoạn 1 — Sửa schema + chạy migration local (~2 tiếng)

### 1.1 Sửa `prisma/schema.prisma`

Tham khảo tài liệu chính: `travel-doc/docs/03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`

Các thay đổi cần làm (sửa thẳng vào `prisma/schema.prisma`):

**Nhóm A — Đổi kiểu ID sang UUID native (PART 0):**
- Tất cả `String @id @default(uuid())` → `String @id @default(uuid()) @db.Uuid`
- Tất cả `String @id` (không có default) → `String @id @db.Uuid`
- Tất cả khoá ngoại `String @map("..._id")` → `String @db.Uuid @map("..._id")`

**Nhóm B — Xoá Hotel Booking (PART 8):**
- Xoá model `HotelBooking` toàn bộ
- Xoá enum `BookingType`
- Xoá field `Booking.bookingType`, `Booking.checkIn`, `Booking.checkOut`
- Xoá relation `Booking.hotelBooking`

**Nhóm C — Pricing Pattern C cho Tour (PART 3):**
- Xoá field `Tour.priceFrom`, `Tour.durationText`
- Đổi `Tour.tourType` từ String → enum `TourType { SERIES PRIVATE CORPORATE }`
- Thêm field `Tour.priceAdult`, `priceChild`, `priceInfant`, `singleSupplementPrice` (đều `Decimal? @db.Decimal(14, 0)`)
- Thêm field `Tour.estimatedCost` (cho admin reporting tương lai)
- Thêm field `Tour.durationDays` (Int — thay `durationText`)

**Nhóm D — Tour Option (PART 3):**
- Thêm model `TourOption` (id, tourId, nameVi, nameEn, surchargeAdult, surchargeChild, ...)

**Nhóm E — Tour Departure (PART 4):**
- Thêm field `TourDeparture.minParticipants`, `cancellationDeadline`, `actualCostPerPax`

**Nhóm F — Tour Booking Pattern C (PART 3):**
- Xoá `TourBooking.unitPrice`, `TourBooking.participants` (vì chưa có khách, drop thẳng)
- Thêm `TourBooking.adults`, `children`, `infants`
- Thêm `TourBooking.optionId` (FK tới TourOption)
- Thêm `TourBooking.priceBreakdown` (Json — chi tiết tính tiền)
- Thêm `TourBooking.isSingleSupplement`

**Nhóm G — Booking lock (PART 4):**
- Thêm `Booking.paymentDeadline` (DateTime)

**Nhóm H — Hotel Allotment (PART 4):**
- Thêm model `HotelAllotment` (id, hotelId, periodMonth Date, allotment, ...)
- `CHECK (periodMonth = date_trunc('month', periodMonth))` — chỉ cho phép ngày đầu tháng

**Nhóm I — Room enum (PART 5):**
- Đổi `Room.roomType` từ String → enum `RoomType`

**Nhóm J — Inquiry Request (PART 7):**
- Thêm model `InquiryRequest` (id, fullName, email, phone, tourType InquiryTourType, ...)
- Thêm enum `InquiryStatus`, `InquiryTourType`

**Nhóm K — Tour Itinerary (PART 1):**
- Đổi `TourItinerary.hotelId` từ String → `String? @db.Uuid` (cho phép null + UUID)

**Nhóm L — Đổi onDelete (PART 9):**
- `Booking.userId` → `onDelete: Restrict` (không cho xoá Profile khi còn booking)
- `Review.userId` → `onDelete: Restrict`

**Nhóm M — Partial index (PART 10):**
- Prisma không support partial index trực tiếp → khai báo qua raw SQL trong migration file (xem bước 1.3)

### 1.2 Reset DB local + tạo migration mới

```bash
# Reset DB local — XOÁ HẾT DỮ LIỆU local
pnpm prisma migrate reset --force

# Tạo migration mới — Prisma tự sinh SQL từ schema vừa sửa
pnpm prisma migrate dev --name add_pricing_options_and_allotment
```

Lệnh trên sẽ:
- So sánh schema mới với DB local
- Tạo file `prisma/migrations/20260601_add_pricing_options_and_allotment/migration.sql`
- Chạy migration trên DB local
- Sinh lại Prisma Client

### 1.3 Thêm partial index thủ công (Prisma không hỗ trợ)

Mở file migration vừa sinh ở `prisma/migrations/[timestamp]_add_pricing_options_and_allotment/migration.sql`, thêm vào cuối file:

```sql
-- Partial index cho các bảng có is_active
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(slug) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tours_active        ON tours(slug)        WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_hotels_active       ON hotels(slug)       WHERE is_active = true;

-- CHECK constraint cho HotelAllotment.periodMonth
ALTER TABLE hotel_allotments
  ADD CONSTRAINT hotel_allotments_period_month_first_day
  CHECK (period_month = DATE_TRUNC('month', period_month));

-- CHECK constraint cho TourDeparture.bookedCount ≤ capacity
ALTER TABLE tour_departures
  ADD CONSTRAINT tour_departures_no_overbooking
  CHECK (booked_count <= capacity);

-- CHECK constraint cho Review polymorphism (chỉ 1 trong hotel/tour)
ALTER TABLE reviews
  ADD CONSTRAINT review_target_exclusive
  CHECK ((hotel_id IS NOT NULL)::int + (tour_id IS NOT NULL)::int = 1);

-- CHECK constraint cho SeoPage polymorphism
ALTER TABLE seo_pages
  ADD CONSTRAINT seo_pages_exclusive_target
  CHECK (
    (tour_id IS NOT NULL)::int +
    (destination_id IS NOT NULL)::int +
    (hotel_id IS NOT NULL)::int +
    (static_key IS NOT NULL)::int = 1
  );
```

Sau khi sửa file, chạy lại migration để áp dụng phần SQL bổ sung:

```bash
pnpm prisma migrate reset --force
pnpm prisma migrate dev    # apply lại với raw SQL bổ sung
```

### 1.4 Verify schema local

```bash
# Mở Prisma Studio để xem schema mới
pnpm prisma studio
```

Hoặc qua SQL:

```sql
-- Verify 1: ID columns là UUID
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE column_name = 'id' AND table_schema = 'public';
-- Tất cả phải có data_type = 'uuid'

-- Verify 2: HotelBooking đã bị xoá
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'hotel_bookings'
);
-- Kết quả: false

-- Verify 3: Bảng mới đã có
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('tour_options', 'inquiry_requests', 'hotel_allotments');
-- Kết quả: 3 dòng

-- Verify 4: Field mới trên Tour
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'tours'
  AND column_name IN ('price_adult', 'price_child', 'price_infant', 'duration_days');
-- Kết quả: 4 dòng

-- Verify 5: Partial index đã tạo
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public' AND indexname LIKE 'idx_%_active';
-- Kết quả: ≥3 dòng
```

---

## Giai đoạn 2 — Sửa lại file seed (~1 tiếng)

File `prisma/seed.ts` hiện đang seed theo schema cũ (priceFrom, durationText, ...). Cần sửa để khớp schema mới.

### 2.1 Các thay đổi chính trong `seed.ts`

```typescript
// CŨ
await prisma.tour.create({
  data: {
    nameVi: 'Tour Đà Lạt 3N2Đ',
    priceFrom: 5_000_000,
    durationText: '3 ngày 2 đêm',
    tourType: 'SERIES',  // string
    // ...
  }
})

// MỚI
await prisma.tour.create({
  data: {
    nameVi: 'Tour Đà Lạt 3N2Đ',
    priceAdult: 5_000_000,
    priceChild: 3_500_000,
    priceInfant: 0,
    singleSupplementPrice: 2_000_000,
    durationDays: 3,
    tourType: TourType.SERIES,  // enum
    estimatedCost: 3_000_000,
    // ...
    tourOptions: {
      create: [
        { nameVi: 'Tiêu chuẩn', surchargeAdult: 0, surchargeChild: 0 },
        { nameVi: 'Cao cấp', surchargeAdult: 1_000_000, surchargeChild: 500_000 },
      ],
    },
  }
})
```

### 2.2 Thêm sample InquiryRequest

```typescript
await prisma.inquiryRequest.create({
  data: {
    fullName: 'Nguyễn Văn A',
    email: 'demo@example.com',
    phone: '0901234567',
    tourType: InquiryTourType.PRIVATE,
    groupSize: 8,
    preferredDate: new Date('2026-07-15'),
    message: 'Đoàn gia đình 8 người đi Đà Lạt 3 ngày',
    status: InquiryStatus.NEW,
  }
})
```

### 2.3 Chạy seed

```bash
pnpm prisma db seed
```

### 2.4 Kiểm tra dữ liệu

```bash
pnpm prisma studio
# Mở browser → click vào Tour → verify priceAdult, priceChild, durationDays đã có
# Click InquiryRequest → verify có row sample
```

---

## Giai đoạn 3 — Chạy migration trên Supabase production (~15 phút)

> Vì chưa có khách thật → không cần maintenance window phức tạp, không cần thông báo fanpage. Vẫn nên báo nhóm nội bộ (nếu có).

### 3.1 Chuẩn bị

```bash
# Set DATABASE_URL trỏ tới Supabase production
# Lấy từ Supabase dashboard → Settings → Database
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### 3.2 Backup snapshot Supabase (đề phòng)

Supabase Free plan có daily backup tự động. Trước khi apply, vào dashboard → Database → Backups → confirm có backup mới nhất ≤24h.

Nếu muốn chắc chắn, dump 1 bản tay (giống bước 0.2 nhưng dùng connection production).

### 3.3 Apply migration

```bash
# Xem trước SQL nào sẽ chạy
pnpm prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script

# Apply thật
pnpm prisma migrate deploy

# Sinh lại Prisma Client cho production build
pnpm prisma generate
```

### 3.4 Verify production

Chạy lại 5 query verify ở Giai đoạn 1.4, nhưng connect tới Supabase production.

### 3.5 Smoke test web

- Đăng nhập admin → list tours → load OK
- Tạo 1 destination test → save → verify DB qua Prisma Studio
- Public page `/diem-den` load OK
- Public page `/tours` load OK
- Đăng ký user mới → đăng nhập OK

Nếu cả 5 đều OK → migration thành công.

---

## Khôi phục (chỉ dùng khi migration hỏng giữa chừng)

### Trên local

```bash
pnpm prisma migrate reset --force
git checkout main -- prisma/schema.prisma
pnpm prisma migrate deploy
pnpm prisma db seed
```

### Trên production Supabase

1. Vào Supabase dashboard → Database → Backups → chọn backup ngay trước migration → Restore
2. Đợi ~5-10 phút
3. Revert code: `git revert HEAD` rồi `vercel deploy --prod`

Vì chưa có khách thật → tệ nhất là mất dữ liệu seed nội bộ, làm lại bằng `pnpm prisma db seed`.

---

## Sau khi xong

- [ ] Commit `prisma/schema.prisma` + `prisma/migrations/[timestamp]_add_pricing_options_and_allotment/`
- [ ] Commit `prisma/seed.ts` đã refactor
- [ ] Push branch `sprint-4/schema-pivot`
- [ ] Cập nhật `trang-thai-web.md` đánh dấu S4-01 = Done
- [ ] Thêm entry vào `99-tham-khao/changelog.md`
- [ ] Bắt đầu task S4-02 (dọn code ref `HotelBooking` + `bookingType`)

---

## Liên kết

- Spec migration chi tiết SQL: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Quy trình migration tổng quát: `../../03-co-so-du-lieu/04-quy-trinh-migration.md`
- Test plan: `03-test-plan.md`
- Stories: `01-stories.md`
- Runbook đầy đủ (cho post-launch): `02-runbook-luc-da-co-khach.md`
