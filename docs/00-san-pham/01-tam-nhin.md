# 01 — Tầm nhìn sản phẩm

> **Vai trò đọc**: PO, PM, Founder, Tech Lead — bất kỳ ai muốn hiểu **vì sao** dự án này tồn tại trước khi xem code/schema.
> **Quy tắc cập nhật**: chỉ sửa khi có pivot business thật (Founder duyệt). Mọi thay đổi log vào `99-tham-khao/changelog.md`.

---

## WHY — Vì sao Vivu tồn tại

Người Việt đặt tour du lịch B2C đang kẹt giữa 2 cực:

- **Facebook/Zalo + operator nhỏ lẻ**: không minh bạch giá, không có review độc lập, mô tả lịch trình rời rạc qua tin nhắn, chuyển khoản tay → khó kiểm chứng chất lượng trước khi đi.
- **Sàn quốc tế (Traveloka, Klook, Agoda)**: nghiêng về tour chuẩn hoá quốc tế, thiếu tour local đặc trưng Việt Nam (homestay vùng cao, foodtour địa phương), trải nghiệm tiếng Việt còn cứng.

**Vivu lấp khoảng giữa**: tour B2C minh bạch về giá / lịch trình / đánh giá, đặt online 24/7, do người Việt vận hành cho khách Việt.

---

## WHO — Khách hàng mục tiêu

| Nhóm | Mô tả ngắn | Phase tập trung |
| --- | --- | --- |
| **B2C primary** | Người Việt 25-45 tuổi, thu nhập trung-cao, đi gia đình / cặp đôi / nhóm bạn. | Phase 1 |
| **B2C secondary** | Khách quốc tế tới Việt Nam (landing EN). | Phase 1.5 |
| **Admin nội bộ** | Operator Vivu — quản inventory, đẩy promotion, theo dõi đơn. | Phase 1 |

→ Chi tiết 3 personas xem `03-personas-user-journey.md`.

---

## WHAT — Sản phẩm cụ thể

Vivu = **tour operator B2C trực tuyến**, tự cung cấp tour (không marketplace, không affiliate).

**Phase 1 (MVP, 3–6 tháng):**

| Module | Có ở MVP? | Tóm tắt |
| --- | :---: | --- |
| Tour browse + filter + detail | ✅ | List/filter/detail có gallery + itinerary |
| Tour booking + thanh toán | ✅ | VNPay/MoMo, bắt buộc login, snapshot pricing |
| Tour departure & inventory | ✅ | Lịch khởi hành, slot, anti-overbook |
| Hotel info trong tour combo | ✅ | Content reference, không book riêng |
| Auth khách hàng | ✅ | Email + Google OAuth, dual cookie admin/public |
| Review tour | ✅ | Khách đã hoàn thành tour mới review |
| SEO foundation | ✅ | Sitemap động + structured data + metadata override |
| Admin CMS | ✅ | Tour, destination, hotel, booking, settings, audit log |
| Admin Dashboard L0 (Operational) | ✅ | Đơn hôm nay, doanh thu tuần, top tour, export CSV |
| Tour pricing + upsell options | ✅ | Per-pax + TourOption (room upgrade, single supplement…) |
| Private Tour Lead Capture | ✅ | Form "Đặt nhóm riêng" → admin liên hệ quote manual |
| Hotel allotment monthly tracking | ✅ | Admin nhập tay đầu tháng — không per-date |
| Booking payment hold 15 phút | ✅ | PENDING + cron auto-cancel + release slot |
| Tour policy structured | ✅ | JSON + Zod: trẻ em, cancellation tier, inclusions |
| i18n VI/EN | ✅ | next-intl từ ngày 1 |

Phase 1 **cố ý không có** — xem mục Non-Goals.

---

## HOW — Mô hình vận hành & doanh thu

- Vivu là **tour operator trực tiếp**: tự ký contract hotel/transport/guide → đóng gói tour → bán cho khách cuối.
- **Không trung gian**: không marketplace, không commission split.
- **Hotel** chỉ là content reference: Vivu contract trước (allotment monthly), bán tour thì block phòng đã giữ. Customer không "chọn hotel" — hotel là attribute của package.
- **Doanh thu** Phase 1 = markup (giá bán − giá vốn). Phase 1.5+ thêm upsell. Phase 2+ thêm affiliate KOL.

→ Chi tiết kinh tế đơn hàng + KPI: `02-mo-hinh-kinh-doanh.md`.

---

## WHERE — Thị trường & ngôn ngữ

