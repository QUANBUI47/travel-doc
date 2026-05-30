# Tầm Nhìn Sản Phẩm — Vivu Travel

> **Phiên bản:** 1.4 · **Ngày:** 26/05/2026
> **Trạng thái:** Đã chốt · **Tier:** 0 (Vision)
>
> File này là **constitution** của sản phẩm. Mọi quyết định technical về
> sau phải trace ngược về một trong các dòng dưới đây. Nếu không trace
> được → dấu hiệu chệch hướng, dừng lại review trước khi code.
>
> **Quy tắc:** chỉ sửa khi có pivot business thật sự (founder duyệt).
> Mỗi lần sửa cập nhật `Changelog` cuối file.

---

## 1. WHY — Vì sao Vivu tồn tại

Người Việt khi đặt tour du lịch B2C hiện đang bị kẹt giữa 2 cực:

- **Facebook/Zalo + operator nhỏ lẻ**: không minh bạch giá, không có
  review độc lập đáng tin, mô tả lịch trình rời rạc qua tin nhắn, thanh
  toán chuyển khoản tay → khó kiểm chứng chất lượng trước khi đi.
- **Sàn quốc tế (Traveloka, Klook, Agoda)**: nghiêng về tour chuẩn hoá
  quốc tế, thiếu tour local đặc trưng Việt Nam (homestay vùng cao, tour
  đêm phố cổ, food-tour địa phương), trải nghiệm tiếng Việt còn cứng.

**Vivu Travel lấp khoảng giữa**: tour B2C minh bạch về giá / lịch trình
/ đánh giá, đặt online 24/7, do người Việt vận hành cho khách Việt.

---

## 2. WHO — Khách hàng mục tiêu

| Nhóm | Mô tả ngắn | Phase tập trung |
| --- | --- | --- |
| **B2C primary** | Người Việt 25-45 tuổi, thu nhập trung-cao, đi gia đình / cặp đôi / nhóm bạn, đã từng đi tour, sẵn sàng book online. | Phase 1 |
| **B2C secondary** | Khách quốc tế tới Việt Nam (landing EN). | Phase 1.5 |
| **Admin nội bộ** | Operator Vivu — quản inventory, đẩy promotion, theo dõi đơn. | Phase 1 |

Chi tiết 3 personas + journey map: xem
[`00c-personas-user-journey.md`](./00c-personas-user-journey.md).

---

## 3. WHAT — Sản phẩm cụ thể

Vivu Travel = **tour operator B2C trực tuyến**, do Vivu tự cung cấp tour
(không phải marketplace, không phải affiliate). Doanh thu đến từ việc
bán tour trực tiếp.

**Phase 1 (MVP, 3–6 tháng) bao gồm:**

| Module | Có ở MVP | Mô tả ngắn |
| --- | :---: | --- |
| Tour browse + filter + detail | ✅ | List, filter theo vùng/giá/thời gian, trang detail có gallery + itinerary |
| Tour booking + thanh toán | ✅ | VNPay/MoMo, **bắt buộc login**, snapshot pricing |
| Tour departure & inventory | ✅ | Quản lý lịch khởi hành, slot, anti-overbook |
| Hotel info gắn vào tour combo | ✅ | Content reference (không book riêng), gắn vào từng ngày itinerary |
| Auth khách hàng | ✅ | Email + Google OAuth, dual cookie admin/public |
| Review tour | ✅ | Khách đã hoàn thành tour mới review được |
| SEO foundation | ✅ | Sitemap động + structured data + polymorphic metadata override |
| Admin CMS | ✅ | Tour, destination, hotel, booking, settings, audit log |
| Admin Dashboard L0 (Operational) | ✅ | Số đơn hôm nay, doanh thu tuần, top tour, export CSV booking |
| Tour pricing per-pax + upsell options | ✅ | priceAdult/Child/Infant + TourOption (room upgrade, single supplement, service add-on) |
| Private Tour Lead Capture | ✅ | Form "Đặt tour cho nhóm riêng" → `InquiryRequest` → admin liên hệ quote manual (V-12) |
| Hotel allotment monthly tracking | ✅ | Admin nhập tay đầu tháng số phòng-đêm contracted, theo dõi used/released — không per-date |
| Booking payment hold 15 phút | ✅ | Booking PENDING + cron auto-cancel + release slot — chống "ghost booking" |
| Tour policy structured (JSON + Zod) | ✅ | Chính sách trẻ em, extra bed, inclusions/exclusions, cancellation tier rõ |
| Allotment risk management | ✅ | TourDeparture min/max participants + cancellation deadline + cảnh báo manual |
| i18n VI/EN | ✅ | next-intl từ ngày 1 để không phải refactor sau |

