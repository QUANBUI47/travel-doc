# 04 — Bảo mật & Xác thực

> **Vai trò đọc**: dev — biết security primitives của Vivu, threat model cơ bản, account lifecycle.

---

## 1. Threat model Phase 1

| Threat | Mức | Mitigation Phase 1 |
| --- | --- | --- |
| **SQL injection** | 🔴 cao | Prisma ORM parameterized, không `$queryRawUnsafe` |
| **XSS** | 🔴 cao | React auto-escape, `dangerouslySetInnerHTML` chỉ dùng cho content admin trusted |
| **CSRF** | 🟠 TB | Next.js Server Action tự CSRF protected (form POST), API route check origin |
| **Auth bypass** | 🔴 cao | Middleware verify Supabase JWT, role check ở service layer |
| **Booking spam / fake** | 🟠 TB | Must-login + email verify (ADR-004), rate limit Phase 1.5 |
| **Payment fraud** | 🔴 cao | VNPay/MoMo signature verify, idempotency, snapshot pricing |
| **PII leak** | 🟠 TB | HTTPS, không log PII vào console, không expose `Profile.phone` ở public API |
| **Brute force login** | 🟡 thấp | Supabase Auth built-in rate limit; thêm reCAPTCHA Phase 1.5 nếu cần |
| **Session hijack** | 🟡 thấp | HTTPS-only cookie, secure flag, sameSite=lax |
| **Admin abuse** | 🟡 thấp | ActivityLog audit + idle timeout 8h |

---

## 2. Authentication flow chi tiết

### 2.1 Email + password register

```
1. User submit form: email + password + displayName
2. Supabase Auth: signUp({ email, password })
3. Supabase gửi email verify
4. User click link → email confirmed
5. Middleware detect user → call ensureUserProfile()
6. Profile row tạo với id = auth.users.id
7. Redirect home
```

### 2.2 Google OAuth (1-click)

```
1. User click "Sign in with Google"
2. Supabase Auth redirect Google OAuth consent
3. Google callback → Supabase callback → set cookie
4. Middleware call ensureUserProfile() (lần đầu)
5. Profile có displayName + avatarUrl từ Google
```

### 2.3 Login (existing user)

```
1. User submit email + password
2. Supabase Auth verify → JWT access token + refresh token
3. Cookie sb-access-token (httpOnly, secure, sameSite=lax)
4. Middleware check cookie → fetch profile từ DB
5. Inject user context cho RSC
```

### 2.4 Logout

```
1. User click "Đăng xuất"
2. Server Action: supabase.auth.signOut()
3. Clear cookie
4. Redirect home
```

### 2.5 Forgot password

```
1. User submit email
2. Supabase Auth: resetPasswordForEmail(email)
3. Email link gửi
4. User click → /auth/reset-password?token=...
5. Form: new password → updateUser({ password })
6. Redirect login
```

---

## 3. Authorization — Role check

### 3.1 Middleware (route-level)

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const supabase = createMiddlewareClient({ req, res: NextResponse.next() })
  const { data: { user } } = await supabase.auth.getUser()

  // Admin routes
  if (pathname.startsWith('/portal')) {
    if (!user) return redirectToLogin(pathname)
    const profile = await getProfile(user.id)
    if (!profile || profile.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // User routes (account)
  if (pathname.startsWith('/account')) {
    if (!user) return redirectToLogin(pathname)
  }

  return NextResponse.next()
}
```

### 3.2 Service-level (defense in depth)

```typescript
async function requireAdmin(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } })
  if (!profile || profile.role !== 'ADMIN') {
    throw new ForbiddenError('Admin role required')
  }
}

