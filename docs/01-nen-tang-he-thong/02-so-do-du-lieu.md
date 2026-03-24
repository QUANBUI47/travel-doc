# Sơ đồ Dữ liệu (ERD & Schema)

Cấu trúc lưu trữ dữ liệu tập trung trên PostgreSQL (Supabase).

## 1. Core Entities
- **User**: Lưu thông tin Auth, Role (Admin/User).
- **Destination**: Thông tin địa danh du lịch.
- **Tour**: Sản phẩm du lịch chính.
- **Booking**: Thông tin đặt tour và thanh toán.
- **Setting**: Cấu hình hệ thống (SEO, Homepage).

## 2. Relationships
- `Destination 1 -- n Tour`: Một địa danh có nhiều tour.
- `User 1 -- n Booking`: Một khách hàng có nhiều đơn đặt chỗ.
- `Tour 1 -- n Booking`: Một tour có nhiều người đặt.

## 3. Tối ưu hóa Database
- Index trên các cột tìm kiếm thường xuyên: `Tour.name`, `Destination.region`.
- Sử dụng Soft Delete cho các dữ liệu quan trọng như Tour và Booking.
