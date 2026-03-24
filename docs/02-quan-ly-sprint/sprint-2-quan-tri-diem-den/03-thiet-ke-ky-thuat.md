# [Sprint 2] Thiết kế Kỹ thuật (Technical Specs)

Hướng dẫn triển khai backend và frontend cho module Points of Interest (POI).

## 1. Database Schema (Prisma)
```prisma
model Destination {
  id          String   @id @default(cuid())
  name        String
  region      String   // Northern, Central, Southern
  description String?  @db.Text
  images      String[] // Cloudinary URLs
  latitude    Float?
  longitude   Float?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  tours       Tour[]
}
```

## 2. API Endpoints
- `GET /api/v1/destinations`: Lấy danh sách (hỗ trợ phân trang, lọc theo region).
- `POST /api/v1/destinations`: Tạo mới (yêu cầu Admin Session).
- `PUT /api/v1/destinations/:id`: Cập nhật.
- `DELETE /api/v1/destinations/:id`: Xóa kèm logic check constraint.

## 3. UI Components (Admin Side)
- `DestinationForm.tsx`: Sử dụng React Hook Form + Zod validation.
- `ImageUploader.tsx`: Tích hợp CDN Cloudinary.
- `DestinationList.tsx`: Shadcn Datatable với bộ lọc region.
