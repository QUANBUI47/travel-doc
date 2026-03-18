# QA Output: Hệ thống Quản trị (Admin System)

> **Role:** Quality Assurance (QA)  
> **Status:** Sprint 2 Verification

## 1. Chiến lược Kiểm thử (Testing Strategy)
- **Alpha:** Manual test giao diện & luồng CRUD.
- **Beta:** Kiểm tra trên môi trường Staging (Vercel).
- **Security:** SQL Injection & XSS check trên các form edit nội dung.

## 2. Kịch bản Kiểm thử tiêu biểu (Test Cases)

| TC_ID | Mô tả kịch bản | Kết quả Mong đợi | Status |
|---|---|---|---|
| TC-ADM-01 | Login với quyền User thường | Bị chặn, redirect về Home | 📋 |
| TC-ADM-02 | Sửa SEO Title của trang chủ | View Source trang chủ thấy tag `<title>` thay đổi | 📋 |
| TC-ADM-03 | Xóa Tour đang có đơn booking | Hệ thống báo lỗi "Không thể xóa tour đang có đơn hàng" | 📋 |

## 3. Checklist đóng Sprint (Sprint Sign-off)
- [ ] Toàn bộ API admin đều có `requireAdmin()` guard.
- [ ] Không có bug Critical/High.
- [ ] Giao diện responsive 100% trên iPhone 14 & Desktop.