**Phase 1 cố ý KHÔNG có** — chi tiết ở Phần 7 (Non-Goals).

---

## 4. HOW — Mô hình vận hành & doanh thu

### Mô hình vận hành (Operating model)

- Vivu là **tour operator trực tiếp**: tự ký contract với hotel /
  transport / guide → đóng gói thành tour package → bán cho khách cuối.
- **Không trung gian**: không marketplace, không commission split, không
  affiliate. Vivu sở hữu toàn bộ tour mình bán.
- **Hotel partner** chỉ là content reference: Vivu contract trước
  (allotment phòng theo mùa/quý), khi bán tour thì block phòng đã giữ.
  Customer không "chọn hotel" — hotel là attribute của package.
- Khách book → Vivu thu tiền → Vivu thực hiện tour (hoặc outsource một
  phần cho local partner trong cùng contract).

### Doanh thu

- **Phase 1**: chênh lệch giá tour (markup) = giá bán - tổng chi phí
  vận hành (allotment hotel + transport + guide + ăn uống + overhead).
- **Phase 1.5+**: thêm upsell (bảo hiểm du lịch, dịch vụ thêm), voucher
  cho khách quay lại.
- **Phase 2+**: affiliate / KOL commission (KOL ref khách → KOL ăn %,
  tour vẫn của Vivu — không phải marketplace).

---

## 5. WHERE — Thị trường & ngôn ngữ

| Khía cạnh | Phase 1 | Phase 1.5 | Phase 2 |
| --- | --- | --- | --- |
| Địa lý | Việt Nam (3 miền) | Việt Nam + landing EN cho khách quốc tế tới VN | Mở rộng nội địa sâu hơn theo từng tỉnh |
| Ngôn ngữ | VI chính + EN khung sườn | EN content đầy đủ cho tour quốc tế | Có thể thêm CN/JP nếu thị trường khách đó tăng |
| Tiền tệ | VND only | VND only (hiển thị quy đổi USD hint) | Cân nhắc multi-currency khi có data |

---

## 6. WHEN — Lộ trình tổng

| Phase | Thời gian dự kiến | Mục tiêu chính |
| --- | --- | --- |
| **Phase 1 MVP** | Q2–Q3/2026 (3–6 tháng) | Tour book + pay + admin CMS + SEO foundation; launch private beta |
| **Phase 1.5** | Q4/2026 | EN landing, loyalty cơ bản (điểm, voucher), upsell |
| **Phase 2** | 2027 | Affiliate / KOL referral, mobile app (RN), tinh chỉnh inventory |
| **Phase 3+** | 2028+ | Mở khả năng hotel portal lite, đa thị trường — chưa committed |

Mapping với sprint hiện có: xem
[`02-quan-ly-sprint/roadmap.md`](../roadmap.md) và
[`02-quan-ly-sprint/trang-thai-web.md`](../02-quan-ly-sprint/trang-thai-web.md).

---

## 7. Non-Goals — Cái chúng ta CỐ Ý không làm

> **Vì sao có phần này:** scope creep là kẻ thù số 1 của startup. Mỗi
> tính năng từ chối phải có lý do rõ ràng, không chỉ "chưa làm" mà là
> "cố ý không làm ở phase này". Mỗi PR/sprint mới phải check: feature
> này có rơi vào Non-Goals không? Nếu có → reject hoặc escalate.

| Cái KHÔNG làm Phase 1 | Vì sao |
| --- | --- |
| **Marketplace** (cho operator khác list tour) | Vivu là tour operator trực tiếp, không phải sàn. Build marketplace sẽ confuse brand + tăng auth surface 3x. |
| **Hotel booking độc lập** (khách tự chọn hotel/ngày, không qua tour) | Phase 1 **và Phase 2** đều KHÔNG mở. Vivu là tour operator, không trở thành OTA hotel. **DROP `HotelBooking` model + `bookingType` enum** khỏi schema (YAGNI - V-05 lock). |
| **Hotel supplier portal / mini-PMS** | Inventory hotel là việc của hotel, không phải của tour operator. Vivu contract allotment trước với hotel (`HotelAllotment` monthly - V-10) — như cách industry (Vietravel/Saigontourist) làm. |
| **Mobile native app** | Web SEO + responsive đủ cho conversion MVP. Mobile chỉ làm khi data chứng minh >X% traffic mobile có retention cao. |
| **Guest checkout** (book không login) | Bắt buộc login để build loyalty + giảm fake booking + dễ dispute. Trade-off friction chấp nhận được vì khách book tour không impulsive như mua hàng. |
| **Multi-currency / Stripe quốc tế** | Phase 1 chỉ VND + VNPay/MoMo. Multi-currency chỉ tính khi tỉ lệ khách quốc tế đáng kể. |
| **Loyalty system chính thức** (point, tier, redemption) | Phase 1.5 sau khi có lượng user base. Phase 1 chỉ cần tracking user. |
| **Live chat / chatbot AI** | Phase 2. MVP dùng email + hotline. Hỗ trợ tốt hơn để học customer pain trước khi auto. |
| **Multi-tenant admin** (nhiều brand cùng codebase) | Vivu single brand. Multi-brand chỉ tính Phase 3 nếu acquire công ty khác. |
| **CMS legal content tự build** | Dùng `LegalContent` model tối giản (đã có schema). Không build editor phức tạp. |
| **Public REST API mở ra ngoài** | `/api/v1/*` chỉ phục vụ internal (admin + mobile sau). Không mở public dev portal Phase 1. |
| **Admin Dashboard L1/L2** (business metrics + full P&L lỗ lãi) | Phase 1 chỉ L0 (operational). L1 conversion/AOV/retention Phase 1.5. L2 P&L Phase 2 hoặc outsource cho Excel + kế toán. Lý do: spend dev cho doanh thu, không phải báo cáo. |

