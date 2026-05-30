# 04 — Quy trình migration

> **Vai trò đọc**: DBA, dev viết migration — biết quy trình từ design → audit → apply → rollback.
> **Quy tắc số 1**: schema sai sau khi production có data đắt gấp 10 lần fix ở thời điểm design. → Mọi migration phải có **audit pre-flight** + **rollback plan**.

---

## 1. Loại migration & strategy

| Loại | Ví dụ | Strategy |
| --- | --- | --- |
| **Additive** | Thêm bảng, thêm cột nullable, thêm index | Apply trực tiếp, rollback chỉ cần DROP |
| **Destructive** | DROP bảng, DROP cột, ALTER COLUMN TYPE | Cần audit data + backup + rollback script. KHÔNG combine với additive trong cùng PR |
| **Mixed** (additive + destructive) | Migration lớn theo pivot (vd `add_pricing_options_and_allotment`) | Tách thành **PART**: PART đầu = additive, PART cuối = destructive. Audit + rollback per-PART |
| **Data migration** | Backfill cột mới từ cột cũ trước khi DROP cũ | Tách thành migration riêng, chạy giữa 2 schema migration |

---

## 2. Quy trình đầy đủ (8 bước)

### Bước 1 — Design

- Update doc TRƯỚC code:
  - `02-thiet-ke-bang.md`: thay đổi field
  - `01-erd-tong-quan.md`: thay đổi cascade matrix nếu đụng FK
  - `03-toan-ven-concurrency.md`: thay đổi CHECK/index convention
- Viết file migration mới: `migrations/YYYY-MM-DD_<ten>.md`
  - Tên tả ý đồ: `add_pricing_options_and_allotment`, `fix_cascade_user_booking`
  - KHÔNG vague: `update_schema`, `misc_changes`

### Bước 2 — Prisma schema update

- Sửa `travel-web/prisma/schema.prisma`
- Tuân thủ:
  - `@db.Uuid` cho mọi ID/FK (ADR-003)
  - `@map("snake_case")` cho mọi field
  - `onDelete` + `onUpdate` tường minh
- KHÔNG chạy `prisma migrate dev` ngay — chờ audit ở bước 3

### Bước 3 — Pre-flight audit

Mục đích: catch data hiện tại không hợp lệ TRƯỚC khi `ALTER` (vì ALTER có CHECK sẽ fail trên data lỗi).

**Mọi migration destructive phải có audit script** dạng:

```sql
-- AUDIT cho migration `add_pricing_options_and_allotment` PART 0
-- Kiểm tra: tất cả id columns có phải UUID format hợp lệ?

DO $$
DECLARE
  bad_count INT;
BEGIN
  -- Tables có id column
  SELECT COUNT(*) INTO bad_count
  FROM profiles
  WHERE id !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  IF bad_count > 0 THEN
    RAISE EXCEPTION 'AUDIT FAIL: profiles.id has % rows với format không phải UUID', bad_count;
  END IF;

  -- ... lặp cho từng bảng + FK column
END $$;
```

Nếu audit FAIL → fix data trước khi apply migration.

### Bước 4 — Apply migration trên staging

```bash
# 1. Snapshot staging DB
pg_dump -Fc staging-db > backup_before_<migration_name>.dump

# 2. Chạy audit script
psql staging-db < migrations/<date>_<name>/audit.sql

# 3. Apply migration
cd travel-web
npx prisma migrate deploy

# 4. Verify
npx prisma db pull          # Schema khớp với introspection?
npx prisma validate
```

### Bước 5 — Smoke test

Test các flow chính sau khi migrate:
- Login (Supabase Auth — đặc biệt nếu đụng `Profile`)
- Create/List tour
- Create booking
- Cron auto-cancel
- Admin dashboard

→ Nếu fail → rollback (bước 8).

### Bước 6 — Code review

PR phải có:
- File migration `.sql` (Prisma auto-generate trong `prisma/migrations/`)
- File doc `migrations/YYYY-MM-DD_<ten>.md` (mô tả intent + audit + rollback)
- Audit script
- Rollback script
- Test plan
- Sign-off của Tech Lead

→ Checklist code review: xem mục 6 trong `03-toan-ven-concurrency.md`.

### Bước 7 — Apply production

- Chỉ sau khi staging xanh ≥24h
- Backup full DB
- Off-peak hour
- Có người monitor trong 30 phút sau apply

