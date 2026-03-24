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
          { text: 'Đặc tả API v1', link: '/01-nen-tang-he-thong/05-dac-ta-api-v1' },
          { text: 'Sơ đồ Dữ liệu', link: '/01-nen-tang-he-thong/02-so-do-du-lieu' },
          { text: 'Bảo mật & Xác thực', link: '/01-nen-tang-he-thong/04-bao-mat-xac-thuc' },
          { text: 'Quy chuẩn Lập trình', link: '/01-nen-tang-he-thong/11-quy-chuan-lap-trinh' }
        ]
      },
      {
        text: '02. Quản lý Sprint',
        items: [
          { text: 'Sprint 1: Nền tảng', link: '/02-quan-ly-sprint/sprint-1-nen-tang' },
          { 
            text: 'Sprint 2: Quản trị Điểm đến', 
            items: [
              { text: 'Yêu cầu Nghiệp vụ', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/01-yeu-cau-nghiep-vu' },
              { text: 'Kịch bản Sử dụng', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/02-kich-ban-su-dung' },
              { text: 'Thiết kế Kỹ thuật', link: '/02-quan-ly-sprint/sprint-2-quan-tri-diem-den/03-thiet-ke-ky-thuat' }
            ]
          }
        ]
      },
      {
        text: '03. Kho tính năng',
        items: [
          { text: 'Ma trận Tính năng', link: '/03-kho-tinh-nang/00-ma-tran-tinh-nang' },
          { text: 'Quản trị Nội dung', link: '/03-kho-tinh-nang/quan-tri-noi-dung/01-dac-ta-chi-tiet' },
          { text: 'Đặt chỗ & Thanh toán', link: '/03-kho-tinh-nang/dat-cho-thanh-toan/01-dac-ta-chi-tiet' },
          { text: 'Tìm kiếm & Khám phá', link: '/03-kho-tinh-nang/tim-kiem-kham-pha/01-dac-ta-chi-tiet' },
          { text: 'Trải nghiệm Người dung', link: '/03-kho-tinh-nang/trai-nghiem-nguoi-dung/01-dac-ta-chi-tiet' }
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
