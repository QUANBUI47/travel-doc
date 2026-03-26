# Đặc tả Bảo mật & Xác thực (Security & Auth Specs)

Hệ thống Vivu Travel sử dụng **Supabase Auth** làm nền tảng quản lý danh tính cho cả Web Client, Mobile App và Admin Dashboard.

## 1. Cơ chế Xác thực (Authentication)

### Luồng Web (Next.js 15)
- **Cơ chế**: Server-side Auth bằng cách sử dụng @supabase/ssr.
- **Middleware**: Toàn bộ các route `/admin/*` và `/dashboard/*` phải được bảo vệ qua middleware.
- **Logic**:
    - Nếu không có Session -> Redirect về `/login`.
    - Nếu có Session nhưng sai Role (e.g. User vào Admin) -> Redirect về `/403`.

### Luồng Mobile App (Expo)
- **Cơ chế**: JWT lưu tại `SecureStore` của thiết bị.
- **Refresh Token**: Tự động thực hiện bởi SDK Supabase khi Token hết hạn.

## 2. Phân quyền (Role-Based Access Control - RBAC)

Hệ thống chia làm 3 Role chính trong bảng `profiles`:
| Role | Quyền hạn |
| :--- | :--- |
| **ADMIN** | Toàn quyền cấu hình hệ thống, quản lý mọi đơn hàng, phê duyệt đánh giá. |
| **SUPPLIER** | (Sprint sau) Quản lý sản phẩm và đơn hàng của riêng mình. |
| **USER** | Tìm kiếm, đặt tour, quản lý lịch sử đặt chỗ của cá nhân. |

## 3. Chính sách Bảo mật Dữ liệu

### Row Level Security (RLS) - Supabase
- **Destination/Tour**: `SELECT` công khai cho mọi người. `INSERT/UPDATE/DELETE` chỉ dành cho role ADMIN.
- **Booking**: Người dùng chỉ được nhìn thấy đơn hàng của chính mình (Policy: `auth.uid() = user_id`).
- **Profile**: Chỉ chủ sở hữu mới có quyền chỉnh sửa thông tin cá nhân.

### Validation Backend (Prisma)
- Sử dụng **Zod Schema** để validate dữ liệu đầu vào tại các Server Actions (Web) và API Endpoints (Mobile).

---
*Tài liệu hướng dẫn an toàn thông tin v1.0*
