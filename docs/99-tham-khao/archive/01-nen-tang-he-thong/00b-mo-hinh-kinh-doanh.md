# Mô Hình Kinh Doanh — Vivu Travel (giải thích đời thường)

> **Phiên bản:** 2.0 · **Ngày:** 26/05/2026 · **Tier:** 1 (Business)
>
> File này trả lời **7 câu cơ bản nhất** về Vivu, viết theo kiểu mentor
> giảng cho người chưa startup bao giờ. Không cần học MBA mới đọc được.
>
> **Quy tắc dùng:** mỗi feature đề xuất trong sprint phải trả lời được
> "phục vụ câu hỏi nào dưới đây?". Nếu không phục vụ câu nào → có thể
> là feature không tạo giá trị, dừng lại review.

---

## Mục lục 7 câu hỏi

1. [Vivu bán cái gì?](#câu-1--vivu-bán-cái-gì)
2. [Bán cho ai?](#câu-2--bán-cho-ai)
3. [Khách tìm thấy Vivu bằng cách nào?](#câu-3--khách-tìm-thấy-vivu-bằng-cách-nào)
4. [Vivu kiếm tiền thế nào? Bao nhiêu?](#câu-4--vivu-kiếm-tiền-thế-nào-bao-nhiêu)
5. [Tiền chi đi đâu hết?](#câu-5--tiền-chi-đi-đâu-hết)
6. [Đối thủ là ai? Vivu hơn ở đâu?](#câu-6--đối-thủ-là-ai-vivu-hơn-ở-đâu)
7. [Rủi ro lớn nhất là gì? Đo lường thế nào để biết Vivu đang sống tốt?](#câu-7--rủi-ro-lớn-nhất-là-gì-đo-lường-thế-nào-để-biết-vivu-đang-sống-tốt)

---

## Câu 1 — Vivu bán cái gì?

**Câu trả lời ngắn:** Vivu bán **tour du lịch trọn gói** (tour package).

**Trọn gói nghĩa là sao?** Khách trả 1 cục tiền, Vivu lo hết: xe đưa
đón, khách sạn, ăn uống, hướng dẫn viên, vé tham quan. Khách không
cần tự đặt từng cái.

**Ví dụ cụ thể:**

> *"Tour Đà Lạt 4 ngày 3 đêm, khởi hành 15/06/2026, giá 4.5 triệu/người.
> Bao gồm: xe khứ hồi Sài Gòn → Đà Lạt, khách sạn 3★, 3 bữa sáng + 4
> bữa tối, vé Langbiang + Thung lũng tình yêu, hướng dẫn viên."*

**Vivu KHÔNG bán gì?** (rất quan trọng để khỏi loãng)

- ❌ Không bán **khách sạn riêng lẻ** (không cạnh tranh với Agoda,
  Booking.com). Hotel chỉ là một phần của tour package.
- ❌ Không bán **vé máy bay rời** (không cạnh tranh với Vietnam
  Airlines hay traveloka về vé).
- ❌ Không bán **tour cho khách doanh nghiệp / công ty** (B2B, MICE).
  Đây là thị trường khác, cần proposal riêng, không phù hợp tour
  chuẩn hoá.
- ❌ Không là **trung gian** cho bên khác bán tour (marketplace).
  Tour mà Vivu list trên web đều là **tour của chính Vivu tự tổ chức**.

> 💡 **Vì sao gạch đầu dòng những cái KHÔNG bán?** Vì startup chết
> nhiều nhất do "thấy gì cũng làm, ai cũng phục vụ". Lock chặt phạm
> vi ngay từ đầu = giữ tỉnh táo về sau.

---

## Câu 2 — Bán cho ai?

**Câu trả lời ngắn:** Bán cho **gia đình, cặp đôi, nhóm bạn người Việt**
trong độ tuổi 25-45, thu nhập trung-cao, muốn đi du lịch nghỉ dưỡng/khám
phá trong nước.

Chi tiết 3 nhân vật cụ thể (gọi là *"personas"* — đại diện cho 3 nhóm
khách điển hình): xem [`00c-personas-user-journey.md`](./00c-personas-user-journey.md).

**Tại sao chọn đối tượng này?**

| Tiêu chí | Lý do chọn |
| --- | --- |
| **Người Việt** (không phải khách nước ngoài) | Vivu vận hành ở VN, hiểu insight khách Việt nhất. Khách Tây để Phase 1.5+ |
| **25-45 tuổi** | Có thu nhập + có thời gian + chịu khó tìm online. Dưới 25t thường chưa có budget, trên 45t ít book online |
| **Thu nhập trung-cao** | Đủ tiền cho tour 3-15 triệu/người. Không cạnh tranh phân khúc rẻ nhất (backpacker tự đi) |
| **Đi gia đình / nhóm** (không đi 1 mình) | Tour package value cao nhất khi đi nhóm 4-8 người. Solo traveler chiếm <10% |

**KHÔNG bán cho ai?**

- ❌ **Khách doanh nghiệp** (corporate, đoàn công ty 50+ người) — cần
  team sales B2B riêng, không phải MVP
- ❌ **Backpacker** đi tự túc — họ không mua tour package, chỉ search
  vé máy bay + hostel
- ❌ **Khách quá trẻ (<22t)** — tour package không hợp budget của họ
- ❌ **Khách quốc tế** (Phase 1) — chỉ thêm Phase 1.5 khi có nguồn lực
  làm content EN

---

## Câu 3 — Khách tìm thấy Vivu bằng cách nào?

Đây gọi là **"kênh marketing"** — chỗ Vivu xuất hiện để khách biết tới.

| Kênh | Phase 1 (MVP) | Cách hoạt động |
| --- | :---: | --- |
| **Google search** (SEO) | ✅ chính | Khách gõ "tour Đà Nẵng 4 ngày gia đình" → Google trả về kết quả → web Vivu nằm top → khách click vào |
| **Quảng cáo Google** (Google Ads) | ✅ phụ | Vivu trả tiền Google → khi khách search keyword liên quan, web Vivu hiện trước (có chữ "Quảng cáo") |
| **Email** | ✅ | Sau khi khách book lần đầu → email confirm + sau này gửi tour mới |
| **Facebook / Instagram** | 🔶 nice-to-have | Đăng bài content du lịch, làm brand awareness |
| **TikTok / KOL** | ❌ Phase 2 | Người nổi tiếng review tour → ăn hoa hồng |
| **Affiliate** | ❌ Phase 2 | Bên thứ 3 share link Vivu, ai book qua link → bên đó ăn % |

**Vì sao Vivu chọn Google search (SEO) làm kênh chính?**

- Khách book tour không quyết định **ngay tức thì** như mua quần áo.
  Họ thường **search Google trước**, đọc 5-10 trang web, so sánh
  3-4 tour rồi mới quyết. → Ai xuất hiện top Google = chiếm tay khách.
- **SEO miễn phí** sau khi build (so với Google Ads phải trả tiền
  mỗi click). Đầu tư công sức làm content + tối ưu kỹ thuật → kết
  quả tích luỹ 12-18 tháng. Đây là **lợi thế lâu dài** mà đối thủ
  copy không dễ.
- **Khách qua Google đã có ý định mua** (gõ keyword "tour" = đang
  cần tour). Conversion cao hơn social organic nhiều lần.

**Trade-off của SEO:** chậm 6-12 tháng mới ra kết quả. Trong lúc đó
phải dùng Google Ads (trả tiền) để có khách ngay.

> 💡 **Một câu chốt cho team dev:** mọi page tour / điểm đến / hotel
> phải tối ưu SEO ngay từ ngày 1. Không "làm tạm rồi sửa SEO sau" —
> vì Google index cần thời gian, sửa muộn = mất 3-6 tháng.

---

## Câu 4 — Vivu kiếm tiền thế nào? Bao nhiêu?

**Câu trả lời ngắn:** Vivu mua dịch vụ (hotel + xe + guide + ăn) với
giá sỉ → đóng gói thành tour → bán cho khách với giá cao hơn → ăn
chênh lệch.

### 4.1 Cách kiếm tiền (Revenue model)

Tiếng tây gọi cách này là **"markup"** — nghĩa là "đánh dấu giá lên".
Đời thường gọi là "ăn chênh lệch".

**Ví dụ minh hoạ (số giả định):**

```
Tour Đà Lạt 4N3Đ — 1 khách

GIÁ VỐN (tiền Vivu chi ra):
  Khách sạn 3 đêm          : 1.500.000đ
  Xe khứ hồi (chia theo đầu): 1.200.000đ
  Ăn uống (4 bữa sáng+tối) :   600.000đ
  Vé tham quan               :  300.000đ
  Hướng dẫn viên (chia)      :  200.000đ
  Tổng giá vốn               : 3.800.000đ

GIÁ BÁN cho khách           : 4.500.000đ
                              ─────────
TIỀN CHÊNH LỆCH (markup)    :   700.000đ  ← khoảng 15% giá bán
```

**Trong 700.000đ "chênh lệch" này còn phải trừ:**

- Phí thanh toán VNPay/MoMo (~1.5% giá bán) ≈ 67.500đ
- Dự phòng hoàn huỷ, sự cố (~1-2% giá bán) ≈ 67.500đ
- Chi phí cố định phân bổ (lương team, marketing, hosting) → cái này
  phụ thuộc số đơn/tháng

**Số khách càng nhiều, chi phí cố định chia đều ra càng thấp.** Đây
là lý do startup luôn muốn "scale" — bán nhiều hơn để mỗi đơn lãi
nhiều hơn.

### 4.2 Doanh thu vs Lợi nhuận — đừng nhầm

Đây là 2 con số khác nhau, hay bị nhầm:

| Khái niệm | Đời thường | Ví dụ với tour trên |
| --- | --- | --- |
| **Doanh thu** | Tổng tiền khách trả | 4.500.000đ |
| **Giá vốn** | Tiền chi ra để cung cấp tour | 3.800.000đ |
| **Lợi nhuận gộp** | Doanh thu − Giá vốn (chưa trừ chi phí khác) | 700.000đ |
| **Lợi nhuận thực** | Lợi nhuận gộp − Chi phí marketing − Lương − Phí thanh toán − Thuế | Có thể chỉ còn 100-300k, hoặc thậm chí âm nếu tháng ít đơn |

> 💡 **Đầu năm 1-2 thường lỗ là chuyện bình thường.** Startup chấp
> nhận lỗ ngắn hạn để xây brand + tích SEO authority + có user base.
> Lãi xuất hiện khi đạt **break-even** = lúc tổng lợi nhuận gộp vừa
> đủ trả tổng chi phí cố định.

### 4.3 Các nguồn thu phụ (Phase 1.5 trở đi)

| Nguồn | Phase | Cách hoạt động |
| --- | --- | --- |
| **Bán bảo hiểm du lịch** | 1.5 | Khi khách book tour, hỏi "mua thêm bảo hiểm 50k/người không?" → Vivu ăn hoa hồng từ hãng bảo hiểm |
| **Dịch vụ thêm** | 1.5 | Đưa đón sân bay riêng, room upgrade, tour mở rộng |
| **Voucher / gift card** | 1.5 | Khách mua voucher trước (tiền vô túi Vivu sớm), tặng người khác |
| **KOL / Affiliate** | 2 | Người nổi tiếng share link, ai book qua link → KOL ăn 5-10% |

---

## Câu 5 — Tiền chi đi đâu hết?

Hai loại chi phí cần phân biệt:

### 5.1 Chi phí biến đổi — chi theo từng tour bán được

**(Bán 1 tour mới chi 1 lần. Không bán không chi.)**

| Khoản | Ước tính % giá bán |
| --- | --- |
| Khách sạn (allotment đã ký với hotel) | 30-40% |
| Xe / phương tiện | 20-30% |
| Ăn uống + vé tham quan + guide | 15-25% |
| Phí thanh toán VNPay/MoMo | 1.5-2% |
| Dự phòng hoàn huỷ | 1-2% |
| **Tổng cộng** | **~70-90% giá bán** |
| **Lợi nhuận gộp còn lại** | **~10-30% giá bán** |

### 5.2 Chi phí cố định — chi đều mỗi tháng dù bán nhiều hay ít

**(Tháng nào cũng phải trả, bán 0 đơn hay 1000 đơn cũng vậy.)**

| Khoản | Mô tả |
| --- | --- |
| **Lương team** (3-5 người ban đầu) | Khoản lớn nhất |
| **Marketing** (làm SEO content + Google Ads) | Tăng dần khi mở rộng |
| **Hosting + dịch vụ** (Supabase + Vercel + Cloudinary + email) | Phase 1 dùng free tier nhiều, gần như 0đ |
| **Văn phòng** (nếu có) | Tuỳ chính sách, có thể work-from-home tiết kiệm |
| **Pháp lý + kế toán** | Báo cáo thuế hằng quý, contract |

> 💡 **Mục tiêu Phase 1:** giảm chi phí cố định càng thấp càng tốt
> (work remote, tận dụng free tier dịch vụ) → kéo dài runway. Runway
> là **số tháng tiền còn lại trước khi cạn vốn**. Runway dài = có
> thời gian thử nghiệm + sửa sai.

---

## Câu 6 — Đối thủ là ai? Vivu hơn ở đâu?

| Đối thủ | Họ mạnh ở | Họ yếu ở | Vivu hơn ở chỗ |
| --- | --- | --- | --- |
| **Vietravel, Saigontourist** (tour operator lớn) | Brand uy tín nhiều năm, có chi nhánh vật lý, inventory tour rộng | Website cũ, UX kém, khó book online, ít tối ưu mobile | Web hiện đại, mobile-first, booking flow ít bước, SEO mạnh |
| **Klook, Traveloka** (sàn quốc tế) | App ngon, đa quốc gia, brand quốc tế | Thiếu tour local VN đặc trưng, EN-first nên không quá Việt hoá | Tour local tinh hoa (homestay vùng cao, foodtour), tiếng Việt thuần |
| **Operator nhỏ trên Facebook** | Linh hoạt, giá rẻ, gần gũi khách | Không minh bạch giá, không có review độc lập, chuyển khoản tay rủi ro | Giá hiển thị công khai, review verified, payment chính thống có hoá đơn |
| **Booking.com, Agoda** | Inventory hotel khổng lồ | Không có tour package | Vivu bán *tour* (gói trọn), khác category hẳn — không cạnh tranh trực tiếp |

**Định vị Vivu trong 1 câu:**

> *"Vietravel của thế hệ web hiện đại — tour curate cẩn thận, web đẹp,
> book mobile mượt, SEO mạnh, làm cho người Việt."*

**Cạnh tranh sống còn:** đối thủ trực tiếp nhất là **Vietravel /
Saigontourist** nếu họ rebuild web. Nhưng họ là công ty lớn, di chuyển
chậm — Vivu có lợi thế "small + fast" trong 2-3 năm đầu.

---

## Câu 7 — Rủi ro lớn nhất là gì? Đo lường thế nào để biết Vivu đang sống tốt?

### 7.1 Các rủi ro cần để mắt

Xếp theo mức độ nguy hiểm:

| Rủi ro | Mức độ | Cách giảm thiểu |
| --- | --- | --- |
| **Không đủ tour để bán** (chưa ký được đủ partner hotel/xe) | 🔴 CAO | Founder phụ trách ký contract trước launch. Target 20-30 tour cho Phase 1 |
| **SEO mất 6-12 tháng mới ra kết quả** | 🔴 CAO | Phase 1 chấp nhận trả tiền Google Ads bù. Đồng thời invest content nặng tay |
| **Tỉ lệ khách book / khách vô web quá thấp** (gọi là *conversion rate* thấp) | 🟠 TRUNG BÌNH | A/B test booking flow Phase 1.5, gắn analytics ngay |
| **Thanh toán VNPay/MoMo bị lỗi timeout** | 🟠 TRUNG BÌNH | Có cơ chế retry, lưu trạng thái PENDING, manual recovery |
| **Hotel partner đột ngột không giữ phòng** | 🟠 TRUNG BÌNH | Mỗi điểm đến có ≥2 hotel backup cùng tầm |
| **2 khách book trùng slot cuối cùng → overbook** | 🟡 THẤP-TRUNG | Đã có code lock database (xem [`08-chien-luoc-concurrency.md`](./08-chien-luoc-concurrency.md)) |
| **Luật bảo vệ dữ liệu cá nhân VN siết** | 🟡 THẤP | Phase 1.5 review compliance, hiện chỉ thu data tối thiểu |

### 7.2 Các chỉ số sống còn cần theo dõi

Đây gọi là **KPI** (Key Performance Indicators — chỉ số đo hiệu quả).
Mỗi tháng cần biết:

| Chỉ số | Định nghĩa đời thường | Mục tiêu Phase 1 |
| --- | --- | --- |
| **Số booking thành công / tháng** | Bao nhiêu khách book + trả tiền xong | Tăng đều mỗi tháng |
| **Trung bình mỗi đơn bao nhiêu tiền** | Tổng doanh thu ÷ số booking | 5-8 triệu/đơn |
| **Tỉ lệ khách vào web → khách book** | (số booking ÷ số khách unique vào web) × 100% | >0.5% là OK, >1% là tốt |
| **Tốn bao nhiêu marketing để có 1 khách** | Chi phí marketing tháng ÷ số khách mới | <15% trung bình mỗi đơn |
| **Tỉ lệ khách quay lại đặt lần 2** | (Khách book lần 2+ ÷ tổng khách) × 100% | >20% sau 12 tháng |
| **Traffic SEO organic** | Số khách vào web từ Google không qua quảng cáo | Tăng đều mỗi tháng (lag 6-12 tháng) |
| **Lỗi thanh toán / tổng booking** | Tỉ lệ booking PENDING không lên PAID | <2% |

> 💡 **Đầu Phase 1, các con số này còn ít data → đặt mục tiêu thấp,
> review hằng tháng, điều chỉnh.** Đừng đo "stress" vì 1 tháng không
> đạt — pattern 3 tháng liên tiếp mới có ý nghĩa.

---

## Tóm tắt 1 trang (cho bạn dán lên tường)

```
┌─────────────────────────────────────────────────────────────────┐
│ VIVU TRAVEL — MÔ HÌNH KINH DOANH (1 trang)                      │
├─────────────────────────────────────────────────────────────────┤
│ BÁN GÌ?    Tour du lịch trọn gói (Vivu tự tổ chức, không sàn)  │
│ CHO AI?    Gia đình + cặp đôi + nhóm bạn Việt 25-45, thu nhập   │
│            trung-cao, đi du lịch nội địa                        │
│ TÌM Ở ĐÂU? Google Search (SEO) là chính, Google Ads phụ         │
│ ĂN TIỀN?   Chênh lệch giá vốn ↔ giá bán (markup 15-25%)         │
│ CHI ĐÂU?   Hotel/xe/guide/ăn (~70-90% giá bán) + lương team +   │
│            marketing + hosting                                  │
│ ĐỐI THỦ?   Vietravel/Saigontourist (web cũ), Klook (không local)│
│ ĐO LƯỜNG?  Booking/tháng + Conversion + Repeat rate + SEO traffic│
└─────────────────────────────────────────────────────────────────┘
```

---

## Mục tiêu cụ thể Phase 1 (placeholder — team fill sau khi có data)

```
Đến hết Q3/2026 (6 tháng sau launch):
[ ] Có ___ tour active trên web              (đề xuất: 20-30)
[ ] Đạt ___ booking thành công/tháng         (đề xuất: tháng 6 = 50)
[ ] Trung bình mỗi đơn ___ VND               (đề xuất: 5-8 triệu)
[ ] Conversion rate ___ %                    (đề xuất: >0.5%)
[ ] SEO organic traffic ___ unique/tháng     (đề xuất: tháng 6 = 5.000)
[ ] Repeat rate sau 6 tháng ___ %            (đề xuất: >10%)
```

---

## Phụ lục — Mini từ điển thuật ngữ trong file này

(Thuật ngữ gặp thường xuyên trong tài liệu kinh doanh)

| Thuật ngữ tiếng Anh | Tiếng Việt đời thường |
| --- | --- |
| **Markup** | Tiền chênh lệch (giá bán − giá vốn) |
| **Revenue (doanh thu)** | Tổng tiền khách trả |
| **Gross profit (lợi nhuận gộp)** | Doanh thu − Giá vốn |
| **Net profit (lợi nhuận thực)** | Doanh thu − Tất cả chi phí (kể cả lương + marketing) |
| **Variable cost (chi phí biến đổi)** | Chi phí phát sinh theo từng đơn bán |
| **Fixed cost (chi phí cố định)** | Chi phí trả đều mỗi tháng dù bán nhiều hay ít |
| **Break-even** | Điểm hoà vốn — lợi nhuận gộp = chi phí cố định |
| **Runway** | Số tháng tiền còn lại trước khi cạn vốn |
| **CAC** (Customer Acquisition Cost) | Tốn bao nhiêu marketing để có 1 khách mới |
| **AOV** (Average Order Value) | Trung bình mỗi đơn khách chi bao nhiêu |
| **Conversion rate** | Tỉ lệ khách vào web → khách book |
| **Repeat rate** | Tỉ lệ khách book lại lần 2+ |
| **KPI** | Chỉ số đo hiệu quả (Key Performance Indicator) |
| **SEO** | Tối ưu công cụ tìm kiếm (làm web hiện top Google miễn phí) |
| **B2C** | Bán trực tiếp cho khách lẻ (Business-to-Consumer) |
| **B2B** | Bán cho doanh nghiệp (Business-to-Business) |
| **MVP** | Phiên bản tối thiểu khả thi (Minimum Viable Product) |

> 💡 **Cách dùng từ điển:** khi gặp thuật ngữ này trong file khác, quay
> lại đây xem. File sẽ được mở rộng thành `99-tu-dien-thuat-ngu.md`
> riêng khi nhiều file dùng chung.

---

## Mapping về Anchor decisions trong Vision

Mỗi câu hỏi ở trên trace về anchor V-01 → V-07 trong [`00-tam-nhin.md`](./00-tam-nhin.md):

| Câu | Trace tới |
| --- | --- |
| Câu 1 (Bán cái gì) | V-01 (MVP tour-only) + V-02 (B2C direct) + V-05 (Hotel content-only) |
| Câu 2 (Bán cho ai) | V-01 (B2C) + WHO trong Vision Phần 2 |
| Câu 3 (Tìm Vivu đâu) | V-03 (SEO-first) |
| Câu 4 (Kiếm tiền) | V-02 (B2C direct markup, không commission) + V-07 (Phase 2 mở upsell) |
| Câu 5 (Chi đâu) | (operational — không trực tiếp map technical) |
| Câu 6 (Đối thủ) | V-02 + Non-Goals trong Vision |
| Câu 7 (Rủi ro + KPI) | V-04 (Must login → loyalty) + V-06 (Team 2-3 dev — cần tự động hoá KPI) |

---

## Changelog

| Ngày | Version | Thay đổi |
| --- | --- | --- |
| 26/05/2026 | 1.0 | Khởi tạo BMC chuẩn 9 ô + Unit economics framework (jargon nặng) |
| 26/05/2026 | 2.0 | **Rewrite plain language.** Bỏ BMC framework, thay bằng 7 câu hỏi đời thường. Thêm ví dụ số cụ thể, mini glossary, tóm tắt 1 trang. Bản v1.0 archive trong git history. |

---

*File này thuộc **Tier 1 (Business)**. References:*

- *Vision: [`00-tam-nhin.md`](./00-tam-nhin.md)*
- *Personas chi tiết: [`00c-personas-user-journey.md`](./00c-personas-user-journey.md)*
- *Chiến lược triển khai: [`01-chien-luoc-tong-the.md`](./01-chien-luoc-tong-the.md)*