---

## 8. Bảy quyết định gốc đã chốt (Anchor decisions)

Mỗi quyết định ở đây có **ID** để các doc kỹ thuật khác trace về.

| ID | Quyết định | Trace tới |
| --- | --- | --- |
| **V-01** | MVP **chỉ book tour** (Series Tour ghép). Hotel chỉ display combo gắn vào tour. Private Tour / Corporate Group: chỉ lead capture form, admin contact lại — không book online (V-12) | Mục 3 (WHAT) + Mục 7 (Non-Goals) |
| **V-02** | **B2C trực tiếp**, Vivu tự là tour operator (không marketplace) | Mục 4 (HOW) |
| **V-03** | **SEO-first** là kênh acquisition chính Phase 1 | Mục 5 + ràng buộc tech: SeoPage polymorphic + sitemap động phải wire sớm |
| **V-04** | **Bắt buộc login** để book tour | Mục 7 (Non-Goals "guest checkout") + ràng buộc schema: `Booking.userId` NOT NULL |
| **V-05** | **Hotel = "Content Reference" VĨNH VIỄN** (cả Phase 1 lẫn Phase 2). Hotel chỉ display + gắn vào tour qua `TourItinerary.hotelId` + tracking allotment monthly (`HotelAllotment` - V-10). KHÔNG có portal cho hotel partner, KHÔNG cho phép booking hotel độc lập (kể cả Phase 2). Vivu là **tour operator**, không trở thành OTA hotel. **DROP `HotelBooking` model + `bookingType` enum khỏi schema** (YAGNI). Phase 2 mở rộng theo hướng cruise / vé máy bay / private tour online | Mục 4 + Non-Goals "hotel portal" + "hotel booking standalone" + DROP schema legacy |
| **V-06** | **Team 2-3 dev**: doc onboarding + naming convention cứng | Mục 1 (Personas) + ràng buộc process: code review compulsory + doc-before-code |
| **V-07** | **Phase 2 mở**: loyalty + referral + affiliate KOL (không marketplace) | Mục 4 (HOW) + Mục 6 (WHEN) — schema phải chừa cửa |
| **V-08** | **Admin Reporting 3 tier (L0/L1/L2)**: Phase 1 chỉ L0 (operational dashboard). L1 business metrics Phase 1.5. L2 full P&L Phase 2 hoặc outsource Excel. Schema **chừa cửa** từ Phase 1: `Tour.estimatedCost` + `TourDeparture.actualCostPerPax` (nullable) | Mục 3 (WHAT) + Non-Goals "L1/L2" + ràng buộc schema |
| **V-09** | **Pricing per-pax Pattern C** (per-pax + service tier upsell): `Tour.priceAdult` NOT NULL + `priceChild`/`priceInfant`/`singleSupplement` nullable. Model `TourOption` cho room upgrade + add-on. `TourBooking.priceBreakdown` Json lưu chi tiết tính + tách `adultsCount`/`childrenCount`/`infantsCount` | Mục 3 (WHAT) + ràng buộc schema migration |
| **V-10** | **Operational Risk Management** — tích hợp 4 cơ chế: (1) `TourDeparture.minParticipants` + `cancellationDeadline` chống wash; (2) `Booking.paymentDeadline` + cron auto-cancel 15 phút chống ghost booking; (3) `HotelAllotment` monthly tracking (admin nhập tay) chống over-commit; (4) `Tour.policy` structured Zod (children + cancellation tier + inclusions) cho transparency | Mục 3 (WHAT) + Non-Goals "Per-date inventory" + ràng buộc schema |
| **V-12** | **Series + Private Tour split**. Series Tour (khách lẻ 1-4 người, ghép đoàn 15-20) book online qua `TourDeparture`. Private Tour / Corporate Group (10+ người, custom hoá) dùng `InquiryRequest` lead capture form → admin liên hệ quote manual. Schema phân biệt rõ 2 flow. Phase 2 cân nhắc nâng cấp Private Tour online nếu ROI tốt. | Mục 3 (WHAT) + Mục 4 (HOW Operating) + ràng buộc schema |

