# Changelog — travel-doc

> **Mục đích**: log mọi thay đổi đáng kể của doc + schema + ADR. Thay cho versioning per-file (trước đây mỗi file có Changelog riêng — bị fragment).
> **Quy tắc**: append-only. Mỗi entry có ngày + scope + người duyệt + mô tả. Mọi PR đụng doc/schema phải thêm 1 dòng vào đây.

---

## 2026-05-30 — Renumber sprint + drop Loyalty khỏi MVP (v3.0)

**Scope**: `05-quan-ly-sprint/` + meta files
**Duyệt**: Founder

Sau khi Sprint 4 Pivot spec ổn (D5 patches), founder review tổng thể chia sprint và quyết định:

**1. Renumber sprint tuần tự (Option B)** — bỏ tên kiểu `3.5/3.6`, đánh số liên tục:

| Cũ | Mới | Folder |
| --- | --- | --- |
| Sprint 3.5 (Schema Pivot) | **Sprint 4** | `sprint-4-schema-pivot/` |
| Sprint 3.6 (Đóng Discovery) | **Sprint 5** | `sprint-5-dong-tim-kiem/` (NEW) |
| Sprint 4 (Đặt chỗ + Thanh toán) | **Sprint 6** | `sprint-6-dat-cho-thanh-toan/` |
| Sprint 5 (Member + Review) | **Sprint 7** | `sprint-7-danh-gia/` |
| Sprint 6 (Quy hoạch + Tối ưu) | **Sprint 8** | `sprint-8-quy-hoach-toi-uu/` |

Sprint 3 cũ (đang pause 40%) giữ nguyên path `sprint-3-tim-kiem-kham-pha/` làm reference.

**2. Drop Loyalty khỏi MVP** — defer Phase 2:
- Lý do: Tích điểm thành viên là "nice-to-have", khách Việt ít quan tâm thẻ thành viên du lịch ở giai đoạn đầu
- Build sau khi có 100-200 khách thật để biết tier nào hợp lý
- Sprint 7 giờ chỉ làm Review (1.5 tuần thay vì 2.5 tuần Member+Review)

**3. Discovery completion (Sprint 5) làm sau Pivot** — không parallel
- Lý do: solo dev, parallel sẽ context-switch nhiều
- Sprint 4 Pivot xong → Sprint 5 đóng nốt autocomplete + filter rating + cluster map (1.5 tuần)

**Timeline tổng**: ~10 tuần (2.5 tháng) tới launch MVP.

**Files thay đổi**:
- 4 folder rename + 1 folder mới (`sprint-5-dong-tim-kiem/`)
- 5 file Sprint 4 spec: replace `Sprint 3.5 → 4`, `S3.5-XX → S4-XX`, `sprint-3-5-schema-pivot → sprint-4-schema-pivot`, branch name `sprint-3-5/migration-pivot → sprint-4/migration-pivot` (~87 occurrences)
- `trang-thai-web.md` rewrite hoàn toàn với 8 sprint mapping
- `01-nghiep-vu/04-ma-tran-tinh-nang.md` cập nhật reference sprint number, mark Loyalty ~~strikethrough~~ defer Phase 2
- `00-san-pham/04-lo-trinh-phat-hanh.md` (chưa update — defer task tiếp theo)
- `99-tham-khao/changelog.md` (file này)
- `.vitepress/config.js` + `index.md` sidebar/nav update

**Trace**: chat 2026-05-30 mục "tiếp xem trạng thái web ở đâu. để chia sprint cho chuẩn".

---

## 2026-05-30 — Sprint 3.5 spec patch v2 (gap fix)

**Scope**: `05-quan-ly-sprint/sprint-3-5-schema-pivot/`
**Duyệt**: Founder

Sau review lần 2 (Group A + B), patch các gap critical & important trước khi Day 1:

**Group A — Critical (3 fix)**:
- A1+A2 + Audit 5/6 (PENDING booking, priceFrom NULL) + Phase 0.5 backfill (priceAdult từ priceFrom × 1.0/0.7/0/0.4) + expand-contract migration cho TourBooking (giữ unitPrice/participants làm shadow, drop sau Sprint 4) → `02-runbook.md`
- A3 Test DB setup decision: Docker Postgres local + Vitest setup + factories template → `03-test-plan.md`
- A4 Wireframe Booking widget desktop + mobile + Inquiry form → file mới `04-wireframes.md`

