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

## 4. Error Handling
- Luôn sử dụng Error Boundary cho UI.
- API Response phải tuân thủ format: `{ success: boolean, data?: any, error?: string, code?: string }`.
