# Sprint 4 — Wireframes

> **Mục đích**: low-fidelity wireframe cho 2 UI mới được build trong Sprint 4: Booking widget multi-pax (S4-05) và Inquiry form (S4-06).
>
> **Hình thức**: ASCII art + giải thích. Đủ để dev hiểu layout + interaction. Nếu cần fidelity cao hơn, dùng Figma sau.

---

## 1. Booking Widget multi-pax (S4-05)

### 1.1 Desktop view (≥1024px) — sidebar bên phải Tour detail

```
┌──────────────────────────────────────┐
│  💰 Giá từ 5.000.000₫ / người lớn    │
│  ────────────────────────────────    │
│                                      │
│  📅 Chọn lịch khởi hành              │
│  ┌──────────────────────────────┐   │
│  │ 🟢 15/08/2026  │ Còn 12 chỗ  │ ▼ │
│  └──────────────────────────────┘   │
│                                      │
│  👥 Số người                         │
│  ┌──────────────────────────────┐   │
│  │ Người lớn                    │   │
│  │ (≥12 tuổi)              ─ 2 + │   │
│  ├──────────────────────────────┤   │
│  │ Trẻ em                       │   │
│  │ (2-11 tuổi)             ─ 1 + │   │
│  ├──────────────────────────────┤   │
│  │ Em bé                        │   │
│  │ (<2 tuổi, miễn phí)     ─ 0 + │   │
│  └──────────────────────────────┘   │
│                                      │
│  ☐ Tôi đi 1 mình + phòng riêng      │
│    (+2.000.000₫)        [disabled]  │
│                                      │
│  🎁 Hạng dịch vụ                     │
│  ○ Tiêu chuẩn  (miễn phí)            │
│  ● Deluxe      (+500.000₫/NL)        │
│  ○ VIP         (+1.000.000₫/NL)      │
│                                      │
│  ────────────────────────────────    │
│  📋 Chi tiết:                        │
│    2 NL × 5.000.000 = 10.000.000     │
│    1 TE × 3.500.000 = 3.500.000      │
│    Deluxe upgrade   = 1.000.000      │
│  ────────────────────────────────    │
│  💵 Tổng: 14.500.000₫                │
│                                      │
│  ⏱ Giữ chỗ trong 15 phút sau khi    │
│    bấm Đặt ngay                      │
│                                      │
│  ┌──────────────────────────────┐   │
│  │       Đặt ngay               │   │
│  └──────────────────────────────┘   │
│                                      │
│  ⚠ Chính sách hủy:                  │
│    Hủy >30 ngày: hoàn 100%           │
│    Hủy 15-30 ngày: hoàn 50%          │
│    Hủy <15 ngày: mất cọc             │
│    [Xem chi tiết]                    │
└──────────────────────────────────────┘
```

### 1.2 Mobile view (375px iPhone SE) — full width sticky bottom

```
┌──────────────────────────┐
│ Tour: Hà Nội — Sapa 3N2Đ │
│ ⭐ 4.8 (120 reviews)      │
│                           │
│ [Image carousel]         │
│                           │
│ Mô tả tour...             │
│ Lịch trình...             │
│ Hotels gắn kèm...         │
│                           │
└──────────────────────────┘
┌──────────────────────────┐
│ 💰 14.500.000₫           │
│ Cho 2NL+1TE+Deluxe       │
│                           │
│ [Chọn ngày + người] ▼    │ ← bottom sheet
│ [    Đặt ngay      ]     │
└──────────────────────────┘
       (sticky bottom)
```

Khi bấm "Chọn ngày + người" → bottom sheet slide up:

```
┌──────────────────────────┐
│      ─ Chọn lịch ─       │
│ ─────────────────────    │
│ 📅 15/08/2026 — Còn 12   │
│ 📅 22/08/2026 — Còn 5    │
│ 📅 05/09/2026 — Còn 18   │
│                           │
│      ─ Số người ─        │
│ ─────────────────────    │
│ Người lớn         ─ 2 +  │
│ Trẻ em            ─ 1 +  │
│ Em bé             ─ 0 +  │
│                           │
│ ☐ Tôi đi 1 mình + phòng  │
│                           │
│      ─ Hạng dịch vụ ─    │
│ ─────────────────────    │
│ ○ Tiêu chuẩn             │
│ ● Deluxe (+500k/NL)      │
│ ○ VIP (+1tr/NL)          │
│                           │
│ ─────────────────────    │
│ Tổng: 14.500.000₫        │
│ [   Áp dụng    ]         │
└──────────────────────────┘
```

### 1.3 Interaction rules

