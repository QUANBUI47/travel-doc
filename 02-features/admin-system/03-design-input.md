# Design Inputs: Hệ thống Quản trị (Admin System)

> **Role:** UI/UX Designer  
> **Assets:** [Design System](../../01-system-foundation/03-design-system.md)

## 1. Màn hình Chi tiết (Wireframes & Specs)

### 1.1. Admin Sidebar (Standard)
- **Width:** 260px (Desktop), Hidden (Mobile).
- **Background:** Dark Slate (#0F172A).
- **Icons:** Lucide React (size: 20px).
- **Menu Items:** Bảng điều khiển, Quản lý Tour, Đơn đặt chỗ, Khách hàng, Pháp lý & Bảo mật, Cài đặt hệ thống.

### 1.2. Màn hình Settings (Tabs)
- **Tab Homepage:** Sử dụng Accordion để phân chia: Hero Section, Stats Section, Promo Banners.
- **Tab SEO:** Meta Titles, Descriptions, OG Tags.
- **Tab General:** Website Name, Logo (Upload), Contact.

## 2. Quy tắc Responsive
- Trên Mobile (`< 768px`): Sidebar thu thành Drawer (vuốt từ trái hoặc bấm icon ☰).
- Tables chuyển sang dạng "Card Mode" hoặc cho phép scroll ngang mượt mà.

## 3. Micro-animations
- **Hover:** Menu items nháy sáng nhẹ (Opactity 0.8 -> 1).
- **Transitions:** Đổi tab mượt mà với Framer Motion (Fade & Slide).