async function createTour(input: CreateTourInput, userId: string) {
  await requireAdmin(userId)   // ← service vẫn check, không trust middleware
  return prisma.tour.create({ data: input })
}
```

### 3.3 Resource ownership check

```typescript
async function cancelBooking(bookingId: string, userId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) throw new NotFoundError()

  // User chỉ cancel được booking của mình; admin cancel được tất cả
  const profile = await getProfile(userId)
  if (booking.userId !== userId && profile?.role !== 'ADMIN') {
    throw new ForbiddenError()
  }

  // ...
}
```

---

## 4. PII & Privacy

### 4.1 PII fields cần bảo vệ

| Bảng | PII fields |
| --- | --- |
| `Profile` | `displayName`, `avatarUrl`, `phone` |
| `Booking` | `guestName`, `guestEmail`, `guestPhone` |
| `Review` | `title`, `content` (có thể chứa PII trong text) |
| `InquiryRequest` | `contactName`, `contactEmail`, `contactPhone`, `companyName` |
| `Payment` | `externalId` (không phải PII nhưng nhạy) |

### 4.2 Quy ước hiển thị

- KHÔNG hiển thị `phone` ở public surface (chỉ admin xem)
- Review hiển thị `displayName` rút gọn: "Khoa N." thay vì "Khoa Nguyễn Văn"
- API/server log KHÔNG log raw PII; nếu cần debug → hash hoặc redact

### 4.3 Account deletion procedure (Phase 1)

> Phase 1 **không support hard delete** user vì `Profile → Booking/Review` là `Restrict` (ADR-007).

**Admin manual flow**:
1. Khách yêu cầu xoá tài khoản qua email/support
2. Admin verify identity
3. Admin chạy procedure `anonymizeProfile(userId)`:
   ```sql
   UPDATE profiles SET
     display_name = 'Deleted User',
     avatar_url   = NULL,
     phone        = NULL
   WHERE id = $1;
   ```
4. (Optional) anonymize Booking guest fields nếu khách yêu cầu:
   ```sql
   UPDATE bookings SET
     guest_name  = 'Anonymous',
     guest_email = 'anonymized@example.com',
     guest_phone = '0000000000',
     notes       = NULL
   WHERE user_id = $1;
   ```
5. (Optional) anonymize Review content nếu khách yêu cầu
6. Log `ActivityLog` action = `ANONYMIZE_USER`
7. Email khách xác nhận

### 4.4 Phase 1.5 — Soft delete + cron anonymize

- Thêm `Profile.deletedAt` nullable
- User self-service: submit yêu cầu → set `deletedAt = NOW()`
- Cron daily: nếu `deletedAt < NOW() - INTERVAL '30 days'` → auto anonymize

---

## 5. Secret management

### 5.1 Env variables

→ Chi tiết: `../02-kien-truc/02-cross-cutting.md` mục Env.

### 5.2 Rotation policy

| Secret | Rotation |
| --- | --- |
| Supabase service role key | Khi nghi ngờ leak; Phase 1.5+ 6 tháng/lần |
| Cloudinary API secret | 1 năm/lần |
| VNPay/MoMo secret | Theo policy gateway (thường 1 năm) |
| Resend API key | 1 năm/lần |
| Cron secret | Khi dev rời team |

### 5.3 Storage

- **Local dev**: `.env.local` (gitignored)
- **Vercel**: Environment Variables UI (encrypted at rest)
- **Sharing**: 1Password / Bitwarden vault chung; KHÔNG paste vào Slack/Zalo

---

## 6. Webhook security

### 6.1 Signature verification (VNPay)

```typescript
function verifyVnpaySignature(params: Record<string, string>, secureHash: string): boolean {
  const filtered = Object.entries(params)
    .filter(([k]) => k !== 'vnp_SecureHash' && k !== 'vnp_SecureHashType')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&')

  const hash = crypto.createHmac('sha512', process.env.VNPAY_SECRET!)
    .update(filtered)
    .digest('hex')

  return hash === secureHash
}
```

### 6.2 Replay attack protection

- VNPay `vnp_TransactionNo` unique → Payment.externalId unique → duplicate webhook idempotent (xem `../02-kien-truc/03-api-contract.md` mục 3.5)

---

## 7. Cookie policy

| Cookie | Attributes |
| --- | --- |
| `sb-access-token` | `httpOnly`, `secure`, `sameSite=lax`, max-age 1h |
| `sb-refresh-token` | `httpOnly`, `secure`, `sameSite=lax`, max-age 30d |
| `sb-admin-session` | `httpOnly`, `secure`, `sameSite=strict`, max-age 8h idle |
| Analytics (Phase 1.5) | `secure`, `sameSite=lax` |

**KHÔNG dùng `localStorage`** cho auth token (vulnerable to XSS).

---

## 8. HTTPS & Headers

### 8.1 HTTPS only

- Vercel auto HTTPS với certificate Let's Encrypt
- Redirect HTTP → HTTPS

### 8.2 Security headers (Next.js config)

```typescript
// next.config.mjs
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options',         value: 'DENY' },
  { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',      value: 'geolocation=(), camera=(), microphone=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
]
```

### 8.3 CSP (Content Security Policy) — Phase 1.5

Phase 1 chấp nhận default. Phase 1.5 tighten CSP khi feature stable.

---

## 9. Audit & monitoring

### 9.1 ActivityLog cho mọi mutation admin

→ Đã có trong service convention (xem `01-quy-chuan-lap-trinh.md` mục 4.4).

### 9.2 Login attempt tracking — Phase 1.5

Hiện tại Supabase Auth tự rate limit. Phase 1.5 nếu cần thêm:
- Failed login attempts → ActivityLog action=`LOGIN_FAILED`
- IP lockout sau 5 fail trong 15 phút

### 9.3 Suspicious activity alert — Phase 2

Phase 2 add cảnh báo:
- Admin login từ IP mới
- Booking từ IP cách xa địa chỉ thường
- Mass booking từ 1 user trong thời gian ngắn

---

## 10. Checklist trước launch

- [ ] Tất cả env vars set đúng trên Vercel (không hardcode)
- [ ] HTTPS bật, HTTP redirect
- [ ] Security headers active
- [ ] Cookie httpOnly + secure
- [ ] Webhook signature verify
- [ ] Payment idempotency tested
- [ ] No `console.log` PII còn sót
- [ ] Rate limit Supabase Auth bật
- [ ] Admin role assignment quy trình rõ ràng (Founder duyệt)
- [ ] ActivityLog tracking đầy đủ mutation
- [ ] Backup DB chạy (Supabase auto daily)

---

## Liên kết

- Auth flow tổng: `../02-kien-truc/02-cross-cutting.md` mục Auth
- API security: `../02-kien-truc/03-api-contract.md` mục 6.x
- Account rules: `../01-nghiep-vu/02-quy-tac-nghiep-vu.md` mục BR-AC
- ADR liên quan: `../02-kien-truc/decisions/ADR-004` (must-login)
