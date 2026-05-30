# Sprint 4 — Stories chi tiết

> **Cách đọc**: Mỗi story có Context (tại sao) — AC (acceptance criteria) — Files affected (blast list) — DoD (definition of done) — Test plan link.

---

## S4-01 — Apply migration `add_pricing_options_and_allotment`

**Effort**: 2 ngày | **Priority**: 🔴 P0 (blocker) | **Owner**: Tech Lead

### Context

Migration spec đã hoàn chỉnh ở `03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md` với 10 PART. Đây là story khó nhất sprint vì:
- Có data thật trên production (`real_data`)
- PART 0 (TEXT → UUID) là **destructive cast** — không reversible without rollback từ backup
- Phải chạy đúng thứ tự PART 0 → PART 10

### AC (Acceptance Criteria)

| AC | Mô tả | Verify |
| --- | --- | --- |
| AC-01 | Supabase staging clone từ prod dump (≤24h) | Compare row count `profiles`, `tours`, `bookings` giữa staging và prod |
| AC-02 | Pre-flight audit pass trên staging | Run `prisma/audit-uuid-format.sql` → 0 row invalid |
| AC-03 | All 10 PARTs apply trên staging không lỗi | `prisma migrate deploy` exit 0 |
| AC-04 | Smoke test pass trên staging (10 case) | Xem `03-test-plan.md` mục "Smoke Test Migration" |
| AC-05 | Tested ≥48h staging idle (không error) | Supabase logs check |
| AC-06 | Production PITR backup verified | Restore test trên throwaway project |
| AC-07 | Production migration apply trong maintenance window | Status page banner, timeline ≤30 phút |
| AC-08 | Post-deploy verification trên prod | Audit script lại, 5 smoke test |

### Files affected

```
prisma/schema.prisma                                   ← update theo Prisma delta của migration
prisma/migrations/<timestamp>_add_pricing_options_and_allotment/migration.sql
                                                       ← copy content từ migration spec
prisma/seed.ts                                         ← verify còn chạy được sau migrate
.env.staging                                           ← DATABASE_URL + DIRECT_URL staging mới
```

### DoD checklist

- [ ] Supabase Pro PITR enabled
- [ ] Staging Supabase project created
- [ ] Prod dump imported vào staging
- [ ] Pre-flight audit pass
- [ ] All 10 PARTs apply trên staging
- [ ] Smoke test 10/10 pass trên staging
- [ ] 48h soak test trên staging — 0 error
- [ ] Production maintenance window scheduled + announce
- [ ] PITR snapshot taken ngay trước apply
- [ ] Production migration apply
- [ ] Post-deploy audit pass
- [ ] Doc `02-runbook.md` final updated với learnings

### Test plan

→ Xem `03-test-plan.md` mục "Migration smoke test"

### Rollback plan

→ Xem `02-runbook.md` mục "Rollback"

---

## S4-02 — Drop HotelBooking + bookingType refs

**Effort**: 0.5 ngày | **Priority**: 🟡 P1 | **Owner**: Dev | **Blocker**: S4-01

### Context

ADR-001 quyết định Hotel = content reference, không bookable. Migration PART 8 đã drop `HotelBooking` table + `bookingType` enum trong DB. Nhưng code TS còn 5 file ref → cần dọn để build pass.

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | `pnpm build` pass sau khi xóa refs |
| AC-02 | `services/booking.service.ts` chỉ tạo `Booking` cho tour (drop `bookingType` field, drop `hotelBooking` include) |
| AC-03 | `components/admin/bookings/booking-table.tsx` không hiển thị column "Loại" booking |
| AC-04 | `app/admin/page.tsx` (dashboard) drop count by bookingType |

### Files affected (5 files)

```
services/booking.service.ts                           ← drop bookingType: "TOUR" + hotelBooking include
components/admin/bookings/booking-table.tsx           ← drop column "type"
app/admin/page.tsx                                    ← drop card "Booking khách sạn" nếu có
types/booking.ts                                      ← drop bookingType field, drop checkIn/checkOut
types/travel.ts                                       ← drop BookingType type
```

