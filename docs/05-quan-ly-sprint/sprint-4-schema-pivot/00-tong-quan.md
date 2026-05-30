# Sprint 4 — Schema Pivot

> **Lý do tồn tại**: Sau khi finalize bộ doc v2.0 (D1-D5 hoàn thành 2026-05-27), audit code `travel-web` phát hiện schema hiện tại đang lệch ADR-001..006 ở 7 chỗ quan trọng. Nếu bỏ qua đi thẳng Sprint 4 Booking → code sẽ rework chắc chắn.
>
> Sprint 4 = "pivot sprint" để align schema + code core với ADR mới **trước khi** đi tiếp Sprint 4.

**Sprint code**: S4
**Loại sprint**: Pivot / Refactor (không add feature mới ngoài `InquiryRequest`)
**Thời gian dự kiến**: 2 tuần (10 ngày làm việc)
**Effort dev ước tính**: 9-13 ngày dev
**Owner**: Solo dev (Founder kiêm Tech Lead + PM + Dev). Code review = tự review theo `04-phat-trien/01-quy-chuan-lap-trinh.md` + DoD checklist từng story.
**Pre-req hoàn thành trước khi start**:
- ✅ Doc v2.0 (D1-D5) đã chốt
- ✅ Migration `add_pricing_options_and_allotment` đã spec đầy đủ 10 PART (`03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`)
- ✅ Sprint 4 spec 4 file (`00-tong-quan / 01-stories / 02-runbook / 03-test-plan`) đã chốt 2026-05-30
- ✅ Wireframe Booking widget multi-pax (S4-05) — xem `04-wireframes.md`
- ⏳ Backup production DB qua Supabase PITR — verify đã enable trước Day 1
- ⏳ Tạo Supabase staging project mới + import dump từ prod — Day 1
- ⏳ Performance baseline đo trước migration — xem `03-test-plan.md` Section 8

---

## Mục tiêu sprint

1. **Schema alignment**: DB + Prisma schema khớp 100% với ADR-001..006.
2. **Pricing Pattern C live**: tour có 4 giá per-pax + service tier upsell.
3. **Booking flow ready cho Sprint 4**: service + widget hoạt động được với multi-pax.
4. **InquiryRequest live**: lead capture form public + admin manage.
5. **0 reference đến field cũ**: `bookingType`, `HotelBooking`, `priceFrom`, `durationText`, `tourType` (string).
6. **Doc + reality đồng bộ**: `trang-thai-web.md` cập nhật phản ánh đúng code.

---

## Definition of Done (Sprint-level)

| # | Tiêu chí | Verify bằng |
| --- | --- | --- |
| 1 | Migration 10 PART apply trên production thành công | `prisma migrate status` clean, audit script pass |
| 2 | Toàn bộ ID columns là `UUID` native | `SELECT data_type FROM information_schema.columns WHERE column_name LIKE '%id%'` → tất cả `uuid` |
| 3 | 0 file ref `bookingType / HotelBooking / hotel_booking` | `rg "bookingType|HotelBooking" src/` → 0 match |
| 4 | 0 file ref `tour.priceFrom` (đã thay bằng priceAdult) | `rg "priceFrom|price_from" src/` chỉ còn ref `Hotel.priceFrom` (hợp lệ) |
| 5 | Tour CRUD admin nhập 4 giá + ≥0 TourOption | E2E test `admin/tours/[id]` flow |
| 6 | Booking flow E2E: chọn departure → multi-pax → calc đúng → tạo booking → lock departure | `tests/e2e/booking-pattern-c.spec.ts` |
| 7 | InquiryRequest public form + admin list nhận lead | E2E test `/lien-he-doan-rieng` |
| 8 | `trang-thai-web.md` Sprint 4 = Done, Sprint 4 unblocked | Doc updated, changelog log entry |
| 9 | 0 lint error, 0 type error, build production pass | `pnpm build` exit 0 |
| 10 | Staging tested ≥48h trước khi production | Staging URL + log → 0 error 500 |

---

## Stories overview

| ID | Story | Effort | Phụ thuộc | Risk |
| --- | --- | --- | --- | --- |
| S4-01 | Apply migration `add_pricing_options_and_allotment` | 2 ngày | Backup PITR + Staging ready | 🔴 Cao |
| S4-02 | Drop HotelBooking + bookingType refs trong code | 0.5 ngày | S4-01 | 🟢 Thấp |
| S4-03 | Refactor Tour CRUD theo Pricing Pattern C | 2-3 ngày | S4-01, S4-02 | 🟡 Trung |
| S4-04 | Refactor BookingService Pattern C | 1-2 ngày | S4-03 | 🟡 Trung |
| S4-05 | Booking widget multi-pax | 2-3 ngày | S4-04 | 🟡 Trung |
| S4-06 | InquiryRequest (Series + Private split) | 1-2 ngày | S4-01 | 🟢 Thấp |
| S4-07 | Doc sync + sprint pivot logging | 0.5 ngày | Tất cả còn lại | 🟢 Thấp |
| **Tổng** | | **9-13 ngày** | | |

