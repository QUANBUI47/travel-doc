export default {
  title: "Vivu Travel — Docs",
  description: "Bộ tài liệu nguồn (single source of truth) cho dự án Vivu Travel.",
  srcDir: 'docs',
  lang: 'vi-VN',
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    siteTitle: 'Vivu Docs',
    nav: [
      { text: 'Trang chủ', link: '/' },
      { text: 'Trạng thái Web', link: '/05-quan-ly-sprint/trang-thai-web' },
      { text: 'Sprint 4 (Pivot)', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/00-tong-quan' },
      { text: 'ADR', link: '/02-kien-truc/decisions/ADR-001-hotel-content-reference' },
      { text: 'Changelog', link: '/99-tham-khao/changelog' }
    ],
    sidebar: [
      {
        text: '📌 Bắt đầu',
        items: [
          { text: 'README — bản đồ doc', link: '/README' }
        ]
      },
      {
        text: '00. Sản phẩm (PO/PM)',
        collapsed: false,
        items: [
          { text: 'Tầm nhìn', link: '/00-san-pham/01-tam-nhin' },
          { text: 'Mô hình kinh doanh', link: '/00-san-pham/02-mo-hinh-kinh-doanh' },
          { text: 'Personas & User Journey', link: '/00-san-pham/03-personas-user-journey' },
          { text: 'Lộ trình phát hành', link: '/00-san-pham/04-lo-trinh-phat-hanh' }
        ]
      },
      {
        text: '01. Nghiệp vụ (BA)',
        collapsed: false,
        items: [
          { text: 'Luồng nghiệp vụ cốt lõi', link: '/01-nghiep-vu/01-luong-nghiep-vu-cot-loi' },
          { text: 'Quy tắc nghiệp vụ (BR-XX)', link: '/01-nghiep-vu/02-quy-tac-nghiep-vu' },
          { text: 'Thuật ngữ', link: '/01-nghiep-vu/03-thuat-ngu' },
          { text: 'Ma trận tính năng', link: '/01-nghiep-vu/04-ma-tran-tinh-nang' }
        ]
      },
      {
        text: '02. Kiến trúc (Tech Lead)',
        collapsed: false,
        items: [
          { text: 'Kiến trúc tổng thể', link: '/02-kien-truc/01-kien-truc-tong-the' },
          { text: 'Cross-cutting', link: '/02-kien-truc/02-cross-cutting' },
          { text: 'API contract', link: '/02-kien-truc/03-api-contract' },
          {
            text: 'ADR (Decisions)',
            collapsed: true,
            items: [
              { text: 'ADR-001 — Hotel content reference', link: '/02-kien-truc/decisions/ADR-001-hotel-content-reference' },
              { text: 'ADR-002 — Pricing Pattern C', link: '/02-kien-truc/decisions/ADR-002-pricing-pattern-c' },
              { text: 'ADR-003 — UUID native type', link: '/02-kien-truc/decisions/ADR-003-uuid-native-type' },
              { text: 'ADR-004 — Must login', link: '/02-kien-truc/decisions/ADR-004-must-login' },
              { text: 'ADR-005 — SEO polymorphic', link: '/02-kien-truc/decisions/ADR-005-seo-polymorphic' },
              { text: 'ADR-006 — Series vs Private', link: '/02-kien-truc/decisions/ADR-006-series-vs-private-tour' },
              { text: 'ADR-007 — Admin Reporting tier', link: '/02-kien-truc/decisions/ADR-007-admin-reporting-tier' }
            ]
          }
        ]
      },
      {
        text: '03. Cơ sở dữ liệu (DBA)',
        collapsed: false,
        items: [
          { text: 'ERD tổng quan', link: '/03-co-so-du-lieu/01-erd-tong-quan' },
          { text: 'Thiết kế bảng (spec)', link: '/03-co-so-du-lieu/02-thiet-ke-bang' },
          { text: 'Toàn vẹn & Concurrency', link: '/03-co-so-du-lieu/03-toan-ven-concurrency' },
          { text: 'Quy trình migration', link: '/03-co-so-du-lieu/04-quy-trinh-migration' },
          {
            text: 'Migrations',
            collapsed: true,
            items: [
              { text: '2026-05-27 add_pricing_options_and_allotment', link: '/03-co-so-du-lieu/migrations/2026-05-27_add_pricing_options_and_allotment' }
            ]
          }
        ]
      },
      {
        text: '04. Phát triển (Dev)',
        collapsed: false,
        items: [
          { text: 'Quy chuẩn lập trình', link: '/04-phat-trien/01-quy-chuan-lap-trinh' },
          { text: 'Quy trình Git', link: '/04-phat-trien/02-quy-trinh-git' },
          { text: 'Testing', link: '/04-phat-trien/03-testing' },
          { text: 'Bảo mật & Xác thực', link: '/04-phat-trien/04-bao-mat-xac-thuc' }
        ]
      },
      {
        text: '05. Quản lý sprint (Scrum Master)',
        collapsed: false,
        items: [
          { text: '⭐ Trạng thái Web (travel-web)', link: '/05-quan-ly-sprint/trang-thai-web' },
          { text: 'Backlog chi tiết', link: '/05-quan-ly-sprint/backlog-chi-tiet' },
          { text: 'Sprint 1 — Nền tảng', link: '/05-quan-ly-sprint/sprint-1-nen-tang' },
          {
            text: 'Sprint 2 — CMS & Điểm đến',
            collapsed: true,
            items: [
              { text: 'Yêu cầu nghiệp vụ', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/01-yeu-cau-nghiep-vu' },
              { text: 'Kịch bản sử dụng', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/02-kich-ban-su-dung' },
              { text: 'Thiết kế kỹ thuật', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/03-thiet-ke-ky-thuat' },
              { text: 'Thiết kế chi tiết POI', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/04-thiet-ke-chi-tiet-poi' },
              { text: 'API design', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/05-api-design' },
              { text: 'Admin specs', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/06-admin-specs' },
              { text: 'Client app specs', link: '/05-quan-ly-sprint/sprint-2-quan-tri-diem-den/07-client-app-specs' },
              { text: 'Close checklist', link: '/05-quan-ly-sprint/sprint-2-close-checklist' }
            ]
          },
          {
            text: 'Sprint 3 — Discovery',
            collapsed: true,
            items: [
              { text: 'Yêu cầu nghiệp vụ', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/01-yeu-cau-nghiep-vu' },
              { text: 'Thiết kế cơ bản', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/02-thiet-ke-co-ban' },
              { text: 'Thiết kế chi tiết', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/03-thiet-ke-chi-tiet' },
              { text: 'API design', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/04-api-design' },
              { text: 'Admin specs', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/05-admin-specs' },
              { text: 'Client app specs', link: '/05-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/06-client-app-specs' }
            ]
          },
          {
            text: '🔥 Sprint 4 — Schema Pivot',
            collapsed: false,
            items: [
              { text: 'Tổng quan', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/00-tong-quan' },
              { text: 'Stories', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/01-stories' },
              { text: 'Runbook (Path A — hiện tại)', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/02-runbook' },
              { text: 'Runbook đầy đủ (lúc đã có khách)', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/02-runbook-luc-da-co-khach' },
              { text: 'Test plan', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/03-test-plan' },
              { text: 'Wireframes', link: '/05-quan-ly-sprint/sprint-4-schema-pivot/04-wireframes' }
            ]
          },
          {
            text: 'Sprint 5 — Đóng Tìm kiếm',
            collapsed: true,
            items: [
              { text: 'Tổng quan', link: '/05-quan-ly-sprint/sprint-5-dong-tim-kiem/00-tong-quan' }
            ]
          },
          {
            text: 'Sprint 6 — Đặt chỗ & Thanh toán',
            collapsed: true,
            items: [
              { text: 'Yêu cầu nghiệp vụ', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/01-yeu-cau-nghiep-vu' },
              { text: 'Thiết kế cơ bản', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/02-thiet-ke-co-ban' },
              { text: 'Thiết kế chi tiết', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/03-thiet-ke-chi-tiet' },
              { text: 'API design', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/04-api-design' },
              { text: 'Admin specs', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/05-admin-specs' },
              { text: 'Client app specs', link: '/05-quan-ly-sprint/sprint-6-dat-cho-thanh-toan/06-client-app-specs' }
            ]
          },
          {
            text: 'Sprint 7 — Đánh giá khách',
            collapsed: true,
            items: [
              { text: 'Yêu cầu nghiệp vụ', link: '/05-quan-ly-sprint/sprint-7-danh-gia/01-yeu-cau-nghiep-vu' },
              { text: 'API design', link: '/05-quan-ly-sprint/sprint-7-danh-gia/04-api-design' },
              { text: 'Admin specs', link: '/05-quan-ly-sprint/sprint-7-danh-gia/05-admin-specs' },
              { text: 'Client app specs', link: '/05-quan-ly-sprint/sprint-7-danh-gia/06-client-app-specs' }
            ]
          },
          {
            text: 'Sprint 8 — Báo cáo + SEO + Launch',
            collapsed: true,
            items: [
              { text: 'Yêu cầu nghiệp vụ', link: '/05-quan-ly-sprint/sprint-8-quy-hoach-toi-uu/01-yeu-cau-nghiep-vu' }
            ]
          }
        ]
      },
      {
        text: '99. Tham khảo',
        collapsed: true,
        items: [
          { text: 'Changelog', link: '/99-tham-khao/changelog' },
          { text: 'Archive (doc cũ)', link: '/99-tham-khao/archive/00-blueprint-handoff-2026-05-26' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/QUANBUI47/travel-doc' }
    ],
    footer: {
      message: 'Released under the ISC License.',
      copyright: 'Copyright © 2026-present Vivu Travel'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Tìm kiếm', buttonAriaLabel: 'Tìm kiếm' },
          modal: {
            displayDetails: 'Hiện chi tiết',
            resetButtonTitle: 'Xóa tìm kiếm',
            backButtonTitle: 'Quay lại',
            noResultsText: 'Không có kết quả',
            footer: {
              selectText: 'Chọn',
              navigateText: 'Di chuyển',
              closeText: 'Đóng'
            }
          }
        }
      }
    },
    docFooter: {
      prev: 'Trang trước',
      next: 'Trang sau'
    },
    outline: {
      label: 'Mục lục trang'
    },
    returnToTopLabel: 'Lên đầu trang',
    sidebarMenuLabel: 'Menu',
    darkModeSwitchLabel: 'Giao diện'
  }
}