### DoD checklist

- [ ] `rg "bookingType|BookingType|HotelBooking|hotelBooking" src/` → 0 match
- [ ] `pnpm build` exit 0
- [ ] `pnpm lint` exit 0
- [ ] `pnpm test` (existing tests) pass
- [ ] Manual: admin booking list vẫn render đúng

---

## S4-03 — Refactor Tour CRUD theo Pricing Pattern C

**Effort**: 2-3 ngày | **Priority**: 🔴 P0 | **Owner**: Dev | **Blocker**: S4-01, S4-02

### Context

ADR-002 chốt Pattern C: per-pax + service tier upsell. Schema migration PART 3 đã add `priceAdult/priceChild/priceInfant/singleSupplementPrice` + model `TourOption`. Code phải refactor:
- Drop `Tour.priceFrom` (đơn lẻ)
- Add 4 fields giá per-pax + form UI
- Add nested CRUD `TourOption` (giống `TourDeparture` editor pattern)
- Drop `Tour.durationText` (admin nhập số ngày + tự gen text)
- Drop `Tour.tourType` String → enum `TourType` (SERIES, PRIVATE, CORPORATE)
- Update i18n labels
- Update `tour-json-ld.tsx` (Schema.org Offer.price = priceAdult)
- Update test `display-labels.test.ts`

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | Admin nhập tour mới với 4 giá + chọn `tourType` enum + ≥0 TourOption | UI render đúng |
| AC-02 | Public tour detail hiển thị `priceAdult` làm "giá từ" | `tour-card.tsx` + `[slug]/page.tsx` |
| AC-03 | JSON-LD Schema.org dùng `priceAdult` làm `offers.price` | Validate Google Rich Results test |
| AC-04 | i18n labels không còn key `priceFrom` cho Tour | `vi.json/en.json` clean |
| AC-05 | `lib/tour/display-labels.ts` đổi từ tự do `tourType` string sang enum mapping | Test pass |
| AC-06 | TourOption nested editor giống pattern `TourDeparturesEditor` | Tabbed UI, save 1 click |
| AC-07 | `Tour.durationDays` là source of truth, `durationText` được derive | UI hiển thị "3 ngày 2 đêm" tự động |

### Files affected (14 files — blast lớn nhất)

```
prisma/schema.prisma                                   ← đã update ở S4-01
services/tour.service.ts                               ← createTour/updateTour accept priceAdult/Child/Infant + options
actions/tour.actions.ts                                ← input validation Zod cập nhật
lib/validations/schemas.ts                             ← drop priceFromSchema, add tourPricingSchema
types/travel.ts                                        ← Tour type rebuild
components/admin/tours/
  tour-basic-editor.tsx                                ← replace 2 inputs giá bằng 4 inputs + tier
  tour-options-editor.tsx                              ← NEW (mirror TourDeparturesEditor pattern)
  tour-itineraries-editor.tsx                          ← thêm hotelId field (TourItinerary.hotelId)
app/admin/tours/page.tsx                               ← list query update column giá
app/(main)/tours/[slug]/page.tsx                       ← detail page render giá adult
components/tours/
  tour-card.tsx                                        ← display priceAdult
  tour-json-ld.tsx                                     ← Schema.org Offer.price = priceAdult
  booking-widget.tsx                                   ← will be redone in S4-05
components/home/trending-section.tsx                   ← thay priceFrom bằng priceAdult
lib/tour/display-labels.ts + __tests__/                ← enum-based mapping + test update
messages/{vi,en}.json                                  ← drop key cũ, add 4 key mới
```

### DoD checklist

