# travel-doc — Tài liệu dự án Vivu Travel

> **Mục đích**: Đây là bộ tài liệu nguồn (single source of truth) cho dự án `travel-web`. Mỗi quyết định về sản phẩm, nghiệp vụ, kiến trúc, dữ liệu, và quy trình phát triển đều được lưu ở đây để bất cứ ai mới vào (dev, BA, PM, designer) đều có thể đọc và làm việc được trong vòng 1 ngày.

**Phiên bản cấu trúc**: 2.0 (Scrum project layout — 2026-05-27)
**Chủ sở hữu**: PM/PO/Tech Lead
**Người đọc chính**: Dev team, BA, PO, future handover team

---

## Cấu trúc thư mục (role-based)

```
docs/
├── README.md                        ← Bạn đang đọc file này
│
├── 00-san-pham/                     ← PO/PM: WHY & WHAT
│   ├── 01-tam-nhin.md
│   ├── 02-mo-hinh-kinh-doanh.md
│   ├── 03-personas-user-journey.md
│   └── 04-lo-trinh-phat-hanh.md
│
├── 01-nghiep-vu/                    ← BA: HOW (business)
│   ├── 01-luong-nghiep-vu-cot-loi.md
│   ├── 02-quy-tac-nghiep-vu.md
│   ├── 03-thuat-ngu.md
│   └── 04-ma-tran-tinh-nang.md
│
├── 02-kien-truc/                    ← Tech Lead: HOW (system)
│   ├── 01-kien-truc-tong-the.md
│   ├── 02-cross-cutting.md          (auth, i18n, cache, log, error)
│   ├── 03-api-contract.md
│   └── decisions/                   ← ADR (Architectural Decision Records)
│       ├── ADR-001-hotel-content-reference.md
│       ├── ADR-002-pricing-pattern-c.md
│       ├── ADR-003-uuid-native-type.md
│       ├── ADR-004-must-login.md
│       ├── ADR-005-seo-polymorphic.md
│       ├── ADR-006-series-vs-private-tour.md
│       └── ADR-007-admin-reporting-tier.md
│
├── 03-co-so-du-lieu/                ← DBA: WHAT (data)
│   ├── 01-erd-tong-quan.md
│   ├── 02-thiet-ke-bang.md          ← spec từng bảng/field
│   ├── 03-toan-ven-concurrency.md   ← CHECK, FK, lock, partial index
│   ├── 04-quy-trinh-migration.md
│   └── migrations/                  ← Đặc tả từng migration SQL
│       └── 2026-05-27_add_pricing_options_and_allotment.md
│
├── 04-phat-trien/                   ← Dev: HOW (code)
│   ├── 01-quy-chuan-lap-trinh.md
│   ├── 02-quy-trinh-git.md
│   ├── 03-testing.md
│   └── 04-bao-mat-xac-thuc.md
│
├── 05-quan-ly-sprint/               ← Scrum Master: WHEN
│   ├── backlog-chi-tiet.md
│   ├── trang-thai-web.md
│   ├── sprint-1-nen-tang.md
│   ├── sprint-2-quan-tri-diem-den/
│   ├── sprint-3-tim-kiem-kham-pha/    ← Pause 40%
│   ├── sprint-4-schema-pivot/         ← 🔥 NOW (renumber từ 3.5)
│   ├── sprint-5-dong-tim-kiem/        ← Đóng nốt 60% Sprint 3
│   ├── sprint-6-dat-cho-thanh-toan/   ← Booking + Payment
│   ├── sprint-7-danh-gia/             ← Review only (drop Loyalty)
│   └── sprint-8-quy-hoach-toi-uu/     ← Dashboard + SEO + Launch
│
├── 99-tham-khao/                    ← Reference
│   ├── changelog.md                 ← Lịch sử thay đổi tài liệu (centralized)
│   ├── archive/                     ← Doc cũ (giữ history, không xoá)
│   └── ...
│
└── public/                          ← Asset (hình ERD, diagram, screenshot)
```

---

## Quick start theo vai trò