---

## 9. Quy tắc dùng vision này

1. **Vision = constitution.** Không sửa khi có biến động nhỏ. Chỉ sửa
   khi có pivot business thật sự (founder duyệt + ghi vào Changelog).
2. **Mọi quyết định technical phải trace về anchor (V-01 → V-12).**
   Trong PR description, code comment, sprint spec — nếu không trace
   được → dấu hiệu chệch hướng, dừng lại review.
3. **Non-Goals quan trọng ngang Goals.** Mỗi sprint mới phải check
   feature có rơi vào Non-Goals không. Nếu rơi → escalate trước khi
   commit code.
4. **Update định kỳ.** Mỗi quý review 1 lần. Không có "vision drift"
   im lặng — mọi thay đổi đều phải ghi Changelog.
5. **Anchor immutable trong phase.** ID V-01 → V-12 không được tái sử
   dụng cho quyết định khác. Nếu V-05 bị thay → tăng version V-05.1.

---

## Changelog

| Ngày | Version | Thay đổi | Người duyệt |
| --- | --- | --- | --- |
| 26/05/2026 | 1.0 | Khởi tạo từ [`00-blueprint-handoff-2026-05-26.md`](../00-blueprint-handoff-2026-05-26.md). Chốt 7 anchor V-01 → V-07 sau session mentor: MVP tour-only, B2C direct, SEO-first, must-login, hotel content-reference, team 2-3 dev, Phase 2 loyalty/affiliate. | Founder |
| 26/05/2026 | 1.1 | Thêm anchor **V-08** (Admin Reporting 3 tier L0/L1/L2). Cập nhật Phần 3 (WHAT) include "Admin Dashboard L0 Operational". Cập nhật Non-Goals (Phần 7) thêm dòng L1/L2 reporting Phase 1.5+. Quyết định: schema chừa cửa cost tracking ngay Phase 1 (`Tour.estimatedCost`, `TourDeparture.actualCostPerPax`). | Founder |
| 26/05/2026 | 1.2 | Thêm anchor **V-09** (Pricing Pattern C per-pax + upsell) + **V-10** (Operational Risk Management — 4 cơ chế). Pivot scope từ "Plan A nguyên bản" → **"Plan A+"** sau khi user research industry: thêm `HotelAllotment` (monthly), `TourOption` (upsell), `Booking.paymentDeadline` (15-min hold + cron), `Tour.policy` structured. Vẫn KHÔNG có Hotel portal + KHÔNG có per-date inventory. | Founder |
| 26/05/2026 | 1.3 | Thêm anchor **V-12** (Series + Private Tour split) sau khi user raise case "công ty 40 người". Series Tour book online qua `TourDeparture`. Private Tour / Corporate Group dùng `InquiryRequest` lead capture (admin xử lý manual). Update V-01 nói rõ Phase 1 chỉ bán Series online. | Founder |
| 26/05/2026 | 1.4 | **YAGNI pivot**: User push back về polymorphic Booking → tôi đồng ý reconsider. Vivu là tour operator, không trở thành OTA hotel kể cả Phase 2. Update V-05 thành "**Hotel = Content Reference VĨNH VIỄN**" (extend Phase 2). DROP `HotelBooking` model + `bookingType` enum + `Booking.checkIn`/`checkOut` khỏi schema. Schema cleaner → 20 tables thay vì 21. Cập nhật Non-Goals Phần 7. | Founder |

---

*File này thuộc **Tier 0 (Vision)** trong framework
[`00-blueprint-handoff-2026-05-26.md`](../00-blueprint-handoff-2026-05-26.md)
Phần III. Liên kết tới các tier khác:*

- *Tier 1 Business Model: [`00b-mo-hinh-kinh-doanh.md`](./00b-mo-hinh-kinh-doanh.md)*
- *Tier 1 Personas: [`00c-personas-user-journey.md`](./00c-personas-user-journey.md)*
- *Tier 2 Strategy: [`01-chien-luoc-tong-the.md`](./01-chien-luoc-tong-the.md)*
- *Tier 3 Architecture: [`01-kien-truc-he-thong.md`](./01-kien-truc-he-thong.md)*
- *Tier 4 Data: [`03-thiet-ke-du-lieu-chi-tiet.md`](./03-thiet-ke-du-lieu-chi-tiet.md)*
