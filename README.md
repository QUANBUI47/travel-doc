# 📘 Vivu Travel — Hệ thống Tài liệu Quản lý Dự án (SDLC)

> **Kiến trúc:** Feature-Centric (Lấy tính năng làm trung tâm)  
> **Giai đoạn:** Phase 2 (Admin Implementation)  
> **Tech Stack:** Next.js 15, React Native, Prisma, Supabase

Bộ tài liệu này được thiết kế để hỗ trợ một team liên chức năng (Cross-functional team) làm việc cùng nhau trên từng đầu mục giá trị (Feature). Mỗi tính năng sẽ bao quát toàn bộ vòng đời từ lúc lên ý tưởng đến khi kiểm thử thành công.

---

## 📂 Danh mục Tài liệu

### 🏛️ 01. System Foundation (Tiêu chuẩn chung)
Chứa các quy định, thiết kế và hạ tầng dùng chung cho toàn dự án.
- [Kỹ thuật: Kiến trúc hệ thống](01-system-foundation/01-architecture.md)
- [Dữ liệu: Database Schema](01-system-foundation/02-database-schema.md)
- [Giao diện: Shared Design System](01-system-foundation/03-design-system.md)
- [Bảo mật: Auth & RBAC Logic](01-system-foundation/04-auth-security.md)
- [Tầm nhìn: Roadmap & Milestones](01-system-foundation/06-roadmap.md)

### 🚀 02. Features (Phát triển theo Tính năng)
Mỗi folder bao gồm đầy đủ 5 vai trò: **BA** (Yêu cầu), **PO** (Kế hoạch), **Design** (Đầu vào), **Tech** (Phát triển), **QA** (Đầu ra).
- **[Trung tâm Quản trị (Admin System)](02-features/admin-system/01-ba-requirements.md):** Dashboard, Quản lý nội dung/SEO.
- **[Khám phá (Public Discovery)](02-features/public-discovery/01-ba-requirements.md):** Tìm kiếm, lọc dịch vụ, landing page.
- **[Đặt chỗ (Booking & Payment)](02-features/booking-payment/01-ba-requirements.md):** Quy trình đặt tour/phòng & Thanh toán.
- **[Cá nhân hóa (User Experience)](02-features/user-experience/01-ba-requirements.md):** Dashboard khách hàng, Wishlist, Reviews.
- **[Đa nền tảng (Mobile App)](02-features/mobile-app/01-ba-requirements.md):** Ứng dụng iOS/Android.
- **[Tối ưu hóa (SEO & Performance)](02-features/seo-optimization/01-ba-requirements.md):** Google indexing & Performance tuning.

### 📈 03. Sprints & Delivery (Vận hành)
Theo dõi tiến độ, **Input & Output** chi tiết theo từng mốc thời gian.
- **Sprint 1 [✅]:** [Nền tảng & Auth](03-sprints-delivery/sprint-1-foundation.md)
- **Sprint 2 [🔨]:** [Quản trị Hệ thống](03-sprints-delivery/sprint-2-admin.md)
- **Sprint 3 [📋]:** [Khám phá Dịch vụ](03-sprints-delivery/sprint-3-discovery.md)
- **Sprint 4 [📋]:** [Đặt chỗ & Thanh toán](03-sprints-delivery/sprint-4-booking.md)
- **Sprint 5 [📋]:** [Trải nghiệm Người dùng](03-sprints-delivery/sprint-5-user-reviews.md)
- **Sprint 6 [📋]:** [Đa nền tảng & Tối ưu](03-sprints-delivery/sprint-6-optimization.md)

---

## 🛠️ Trách nhiệm các Vai trò (Roles) trong Feature Folder

1.  **01-ba-requirements.md:** Định nghĩa "Cái gì" (User Story, Requirements).
2.  **02-po-plan.md:** Định nghĩa "Khi nào" (Priority, Planning, Acceptance Criteria).
3.  **03-design-input.md:** Cung cấp "Input" (Wireframes, UI Specs, Behaviors).
4.  **04-tech-specs.md:** Định nghĩa "Cách thức" (Backend Logic, FE/Mob implementation).
5.  **05-qa-output.md:** Cung cấp "Output" (Test Cases, Checklists, Verification).

---

## 🚀 Hướng dẫn Bắt đầu
- Để xem tiến độ hiện tại: Vào [Sprint 2](03-sprints-delivery/sprint-2-admin.md).
- Để phát triển tính năng Admin: Vào [Admin System Feature](02-features/admin-system/01-ba-requirements.md).
- Để tra cứu thiết kế chung: Vào [Design System](01-system-foundation/03-design-system.md).
