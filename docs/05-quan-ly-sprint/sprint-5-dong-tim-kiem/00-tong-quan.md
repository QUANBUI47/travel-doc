# Sprint 5 — Đóng nốt Tìm kiếm & Khám phá

> **Lý do tồn tại**: Sprint 3 đã chạy được ~40% (UI Discovery + Tour CRUD) rồi tạm pause để chạy Sprint 4 Schema Pivot. Sprint 5 này dùng để đóng nốt 60% việc còn lại của Sprint 3 — autocomplete, filter rating, cluster map.

**Sprint code**: S5
**Loại sprint**: Hoàn thành tính năng còn dở
**Thời gian dự kiến**: 1.5 tuần (7-8 ngày làm việc)
**Effort dev ước tính**: 7-8 ngày dev
**Owner**: Solo dev (Founder)
**Pre-req**:
- ✅ Sprint 4 Schema Pivot xong (vì Tour có `priceAdult`, `tourType` enum mới — affect filter logic)
- ✅ Tour CRUD đã refactor Pattern C
- ✅ Spec gốc Sprint 3 ở `../sprint-3-tim-kiem-kham-pha/` (giữ làm reference)

---

## Mục tiêu sprint

1. **Search autocomplete** — gõ từ khoá → hiển thị suggest tour + destination + region
2. **Filter rating + loại tour** — bộ lọc rating ≥4 sao, lọc theo `tourType` enum (SERIES/PRIVATE)
3. **Cluster map** — bản đồ Việt Nam có chấm tour, zoom out thì cluster lại

---

## Stories

### S5-01 Search autocomplete

**Effort**: 3 ngày | **Priority**: 🔴 P0 | **Risk**: 🟡 Trung

**Context**: Search bar hiện chỉ submit form khi Enter. Cần real-time suggest khi gõ.

**AC**:
| AC | Mô tả |
| --- | --- |
| AC-01 | User gõ ≥2 ký tự → API call debounce 300ms |
| AC-02 | Suggest 3 group: Tour (max 5), Destination (max 5), Region (max 3) |
| AC-03 | Mỗi item có icon + tên + link |
| AC-04 | Click item → redirect chính xác (tour: `/tours/[slug]`, destination: `/diem-den/[slug]`) |
| AC-05 | Phím ↑↓ navigate, Enter chọn, Esc đóng |
| AC-06 | Empty state "Không có kết quả" khi không match |
| AC-07 | Mobile responsive — fullscreen modal khi tap input |

**Files affected**:
```
components/home/hero-search-widget.tsx                  ← thêm dropdown panel
components/search/search-suggest.tsx                    ← NEW
hooks/use-search-suggest.ts                             ← NEW (debounced query)
actions/search.actions.ts                               ← NEW server action
services/search.service.ts                              ← NEW (Postgres ILIKE / trigram)
prisma/schema.prisma                                    ← add pg_trgm extension nếu chưa
messages/{vi,en}.json                                   ← labels
```

**Tech note**: Dùng Postgres `pg_trgm` extension cho fuzzy match (`SELECT ... WHERE name_vi ILIKE '%' || $query || '%'` + `similarity(name_vi, $query) > 0.3`). Hoặc dùng full-text search nếu data lớn (>10k tour).

---

### S5-02 Filter rating + loại tour

**Effort**: 2 ngày | **Priority**: 🟡 P1 | **Risk**: 🟢 Thấp

**Context**: `/tours` đã có filter cơ bản (search + destinationId). Cần thêm filter:
- Rating ≥X (slider 1-5)
- `tourType` (SERIES, PRIVATE) — checkbox
- Price range (min-max)
- Duration (1-3 ngày, 4-7 ngày, >7 ngày)

**AC**:
| AC | Mô tả |
| --- | --- |
| AC-01 | Filter panel ở sidebar (desktop) hoặc bottom sheet (mobile) |
| AC-02 | Rating slider min default 0, max 5, step 0.5 |
| AC-03 | TourType checkbox 2 option |
| AC-04 | Price range slider VND format |
| AC-05 | Duration radio 3 group |
| AC-06 | URL state preserve (`?rating=4&tourType=SERIES`) |
| AC-07 | Reset all button |
| AC-08 | Hiển thị count "Tìm thấy X tour" sau filter |

**Files affected**:
```
app/(main)/tours/page.tsx                               ← integrate filter sidebar
components/tours/tours-filter-sidebar.tsx               ← NEW
components/tours/tours-filter-mobile.tsx                ← NEW (bottom sheet)
services/tour.service.ts                                ← extend searchListings với filter mới
lib/validations/schemas.ts                              ← Zod schema cho filter input
```

---

### S5-03 Cluster map (Vietnam map với điểm tour)

**Effort**: 2-3 ngày | **Priority**: 🟢 P2 | **Risk**: 🟡 Trung

**Context**: Trang chủ đã có `vietnam-exploration-map` (Leaflet). Cần upgrade từ markers riêng lẻ → cluster khi zoom out.

**AC**:
| AC | Mô tả |
| --- | --- |
| AC-01 | Marker tour cluster lại khi zoom out (Leaflet.markercluster) |
| AC-02 | Click cluster → zoom in tự động |
| AC-03 | Click marker đơn → popup hiển thị tour info + link |
| AC-04 | Mobile responsive (touch gestures) |
| AC-05 | Performance: render <500ms với 100 marker |
| AC-06 | Filter trên map: chọn region → zoom đúng vùng |

**Files affected**:
```
components/home/vietnam-exploration-map-inner.tsx       ← thêm cluster plugin
package.json                                            ← add leaflet.markercluster + types
components/home/map-tour-popup.tsx                      ← NEW (popup tour info)
```

---

## Definition of Done (Sprint-level)

- [ ] Autocomplete debounce 300ms, suggest 3 group
- [ ] Filter sidebar + mobile bottom sheet đầy đủ rating/type/price/duration
- [ ] Cluster map zoom in/out smooth
- [ ] URL state preservation cho filter
- [ ] Mobile responsive 5 device size
- [ ] Lighthouse score `/tours` ≥ trước Sprint 5
- [ ] Doc update: `trang-thai-web.md` Sprint 5 = Done

---

## Out of scope (defer Phase 2 hoặc sau)

- ❌ Voice search
- ❌ Image search (upload ảnh tour tương tự)
- ❌ Search analytics dashboard (đếm top keyword)
- ❌ Saved searches / search history per user
- ❌ Map heatmap view (mật độ tour/region)

---

## Liên kết

- Sprint 3 spec gốc (đóng nốt từ đây): `../sprint-3-tim-kiem-kham-pha/`
- Sprint trước (pre-req): `../sprint-4-schema-pivot/`
- Trạng thái web: `../trang-thai-web.md`
- ADR liên quan: ADR-005 SEO polymorphic