- [ ] Migration apply ✅ (từ S4-01)
- [ ] Schema delta theo migration spec (`@db.Uuid` + 4 price fields + TourOption + enum TourType)
- [ ] Service tour: `createTour({ priceAdult, priceChild, priceInfant, singleSupplementPrice, durationDays, tourType, options[] })`
- [ ] Admin form đầy đủ 4 ô giá + dropdown enum TourType + nested TourOption CRUD
- [ ] i18n: `tour.priceAdult`, `tour.priceChild`, `tour.priceInfant`, `tour.singleSupplementPrice`
- [ ] Public hiển thị giá: priceAdult làm "from price"
- [ ] JSON-LD validated bằng Google Rich Results
- [ ] `display-labels.test.ts` adapt sang enum
- [ ] `pnpm build && pnpm test && pnpm lint` exit 0

### Test plan

→ Xem `03-test-plan.md` mục "Tour CRUD Pattern C"

---

## S4-04 — Refactor BookingService Pattern C

**Effort**: 1-2 ngày | **Priority**: 🔴 P0 | **Owner**: Dev | **Blocker**: S4-03

### Context

`BookingService.createTourBooking()` hiện tính `totalAmount = unitPrice × participants` — flat. Pattern C cần:
- Input đổi: `participants: number` → `adults: number, children: number, infants: number, optionId?: string, isSingleSupplement?: boolean`
- Calc: `total = (priceAdult × adults) + (priceChild × children) + (priceInfant × infants) + (singleSupplement × adults nếu single) + (option upgrade × adults)`
- `priceBreakdown` JSON lưu detail từng line item (adults×price, children×price, ...)
- `participants` derive: `adults + children + infants` (validation)
- Pessimistic lock vẫn giữ nguyên (validate `bookedCount + participants <= maxParticipants`)
- `paymentDeadline = now + 15 min` (PART 4)

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | `createTourBooking` accept input mới (4 số + option) | Type signature đổi |
| AC-02 | Calc đúng cho 6 case (1 adult, 2 adult, 2 adult + 1 child, 2 adult + 1 infant, single supplement, có option upgrade) | Unit test 100% |
| AC-03 | `priceBreakdown` JSON validate Zod schema | Schema in `lib/validations/schemas.ts` |
| AC-04 | Lock departure vẫn work — concurrent test 2 request đồng thời ≤ slot | Integration test |
| AC-05 | `paymentDeadline = now + 15 min` được set khi tạo booking PENDING | DB check |
| AC-06 | Cancel booking refund slot vẫn work với participants mới | Test cancel flow |

### Files affected

```
services/booking.service.ts                           ← rewrite createTourBooking + cancelTourBooking
lib/validations/schemas.ts                            ← createTourBookingInput Zod + priceBreakdown Zod
lib/tour/calculate-price.ts                           ← NEW: pure function calc
lib/tour/__tests__/calculate-price.test.ts            ← NEW: unit test 6 case
types/booking.ts                                      ← input type update
```

### DoD checklist

- [ ] `calculatePrice()` pure function với 6 case unit test pass
- [ ] `BookingService.createTourBooking()` accept input mới
- [ ] `priceBreakdown` JSON đúng format (validate Zod)
- [ ] Pessimistic lock vẫn work (concurrent test)
- [ ] `paymentDeadline` được set
- [ ] Test integration: tạo booking, query DB → priceBreakdown match expected

### Test plan

→ Xem `03-test-plan.md` mục "BookingService Pattern C"

---

## S4-05 — Booking widget multi-pax

**Effort**: 2-3 ngày | **Priority**: 🔴 P0 | **Owner**: Dev | **Blocker**: S4-04

### Context

Booking widget hiện chỉ có 1 input "số người" → flat. Pattern C cần widget cho phép user:
- Chọn số người lớn (≥1, max = available slot)
- Chọn số trẻ em 2-11 tuổi (≥0)
- Chọn số em bé < 2 tuổi (≥0)
- Toggle "Tôi đi 1 mình + phòng riêng" (single supplement)
- Chọn TourOption (radio: Standard / Deluxe / VIP) — nếu tour có
- Hiển thị breakdown total real-time
- Hiển thị deadline thanh toán "Giữ chỗ trong 15 phút" sau khi click Đặt

