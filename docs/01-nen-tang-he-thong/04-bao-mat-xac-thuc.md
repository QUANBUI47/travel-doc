# Bảo mật & Xác thực (Security Strategy)

Chiến lược bảo mật đa lớp cho Vivu Travel.

## 1. Phân quyền (RBAC)
- **Role ADMIN**: Toàn quyền quản trị nội dung và hệ thống. Truy cập `/admin/*`.
- **Role USER**: Khách hàng, chỉ có quyền xem và đặt chỗ.
- **Middleware**: Chặn đứng truy cập trái phép ở tầng Next.js Middleware.

## 2. Bảo mật Dữ liệu
- SSL/TLS cho toàn bộ traffic.
- Mã hóa mật khẩu bằng BCrypt/Argon2.
- Bảo vệ khỏi SQL Injection qua Prisma ORM.
- CSRF Protection cho các Form.

## 3. Quản lý Phiên (Session Management)
- JWT với thời gian hết hạn ngắn.
- Refresh Token logic cho Mobile App.
