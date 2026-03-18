# Authentication & Security

> Tài liệu mô tả cơ chế xác thực, phân quyền và bảo mật dữ liệu.

---

## 1. Cơ chế Xác thực (Authentication)

Dự án sử dụng **Supabase Auth** làm nền tảng xác thực.

### Luồng Đăng nhập (Web)
1. Client gọi Server Action `login()`.
2. Server Action dùng `supabase.auth.signInWithPassword`.
3. Supabase trả về Session/JWT.
4. `@supabase/ssr` tự động lưu Session vào **Cookies (HttpOnly)**.
5. Cập nhật state UI và redirect.

### Social Login (OAuth)
- Hỗ trợ: Google.
- Redirect flow qua `auth/callback` route để xử lý session phía server.

---

## 2. Phân quyền (Role-Based Access Control)

Chúng ta lưu role trong bảng `profiles` (đồng bộ với `auth.users`).

| Role | Quyền hạn |
|---|---|
| **USER** | Truy cập trang chủ, xem tour/hotel, đặt chỗ, quản lý profile cá nhân. |
| **ADMIN** | Toàn quyền truy cập hệ thống quản trị `/admin/*`, điều chỉnh cài đặt hệ thống, quản lý mọi đơn hàng và người dùng. |

---

## 3. Bảo vệ Route (Middleware)

`middleware.ts` xử lý bảo vệ route ở Edge level.

```typescript
// Pseudo logic
const pathname = request.nextUrl.pathname;

// 1. Nếu vào /admin/* (trừ /admin/login)
if (pathname.startsWith("/admin") && !pathname.includes("/login")) {
  if (!user) redirect("/admin/login");
  if (profile.role !== "ADMIN") redirect("/");
}

// 2. Nếu đã login mà vào /dang-nhap
if (pathname === "/dang-nhap" && user) redirect("/");
```

---

## 4. Bảo mật dữ liệu & API

### Server Action Guard
Mỗi admin action **phải** được bọc bởi helper check role:
```typescript
async function requireAdmin() {
  const user = await getAuthUser();
  const profile = await getProfile(user.id);
  if (profile.role !== 'ADMIN') throw new Error('Unauthorized');
  return user;
}
```

### Sanitization
- **Prisma:** Chống SQL Injection bằng cách dùng parameterized queries mặc định.
- **XSS:** React auto-escape dữ liệu đầu ra. Các field HTML (ví dụ Legal content) được render qua thư viện sanitize.
- **CSRF:** Next.js Server Actions có cơ chế chống CSRF tích hợp.

---

## 5. Mobile Security (Dự kiến)

- **JWT Storage:** Lưu trong Secure Store (iOS) / SharedPreferences (Android).
- **Session Refresh:** Tự động gọi refresh token khi app foreground.
- **API Key:** Sử dụng Supabase Anon Key hạn chế quyền qua Row Level Security (RLS) của Postgres.