### Bước 8 — Rollback (nếu cần)

**Rollback script** phải có sẵn cho mọi migration destructive:

```sql
-- ROLLBACK cho PART 9: Cascade Restrict → Cascade
ALTER TABLE bookings DROP CONSTRAINT bookings_user_id_fkey;
ALTER TABLE bookings
  ADD CONSTRAINT bookings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id)
    ON DELETE CASCADE ON UPDATE CASCADE;
```

**Nếu rollback bằng Prisma**:
```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Apply previous schema
git checkout <previous-commit> prisma/schema.prisma
npx prisma migrate deploy
```

---

## 3. Quy ước cho migration lớn (multi-PART)

Khi 1 pivot scope cần nhiều thay đổi (vd `add_pricing_options_and_allotment` có 10 PART), tổ chức theo nguyên tắc:

```
PART 0  — Type alignment (TEXT → UUID)        [destructive, chạy đầu]
PART 1  — Enums mới
PART 2  — Tables mới (additive)
PART 3  — Cột mới nullable trong bảng cũ (additive)
PART 4  — Data backfill (vd duration_nights = duration_days - 1)
PART 5  — Cột mới NOT NULL (sau backfill)
PART 6  — CHECK constraints mới
PART 7  — Indexes mới
PART 8  — DROP cũ (destructive)
PART 9  — Cascade fix (FK ALTER)
PART 10 — Convert old indexes (full → partial)
```

**Lý do thứ tự**: destructive PART 0 + PART 8/9 đặt biệt lập với additive — dễ rollback từng phần.

**Lưu ý chạy theo thứ tự**: PART 0 (UUID alignment) phải chạy TRƯỚC tất cả PART khác vì các PART sau assume column type là UUID.

---

## 4. Cấu trúc file migration doc

Mỗi migration ở `migrations/YYYY-MM-DD_<ten>.md` phải có:

```markdown
# Migration: <tên ngắn> (YYYY-MM-DD)

## Mục tiêu
<1-2 câu>

## Phạm vi (PART list nếu lớn)
- PART 0 — ...
- PART 1 — ...

## Trace tới ADR
- ADR-XXX (link)

## Pre-flight audit
```sql
-- audit script
```

## SQL chi tiết
### PART 0
```sql
-- migration SQL
```
...

## Prisma schema delta
```prisma
// Trước
// Sau
```

## Smoke test plan
- [ ] Login
- [ ] Create tour
- [ ] ...

## Rollback plan
```sql
-- rollback SQL
```

## Notes
- Downtime estimate
- Risk note
```

---

## 5. Anti-pattern tránh

| Anti-pattern | Hệ quả | Đúng |
| --- | --- | --- |
| Combine additive + destructive trong 1 migration small | Rollback đau, rất khó debug | Tách 2 migration |
| `prisma migrate dev` trực tiếp production | Lost data | Luôn `prisma migrate deploy` |
| Không backup trước migration destructive | Không rollback được nếu fail | `pg_dump` BẮT BUỘC |
| Đặt tên migration vague (`misc_fix`, `update_2`) | 6 tháng sau không trace được | Tên tả ý đồ |
| Cascade `onDelete: Cascade` cho FK đến `Profile` | Tax audit fail, mất revenue history | `Restrict` cho Booking/Review (ADR-007) |
| `String @id @default(uuid())` không `@db.Uuid` | Cột TEXT silent — mất performance + join auth.users fail | `@db.Uuid` (ADR-003) |
| Index trên `is_active` Boolean full column | Postgres bỏ qua, Seq Scan | Partial `WHERE is_active = true` |

---

## 6. Migration history

| Ngày | Migration | Status | Notes |
| --- | --- | --- | --- |
| 2026-03-26 | `init_database` | ✅ Applied | Schema ban đầu — **lỡ không có `@db.Uuid`** → trigger migration `add_pricing_options_and_allotment` PART 0 |
| 2026-05-27 | `add_pricing_options_and_allotment` | ⏳ Pending | 10 PART — pivot V-05/V-08/V-09/V-10/V-12 + Type alignment + Cascade fix + Partial index |

---

## Liên kết

- Migration kế tiếp: `migrations/2026-05-27_add_pricing_options_and_allotment.md`
- ERD overview: `01-erd-tong-quan.md`
- Spec bảng: `02-thiet-ke-bang.md`
- Toàn vẹn + concurrency: `03-toan-ven-concurrency.md`
