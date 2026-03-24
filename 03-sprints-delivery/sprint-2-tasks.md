# Task Backlog & Tracking (Sprint 2 & 3)

Tài liệu chi tiết hóa từng Task cần thực hiện để hoàn thành Sprint hiện tại và chuẩn bị cho Sprint tiếp theo.

---

## 🚩 Sprint 2: Hệ thống Quản trị & Nền tảng (Hiện tại)

### Task Group: Core Admin Features
| Task ID | Task Name | Priority | Status | Description |
|---|---|---|---|---|
| T2.1.1 | Dashboard stats real-time | High | ✅ | Implement counts and aggregate revenue in dashboard. |
| T2.1.2 | Tour Management List UI | High | ✅ | Build table for tours list with filters. |
| T2.1.3 | Tour CRUD Logic | High | 🔨 | Finish editing and adding new tours UI + Server actions. |
| T2.1.4 | Global SEO Config UI | Medium | ✅ | UI and logic for MetaTags per page. |
| T2.1.5 | Legal content editor | Low | ✅ | Build RichText editor for Terms & Privacy. |

### Task Group: Auth & Security
| Task ID | Task Name | Priority | Status | Description |
|---|---|---|---|---|
| T2.2.1 | Admin Authorization | Critical | 🔨 | Middleware protection for `/admin` routes. |
| T2.2.2 | Profile Update Logic | Medium | 📋 | API/Action to update display name and avatar. |

---

## 🚀 Sprint 3: Discovery & Booking Experience (Tiếp theo)

### Task Group: Search & Filter
| Task ID | Task Name | Priority | Status | Description |
|---|---|---|---|---|
| T3.1.1 | Tour Search Result Page | High | 📋 | Page to display list of tours by search criteria. |
| T3.1.2 | Filter logic (Server-side) | High | 📋 | Prisma queries for price, region, and rating filtering. |
| T3.1.3 | Skeleton Loaders | Medium | 📋 | Improve UX during data fetching. |

### Task Group: Mobile Discovery
| Task ID | Task Name | Priority | Status | Description |
|---|---|---|---|---|
| T3.2.1 | Mobile Search UI | High | 📋 | Search screen with recent searches and suggestions. |
| T3.2.2 | Animated Transitions | Medium | 📋 | Shared element transition from list to detail. |

---

## 🛠️ Trạng thái API & Task Integration
- Mọi Task được tạo ra phải đi kèm với Unit Test hoặc Manual Test Checklist trong `05-qa-output.md`.
- Pull Requests phải được review bởi PM/Tech Lead trước khi merge vào branch `main`.