**Group B — Important (4 fix)**:
- B1 Email template skeleton `inquiry-new.tsx` (React Email) → `01-stories.md` S3.5-06
- B2 Performance baseline procedure (Lighthouse + K6 + EXPLAIN ANALYZE) → `03-test-plan.md` Section 8
- B3 Sprint 4 audit checklist với grep pattern cụ thể → `01-stories.md` S3.5-07
- B4 Owner clarify "Solo dev (Founder)" → `00-tong-quan.md`

**File mới**: `04-wireframes.md` (~340 dòng) — ASCII wireframe + UX rules + reference patterns + accessibility notes.

**Trace**: chat 2026-05-30 self-review section.

---

## 2026-05-30 — Sprint 3.5 Schema Pivot spec chốt

**Scope**: `05-quan-ly-sprint/sprint-3-5-schema-pivot/`
**Duyệt**: Founder + Tech Lead

Sau khi audit reality của `travel-web` (Phase A code scan + Phase B gap-vs-ADR + Phase A.2 grep blast radius), phát hiện schema hiện tại lệch 7 chỗ với ADR-001..006. Quyết định insert **Sprint 3.5 Schema Pivot** (~9-13 ngày dev) trước khi đi tiếp Sprint 4 Booking, để tránh rework lớn.

**Files mới** (4 file, ~1,400 dòng):
- `00-tong-quan.md` — overview, DoD, pre-req, risk register, timeline 10 ngày
- `01-stories.md` — 7 stories chi tiết (S3.5-01..07) với AC + DoD + blast files
- `02-runbook.md` — pre-flight + apply staging + apply prod + PITR rollback procedure
- `03-test-plan.md` — migration smoke (10 case), unit `calculatePrice` (10 case), integration BookingService, E2E booking + inquiry, manual QA checklist

**Quyết định đi kèm**:
- Backup strategy: Supabase PITR (Pro plan)
- Staging strategy: fresh Supabase project + import dump từ prod
- Sprint priority: Pivot trước, đóng nốt Sprint 3 còn lại sau (Sprint 3.6)

**Trace**:
- Audit reality state: section "Phase A" trong chat 2026-05-30
- ADR-001..007 đã chốt từ 2026-05-27
- Migration spec: `03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`

**Pending sau sprint này**:
- Sprint 3.6 — đóng nốt 60% Sprint 3 (autocomplete + filter rating + cluster map)
- Sprint 4 — Booking VNPay/MoMo + email confirm + cron auto-cancel
- Sprint 5 — Review + loyalty
- Sprint 6 — Dashboard L0 + final SEO

---

## 2026-05-27 — D1→D5 restructure to Scrum layout (v2.0)

**Scope**: toàn bộ `docs/`
**Duyệt**: Founder + Tech Lead

Sau feedback "docs càng ngày càng nhiều file, không tập trung mục đích thực sự", restructure toàn bộ doc theo **role-based Scrum layout**:

- **D1**: Tạo folder skeleton 7 root folder + sub. Move file/folder cũ vào `99-tham-khao/archive/`. Viết `README.md` map.
- **D2**: Viết `00-san-pham/` (4 file PO — vision + BMC + personas + roadmap). Bỏ V-XX anchor → thay bằng ADR.
- **D3**: Viết `03-co-so-du-lieu/` (4 file DBA + 1 migration). Tách concerns: ERD vs spec vs integrity vs migration process.
- **D4**: Viết `01-nghiep-vu/` (BA — 4 file) + `02-kien-truc/` (Tech Lead — 3 file + 4 ADR).
- **D5**: Viết `04-phat-trien/` (Dev — 4 file) + 3 ADR còn lại + file changelog này.

**Số liệu**:
- Trước: ~25 file, ~5,500 dòng, nhiều file lằng nhằng
- Sau: 21 file core + 7 ADR + 1 migration + folder archive

