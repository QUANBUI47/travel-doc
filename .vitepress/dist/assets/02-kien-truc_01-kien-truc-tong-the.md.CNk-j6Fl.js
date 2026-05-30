import{_ as s,o as n,c as e,ag as t}from"./chunks/framework.BZohXCq9.js";const u=JSON.parse('{"title":"01 — Kiến trúc tổng thể","description":"","frontmatter":{},"headers":[],"relativePath":"02-kien-truc/01-kien-truc-tong-the.md","filePath":"02-kien-truc/01-kien-truc-tong-the.md"}'),i={name:"02-kien-truc/01-kien-truc-tong-the.md"};function p(l,a,o,r,c,d){return n(),e("div",null,[...a[0]||(a[0]=[t(`<h1 id="_01-—-kien-truc-tong-the" tabindex="-1">01 — Kiến trúc tổng thể <a class="header-anchor" href="#_01-—-kien-truc-tong-the" aria-label="Permalink to &quot;01 — Kiến trúc tổng thể&quot;">​</a></h1><blockquote><p><strong>Vai trò đọc</strong>: Tech Lead, dev — biết các thành phần hệ thống Vivu và cách chúng nói chuyện với nhau.</p></blockquote><hr><h2 id="stack-overview" tabindex="-1">Stack overview <a class="header-anchor" href="#stack-overview" aria-label="Permalink to &quot;Stack overview&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>┌────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              Browser / Mobile Web (B2C + Admin)                │</span></span>
<span class="line"><span>└──────────────────────────┬─────────────────────────────────────┘</span></span>
<span class="line"><span>                           │ HTTPS</span></span>
<span class="line"><span>┌──────────────────────────▼─────────────────────────────────────┐</span></span>
<span class="line"><span>│                  Vercel — Next.js 15 App Router                │</span></span>
<span class="line"><span>│  ┌──────────────────────┬─────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ Public routes        │ Admin routes                    │    │</span></span>
<span class="line"><span>│  │ /(public)/...        │ /portal/...                     │    │</span></span>
<span class="line"><span>│  └──────────────────────┴─────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ Service Layer (TourService, BookingService, ...)       │    │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>│  ┌────────────────────────────────────────────────────────┐    │</span></span>
<span class="line"><span>│  │ Prisma Client                                          │    │</span></span>
<span class="line"><span>│  └────────────────────────────────────────────────────────┘    │</span></span>
<span class="line"><span>└──────────┬───────────────┬────────────────┬─────────────┬──────┘</span></span>
<span class="line"><span>           │               │                │             │</span></span>
<span class="line"><span>           ▼               ▼                ▼             ▼</span></span>
<span class="line"><span>   ┌──────────────┐ ┌─────────────┐ ┌────────────┐ ┌─────────────┐</span></span>
<span class="line"><span>   │  Supabase    │ │  Cloudinary │ │  VNPay /   │ │   Resend    │</span></span>
<span class="line"><span>   │  Postgres +  │ │  (Images)   │ │   MoMo     │ │  (Email)    │</span></span>
<span class="line"><span>   │  Auth        │ │             │ │            │ │             │</span></span>
<span class="line"><span>   └──────────────┘ └─────────────┘ └────────────┘ └─────────────┘</span></span></code></pre></div><table tabindex="0"><thead><tr><th>Component</th><th>Role</th><th>Phase 1 plan</th></tr></thead><tbody><tr><td><strong>Next.js 15 App Router</strong></td><td>Frontend + server logic (RSC + Server Actions + API Routes)</td><td>Đã chốt</td></tr><tr><td><strong>Supabase Auth</strong></td><td>User authentication (email + Google OAuth)</td><td>Free tier đủ</td></tr><tr><td><strong>Supabase Postgres</strong></td><td>Primary DB</td><td>Free tier 500MB Phase 1, upgrade khi cần</td></tr><tr><td><strong>Prisma</strong></td><td>ORM</td><td>Mapping <code>@db.Uuid</code> cho mọi ID (ADR-003)</td></tr><tr><td><strong>Cloudinary</strong></td><td>Image upload + optimize</td><td>Free tier 25GB</td></tr><tr><td><strong>VNPay + MoMo</strong></td><td>Payment gateway</td><td>Sandbox Phase 1, prod khi launch</td></tr><tr><td><strong>Resend</strong></td><td>Email transactional</td><td>Free tier 3k/tháng đủ</td></tr><tr><td><strong>Vercel</strong></td><td>Hosting + Edge functions</td><td>Free tier hobby Phase 1, Pro khi prod</td></tr></tbody></table><hr><h2 id="routing-layout" tabindex="-1">Routing layout <a class="header-anchor" href="#routing-layout" aria-label="Permalink to &quot;Routing layout&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>travel-web/app/</span></span>
<span class="line"><span>├── (public)/                  ← Group public routes</span></span>
<span class="line"><span>│   ├── page.tsx               (home)</span></span>
<span class="line"><span>│   ├── tours/</span></span>
<span class="line"><span>│   │   ├── page.tsx           (list)</span></span>
<span class="line"><span>│   │   └── [slug]/page.tsx    (detail)</span></span>
<span class="line"><span>│   ├── destinations/</span></span>
<span class="line"><span>│   │   └── [slug]/page.tsx</span></span>
<span class="line"><span>│   ├── hotels/</span></span>
<span class="line"><span>│   │   └── [slug]/page.tsx</span></span>
<span class="line"><span>│   ├── inquiry/</span></span>
<span class="line"><span>│   │   └── page.tsx           (Private Tour lead form)</span></span>
<span class="line"><span>│   ├── account/               ← User profile (require auth)</span></span>
<span class="line"><span>│   │   ├── bookings/page.tsx</span></span>
<span class="line"><span>│   │   └── profile/page.tsx</span></span>
<span class="line"><span>│   └── auth/</span></span>
<span class="line"><span>│       ├── login/page.tsx</span></span>
<span class="line"><span>│       └── register/page.tsx</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── portal/                    ← Admin routes (require role=ADMIN)</span></span>
<span class="line"><span>│   ├── dashboard/page.tsx     (L0 Operational)</span></span>
<span class="line"><span>│   ├── tours/</span></span>
<span class="line"><span>│   ├── destinations/</span></span>
<span class="line"><span>│   ├── hotels/</span></span>
<span class="line"><span>│   ├── bookings/</span></span>
<span class="line"><span>│   ├── inquiries/</span></span>
<span class="line"><span>│   ├── seo/</span></span>
<span class="line"><span>│   └── settings/</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>├── api/</span></span>
<span class="line"><span>│   └── v1/</span></span>
<span class="line"><span>│       ├── payments/</span></span>
<span class="line"><span>│       │   ├── vnpay/</span></span>
<span class="line"><span>│       │   │   ├── checkout/route.ts</span></span>
<span class="line"><span>│       │   │   └── webhook/route.ts</span></span>
<span class="line"><span>│       │   └── momo/</span></span>
<span class="line"><span>│       ├── upload/route.ts    (Cloudinary signed upload)</span></span>
<span class="line"><span>│       └── crons/</span></span>
<span class="line"><span>│           ├── auto-cancel-bookings/route.ts</span></span>
<span class="line"><span>│           └── expire-inquiries/route.ts</span></span>
<span class="line"><span>│</span></span>
<span class="line"><span>└── middleware.ts              ← Dual cookie public/admin</span></span></code></pre></div><p><strong>Quy tắc routing</strong>:</p><ul><li><code>/(public)/*</code> → khách &amp; admin đều xem được, lọc theo <code>isActive</code></li><li><code>/portal/*</code> → chỉ ADMIN (middleware reject nếu role≠ADMIN)</li><li><code>/api/v1/*</code> → internal (không public dev portal Phase 1)</li></ul><hr><h2 id="service-layer-architecture" tabindex="-1">Service layer architecture <a class="header-anchor" href="#service-layer-architecture" aria-label="Permalink to &quot;Service layer architecture&quot;">​</a></h2><p>Page/component <strong>KHÔNG</strong> gọi Prisma trực tiếp. Mọi mutation qua service.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Page (RSC / Client Component)</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├──► Server Action ──┐</span></span>
<span class="line"><span>   │                    ├──► Service (TourService, BookingService, …)</span></span>
<span class="line"><span>   └──► API Route ──────┘            │</span></span>
<span class="line"><span>                                     ├──► Prisma ──► PostgreSQL</span></span>
<span class="line"><span>                                     └──► External (VNPay, Cloudinary, Resend)</span></span></code></pre></div><h3 id="service-convention" tabindex="-1">Service convention <a class="header-anchor" href="#service-convention" aria-label="Permalink to &quot;Service convention&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>travel-web/src/lib/services/</span></span>
<span class="line"><span>├── tour.service.ts            # findActive*(), findForAdmin*(), create*, update*</span></span>
<span class="line"><span>├── booking.service.ts         # createTourBooking() — pessimistic lock</span></span>
<span class="line"><span>├── payment.service.ts         # VNPay/MoMo wrap</span></span>
<span class="line"><span>├── inquiry.service.ts</span></span>
<span class="line"><span>├── hotel.service.ts</span></span>
<span class="line"><span>├── review.service.ts</span></span>
<span class="line"><span>├── seo.service.ts</span></span>
<span class="line"><span>├── auth.service.ts            # ensureUserProfile() từ Supabase</span></span>
<span class="line"><span>└── activity-log.service.ts    # logActivity()</span></span></code></pre></div><p><strong>Rule cứng</strong>:</p><ol><li>Service nhận DTO (Zod validated), trả entity hoặc throw domain error.</li><li>Service quản lý transaction boundary (đặc biệt với booking).</li><li>Service tự log <code>ActivityLog</code> cho mọi mutation.</li><li>Service throw class error (NotFoundError, ValidationError, BusinessError, DepartureFullError) — không throw string.</li><li>Service không gọi service khác (tránh tight coupling). Nếu cần, di chuyển logic chung lên util.</li><li>Service có 2 method cho public/admin: <code>findActive*()</code> filter <code>isActive: true</code>, <code>findAll*()</code> không filter.</li></ol><p>→ Chi tiết: <code>../04-phat-trien/01-quy-chuan-lap-trinh.md</code>.</p><hr><h2 id="database-—-supabase-postgres" tabindex="-1">Database — Supabase Postgres <a class="header-anchor" href="#database-—-supabase-postgres" aria-label="Permalink to &quot;Database — Supabase Postgres&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Aspect</th><th>Phase 1</th></tr></thead><tbody><tr><td>Provider</td><td>Supabase (managed Postgres 15+)</td></tr><tr><td>Tier</td><td>Free (500MB, 2 connection pool)</td></tr><tr><td>Connection</td><td>Connection pooler (PgBouncer) → Prisma</td></tr><tr><td>Backup</td><td>Supabase auto daily backup</td></tr><tr><td>Migration</td><td>Prisma Migrate (<code>prisma migrate deploy</code>)</td></tr></tbody></table><p><strong>Khoảng cách Prisma ↔ Postgres</strong>:</p><ul><li>Mọi ID: <code>@db.Uuid</code> (ADR-003)</li><li>Mọi field <code>@map(&quot;snake_case&quot;)</code></li><li>Decimal money: <code>@db.Decimal(14, 0)</code> (VND nguyên, 14 chữ số)</li><li>Date: <code>@db.Date</code> (không có timezone) cho <code>period_month</code>, <code>start_date</code></li><li>DateTime: TIMESTAMPTZ (default Prisma)</li></ul><p>→ Schema chi tiết: <code>../03-co-so-du-lieu/02-thiet-ke-bang.md</code>.</p><hr><h2 id="authentication" tabindex="-1">Authentication <a class="header-anchor" href="#authentication" aria-label="Permalink to &quot;Authentication&quot;">​</a></h2><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>                         ┌──────────────────┐</span></span>
<span class="line"><span>                         │ Supabase Auth    │</span></span>
<span class="line"><span>                         │ (email + Google) │</span></span>
<span class="line"><span>                         └────────┬─────────┘</span></span>
<span class="line"><span>                                  │ JWT</span></span>
<span class="line"><span>┌────────────────────┐            │</span></span>
<span class="line"><span>│   middleware.ts    │◄───────────┘</span></span>
<span class="line"><span>│ Verify token       │</span></span>
<span class="line"><span>│ Set cookie:        │</span></span>
<span class="line"><span>│  - sb-access-token │</span></span>
<span class="line"><span>│  - sb-refresh-token│</span></span>
<span class="line"><span>└─────────┬──────────┘</span></span>
<span class="line"><span>          │</span></span>
<span class="line"><span>          ▼</span></span>
<span class="line"><span>┌─────────────────────────┐</span></span>
<span class="line"><span>│   ensureUserProfile()   │ ← Tạo Profile row nếu chưa có</span></span>
<span class="line"><span>│   Profile.id = auth.id  │</span></span>
<span class="line"><span>└─────────────────────────┘</span></span></code></pre></div><p><strong>Dual cookie strategy</strong>:</p><ul><li>Public cookie: 30 days</li><li>Admin cookie: 8h (idle timeout)</li><li>Middleware phân biệt route <code>/portal/*</code> vs <code>/(public)/*</code></li></ul><p>→ Chi tiết: <code>02-cross-cutting.md</code> mục Auth + <code>../04-phat-trien/04-bao-mat-xac-thuc.md</code>.</p><hr><h2 id="external-integrations" tabindex="-1">External integrations <a class="header-anchor" href="#external-integrations" aria-label="Permalink to &quot;External integrations&quot;">​</a></h2><h3 id="cloudinary-image" tabindex="-1">Cloudinary (image) <a class="header-anchor" href="#cloudinary-image" aria-label="Permalink to &quot;Cloudinary (image)&quot;">​</a></h3><ul><li>Admin upload qua signed URL → <code>/api/v1/upload</code></li><li>URL lưu vào <code>Tour.imageUrls[]</code>, <code>Hotel.imageUrls[]</code>, <code>Destination.imageUrls[]</code></li><li>Transform on-the-fly cho responsive: <code>cloudinary.com/image/upload/c_fill,w_800,h_600,q_auto/...</code></li></ul><h3 id="vnpay-momo-payment" tabindex="-1">VNPay / MoMo (payment) <a class="header-anchor" href="#vnpay-momo-payment" aria-label="Permalink to &quot;VNPay / MoMo (payment)&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>Booking PENDING → Payment.create → Redirect tới VNPay/MoMo</span></span>
<span class="line"><span>                                                    │</span></span>
<span class="line"><span>                                                    ▼ user pays</span></span>
<span class="line"><span>                                          Webhook → /api/v1/payments/vnpay/webhook</span></span>
<span class="line"><span>                                                    │</span></span>
<span class="line"><span>                                                    ▼ verify signature</span></span>
<span class="line"><span>                                          Update Payment.status=SUCCESS</span></span>
<span class="line"><span>                                          Update Booking.status=PAID</span></span></code></pre></div><p><strong>Idempotency</strong>: webhook có thể gọi nhiều lần → service phải:</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (payment.status </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;SUCCESS&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // already processed</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// otherwise update</span></span></code></pre></div><h3 id="resend-email" tabindex="-1">Resend (email) <a class="header-anchor" href="#resend-email" aria-label="Permalink to &quot;Resend (email)&quot;">​</a></h3><ul><li>Email template (HTML) lưu trong code, render với <code>react-email</code> lib</li><li>Transactional only Phase 1 (confirm, cancel, reminder, review invite)</li><li>Marketing email Phase 1.5</li></ul><hr><h2 id="cron-jobs-vercel-cron" tabindex="-1">Cron jobs (Vercel Cron) <a class="header-anchor" href="#cron-jobs-vercel-cron" aria-label="Permalink to &quot;Cron jobs (Vercel Cron)&quot;">​</a></h2><p><code>vercel.json</code>:</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  &quot;crons&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;path&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/crons/auto-cancel-bookings&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;schedule&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;* * * * *&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;path&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/crons/expire-inquiries&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,     </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">&quot;schedule&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;0 2 * * *&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><table tabindex="0"><thead><tr><th>Cron</th><th>Frequency</th><th>Mục đích</th></tr></thead><tbody><tr><td><code>auto-cancel-bookings</code></td><td>1 phút</td><td>Cancel Booking PENDING quá <code>paymentDeadline</code></td></tr><tr><td><code>expire-inquiries</code></td><td>1 ngày (02:00 UTC)</td><td>Expire InquiryRequest &gt; 30 ngày không update</td></tr></tbody></table><p><strong>Auth cron</strong>: header <code>Authorization: Bearer $CRON_SECRET</code> để Vercel verify.</p><hr><h2 id="caching-strategy" tabindex="-1">Caching strategy <a class="header-anchor" href="#caching-strategy" aria-label="Permalink to &quot;Caching strategy&quot;">​</a></h2><table tabindex="0"><thead><tr><th>Layer</th><th>Cache</th><th>TTL</th></tr></thead><tbody><tr><td>Static pages (home, about)</td><td>Next.js ISR</td><td>1h revalidate</td></tr><tr><td>Tour list/detail</td><td>Next.js ISR + on-demand revalidate khi admin update</td><td>6h + manual revalidate</td></tr><tr><td>Search results</td><td>Server-side cache key by filter params</td><td>5 phút</td></tr><tr><td>Admin pages</td><td>No cache</td><td>—</td></tr><tr><td>Static assets (image, font)</td><td>Cloudinary/Vercel CDN</td><td>Forever</td></tr></tbody></table><p><strong>Revalidation</strong>: khi admin update tour → service call <code>revalidatePath(&#39;/tours/[slug]&#39;)</code> + <code>revalidateTag(&#39;tour-list&#39;)</code>.</p><hr><h2 id="lien-ket" tabindex="-1">Liên kết <a class="header-anchor" href="#lien-ket" aria-label="Permalink to &quot;Liên kết&quot;">​</a></h2><ul><li>Cross-cutting concerns (auth, i18n, cache, log, error): <code>02-cross-cutting.md</code></li><li>API contract: <code>03-api-contract.md</code></li><li>ADR folder: <code>decisions/</code></li><li>Quy chuẩn code: <code>../04-phat-trien/01-quy-chuan-lap-trinh.md</code></li><li>Schema DB: <code>../03-co-so-du-lieu/02-thiet-ke-bang.md</code></li></ul>`,55)])])}const g=s(i,[["render",p]]);export{u as __pageData,g as default};