Chi tiết từng story xem `01-stories.md`.

---

## Timeline đề xuất (10 ngày làm việc)

```
Tuần 1                                  Tuần 2
─────────────────────────────────       ─────────────────────────────────
D1  S4-01 part 1 (staging setup       D6  S4-04 phần 1 (service)
     + apply staging)                   D7  S4-04 phần 2 (test)
D2  S4-01 part 2 (smoke test          D8  S4-05 phần 1 (widget UI)
     + apply prod)                      D9  S4-05 phần 2 (validation
D3  S4-02 + S4-06 phần 1                + integration)
D4  S4-03 phần 1 (schema +            D10 S4-07 (doc + retro)
     service)                           
D5  S4-03 phần 2 (UI admin
     + i18n)
```

> S4-06 chia 2 ngày: phần 1 (schema + admin) ở Tuần 1, phần 2 (public form) ở Tuần 2 đan xen.

---

## Risk register

| Risk | Severity | Mitigation |
| --- | --- | --- |
| **R1** Migration PART 0 (UUID convert) hỏng do data lớn → lock table lâu | 🔴 Cao | Test full trên staging với prod-size data, schedule maintenance window 30-60 phút, rollback plan có sẵn (PITR) |
| **R2** Pricing logic Pattern C tính sai → khách bị charge sai | 🔴 Cao | Test ≥10 case (1 NL, 2 NL, 2 NL + 1 TE, 1 single supplement, có/không tour option), unit test 100% cover `calculateTourPrice()` |
| **R3** Booking widget multi-pax UX khó → user confused | 🟡 Trung | Wireframe trước, nội bộ test với 3 user thật trước khi public, hint text rõ ràng |
| **R4** InquiryRequest spam | 🟡 Trung | Rate limit 3 inquiry/giờ/IP, captcha hCaptcha, validate phone VN format |
| **R5** Refactor JSON-LD Schema.org sai → SEO impact | 🟡 Trung | Test với Google Rich Results test tool sau khi deploy staging |
| **R6** i18n labels mâu thuẫn (mix old + new keys) | 🟢 Thấp | Drop old key cùng commit với refactor, không để 2 phase |
| **R7** Sprint 4 dev đụng vào schema cũ vì cache code | 🟢 Thấp | Sau S4-01 force `git pull` + `pnpm install` toàn team |

---

## Out of scope (deferred)

Mục đích Sprint 4 là pivot foundation, KHÔNG nên scope creep. Các mục sau **deferred** sang sprint khác:

- ❌ Hoàn thành nốt Sprint 3 (autocomplete + filter rating + cluster map) → đẩy sang Sprint 3.6 sau pivot
- ❌ Booking VNPay/MoMo integration → Sprint 4 (Booking)
- ❌ Email confirm booking → Sprint 4
- ❌ Cron job auto-cancel quá deadline → Sprint 4
- ❌ Loyalty program → Sprint 5
- ❌ Review system → Sprint 5
- ❌ Admin dashboard L0 → Sprint 6

---

## Dependencies

### External
- Supabase PITR enabled trên production (verify settings → Database → Backups)
- Supabase Pro plan để có PITR (nếu chưa có thì cần upgrade)
- DB_URL + DIRECT_URL cho staging mới

### Internal (doc / code)
- ADR-001..007 chốt ở `02-kien-truc/decisions/` ✅
- Migration spec ở `03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` ✅
- Quy chuẩn code ở `04-phat-trien/01-quy-chuan-lap-trinh.md` ✅
- Test plan ở `04-phat-trien/03-testing.md` ✅

---

## Liên kết

- 7 stories chi tiết: `01-stories.md`
- Migration runbook (apply + rollback): `02-runbook.md`
- Test plan: `03-test-plan.md`
- ADR liên quan: `../../02-kien-truc/decisions/ADR-001..006.md`
- Migration spec: `../../03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
- Trạng thái web hiện tại: `../trang-thai-web.md`

---

## Changelog sprint

| Ngày | Sự kiện | Note |
| --- | --- | --- |
| 2026-05-30 | Sprint 4 created | Audit reality phát hiện 7 schema mismatch với ADR mới |
