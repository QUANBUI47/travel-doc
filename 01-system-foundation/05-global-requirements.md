# Yêu cầu Hệ thống (Product Requirements)

> Tài liệu tổng hợp tất cả yêu cầu chức năng (FR) và phi chức năng (NFR) của toàn hệ thống Vivu Travel.

---

## 1. Yêu cầu Chức năng (Functional Requirements)

### 1.1. Nhóm Người dùng (Public)
| ID | Tính năng | Mô tả | Phase |
|---|---|---|---|
| FR-1.1 | **Homepage** | Hiển thị Hero banner, Promos, Top Destinations, Stats | 1 |
| FR-1.2 | **Auth** | Đăng nhập, Đăng ký, Quên mật khẩu, Social Login | 1 |
| FR-1.3 | **Legal** | Xem Điều khoản dịch vụ và Chính sách bảo mật | 1 |
| FR-1.4 | **Search** | Tìm kiếm Tour/Khách sạn theo từ khóa, ngày, số người | 3 |
| FR-1.5 | **Explore** | Xem danh sách & chi tiết Điểm đến, Tour, Khách sạn | 3 |
| FR-1.6 | **Booking** | Đặt tour/phòng, điền thông tin khách, chọn phương thức | 4 |
| FR-1.7 | **Payment** | Thanh toán trực tuyến (VNPay/MoMo) | 4 |
| FR-1.8 | **User Dash** | Quản lý profile, lịch sử đặt chỗ, đổi mật khẩu | 5 |
| FR-1.9 | **Review** | Đánh giá & nhận xét dịch vụ sau khi sử dụng | 5 |

### 1.2. Nhóm Quản trị (Admin)
| ID | Tính năng | Mô tả | Phase |
|---|---|---|---|
| FR-2.1 | **Admin Login** | Đăng nhập riêng biệt, role-based guard | 2 |
| FR-2.2 | **Dashboard** | Thống kê tổng quan (Sales, Bookings, Users) | 2 |
| FR-2.3 | **Tour Mgmt** | CRUD Tour, Điểm đến, Vùng miền, Khách sạn | 2 |
| FR-2.4 | **Booking Mgmt** | Quản lý danh sách đơn đặt, trạng thái (Pending/Paid) | 2 |
| FR-2.5 | **User Mgmt** | Quản lý danh sách khách hàng, phân quyền | 2 |
| FR-2.6 | **Legal Mgmt** | Chỉnh sửa nội dung các trang pháp lý | 2 |
| FR-2.7 | **System Set** | Cấu hình Homepage, SEO, Theme, General Info | 2 |

### 1.3. Nhóm Mobile App
| ID | Tính năng | Mô tả | Phase |
|---|---|---|---|
| FR-3.1 | **Sync** | Đồng bộ dữ liệu real-time với Website | 5 |
| FR-3.2 | **Notification** | Push notification cho trạng thái đơn hàng | 5 |
| FR-3.3 | **Offline Cache** | Lưu trữ thông tin tour đã xem ngoại tuyến | 5 |

---

## 2. Yêu cầu Phi chức năng (Non-Functional Requirements)

| Nhóm | ID | Yêu cầu | Chi tiết |
|---|---|---|---|
| **Performance** | NFR-1 | Load time | Trang chủ load < 2s trên 4G |
| | NFR-2 | Optimization | Next/Image cho Web, WebP cho Mobile |
| **Security** | NFR-3 | Auth | JWT via Supabase, HttpOnly cookies |
| | NFR-4 | Role Guard | Server Action level validation cho Admin |
| **UX/UI** | NFR-5 | Design Sys | **Shared Design System** (Web + Mobile tokens) |
| | NFR-6 | Responsive | Mobile-first, desktop-optimized |
| | NFR-7 | Accessibility | Chuẩn WCAG 2.1 (A/AA) |
| **SEO** | NFR-8 | Meta tags | Dynamic SEO per page (SSR) |
| | NFR-9 | Sitemap | Auto-generated sitemap.xml |
| **Maintain** | NFR-10 | Architecture | Clean architecture, centralized routing, Prisma |
