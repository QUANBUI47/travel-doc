# 04 — Lộ trình phát hành (Roadmap)

> **Vai trò đọc**: PO, PM, Scrum Master, Founder — biết "đang ở đâu trong timeline, sắp tới làm gì".
> **Cập nhật**: PM update sau mỗi sprint retro. Mọi pivot scope/sequence phải log vào `99-tham-khao/changelog.md`.

---

## Roadmap tổng (3 phase, 18 tháng)

```
2026 ────────────────────────────────────────────────────► 2027 ───►  2028+
 Q2          Q3            Q4              2027 Q1-Q2     Q3-Q4
 │           │             │               │              │
 │ Phase 1   │ Phase 1     │ Phase 1.5     │ Phase 2      │ Phase 3+
 │ MVP build │ MVP launch  │ EN + loyalty  │ Affiliate +  │ Hotel portal
 │           │ (beta)      │ + upsell      │ Mobile RN    │ lite, đa thị trường
 ▼           ▼             ▼               ▼              ▼
```

### Phase 1 — MVP (Q2-Q3/2026, 3-6 tháng)

**Mục tiêu**: Launch private beta tour operator B2C cho thị trường VN — book Series Tour online + lead capture Private Tour, có CMS đủ vận hành, SEO foundation, dashboard L0.

**Definition of Success**:
- ≥20 tour active trên web (Founder ký contract trước)
- Booking flow happy-path không lỗi với 3 user thật private beta
- SEO: sitemap động + 100% page có metadata + structured data
- Admin tạo 1 tour mới <5 phút (không cần dev support)
- Tháng 6 sau launch đạt ≥50 booking/tháng (target — có thể điều chỉnh)

### Phase 1.5 — Hoàn thiện & EN (Q4/2026)

**Mục tiêu**: Mở rộng audience + tăng AOV + chuẩn bị traffic Phase 2.

| Module | Lý do |
| --- | --- |
| EN landing + content tour quốc tế | Khách quốc tế ghé VN tăng → mở luồng EN |
| Loyalty cơ bản (point + voucher) | Repeat rate >20% → ROI cao hơn acquire mới |
| Upsell (bảo hiểm, room upgrade, sân bay riêng) | Tăng AOV 15-25% không cần thêm tour |
| Self-service cancel theo policy | Giảm load support |
| Admin Dashboard L1 (conversion, AOV, retention) | Đo lường hiệu quả marketing |

### Phase 2 — Scale (2027)

**Mục tiêu**: Tăng acquisition channel + chuyển mobile.

| Module | Lý do |
| --- | --- |
| Affiliate / KOL referral | Acquire mới qua người nổi tiếng — không marketplace |
| Mobile app (React Native) | Khi web mobile đã chứng minh retention |
| Inventory tinh chỉnh (per-date allotment tracking) | Khi volume đủ để vận hành chi tiết hơn |
| Admin Dashboard L2 (P&L tour, profit/tour) | Khi accounting đã ổn định |

### Phase 3+ — Mở rộng (2028+)

- Hotel portal lite (vẫn không OTA — chỉ partner self-update info)
- Đa thị trường (CN/JP nếu data ủng hộ)
- Multi-tenant admin nếu acquire công ty khác
- **Chưa committed** — phụ thuộc Phase 1+2 outcome.

---

## Sprint roadmap Phase 1

```
SPRINT 1 ──► SPRINT 2 ──► SPRINT 3 ──► SPRINT 4 ──► SPRINT 5 ──► SPRINT 6
Foundation  CMS         Discovery    Booking      Member       Optimize
(Done)      (Done)      (Doing)      (Upcoming)   (Upcoming)   (Upcoming)
```

### Tầng 1 — Foundation (Sprint 1-2, Done)

**Sprint 1 — Nền tảng & Hạ tầng** ✅
- Mono-repo (Web + App + Doc)
- Prisma + Supabase Auth + middleware admin/public
- Service layer convention

→ Chi tiết: `../05-quan-ly-sprint/sprint-1-nen-tang.md`

**Sprint 2 — Quản trị Nội dung & Điểm đến** ✅
- CRUD destination / tour / hotel / room / region
- Cloudinary upload + image management
- Audit log (`ActivityLog`)

→ Chi tiết: `../05-quan-ly-sprint/sprint-2-quan-tri-diem-den/`

### Tầng 2 — Revenue path (Sprint 3-4, Doing/Upcoming)

**Sprint 3 — Khám phá & Tìm kiếm** 🔶 In Progress (~40%)
- Tour listing + filter (destination, giá, thời gian, mood)
- Autocomplete + map cluster (chưa)
- SSR/ISR + cache

→ Chi tiết: `../05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/`

**Sprint 4 — Đặt chỗ & Thanh toán** ⏳ Upcoming (10% stub)
- **Sprint quan trọng nhất Phase 1** — sinh revenue
- Booking flow: cart → form → payment → confirm
- Pessimistic lock `TourDeparture.bookedCount`
- VNPay + MoMo integration
- `InquiryRequest` lead capture (Private Tour)
- Cron auto-cancel booking PENDING quá 15 phút
- Email transactional (Resend)

**Pre-requisites cứng** (phải xong TRƯỚC khi start):
1. Migration `add_pricing_options_and_allotment` (10 PART) chạy thành công
2. Schema `@db.Uuid` toàn bộ ID/FK (ADR-003)
3. `Booking.userId` + `Review.userId` chuyển `onDelete: Restrict`
4. Doc: `03-co-so-du-lieu/03-toan-ven-concurrency.md` đã chốt