| Action | Behavior |
| --- | --- |
| Tăng/giảm pax | +/− button, debounced 300ms để gọi calc |
| Total calc | Pure client-side (server gửi `Tour.priceAdult/Child/Infant/singleSupplementPrice` + options khi mount) |
| Hết slot | Disable nút Đặt + show "Khách quá đông, vui lòng chọn ngày khác" |
| Adults < 1 | Disable Đặt + show "Cần ít nhất 1 người lớn" |
| Single supplement enable | Chỉ khi adults = 1 + checkbox |
| Click Đặt ngay (chưa login) | Redirect `/dang-nhap?next=/tours/[slug]?bookingDraft=...` (preserve draft) |
| Click Đặt ngay (đã login) | Server Action `createBookingAction` → redirect `/dat-tour/[bookingId]/thanh-toan` (Sprint 4 build trang) |

### 1.4 Reference patterns (UX inspiration)

- **Klook**: stack pax inputs vertically, hint tuổi rõ
- **GetYourGuide**: option upgrade dạng card với badge "Bestseller"
- **Booking.com**: deadline 15 phút hiển thị progress bar khi vào trang thanh toán
- **Airbnb**: cancellation policy collapse/expand

---

## 2. Inquiry Form (S4-06)

### 2.1 Desktop view — full page `/lien-he-doan-rieng`

```
┌────────────────────────────────────────────────┐
│  Vivu Travel — Tour riêng / Đoàn doanh nghiệp │
│ ─────────────────────────────────────────────  │
│                                                 │
│  Bạn đi nhóm? Đi công ty? Cần lịch trình       │
│  riêng theo nhu cầu? Để Vivu báo giá tốt nhất. │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │  📝 Yêu cầu của bạn                      │  │
│  │                                          │  │
│  │  Họ tên *                                │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │                                  │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │                                          │  │
│  │  Email *           SĐT *                 │  │
│  │  ┌─────────────┐   ┌─────────────┐      │  │
│  │  │             │   │             │      │  │
│  │  └─────────────┘   └─────────────┘      │  │
│  │                                          │  │
│  │  Loại tour *                             │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │ ▼ Tour riêng (Private)           │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │   • Tour riêng (Private) — gia đình     │  │
│  │   • Tour công ty (Corporate)             │  │
│  │   • Sự kiện (Event)                      │  │
│  │                                          │  │
│  │  Số người *       Ngày dự kiến *         │  │
│  │  ┌─────────────┐   ┌─────────────┐      │  │
│  │  │ 15          │   │ 15/08/2026  │ 📅   │  │
│  │  └─────────────┘   └─────────────┘      │  │
│  │                                          │  │
│  │  Ngân sách (tổng đoàn, không bắt buộc)  │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │ Từ ___ triệu — đến ___ triệu     │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │                                          │  │
│  │  Yêu cầu cụ thể *                        │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │ Đi đâu? Bao nhiêu ngày? Đặc      │   │  │
│  │  │ điểm gì cần lưu ý...             │   │  │
│  │  │                                  │   │  │
│  │  │                                  │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │                                          │  │
│  │  [hCaptcha widget]                       │  │
│  │                                          │  │
│  │  ┌──────────────────────────────────┐   │  │
│  │  │       Gửi yêu cầu                │   │  │
│  │  └──────────────────────────────────┘   │  │
│  │                                          │  │
│  │  ⏱ Vivu sẽ liên hệ trong 24 giờ.         │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  Hoặc gọi hotline: 0901-234-567                │
│  Email: lien-he@vivu-travel.com                │
└────────────────────────────────────────────────┘
```

### 2.2 Success state

```
┌────────────────────────────────────────────────┐
│            ✅                                    │
│                                                 │
│      Yêu cầu đã gửi thành công!                │
│                                                 │
│  Mã yêu cầu: VIVU-INQ-20260830-0042            │
│  Vivu sẽ liên hệ qua email/SĐT trong 24 giờ.   │
│                                                 │
│  Trong khi đợi, hãy xem các tour có sẵn:       │
│                                                 │
│  [Xem tour ghép]    [Về trang chủ]             │
│                                                 │
└────────────────────────────────────────────────┘
```

### 2.3 Admin list `/portal/inquiries`

