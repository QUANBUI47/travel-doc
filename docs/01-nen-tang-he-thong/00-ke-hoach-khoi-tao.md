# Kế hoạch Khởi tạo & Hạ tầng

Đặc tả các bước thiết lập môi trường và cấu trúc thư mục chuẩn cho toàn bộ dự án Vivu Travel.

## 1. Môi trường phát triển
- Node.js version >= 20.
- Database: PostgreSQL (Supabase).
- Quản lý mã nguồn: Git Mono-repository (Web/Doc/App).

## 2. Cấu trúc Thư mục chuẩn (Sennior Approach)
- `/src/services`: Tầng xử lý logic nghiệp vụ và truy vấn Database.
- `/src/actions`: Server Actions xử lý Input/Form.
- `/src/types`: Định nghĩa Interface dùng chung toàn hệ thống.
- `/src/components`: UI Components được module hóa (Atomic Design).

## 3. Quy trình Triển khai
- CI/CD qua GitHub Actions (Dự kiến).
- Hosting: Vercel cho Web/Doc, EAS cho Mobile App.
