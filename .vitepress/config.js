export default {
  title: "Vivu Travel Docs",
  description: "Hệ thống tài liệu nghiệp vụ Vivu Travel",
  srcDir: 'docs',
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Trang chủ', link: '/' },
      { text: 'Lộ trình', link: '/roadmap' }
    ],
    sidebar: [
      {
        text: '01. Nền tảng hệ thống',
        items: [
          { text: 'Chiến lược Tổng thể', link: '/01-nen-tang-he-thong/01-chien-luoc-tong-the' },
          { text: 'Kế hoạch Khởi tạo', link: '/01-nen-tang-he-thong/00-ke-hoach-khoi-tao' },
          { text: 'Thiết kế Dữ liệu Chi tiết', link: '/01-nen-tang-he-thong/03-thiet-ke-du-lieu-chi-tiet' },
          { text: 'Đặc tả API v1', link: '/01-nen-tang-he-thong/05-dac-ta-api-v1' },
          { text: 'Bảo mật & Xác thực', link: '/01-nen-tang-he-thong/04-bao-mat-xac-thuc' },
          { text: 'Tích hợp Bên thứ ba', link: '/01-nen-tang-he-thong/07-tich-hop-ben-thu-ba' },
          { text: 'Sơ đồ Dữ liệu', link: '/01-nen-tang-he-thong/02-so-do-du-lieu' },
          { text: 'Quy chuẩn Lập trình', link: '/01-nen-tang-he-thong/11-quy-chuan-lap-trinh' },
          { text: 'Hướng dẫn Cập nhật Doc', link: '/01-nen-tang-he-thong/00-huong-dan-cap-nhat-doc' }
        ]
      },
      {
        text: '02. Đặc tả Nghiệp vụ (Product Backlog)',
        items: [
          { text: 'Ma trận Tính năng', link: '/03-kho-tinh-nang/00-ma-tran-tinh-nang' },
          { 
            text: 'Quản trị Nội dung', 
            collapsed: true,
            items: [
              { text: '[Admin] Quản lý Điểm đến & Tour', link: '/03-kho-tinh-nang/quan-tri-noi-dung/admin-features' },
              { text: '[Client/App] Hiển thị Nội dung', link: '/03-kho-tinh-nang/quan-tri-noi-dung/client-app-display' }
            ]
          },
          { 
            text: 'Đặt chỗ & Thanh toán', 
            collapsed: true,
            items: [
              { text: '[Admin] Quản lý Đơn hàng (OMS)', link: '/03-kho-tinh-nang/dat-cho-thanh-toan/admin-oms' },
              { text: '[Client/App] Luồng Checkout', link: '/03-kho-tinh-nang/dat-cho-thanh-toan/client-checkout' }
            ]
          },
          { 
            text: 'Tìm kiếm & Khám phá', 
            collapsed: true,
            items: [
              { text: '[Admin] Cấu hình Search & Tag', link: '/03-kho-tinh-nang/tim-kiem-kham-pha/admin-configs' },
              { text: '[Client/App] Công cụ Tìm kiếm', link: '/03-kho-tinh-nang/tim-kiem-kham-pha/client-search-tools' }
            ]
          }
        ]
      },
      {
        text: '03. Kế hoạch Triển khai (Sprint Backlog)',
        items: [
          { text: 'Bảng Task Tổng thể', link: '/02-quan-ly-sprint/backlog-chi-tiet' },
          { 
            text: 'Sprint 2: Quản trị nội dung', 
            collapsed: true,
            items: [
              { text: 'Phạm vi & AC', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/01-yeu-cau-nghiep-vu' },
              { text: 'API Design', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/05-api-design' },
              { text: 'Thiết kế Kỹ thuật', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/03-thiet-ke-ky-thuat' }
            ]
          },
          { 
            text: 'Sprint 3: Tìm kiếm & Khám phá', 
            collapsed: true,
            items: [
              { text: 'Phạm vi & AC', link: '/02-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/01-yeu-cau-nghiep-vu' },
              { text: 'API Design', link: '/02-quan-ly-sprint/sprint-3-tim-kiem-kham-pha/04-api-design' }
            ]
          },
          { 
            text: 'Sprint 4: Thanh toán & Booking', 
            collapsed: true,
            items: [
              { text: 'Phạm vi & AC', link: '/02-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/01-yeu-cau-nghiep-vu' },
              { text: 'API Design', link: '/02-quan-ly-sprint/sprint-4-dat-cho-thanh-toan/04-api-design' }
            ]
          },
          { 
            text: 'Sprint 5: Thành viên & Đánh giá', 
            collapsed: true,
            items: [
              { text: 'Phạm vi & AC', link: '/02-quan-ly-sprint/sprint-5-thanh-vien-danh-gia/01-yeu-cau-nghiep-vu' },
              { text: 'API Design', link: '/02-quan-ly-sprint/sprint-5-thanh-vien-danh-gia/04-api-design' }
            ]
          },
          { 
            text: 'Sprint 6: Quy hoạch & Tối ưu', 
            collapsed: true,
            items: [
              { text: 'Phạm vi & Kỹ thuật', link: '/02-quan-ly-sprint/sprint-6-quy-hoach-toi-uu/01-yeu-cau-nghiep-vu' }
            ]
          }
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
      provider: 'local'
    }
  }
}