```
┌────────────────────────────────────────────────────────────────┐
│  📋 Yêu cầu khách hàng                                          │
│  ────────────────────────────────────────────────────────       │
│                                                                  │
│  Filter: [Tất cả ▼] [NEW] [CONTACTED] [QUOTED] [WON] [LOST]     │
│  Sort: [Mới nhất ▼]                                              │
│                                                                  │
│  ┌────┬─────────────┬───────┬──────┬───────┬──────────┬──────┐ │
│  │ ID │ Khách       │ Loại  │ Pax  │ Ngày  │ Status   │ ⏰   │ │
│  ├────┼─────────────┼───────┼──────┼───────┼──────────┼──────┤ │
│  │042 │ Trần Văn A  │ CORP  │ 25   │ 08/15 │ 🔴 NEW   │ 2h   │ │ ← cảnh báo SLA
│  │041 │ Lê Thị B    │ PRIV  │ 5    │ 09/02 │ 🟡 CONT  │ 1d   │ │
│  │040 │ Nguyễn V.C  │ EVENT │ 100  │ 10/10 │ 🟢 QUOT  │ 2d   │ │
│  │039 │ Phạm K.D    │ PRIV  │ 8    │ 08/20 │ ✅ WON   │ 5d   │ │
│  │038 │ Vũ Q.E      │ CORP  │ 30   │ 09/15 │ ❌ LOST  │ 7d   │ │
│  └────┴─────────────┴───────┴──────┴───────┴──────────┴──────┘ │
│                                                                  │
│  Cảnh báo: 1 inquiry NEW > 2h chưa contact                      │
└────────────────────────────────────────────────────────────────┘
```

### 2.4 Admin detail drawer (slide từ phải)

```
┌──────────────────────────────────┐
│  Inquiry #042 — Trần Văn A      X │
│ ─────────────────────────────    │
│  Status: [🔴 NEW ▼]              │
│   • NEW                           │
│   • CONTACTED (đã gọi/email)     │
│   • QUOTED (đã gửi báo giá)      │
│   • WON (chốt deal)              │
│   • LOST (không chốt)            │
│                                   │
│  Email: a@example.com             │
│  SĐT: 0901234567                  │
│  Loại: Corporate                  │
│  Số người: 25                     │
│  Ngày: 15/08/2026                 │
│  Ngân sách: 50tr — 100tr          │
│                                   │
│  Yêu cầu:                         │
│  Công ty IT 25 người, đi          │
│  Đà Nẵng 4 ngày, có team          │
│  building 1 ngày...               │
│                                   │
│  ────────────────                 │
│  💬 Ghi chú nội bộ                │
│  ┌──────────────────────────┐   │
│  │ Đã gọi 30/08 14h. Khách  │   │
│  │ confirm budget 80tr.     │   │
│  │ Sẽ gửi báo giá 31/08.    │   │
│  └──────────────────────────┘   │
│                                   │
│  [💾 Lưu] [📧 Gửi email]         │
│                                   │
│  Lịch sử:                         │
│  • 30/08 14:30 - Status NEW       │
│    → CONTACTED bởi admin@vivu     │
│  • 30/08 10:15 - Khách gửi yêu    │
│    cầu                            │
└──────────────────────────────────┘
```

### 2.5 Validation rules

| Field | Rule |
| --- | --- |
| Họ tên | Required, 2-100 char |
| Email | Required, valid email format |
| SĐT | Required, regex VN: `^(0|\+84)[0-9]{9,10}$` |
| Loại tour | Required, enum |
| Số người | Required, integer 1-200 |
| Ngày dự kiến | Required, date ≥ today + 7 ngày |
| Ngân sách min | Optional, ≥ 0 |
| Ngân sách max | Optional, ≥ min |
| Yêu cầu | Required, 20-2000 char |
| hCaptcha | Required, server verify |
| Rate limit | 3 req/giờ/IP, 10 req/ngày/email |

---

## 3. Notes cho dev khi build

### Thư viện UI
- HeroUI Slider cho budget range
- HeroUI DatePicker cho target date
- HeroUI Drawer cho admin detail
- @react-email/components cho email
- @hcaptcha/react-hcaptcha cho captcha

### Accessibility
- Mọi button có `aria-label`
- Form field có `<label>` đúng với `for`/`id`
- Error message link với field qua `aria-describedby`
- Keyboard navigation: Tab thuận, Enter submit, Esc đóng drawer

### Edge case handling
- Form submit khi mất mạng → React Query retry 3 lần với exponential backoff, show toast "Đang gửi..."
- Submit duplicate (double click) → debounce 1s + disable button khi đang submit
- Inquiry trùng (cùng email + SĐT trong 24h) → cho phép submit nhưng admin thấy warning "Trùng inquiry #XXX"

---

## Liên kết

- Stories: `01-stories.md` (S4-05, S4-06)
- Test plan UX section: `03-test-plan.md` Section 6
- Quy chuẩn UI: `../../04-phat-trien/01-quy-chuan-lap-trinh.md`
