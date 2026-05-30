# Quy chuẩn Lập trình (Clean Code Standards)

Áp dụng cho toàn bộ các repository trong hệ sinh thái Vivu Travel.

## 1. Nguyên tắc cốt lõi
- **SOLID**: Đảm bảo tính linh hoạt và dễ mở rộng.
- **DRY (Don't Repeat Yourself)**: Tận dụng Shared Components và Utilities.
- **KISS (Keep It Simple, Stupid)**: Ưu tiên sự tường minh hơn sự phức tạp.

## 2. Quy tắc đặt tên (Naming Conventions)
- **Folder**: `kebab-case` (ví dụ: `auth-service`, `user-profile`).
- **Files**: `kebab-case` cho các file thường, `PascalCase` cho React Components.
- **Variables/Functions**: `camelCase`.

## 3. Cấu trúc Component (React)
```tsx
// 1. Imports (External -> Internal)
// 2. Interfaces/Types
// 3. Component
// 4. Sub-components (nếu nhỏ)
// 5. Default Export
```

## 4. Đặc tả API Response (Global)

Tất cả các API Endpoints và Server Actions phải trả về dữ liệu theo cấu trúc nhất quán:

```json
{
  "success": true,
  "data": { ... },
  "message": "Thao tác thành công",
  "meta": { "total": 100, "page": 1 } // Pagination (nếu có)
}
```

Trong trường hợp lỗi:
```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Phiên làm việc hết hạn",
    "details": null
  }
}
```

## 5. Quy trình Review & "Definition of Done" (DoD)

Một Task chỉ được coi là hoàn tất khi thỏa mãn:
1.  **Code Quality**: Không có lỗi linter/compiler (Check `.eslintrc.js`).
2.  **Logic**: Vượt qua toàn bộ Acceptance Criteria (AC) trong Sprint Backlog.
3.  **UI/UX**: Đã responsive trên Chrome (Web) và Simulator (Mobile).
4.  **Security**: Đã áp dụng RLS (Supabase) và Zod Validation.

## 6. Cấu trúc Thư mục Chuẩn (Module-based)

```text
src/
  app/ (Next.js routes)
  components/
    ui/ (Shared HeroUI/Tailwind components)
    common/ (Specific functional components)
  hooks/ (Shared React Hooks)
  services/ (API / Supabase SDK interactions)
  types/ (Shared TypeScript interfaces)
  utils/ (Helper functions)
```

---
*Quy chuẩn kỹ thuật Vivu Travel v1.1*