> **🎨 Wireframe**: xem `04-wireframes.md` mục "1. Booking Widget multi-pax" cho desktop + mobile layout, interaction rules, và reference patterns (Klook, GetYourGuide).

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | UI input 3 số (adult/child/infant) với +/- button | Render đúng |
| AC-02 | Total update real-time khi đổi số người | React state |
| AC-03 | Validation client-side: adults ≥1, total ≤ slot remaining | Disable Đặt button |
| AC-04 | Breakdown table hiển thị: "2 NL × 5tr = 10tr, 1 TE × 4tr = 4tr, Tổng: 14tr" | Number format VN |
| AC-05 | Single supplement toggle chỉ enable khi adults = 1 | UX rule |
| AC-06 | TourOption radio (Standard miễn phí, +Deluxe +500k, +VIP +1tr) | Hiển thị nếu tour có options |
| AC-07 | Nút Đặt redirect tới `/dat-tour/[bookingId]/thanh-toan` (placeholder) | Sprint 4 build trang thanh toán |
| AC-08 | Hint text + warning về cancellation policy | Hiển thị từ Tour.policy JSON |

### Files affected

```
components/tours/booking-widget.tsx                   ← rewrite UI
components/tours/booking-summary.tsx                  ← NEW: breakdown table
hooks/use-booking-form.ts                             ← NEW: form state + validation
actions/booking.actions.ts                            ← NEW: createBookingAction Server Action
app/(main)/tours/[slug]/page.tsx                      ← integrate widget mới
messages/{vi,en}.json                                 ← labels mới
```

### DoD checklist

- [ ] UI 3 input + toggle + radio
- [ ] Total real-time
- [ ] Validation đầy đủ
- [ ] Breakdown table render đúng
- [ ] Server Action `createBookingAction` gọi service
- [ ] Manual test với 5 user flow (adult only, family, single, with option, max slot)
- [ ] Mobile responsive

### Test plan

→ Xem `03-test-plan.md` mục "Booking widget UX"

---

## S4-06 — InquiryRequest (Series + Private split)

**Effort**: 1-2 ngày | **Priority**: 🟡 P1 | **Owner**: Dev | **Blocker**: S4-01

### Context

ADR-006 chốt Vivu = Series (online book) + Private (inquiry → admin báo giá). Migration PART 7 add `InquiryRequest` model. Code cần:
- Public form `/lien-he-doan-rieng` cho khách điền yêu cầu
- Server Action submit → tạo `InquiryRequest` status `NEW`
- Email admin notification (Resend)
- Admin list `/portal/inquiries` xem + update status
- Status transition: NEW → CONTACTED → QUOTED → WON / LOST

> **🎨 Wireframe**: xem `04-wireframes.md` mục "2. Inquiry Form" cho public form, success state, admin list, và admin detail drawer.

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | Public form `/lien-he-doan-rieng` với fields: tên, email, phone, số người, ngày, destination preferred, tour type (corporate/private/event), budget range, notes | Render mobile + desktop |
| AC-02 | Server Action validate Zod + insert DB | Test post |
| AC-03 | Email admin Resend `inquiry-new.tsx` | Send to settings.adminEmail |
| AC-04 | Admin list `/portal/inquiries` filter by status, sort by createdAt desc | Admin nav menu thêm link |
| AC-05 | Admin có thể update status + thêm internalNote | Save action |
| AC-06 | Rate limit 3 inquiry/giờ/IP | Middleware check |
| AC-07 | hCaptcha trên form public | Anti-spam |

### Files affected

