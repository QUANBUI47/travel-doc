---
layout: home

hero:
  name: Vivu Travel
  text: Bộ tài liệu nguồn
  tagline: Single source of truth cho dự án `travel-web`. PO/PM/BA/Tech/DBA/Dev đều đọc được trong 1 ngày.
  actions:
    - theme: brand
      text: Đọc README map
      link: /README
    - theme: alt
      text: Trạng thái Web
      link: /05-quan-ly-sprint/trang-thai-web
    - theme: alt
      text: 🔥 Sprint 4 Pivot
      link: /05-quan-ly-sprint/sprint-4-schema-pivot/00-tong-quan

features:
  - icon: 🎯
    title: 00. Sản phẩm (PO/PM)
    details: Tầm nhìn, mô hình kinh doanh, personas, lộ trình phát hành 18 tháng.
    link: /00-san-pham/01-tam-nhin
    linkText: Đọc tầm nhìn

  - icon: 📋
    title: 01. Nghiệp vụ (BA)
    details: Luồng booking Series + Private, quy tắc nghiệp vụ (BR-XX), thuật ngữ, ma trận tính năng.
    link: /01-nghiep-vu/01-luong-nghiep-vu-cot-loi
    linkText: Đọc luồng nghiệp vụ

  - icon: 🏗️
    title: 02. Kiến trúc (Tech Lead)
    details: Tech stack, cross-cutting (auth, i18n, cache, error), API contract, 7 ADR chốt.
    link: /02-kien-truc/01-kien-truc-tong-the
    linkText: Đọc kiến trúc

  - icon: 🗄️
    title: 03. Cơ sở dữ liệu (DBA)
    details: ERD, spec từng bảng/field, CHECK constraint, concurrency lock, quy trình migration.
    link: /03-co-so-du-lieu/01-erd-tong-quan
    linkText: Đọc ERD

  - icon: 💻
    title: 04. Phát triển (Dev)
    details: Quy chuẩn lập trình, Git workflow, testing pyramid, bảo mật & xác thực.
    link: /04-phat-trien/01-quy-chuan-lap-trinh
    linkText: Đọc quy chuẩn

  - icon: 🏃
    title: 05. Quản lý sprint (Scrum)
    details: Trạng thái web, backlog, sprint 1-8 + Sprint 4 Pivot (đang chuẩn bị).
    link: /05-quan-ly-sprint/trang-thai-web
    linkText: Trạng thái sprint

  - icon: 📐
    title: ADR — Quyết định kiến trúc
    details: 7 ADR chốt định hướng dài hạn — Hotel content reference, Pricing Pattern C, UUID native, Must login, SEO polymorphic, Series/Private split, Reporting tier.
    link: /02-kien-truc/decisions/ADR-001-hotel-content-reference
    linkText: Xem ADR-001

  - icon: 📜
    title: Changelog
    details: Lịch sử thay đổi tập trung — append-only, mọi PR đụng doc/schema phải log.
    link: /99-tham-khao/changelog
    linkText: Đọc changelog

  - icon: 🔍
    title: Tìm kiếm
    details: Bấm `Ctrl + K` (hoặc nút tìm kiếm trên đầu trang) để search nhanh trong toàn bộ doc.
---

## Quick start theo vai trò

| Tôi là... | Đọc theo thứ tự |
| --- | --- |
| **Người mới (onboard 1 ngày)** | [Tầm nhìn](/00-san-pham/01-tam-nhin) → [Thuật ngữ](/01-nghiep-vu/03-thuat-ngu) → [ERD tổng quan](/03-co-so-du-lieu/01-erd-tong-quan) |
| **PO/PM (lên kế hoạch sprint)** | [Lộ trình](/00-san-pham/04-lo-trinh-phat-hanh) → [Backlog](/05-quan-ly-sprint/backlog-chi-tiet) |
| **BA (viết user story)** | [Personas](/00-san-pham/03-personas-user-journey) → [Luồng nghiệp vụ](/01-nghiep-vu/01-luong-nghiep-vu-cot-loi) → [Ma trận tính năng](/01-nghiep-vu/04-ma-tran-tinh-nang) |
| **Tech Lead (review thiết kế)** | [Kiến trúc tổng thể](/02-kien-truc/01-kien-truc-tong-the) → [ADR](/02-kien-truc/decisions/ADR-001-hotel-content-reference) |
| **DBA (review schema)** | [Spec bảng](/03-co-so-du-lieu/02-thiet-ke-bang) → [Toàn vẹn & concurrency](/03-co-so-du-lieu/03-toan-ven-concurrency) → [Migration](/03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment) |
| **Dev (start Sprint 4)** | [Sprint 4 Tổng quan](/05-quan-ly-sprint/sprint-4-schema-pivot/00-tong-quan) → [Stories](/05-quan-ly-sprint/sprint-4-schema-pivot/01-stories) → [Runbook](/05-quan-ly-sprint/sprint-4-schema-pivot/02-runbook) |

---

**Phiên bản cấu trúc**: 2.0 (Scrum project layout — 2026-05-27)
**Cập nhật gần nhất**: 2026-05-30 (Sprint 4 Schema Pivot spec chốt, renumber sprint, drop Loyalty khỏi MVP) — xem [Changelog](/99-tham-khao/changelog).
