# [Sprint 2] Thiết kế Kỹ thuật (Technical Specs)

Hướng dẫn triển khai backend và frontend cho module Points of Interest (POI).

## 1. Database Schema (Prisma)
```prisma
model Destination {
  id          String   @id @default(uuid())
  regionId    String   @map("region_id")
  slug        String   @unique
  nameVi      String   @map("name_vi")
  nameEn      String?  @map("name_en")
  description String?
  imageUrl    String?  @map("image_url")
  latitude    Float?
  longitude   Float?
  isFeatured  Boolean  @default(false) @map("is_featured")
  sortOrder   Int      @default(0) @map("sort_order")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  region      Region   @relation(fields: [regionId], references: [id], onDelete: Cascade)
  tours       Tour[]

  @@map("destinations")
}
```

## 2. API Endpoints
- `GET /api/v1/destinations`: Lấy danh sách (hỗ trợ phân trang, lọc theo regionId).
- `POST /api/v1/destinations`: Tạo mới (yêu cầu Admin Session).
- `PUT /api/v1/destinations/:id`: Cập nhật.
- `DELETE /api/v1/destinations/:id`: Xóa kèm logic check constraint (tours).
- **Vùng miền:** `getRegionsAction()` (Server Action) — 3 bản ghi seed; không có `GET /api/v1/regions`.

## 3. UI Components (Admin Side)
- `DestinationForm.tsx`: Sử dụng React Hook Form + Zod validation.
- `ImageUploader.tsx`: Tích hợp xử lý ảnh trước khi đẩy lên Cloudinary (Sharp/Browser Image Compression).
- `DestinationList.tsx`: Sử dụng `Table` của HeroUI, kết hợp với các component `Chip`, `Dropdown`, `Tooltip`.
- **Cài đặt Hệ thống**: Cấu hình chung và SEO lưu tại bảng `SystemSetting`, cập nhật thông qua Server Actions.
