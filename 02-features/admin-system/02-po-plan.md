# PO Plan: Hệ thống Quản trị (Admin System)

> **Role:** Product Owner (PO)  
> **Sprint:** 2 (Current Focus)

## 1. Thứ tự Ưu tiên (Feature Priority)

1. **P0 (Critical):** Admin Authentication & Security Guard.
2. **P0 (Critical):** Homepage & System Settings (Cần đẩy site live sớm).
3. **P1 (High):** Tour & Product Management (Cần nhập liệu).
4. **P2 (Medium):** Customer & Booking Management.
5. **P3 (Low):** Legal Content Management.

## 2. Acceptance Criteria (Tiêu chí Chấp nhận)

### AC-01: Admin Login
- [ ] Chỉ User có role `ADMIN` trong DB mới được vào.
- [ ] Sai thông tin hiện thông báo lỗi chung.
- [ ] Session hết hạn sau 24h hoặc khi logout.

### AC-02: Homepage Dynamic Update
- [ ] Thay đổi Text trên Admin Dashboard → Trang chủ phía khách hàng thay đổi ngay. (Không cần rebuild code).
- [ ] Phải có nút "Xem trước" (Preview) trước khi Publish.

## 3. Quản lý Rủi ro
- **Rủi ro:** Lộ link admin hoặc rò rỉ JWT secret.
- **Giảm thiểu:** Sử dụng Row Level Security (RLS) của Supabase và Middleware Next.js.