→ Chi tiết: `../05-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/`

### Tầng 3 — Retention & SEO (Sprint 5-6, Upcoming)

**Sprint 5 — Thành viên & Đánh giá** ⏳
- User profile + booking history
- Review verified (chỉ booking `COMPLETED`)
- Profile portal `/account/*`

→ Chi tiết: `../05-quan-ly-sprint/sprint-5-thanh-vien-danh-gia/`

**Sprint 6 — Quy hoạch & Tối ưu** ⏳
- SEO toàn diện (Lighthouse >90, Core Web Vitals)
- Sitemap + robots.txt + structured data đầy đủ
- Admin Dashboard L0 (booking hôm nay, doanh thu tuần, top tour, export CSV)
- Performance optimize + cache tuning
- Pre-launch checklist

→ Chi tiết: `../05-quan-ly-sprint/sprint-6-quy-hoach-toi-uu/`

---

## Sequencing — vì sao theo thứ tự này

| Quyết định | Lý do |
| --- | --- |
| **Booking-first** (Sprint 4 trước Sprint 5) | Sinh revenue. Review schema có sẵn nhưng UI có thể defer 1 sprint mà không chặn launch |
| **CMS trước Discovery** | Admin cần tạo tour để có data hiển thị; Sprint 3 dùng data Sprint 2 |
| **SEO Sprint 6, không phải Sprint 1** | Foundation SEO (metadata, sitemap) có từ Sprint 1; optimize Lighthouse Sprint 6 khi data đủ |
| **Optimize cuối cùng** | Profiling cần production-like data → chạy trên data thật |
| **Inquiry chung Sprint 4** | Cùng touch booking + email + admin notification — gộp tránh duplicate |

---

## Milestones & Deliverables

| Tháng | Milestone | Output |
| --- | --- | --- |
| **M1** (now) | Migration `add_pricing_options_and_allotment` done | Schema UUID + 10 PART applied |
| **M2** | Sprint 3 Discovery close | Tour listing + filter prod-ready |
| **M3** | Sprint 4 Booking close | Booking flow end-to-end + 3 user beta |
| **M4** | Sprint 5 close | Review verified live, profile portal |
| **M5** | Sprint 6 close | Lighthouse >90, Dashboard L0 |
| **M6** | **Private beta launch** | 20 tour + 3-5 user thật + Founder go-live |

---

## Risk to schedule

| Risk | Tác động | Mitigation |
| --- | --- | --- |
| Migration `add_pricing_options_and_allotment` fail rollback | Block Sprint 4 → mất 1-2 tuần | Test trên DB staging copy production trước, script audit pre-flight |
| VNPay/MoMo sandbox không stable | Block Sprint 4 acceptance | Sandbox sớm Sprint 3 cuối, mock fallback |
| SEO traffic không lên đúng kỳ vọng | Phase 1.5 lùi | Dồn Ads budget bù 6-12 tháng đầu |
| Hotel partner không đủ 20 tour | Phase 1 launch trì hoãn | Founder track contract weekly, có buffer 30% |
| Team scale: 2 dev không kịp | Sprint trễ 2-3 tuần | Đã chấp nhận trade-off scope, không scope creep |

---

## Build vs Buy — quyết định Phase 1

| Module | Build / Buy | Lý do |
| --- | --- | --- |
| Auth | **Buy** (Supabase Auth) | Free tier đủ, không build custom — security risk |
| Payment | **Buy** (VNPay + MoMo SDK) | Bắt buộc — không có lựa chọn build |
| Email transactional | **Buy** (Resend) | Free tier 3k/tháng đủ phase 1 |
| Image hosting | **Buy** (Cloudinary) | Free tier đủ, optimize tự động |
| Analytics | **Buy** (PostHog free / Plausible) | Build từ 0 mất 2-3 sprint |
| Search | **Build** (Postgres full-text) | Phase 1 chưa cần Algolia/Meilisearch — Postgres đủ với <1k tour |
| CMS | **Build** (Next.js admin portal) | Off-the-shelf CMS không hợp model tour |
| Dashboard L0 | **Build** | Đơn giản, query Prisma + render. L1/L2 sau cân nhắc buy |

---

## Resource Phase 1

| Vai trò | FTE | Trách nhiệm |
| --- | --- | --- |
| Founder | 1.0 | Vision, contract hotel/partner, sales, GTM |
| Tech Lead / Senior Dev | 1.0 | Architecture, DB, code review, mentor |
| Dev (mid/junior) | 1-2 | Feature implementation theo sprint |
| Content / Ops (part-time) | 0.5 | Upload tour, viết SEO content, hỗ trợ khách |
| Designer (freelance) | 0.2 | UI Figma + component spec |

**Tổng**: 3-5 FTE Phase 1. Phase 1.5 cân nhắc thêm 1 marketer + 1 customer support.

---

## Liên kết

- Vision: `01-tam-nhin.md`
- Mô hình kinh doanh: `02-mo-hinh-kinh-doanh.md`
- Personas: `03-personas-user-journey.md`
- Sprint folders: `../05-quan-ly-sprint/`
- Trạng thái triển khai web: `../05-quan-ly-sprint/trang-thai-web.md`
- Backlog chi tiết: `../05-quan-ly-sprint/backlog-chi-tiet.md`