| Tôi là... | Đọc theo thứ tự |
| --- | --- |
| **Người mới (onboard 1 ngày)** | `00-san-pham/01-tam-nhin.md` → `01-nghiep-vu/03-thuat-ngu.md` → `03-co-so-du-lieu/01-erd-tong-quan.md` |
| **PO/PM (lên kế hoạch sprint)** | `00-san-pham/04-lo-trinh-phat-hanh.md` → `05-quan-ly-sprint/backlog-chi-tiet.md` |
| **BA (viết user story)** | `00-san-pham/03-personas-user-journey.md` → `01-nghiep-vu/01-luong-nghiep-vu-cot-loi.md` → `01-nghiep-vu/04-ma-tran-tinh-nang.md` |
| **Tech Lead (review thiết kế)** | `02-kien-truc/01-kien-truc-tong-the.md` → `02-kien-truc/decisions/` |
| **DBA (review schema)** | `03-co-so-du-lieu/02-thiet-ke-bang.md` → `03-co-so-du-lieu/03-toan-ven-concurrency.md` → `03-co-so-du-lieu/migrations/` |
| **Dev (code feature)** | `04-phat-trien/01-quy-chuan-lap-trinh.md` → file nghiệp vụ liên quan trong `01-nghiep-vu/` → bảng DB liên quan trong `03-co-so-du-lieu/02-thiet-ke-bang.md` |
| **Dev (start Sprint 4 Pivot)** | `05-quan-ly-sprint/sprint-4-schema-pivot/00-tong-quan.md` → `01-stories.md` → `02-runbook.md` |

---

## Convention

### 1. Đặt tên file

- Tiếng Việt không dấu, kebab-case: `01-tam-nhin.md`
- Đánh số 2 chữ số đầu file để giữ thứ tự đọc.

### 2. Versioning

- **Không** đặt version trong từng file (vd `v2.3`).
- Mọi thay đổi log vào **`99-tham-khao/changelog.md`** duy nhất.
- Mục đích: tránh "version drift" giữa các file.

### 3. ADR (Architectural Decision Records)

- Mọi quyết định kỹ thuật/sản phẩm có ảnh hưởng dài hạn → ADR tại `02-kien-truc/decisions/`.
- Format: `ADR-XXX-ten-quyet-dinh.md`, gồm Context — Decision — Consequences.
- ADR là **append-only**: nếu đảo quyết định cũ thì viết ADR mới ghi `Supersedes ADR-XXX`.

### 4. Asset

- Hình ERD, diagram, screenshot → `public/`.
- Link tương đối: `![ERD](../public/erd-v1.png)`.

---

## Trạng thái cấu trúc

| Folder | Trạng thái | Ghi chú |
| --- | --- | --- |
| `00-san-pham/` | ✅ Done | 4 file PO (vision + BMC + personas + roadmap) |
| `01-nghiep-vu/` | ✅ Done | 4 file BA (flow + rules + glossary + feature matrix) |
| `02-kien-truc/` | ✅ Done | 3 file Tech Lead + 7 ADR |
| `03-co-so-du-lieu/` | ✅ Done | 4 file DBA + migration `add_pricing_options_and_allotment` 10 PART (pending apply) |
| `04-phat-trien/` | ✅ Done | 4 file Dev (code standard + git + testing + security) |
| `05-quan-ly-sprint/` | ✅ Carry over | Sprint folder copy từ `02-quan-ly-sprint/` cũ — sẽ refine trong các sprint kế tiếp |
| `99-tham-khao/` | ✅ Done | `changelog.md` + `archive/` đầy đủ doc cũ |

> **Lịch sử thay đổi**: xem `99-tham-khao/changelog.md`.

---

## Câu hỏi thường gặp

**Q: Doc cũ ở đâu?**
A: Toàn bộ trong `99-tham-khao/archive/`. Mọi file `01-nen-tang-he-thong/*`, `roadmap.md`, `index.md`, `00-blueprint-handoff-*.md` đều còn nguyên trong đó.

**Q: Tại sao gom lại structure mới?**
A: Doc cũ phân theo "tầng kiến trúc" (tier 0→5) khiến nội dung trùng lặp và khó tra. Structure mới phân theo **vai trò** (PO/BA/Tech Lead/DBA/Dev) — mỗi role chỉ cần đọc folder của mình + xem qua folder liền kề là đủ làm việc.

**Q: ADR là gì? Khác `V-XX` cũ thế nào?**
A: `V-XX` là "vision anchor" trong file `00-tam-nhin.md` cũ — chỉ có dòng tag, không có context. ADR là format chuẩn công nghiệp: Context — Decision — Consequences — Status, cho phép trace ngược lý do quyết định.

**Q: Hotel có bookable riêng được không?**
A: **Không**. Xem `ADR-001-hotel-content-reference.md`. Hotel chỉ là content reference trong Tour package (Phase 1 + Phase 2).