| Khía cạnh | Phase 1 | Phase 1.5 | Phase 2 |
| --- | --- | --- | --- |
| Địa lý | Việt Nam (3 miền) | + landing EN | Mở rộng nội địa sâu hơn |
| Ngôn ngữ | VI chính + EN khung | EN đầy đủ tour quốc tế | Cân nhắc CN/JP |
| Tiền tệ | VND only | VND + USD hint | Cân nhắc multi-currency |

---

## WHEN — Lộ trình tổng

| Phase | Thời gian | Mục tiêu |
| --- | --- | --- |
| **Phase 1 MVP** | Q2–Q3/2026 | Tour book + pay + CMS + SEO; launch private beta |
| **Phase 1.5** | Q4/2026 | EN landing, loyalty cơ bản, upsell |
| **Phase 2** | 2027 | Affiliate KOL, mobile RN, tinh chỉnh inventory |
| **Phase 3+** | 2028+ | Hotel portal lite, đa thị trường — chưa commit |

→ Sprint mapping chi tiết: `04-lo-trinh-phat-hanh.md`.

---

## Non-Goals — Cái cố ý KHÔNG làm Phase 1

> Scope creep là kẻ thù số 1. Mỗi PR/sprint mới phải check: feature này có rơi vào Non-Goals không? Nếu có → escalate trước khi commit.

| Cái KHÔNG làm | Lý do ngắn |
| --- | --- |
| **Marketplace** (operator khác list tour) | Vivu là operator trực tiếp, không phải sàn. Build marketplace confuse brand + tăng auth surface 3x. |
| **Hotel booking độc lập** | Phase 1 + 2 đều không. Vivu không trở thành OTA hotel. → ADR-001. |
| **Hotel supplier portal** | Inventory hotel là việc của hotel. Vivu contract allotment trước — như cách industry làm. |
| **Mobile native app** | Web responsive đủ cho MVP. Mobile chỉ làm khi data chứng minh retention. |
| **Guest checkout** (book không login) | Bắt buộc login → loyalty + giảm fake + dễ dispute. → ADR-004. |
| **Multi-currency / Stripe quốc tế** | Phase 1 chỉ VND + VNPay/MoMo. |
| **Loyalty system chính thức** | Phase 1.5 sau khi có user base. |
| **Live chat / chatbot AI** | Phase 2. MVP dùng email + hotline. |
| **Multi-tenant admin** | Vivu single brand. Multi chỉ Phase 3 nếu acquire công ty khác. |
| **Public REST API mở** | `/api/v1/*` chỉ internal. Không dev portal Phase 1. |
| **Admin Dashboard L1/L2** | L0 (operational) đủ Phase 1. L1 conversion 1.5. L2 P&L Phase 2 hoặc Excel + kế toán. |

---

## Quyết định gốc — trace về ADR

Mọi quyết định technical phải trace về 1 trong các ADR sau (folder `02-kien-truc/decisions/`):

| ADR | Quyết định | Status |
| --- | --- | --- |
| **ADR-001** | Hotel = Content Reference vĩnh viễn (cả Phase 2) — DROP `HotelBooking` + `bookingType` | Accepted |
| **ADR-002** | Pricing Pattern C: per-pax + service tier upsell (`TourOption`) | Accepted |
| **ADR-003** | UUID native type cho toàn schema (`@db.Uuid`) — fix TEXT mismatch | Accepted (PART 0 migration) |
| **ADR-004** | Must-login để book — không guest checkout | Accepted |
| **ADR-005** | SEO-first acquisition: `SeoPage` polymorphic + sitemap động + Next.js metadata | Accepted |
| **ADR-006** | Series + Private Tour split — `TourDeparture` (online) vs `InquiryRequest` (lead capture) | Accepted |
| **ADR-007** | Admin Reporting 3 tier L0/L1/L2 — Phase 1 chỉ L0; schema chừa cửa cost tracking | Accepted |

→ Folder ADR sẽ fill ở D4/D5.

---

## Quy tắc dùng file này

1. **Vision = constitution**. Không sửa khi có biến động nhỏ. Chỉ sửa khi pivot business thật.
2. **Mọi quyết định technical trace về ADR** (không phải V-XX cũ — đã deprecated).
3. **Non-Goals quan trọng ngang Goals**. Mỗi sprint mới phải check.
4. **Update định kỳ**: review 1 lần/quý. Mọi thay đổi log vào `99-tham-khao/changelog.md`.

---

## Liên kết

- Mô hình kinh doanh: `02-mo-hinh-kinh-doanh.md`
- Personas + journey: `03-personas-user-journey.md`
- Lộ trình sprint: `04-lo-trinh-phat-hanh.md`
- ADR folder: `../02-kien-truc/decisions/`
- Doc cũ (V-XX anchors): `../99-tham-khao/archive/01-nen-tang-he-thong/00-tam-nhin.md`
