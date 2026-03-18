# Tech Specs: Hệ thống Quản trị (Admin System)

> **Role:** Developer (FE/BE/Mobile)  
> **Stack:** Next.js Server Actions, Prisma, Supabase

## 1. Backend Architecture (Server Tasks)

### 1.1. Schema Update (Prisma)
- Cần models: `HomeSetting`, `SystemSetting`, `LegalContent`.
- Liên kết: `Tour` -> `Destination` -> `Region`.

### 1.2. Server Actions (Auth & Settings)
```typescript
// /src/app/admin/actions.ts
export async function updateHomeSettings(data: HomeSettingsSchema) {
  await requireAdmin(); // Security guard
  return await prisma.homeSetting.upsert({ ... });
}
```

## 2. Frontend Implementation (Web Tasks)
- **Layout:** Root Admin Layout tích hợp Sidebar + Header + Breadcrumbs.
- **Components:** `DataTable`, `StatusBadge`, `ImageUploader`.
- **Form:** Sử dụng `react-hook-form` + `zod` để validate đầu vào.

## 3. Mobile Admin (Planned)
- View-only dashboard trên ứng dụng mobile.
- Nhận thông báo (Push) khi có booking mới.

## 4. Bảo mật (Security Tasks)
- **Middleware:** Chặn toàn bộ route `/admin/*` nếu `cookies().get('sb-access-token')` không hợp lệ hoặc role không phải ADMIN.
