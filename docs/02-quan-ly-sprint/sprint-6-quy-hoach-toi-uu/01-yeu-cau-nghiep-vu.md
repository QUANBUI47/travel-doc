# [Yêu cầu Nghiệp vụ] Sprint 6: Quy hoạch & Tối ưu (Optimization & Release)

Giai đoạn cuối cùng tập trung vào việc tối ưu hóa hiệu năng, SEO toàn diện và chuẩn bị cho việc phát hành chính thức (GO LIVE).

## 1. Mục tiêu (Objectives)
- Đảm bảo điểm số Performance (Lighthouse) đạt trên 90 điểm cho mọi trang.
- Tối ưu hóa SEO Metadata và Sitemap tự động để Google Index nhanh nhất.
- Triển khai hệ thống Báo cáo (Analytics) giúp doanh nghiệp ra quyết định.

## 2. Đặc tả Chức năng & Kỹ thuật (Functional & Tech Specs)

### A. Tối ưu hóa SEO (Search Engine Optimization)
- **Dynamic Meta Tags**: Tự động sinh `og:title`, `og:description`, `og:image` cho từng Tour và Điểm đến.
- **Sitemap.xml**: Tự động cập nhật danh sách đường dẫn khi có Tour/Điểm đến mới được tạo từ Admin.
- **Robots.txt**: Cấu hình quy tắc crawl dữ liệu cho các Search Engine.

### B. Báo cáo & Phân tích (Analytics)
- **Dashboard Admin**:
    - Doanh thu theo ngày/tháng/vùng miền (Biểu đồ cột/đường).
    - Tỷ lệ hủy đơn hàng (Cancellation Rate).
    - Tour bán chạy nhất (Top-selling Tours).

### C. Hiệu năng & Bảo mật (Performance & Security)
- **Next.js Turbopack**: Sử dụng môi trường build mới nhất để tăng tốc độ tải trang.
- **CDN Cloudinary**: Tối ưu hóa cache và kích thước ảnh toàn diện (WebP/AVIF).
- **Security Audit**: Kiểm tra các lỗ hổng OWASP trên hệ thống API.

---
*Tài liệu xác định bởi PO cho Sprint 6.*
