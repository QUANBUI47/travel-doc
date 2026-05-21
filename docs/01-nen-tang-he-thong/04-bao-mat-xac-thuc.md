# Đặc tả Bảo mật & Xác thực (Security & Auth Specs)

Hệ thống Vivu Travel sử dụng **Supabase Auth** làm nền tảng quản lý danh tính cho Web Client và Admin Dashboard. Mobile App: Sprint sau (Phase 2).

> **Triển khai web:** [Trạng thái triển khai Web](../02-quan-ly-sprint/trang-thai-web.md)

## 1. Cơ chế Xác thực (Authentication)

### Luồng Web (Next.js 15) — đã triển khai

- **Cơ chế**: Server-side Auth với `@supabase/ssr` + Server Actions (`src/actions/auth.actions.ts`).
- **Callback OAuth / email**: `GET /auth/callback` — đổi `code` lấy session, `AuthService.ensureUserProfile`.
- **Hai phiên cookie** (cùng lúc đăng nhập admin + khách nếu cần):
  - Khách: `AUTH_COOKIES.PUBLIC`
  - Admin: `AUTH_COOKIES.ADMIN`
- **Middleware** (`src/middleware.ts`):
  - URL admin công khai: `/portal/*` (rewrite nội bộ từ `/admin/*`; truy cập trực tiếp `/admin` → 404).
  - Chưa đăng nhập vào route bảo vệ → redirect `/dang-nhap?returnTo=...`
  - Admin: `/portal/login`, kiểm tra `Profile.role === ADMIN`
  - Đã đăng nhập khách vào trang auth (`/dang-nhap`, `/dang-ky`, …) → redirect về trang chủ

### Route auth khách hàng (tiếng Việt)

| Route | Chức năng |
| :--- | :--- |
| `/dang-nhap` | Đăng nhập email / Google |
| `/dang-ky` | Đăng ký |
| `/dang-ky/xac-nhan-email` | Hướng dẫn xác nhận + gửi lại email |
| `/quen-mat-khau` | Yêu cầu reset |
| `/dat-lai-mat-khau` | Đặt mật khẩu mới (sau link email) |
| `/tai-khoan` | Hồ sơ (đọc; sửa — chưa) |
| `/don-dat` | Đơn của tôi (placeholder) |

### Đăng nhập Google

- `signInWithOAuth({ provider: "google" })` → redirect Supabase → Google → `/auth/callback`.
- Cấu hình: Supabase Dashboard (Google provider) + Google Cloud redirect URI `https://<project>.supabase.co/auth/v1/callback`.
- Branding consent screen: cấu hình trên **Google Cloud OAuth consent screen** (tên app Vivu).
- **Gộp tài khoản:** bật automatic linking cùng email trên Supabase nếu user vừa đăng ký email vừa đăng nhập Google.

### Email

- Xác nhận đăng ký, reset mật khẩu: **Supabase Auth SMTP** + template HTML trong `travel-web/supabase/templates/`.
- Không gửi mail đặt chỗ từ Next.js (Sprint 4).

### Luồng Mobile App (Expo) — Planned

- JWT lưu tại `SecureStore`; refresh qua Supabase SDK.

## 2. Phân quyền (Role-Based Access Control - RBAC)

| Role | Quyền hạn |
| :--- | :--- |
| **ADMIN** | Toàn quyền cấu hình hệ thống, quản lý nội dung, xem đơn hàng. |
| **SUPPLIER** | (Sprint sau) Quản lý sản phẩm và đơn hàng của riêng mình. |
| **USER** | Tìm kiếm tour, đặt chỗ (khi Sprint 4), quản lý lịch sử cá nhân. |

## 3. Chính sách Bảo mật Dữ liệu

### Row Level Security (RLS) - Supabase

- **Mục tiêu** (cần kiểm tra bật trên Dashboard): Destination/Tour public read; Booking theo `auth.uid()`; Profile chỉ owner sửa.
- **Thực tế web:** phần lớn mutation qua **Prisma + Server Actions** với `requireAdmin()`, không chỉ dựa RLS.

### Validation Backend (Prisma)

- **Zod Schema** tại Server Actions và API `api/v1/*`.

---
*Tài liệu bảo mật v1.1 — đồng bộ web 17/05/2026*
