# 02 — Mô hình kinh doanh

> **Vai trò đọc**: PO, Founder, BA — trả lời "Vivu bán gì, cho ai, ăn tiền thế nào" trong 5 phút.
> **Quy tắc dùng**: mỗi feature đề xuất phải trả lời được "phục vụ câu hỏi nào dưới đây?". Không phục vụ câu nào → có thể không tạo giá trị, review lại.

> **Thuật ngữ kinh doanh** (markup, CAC, AOV, conversion, runway, break-even…) — xem `../01-nghiep-vu/03-thuat-ngu.md`.

---

## 7 câu hỏi cốt lõi

1. [Vivu bán cái gì?](#1--bán-gì)
2. [Bán cho ai?](#2--bán-cho-ai)
3. [Khách tìm thấy Vivu bằng cách nào?](#3--kênh-discover)
4. [Vivu kiếm tiền thế nào? Bao nhiêu?](#4--kiếm-tiền)
5. [Tiền chi đi đâu?](#5--chi-phí)
6. [Đối thủ là ai? Vivu hơn ở đâu?](#6--đối-thủ--positioning)
7. [Rủi ro & KPI sống còn](#7--rủi-ro--kpi)

---

## 1 — Bán gì

**Tour du lịch trọn gói** (tour package). Khách trả 1 cục tiền, Vivu lo hết: xe, hotel, ăn uống, hướng dẫn viên, vé tham quan.

**Ví dụ**: Tour Đà Lạt 4N3Đ, khởi hành 15/06/2026, 4.5tr/người. Bao gồm xe khứ hồi SG-ĐL, hotel 3★, 3 bữa sáng + 4 bữa tối, vé Langbiang, HDV.

**KHÔNG bán**:
- Hotel riêng lẻ (không cạnh tranh Agoda/Booking)
- Vé máy bay rời (không cạnh tranh Traveloka)
- Tour công ty / MICE (B2B — thị trường khác)
- Tour của bên khác (không marketplace)

→ Quyết định lock: `01-tam-nhin.md` mục Non-Goals + ADR-001.

---

## 2 — Bán cho ai

Gia đình + cặp đôi + nhóm bạn **Việt 25-45 tuổi**, thu nhập trung-cao, đi du lịch nội địa.

| Tiêu chí | Lý do |
| --- | --- |
| Người Việt | Vivu vận hành ở VN, hiểu insight khách Việt. Khách Tây — Phase 1.5 |
| 25-45 tuổi | Có thu nhập + thời gian + chịu khó tìm online |
| Thu nhập trung-cao | Đủ tiền tour 3-15tr/người. Không cạnh tranh phân khúc rẻ nhất |
| Đi nhóm | Tour package value cao nhất khi 4-8 người. Solo <10% |

**KHÔNG bán cho**: corporate (B2B), backpacker tự đi, <22t, khách quốc tế Phase 1.

→ 3 personas cụ thể: `03-personas-user-journey.md`.

---

## 3 — Kênh discover

| Kênh | Phase 1 | Hoạt động |
| --- | :---: | --- |
| **Google search (SEO)** | ✅ chính | Khách search → Vivu top → click |
| **Google Ads** | ✅ phụ | Trả tiền để hiện trước trong lúc SEO chưa lên |
| **Email** | ✅ | Confirm + push tour mới |
| **FB/IG** | 🔶 | Content du lịch + brand awareness |
| **TikTok / KOL** | ❌ → P2 | Review tour ăn hoa hồng |
| **Affiliate** | ❌ → P2 | Bên 3 share link ăn % |

**Vì sao SEO là kênh chính?**
- Khách book tour **không quyết ngay** như mua quần áo — search Google trước, đọc 5-10 trang, so sánh rồi mới quyết. Ai top Google = chiếm tay khách.
- SEO **miễn phí** sau khi build (so với Ads phải trả mỗi click). Đầu tư 12-18 tháng → tích luỹ, đối thủ khó copy.
- Khách qua Google **đã có ý định mua** → conversion cao hơn social organic nhiều lần.

**Trade-off**: SEO chậm 6-12 tháng mới ra kết quả. Trong lúc đó dùng Ads bù.

→ Ràng buộc cho team dev: **mọi page tour/destination/hotel phải tối ưu SEO ngay từ ngày 1**. Không "làm tạm rồi sửa SEO sau" — Google index cần thời gian, sửa muộn = mất 3-6 tháng. Cụ thể: `SeoPage` polymorphic + Next.js metadata API + sitemap động (ADR-005).

---

## 4 — Kiếm tiền

Cách kiếm tiền = **markup** (mua giá sỉ → bán giá lẻ → ăn chênh lệch).

**Minh hoạ số giả định:**

```
Tour Đà Lạt 4N3Đ — 1 khách

GIÁ VỐN (Vivu chi):
  Hotel 3 đêm              1.500.000đ
  Xe khứ hồi (chia đầu)    1.200.000đ
  Ăn uống (4 bữa)            600.000đ
  Vé tham quan               300.000đ
  HDV (chia)                 200.000đ
  Tổng giá vốn             3.800.000đ

GIÁ BÁN                    4.500.000đ
                           ─────────
MARKUP (lãi gộp)             700.000đ  (~15% giá bán)
```

Trong 700k này còn trừ:
- Phí thanh toán VNPay/MoMo ~1.5% giá bán ≈ 67k
- Dự phòng hoàn huỷ ~1-2% giá bán ≈ 67k
- Chi phí cố định phân bổ (lương, marketing, hosting)

**Doanh thu vs Lợi nhuận** — đừng nhầm:

| Khái niệm | Tour ví dụ trên |
| --- | --- |
| Doanh thu (Revenue) | 4.500.000đ |
| Giá vốn (COGS) | 3.800.000đ |
| Lợi nhuận gộp (Gross profit) | 700.000đ |
| Lợi nhuận thực (Net) | Có thể chỉ 100-300k, hoặc âm tháng ít đơn |

> Năm 1-2 thường lỗ là bình thường. Startup chấp nhận lỗ ngắn hạn để xây brand + tích SEO + có user base. Lãi xuất hiện khi đạt **break-even** = tổng lợi nhuận gộp vừa đủ trả tổng chi phí cố định.

**Nguồn thu phụ** (Phase 1.5+):

| Nguồn | Phase | Hoạt động |
| --- | --- | --- |
| Bảo hiểm du lịch | 1.5 | Vivu ăn hoa hồng từ hãng bảo hiểm |
| Dịch vụ thêm | 1.5 | Đưa đón sân bay riêng, room upgrade, mở rộng tour |
| Voucher / gift card | 1.5 | Khách mua trước, tặng người khác |
| KOL / Affiliate | 2 | Ai book qua link KOL → KOL ăn 5-10% |

---

## 5 — Chi phí

### 5.1 Biến đổi (variable cost) — chi theo tour bán được

| Khoản | % giá bán |
| --- | --- |
| Hotel (allotment đã ký) | 30-40% |
| Xe / phương tiện | 20-30% |
| Ăn uống + vé + guide | 15-25% |
| Phí thanh toán | 1.5-2% |
| Dự phòng hoàn huỷ | 1-2% |
| **Tổng** | **~70-90%** |
| **Lãi gộp còn lại** | **~10-30%** |

### 5.2 Cố định (fixed cost) — chi đều mỗi tháng

| Khoản | Mô tả |
| --- | --- |
| Lương team (3-5 người) | Khoản lớn nhất |
| Marketing (SEO + Ads) | Tăng dần khi mở rộng |
| Hosting (Supabase + Vercel + Cloudinary + email) | Phase 1 free tier nhiều, gần 0đ |
| Văn phòng | Tuỳ chính sách, work-from-home tiết kiệm |
| Pháp lý + kế toán | Thuế quý, contract |

> **Mục tiêu Phase 1**: giảm fixed cost càng thấp càng tốt → kéo dài **runway** (số tháng tiền còn lại trước khi cạn vốn). Runway dài = có thời gian thử nghiệm + sửa sai.

---

## 6 — Đối thủ & Positioning

| Đối thủ | Mạnh | Yếu | Vivu hơn ở |
| --- | --- | --- | --- |
| Vietravel, Saigontourist | Brand lâu năm, inventory rộng | Web cũ, UX kém, mobile yếu | Web hiện đại, mobile-first, SEO mạnh |
| Klook, Traveloka | App ngon, đa quốc gia | Thiếu tour local VN | Tour local tinh hoa, tiếng Việt thuần |
| Operator FB nhỏ lẻ | Linh hoạt, giá rẻ | Không minh bạch, không review | Giá công khai, review verified, payment chính thống |
| Booking.com, Agoda | Inventory hotel khổng lồ | Không có tour package | Khác category — không cạnh tranh trực tiếp |

**Định vị Vivu trong 1 câu:**
> *"Vietravel của thế hệ web hiện đại — tour curate cẩn thận, web đẹp, mobile mượt, SEO mạnh, làm cho người Việt."*

**Cạnh tranh sống còn**: Vietravel/Saigontourist nếu họ rebuild web. Nhưng công ty lớn di chuyển chậm → Vivu có lợi thế "small + fast" trong 2-3 năm đầu.

---

## 7 — Rủi ro & KPI

### Rủi ro theo mức độ

| Rủi ro | Mức | Giảm thiểu |
| --- | --- | --- |
| Không đủ tour để bán (chưa ký partner) | 🔴 CAO | Founder ký contract trước launch. Target 20-30 tour Phase 1 |
| SEO mất 6-12 tháng mới ra kết quả | 🔴 CAO | Phase 1 chấp nhận trả Ads bù, invest content nặng tay |
| Conversion thấp | 🟠 TB | A/B test booking flow Phase 1.5, analytics ngay |
| VNPay/MoMo timeout | 🟠 TB | Retry + status PENDING + manual recovery |
| Hotel partner đột ngột không giữ phòng | 🟠 TB | Mỗi điểm đến ≥2 hotel backup |
| 2 khách book trùng slot | 🟡 thấp-TB | Pessimistic lock DB (xem `03-co-so-du-lieu/03-toan-ven-concurrency.md`) |
| Luật bảo vệ dữ liệu cá nhân VN siết | 🟡 thấp | Phase 1.5 review compliance, thu data tối thiểu |

### KPI sống còn (Phase 1)

| Chỉ số | Định nghĩa | Mục tiêu Phase 1 |
| --- | --- | --- |
| Booking thành công/tháng | Khách book + trả tiền xong | Tăng đều mỗi tháng |
| AOV (Average Order Value) | Doanh thu ÷ booking | 5-8tr/đơn |
| Conversion rate | Booking ÷ unique visitor × 100% | >0.5% OK, >1% tốt |
| CAC (Customer Acquisition Cost) | Marketing/tháng ÷ khách mới | <15% AOV |
| Repeat rate (12 tháng) | Khách book lần 2+ ÷ tổng × 100% | >20% sau 12 tháng |
| SEO organic traffic | Visitor từ Google organic | Tăng đều (lag 6-12 tháng) |
| Payment failure rate | PENDING không lên PAID | <2% |

> Đầu Phase 1 ít data → đặt mục tiêu thấp, review hàng tháng. Pattern 3 tháng liên tiếp mới có ý nghĩa, không stress vì 1 tháng tệ.

---

## Tóm tắt 1 trang

```
┌──────────────────────────────────────────────────────────────────┐
│ VIVU TRAVEL — MÔ HÌNH KINH DOANH                                 │
├──────────────────────────────────────────────────────────────────┤
│ BÁN GÌ?    Tour du lịch trọn gói (Vivu tự tổ chức, không sàn)    │
│ CHO AI?    Gia đình + cặp đôi + nhóm Việt 25-45, thu nhập TB-cao │
│ TÌM Ở ĐÂU? Google Search (SEO chính), Google Ads (phụ)           │
│ ĂN TIỀN?   Markup 15-25% (giá bán − giá vốn)                     │
│ CHI ĐÂU?   Hotel/xe/guide/ăn ~70-90% + lương + marketing         │
│ ĐỐI THỦ?   Vietravel (web cũ), Klook (không local)               │
│ ĐO LƯỜNG?  Booking/tháng + Conversion + Repeat + SEO traffic     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Mục tiêu Q3/2026 (placeholder — team fill khi có data)

```
[ ] ___ tour active trên web              (đề xuất: 20-30)
[ ] ___ booking thành công/tháng           (đề xuất: tháng 6 = 50)
[ ] AOV ___ VND                            (đề xuất: 5-8tr)
[ ] Conversion ___ %                       (đề xuất: >0.5%)
[ ] SEO organic ___ unique/tháng           (đề xuất: tháng 6 = 5.000)
[ ] Repeat 6 tháng ___ %                   (đề xuất: >10%)
```

---

## Liên kết

- Vision: `01-tam-nhin.md`
- Personas chi tiết: `03-personas-user-journey.md`
- Roadmap sprint: `04-lo-trinh-phat-hanh.md`
- Thuật ngữ kinh doanh: `../01-nghiep-vu/03-thuat-ngu.md`
