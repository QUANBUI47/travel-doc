# ADR-003: UUID native type cho toàn schema

- **Status**: Accepted
- **Ngày**: 2026-05-27
- **Người duyệt**: Tech Lead + Founder

---

## Context

Schema init bằng `prisma migrate` lỡ KHÔNG khai báo `@db.Uuid` ở mọi `String @id`. Hệ quả silent:

- Prisma sinh column type `TEXT` thay vì `UUID` (Postgres không native UUID nếu không tường minh)
- `Profile.id` của Vivu là TEXT, nhưng Supabase `auth.users.id` là UUID native
- Join cross-table mất type safety, phải CAST khi raw query
- Storage: TEXT hex 36 bytes vs UUID 16 bytes
- Index B-tree TEXT chậm hơn UUID ~30%

User phát hiện khi đọc doc có `Profile.id String` mà FK `Booking.userId UUID` — không khớp.

---

## Decision

**Mọi PK + FK ID column dùng PostgreSQL `UUID` native, Prisma khai báo tường minh `@db.Uuid`.**

### Quy ước

```prisma
// ĐÚNG
model Tour {
  id            String  @id @default(uuid()) @db.Uuid
  destinationId String  @map("destination_id") @db.Uuid
}

// SAI
model Tour {
  id            String  @id @default(uuid())   // sinh column TEXT, silent
  destinationId String  @map("destination_id")  // sinh column TEXT
}
```

### Đặc biệt `Profile.id`

```prisma
model Profile {
  id  String  @id @db.Uuid    // KHÔNG có @default(uuid())
}
```

Lý do: `Profile.id` phải = `auth.users.id` từ Supabase (set thủ công bởi `ensureUserProfile()`). Nếu để `@default(uuid())` → mỗi user generate UUID mới → mất khớp Supabase → login flow vỡ.

### Migration alignment

PART 0 của migration `add_pricing_options_and_allotment` thực hiện `ALTER COLUMN TYPE UUID` cho:
- 16 bảng `id` column (trừ `home_settings` singleton)
- ~18 FK ID column
- `SET DEFAULT uuid_generate_v4()` ở DB-side (thay client-side Prisma)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE profiles ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE bookings ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
-- ... (xem migration PART 0)

ALTER TABLE regions ALTER COLUMN id SET DEFAULT uuid_generate_v4();
-- profiles.id KHÔNG có default
```

→ Migration: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` PART 0.

---

## Consequences

### Tốt

- Type safety: PostgreSQL từ chối insert string không phải UUID format
- Index B-tree nhanh hơn ~30%
- Storage giảm: 16 bytes vs 36 bytes
- Native join với Supabase `auth.users` không CAST
- Self-documenting: `@db.Uuid` đọc là biết ngay loại column

### Trade-off

- Phải apply migration destructive `ALTER COLUMN TYPE` cho mọi bảng (Phase 1 chưa có production data nên không downtime)
- Phase 1.5+ nếu cần ALTER TYPE tương tự cho production phải plan blue-green

### Hệ quả kỹ thuật

- Code task phát sinh: update `prisma/schema.prisma` thêm `@db.Uuid` cho mọi `String @id` + FK ID (16 model + ~18 column)
- Mọi raw query có ID phải dùng `::uuid` cast khi cần (`WHERE id = ${id}::uuid`)
- Pre-flight audit script: regex check tất cả ID/FK đã ở UUID format trước khi ALTER

---

## Alternatives đã cân nhắc

### A. Giữ TEXT, ép app validate UUID format (rejected)

- Mất performance + storage advantage
- Vẫn cần CAST khi join Supabase auth → defeats purpose
- Easy to break ở refactor sau

### B. Chuyển sang `bigint` auto-increment (rejected)

- Mất ưu thế distributed-friendly (UUID không cần coordination)
- Lộ thông tin theo số id sequence (security)
- Không match Supabase Auth UUID

---

## Liên kết

- Quy ước trong DB integrity: `../../03-co-so-du-lieu/03-toan-ven-concurrency.md` mục Type convention
- Migration PART 0: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Risk register: `../../00-san-pham/04-lo-trinh-phat-hanh.md` (R-13)