```
app/(main)/lien-he-doan-rieng/page.tsx                ← NEW (form public)
components/inquiry/inquiry-form.tsx                   ← NEW
actions/inquiry.actions.ts                            ← NEW
services/inquiry.service.ts                           ← NEW
app/admin/inquiries/page.tsx                          ← NEW (admin list)
components/admin/inquiries/inquiry-table.tsx          ← NEW
components/admin/inquiries/inquiry-detail-drawer.tsx  ← NEW
emails/inquiry-new.tsx                                ← NEW (React Email — xem skeleton bên dưới)
lib/validations/schemas.ts                            ← inquirySchema Zod
lib/rate-limit.ts                                     ← reuse hoặc tạo mới
messages/{vi,en}.json                                 ← labels
```

### Email template skeleton — `emails/inquiry-new.tsx`

```tsx
import { Body, Button, Container, Head, Heading, Html,
         Preview, Section, Text } from '@react-email/components'

interface InquiryNewEmailProps {
  inquiry: {
    id: string
    name: string
    email: string
    phone: string
    tourType: 'PRIVATE' | 'CORPORATE' | 'EVENT'
    participants: number
    targetDate: string
    budgetMin?: number
    budgetMax?: number
    notes?: string
  }
  adminUrl: string
}

export default function InquiryNewEmail({ inquiry, adminUrl }: InquiryNewEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Yêu cầu mới — {inquiry.name} — {inquiry.participants} người</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f6f9fc', padding: '20px' }}>
        <Container style={{ background: '#fff', borderRadius: 8, padding: '32px' }}>
          <Heading>Yêu cầu mới từ {inquiry.name}</Heading>
          <Section>
            <Text><strong>Email:</strong> {inquiry.email}</Text>
            <Text><strong>SĐT:</strong> {inquiry.phone}</Text>
            <Text><strong>Loại tour:</strong> {inquiry.tourType}</Text>
            <Text><strong>Số người:</strong> {inquiry.participants}</Text>
            <Text><strong>Ngày dự kiến:</strong> {inquiry.targetDate}</Text>
            {inquiry.budgetMin && (
              <Text><strong>Ngân sách:</strong> {inquiry.budgetMin.toLocaleString('vi-VN')} - {inquiry.budgetMax?.toLocaleString('vi-VN')} ₫</Text>
            )}
            {inquiry.notes && (
              <Text><strong>Ghi chú:</strong> {inquiry.notes}</Text>
            )}
          </Section>
          <Button href={`${adminUrl}/portal/inquiries/${inquiry.id}`}
                  style={{ background: '#0070f3', color: '#fff', padding: '12px 24px',
                           borderRadius: 4, marginTop: 16 }}>
            Xem trên admin
          </Button>
          <Text style={{ marginTop: 24, fontSize: 12, color: '#666' }}>
            SLA contact: 24 giờ (xem `01-nghiep-vu/02-quy-tac-nghiep-vu.md` BR-INQ-01)
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

Test render: `pnpm react-email dev` → xem `localhost:3000/preview/inquiry-new`.

### DoD checklist

- [ ] Schema migration apply ✅ (từ S4-01 PART 7)
- [ ] Public form render + submit
- [ ] Email gửi tới admin sau khi submit
- [ ] Admin list filter + sort
- [ ] Admin update status + note
- [ ] Rate limit hoạt động
- [ ] hCaptcha tích hợp
- [ ] E2E test 1 inquiry flow

### Test plan

→ Xem `03-test-plan.md` mục "InquiryRequest E2E"

---

## S4-07 — Doc sync + sprint pivot logging

**Effort**: 0.5 ngày | **Priority**: 🟢 P2 | **Owner**: Tech Lead | **Blocker**: Tất cả còn lại

### Context

Sau khi pivot xong, doc phải reflect reality. Đây là thói quen "doc trước/cùng code", không để doc drift.

### AC

| AC | Mô tả |
| --- | --- |
| AC-01 | `05-quan-ly-sprint/trang-thai-web.md` cập nhật Sprint 4 = Done, refactor entries | List task done |
| AC-02 | `01-nghiep-vu/04-ma-tran-tinh-nang.md` đánh dấu InquiryRequest = ✅ | Bảng update |
| AC-03 | `99-tham-khao/changelog.md` thêm entry "Sprint 4 closed" | Append |
| AC-04 | `00-san-pham/04-lo-trinh-phat-hanh.md` cập nhật timeline (Sprint 4 thêm vào, Sprint 4-6 dời 2 tuần) | Roadmap update |
| AC-05 | Sprint 4 spec ở `05-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/` audit lại + update theo schema mới | Drop ref schema cũ — checklist bên dưới |
| AC-06 | Sprint retro note: "what went well / not / next time" | Mini doc 1 trang |

### Sprint 4 audit checklist (AC-05 chi tiết)

Mỗi file dưới đây cần grep + flag chỗ cần update:

| File | Pattern grep | Action |
| --- | --- | --- |
| `sprint-4-dat-cho-thanh-toan/01-yeu-cau-nghiep-vu.md` | `bookingType / HotelBooking / unitPrice / participants` | Replace bằng `priceBreakdown / adults / children / infants` |
| `sprint-4-dat-cho-thanh-toan/02-thiet-ke-co-ban.md` | Same + `priceFrom / durationText / tourType` | Replace bằng `priceAdult / durationDays / tourType enum` |
| `sprint-4-dat-cho-thanh-toan/03-thiet-ke-chi-tiet.md` | Same + `HotelBooking model / hotelBooking relation` | Drop hoàn toàn |
| `sprint-4-dat-cho-thanh-toan/04-api-design.md` | `POST /bookings` request body | Replace `{ participants }` bằng `{ adults, children, infants, optionId, isSingleSupplement }` |
| `sprint-4-dat-cho-thanh-toan/05-admin-specs.md` | `BookingType column` | Drop column |
| `sprint-4-dat-cho-thanh-toan/06-client-app-specs.md` | Booking widget UI | Reference `04-wireframes.md` mới |

```bash
cd travel-doc/docs/05-quan-ly-sprint/sprint-4-dat-cho-thanh-toan
rg "bookingType|BookingType|HotelBooking|hotelBooking|unitPrice|participants|priceFrom|durationText|tourType\s*[:=]" *.md
```

Kết quả grep → flag từng line, fix incremental. Không phải rewrite từ đầu.

### Files affected

```
05-quan-ly-sprint/trang-thai-web.md                   ← update
01-nghiep-vu/04-ma-tran-tinh-nang.md                  ← update Inquiry
00-san-pham/04-lo-trinh-phat-hanh.md                  ← timeline shift
05-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/        ← audit schema refs
99-tham-khao/changelog.md                             ← append entry
05-quan-ly-sprint/sprint-4-schema-pivot/04-retro.md ← NEW
```

### DoD checklist

- [ ] Trang thái web update reflect 100%
- [ ] Ma trận tính năng update
- [ ] Roadmap update
- [ ] Sprint 4 spec audit + flag chỗ cần update (không phải rewrite)
- [ ] Changelog entry
- [ ] Retro note `04-retro.md` viết

---

## Cross-story checklist

Trước khi đóng sprint, verify:

- [ ] Build production pass: `pnpm build` exit 0
- [ ] Type check pass: `pnpm typecheck` exit 0
- [ ] Lint pass: `pnpm lint` exit 0
- [ ] Test pass: `pnpm test` exit 0 (≥80% coverage cho `services/` và `lib/tour/calculate-price.ts`)
- [ ] E2E tests: `pnpm e2e` pass (booking flow + inquiry flow)
- [ ] Smoke test production sau deploy: 5 case (đăng ký, đăng nhập, xem tour, đặt tour, gửi inquiry)
- [ ] No regression: existing Sprint 1-3 features vẫn work
- [ ] Mobile responsive: test trên Chrome DevTools 5 sizes (iPhone SE, iPhone 12, iPad, Galaxy, Desktop)
- [ ] Accessibility: form có label đầy đủ, button có aria