**Lý do**: doc trước đó "framework-heavy" (Tier 0/1/2/3/4 hierarchy, anchor decisions V-01..V-12 trải khắp file), không phù hợp Scrum team nhỏ. Layout mới role-based (PO/BA/Tech/DBA/Dev/Scrum Master) handoff-ready cho team tương lai.

**Files archive** (xem `99-tham-khao/archive/`):
- `00-blueprint-handoff-2026-05-26.md` (foundational doc gốc)
- `01-nen-tang-he-thong/` (Tier 0-4 framework cũ — vision, BMC, personas, ERD, data detail, strategy, functional)
- `02-quan-ly-sprint/` (đã copy sang `05-quan-ly-sprint/`)
- `03-kho-tinh-nang/` (đã trích `00-ma-tran-tinh-nang.md` sang `01-nghiep-vu/04-ma-tran-tinh-nang.md`)
- `index.md`, `roadmap.md`

---

## 2026-05-27 — ADR-001..007 chốt (replace V-01..V-12)

**Scope**: `02-kien-truc/decisions/`
**Duyệt**: Founder + Tech Lead

Convert 12 anchor `V-XX` thành 7 ADR có format chuẩn (Context → Decision → Consequences → Alternatives):

| ADR | Tiêu đề | Replace anchor cũ |
| --- | --- | --- |
| ADR-001 | Hotel = Content Reference vĩnh viễn | V-01, V-05 |
| ADR-002 | Pricing Pattern C per-pax + upsell | V-09 |
| ADR-003 | UUID native type cho toàn schema | (mới — fix R-13) |
| ADR-004 | Must-login để book | V-04 |
| ADR-005 | SEO-first — SeoPage polymorphic | V-03 |
| ADR-006 | Series + Private Tour split | V-12 |
| ADR-007 | Admin Reporting 3 tier (L0/L1/L2) | V-08 |

**Lý do**: ADR format chuẩn industry, append-only (deprecate cũ bằng "Supersedes ADR-XXX" thay vì version bump), dễ hiểu cho người mới.

---

## 2026-05-27 — Migration `add_pricing_options_and_allotment` chốt 10 PART

**Scope**: `03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment.md`
**Status**: Pending apply (chờ Tech Lead sign-off + apply trên staging)

10 PART gộp 5 pivot scope + 3 fix kỹ thuật:

- PART 0 — TEXT → UUID (ADR-003)
- PART 1 — TourItinerary.hotelId + roomTypeNote
- PART 2 — Cost tracking (estimatedCost, actualCostPerPax)
- PART 3 — Pricing per-pax + TourOption (ADR-002)
- PART 4 — Risk management (minParticipants, paymentDeadline, HotelAllotment)
- PART 5 — Room.roomType enum
- PART 6 — Tour duration restructure (DROP durationText)
- PART 7 — InquiryRequest (ADR-006)
- PART 8 — DROP HotelBooking + bookingType (ADR-001)
- PART 9 — Cascade Profile→Booking/Review: Cascade → Restrict
- PART 10 — Full Boolean index → Partial index

**Pre-req**: phải apply TRƯỚC Sprint 4 Booking.

---

## 2026-05-26 — Initial vision + 5 anchor decisions

**Scope**: vision + BMC + personas
**Duyệt**: Founder

Khởi tạo bộ doc từ session mentor đầu tiên:
- Chốt mô hình Vivu = tour operator B2C trực tiếp (không marketplace)
- Confirm 3 personas (Anh Khoa family, Chị Linh young, Admin Vivu)
- Anchor decisions V-01..V-07 (sau pivot thành V-01..V-12, sau convert sang ADR-001..ADR-007)

---

## Quy ước viết entry mới

```markdown
## YYYY-MM-DD — <Tóm tắt 1 dòng>

**Scope**: `path/to/file.md` hoặc folder
**Duyệt**: <ai>

<Mô tả 2-5 dòng>

**Thay đổi cụ thể** (optional):
- ...
- ...

**Trace**:
- ADR-XXX (nếu có)
- Sprint task: SPR4-12 (nếu có)
- BR-XX (nếu có)
```

---

## Liên kết

- README map: `../README.md`
- Folder archive (history): `archive/`
- ADR folder: `../02-kien-truc/decisions/`
