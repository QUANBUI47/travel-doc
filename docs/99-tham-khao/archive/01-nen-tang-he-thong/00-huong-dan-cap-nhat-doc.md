# Hướng dẫn Quản lý Thay đổi Tài liệu (Documentation Change Management)

Chào mừng bạn đến với quy trình duy trì "Single Source of Truth" cho Vivu Travel. Khi dự án phát triển qua từng Sprint, việc cập nhật tài liệu là bắt buộc để tránh sự sai lệch giữa Spec và Code.

## 1. Nguyên tắc "Single Source of Truth"
- **Product Backlog (Mục 02)**: Phải luôn phản ánh trạng thái **mới nhất** của tính năng. Nếu Sprint 5 thay đổi logic của Sprint 2, hãy sửa trực tiếp vào file nghiệp vụ tại mục 02.
- **Sprint Backlog (Mục 03)**: Chỉ ghi nhận các **thay đổi cụ thể (Delta)** phát sinh trong Sprint đó và link tới Product Backlog đã được cập nhật.

## 2. Quy trình Cập nhật Tài liệu (Workflow)

### Bước 1: Cập nhật Lịch sử Thay đổi (Change Log)
Mỗi file trong Product Backlog cần có một bảng lịch sử ở đầu trang:
| Phiên bản | Ngày | Sprint | Nội dung thay đổi | Người thực hiện |
| :--- | :--- | :--- | :--- | :--- |
| v1.0 | 26/03 | [Sprint 2](../../02-quan-ly-sprint/sprint-2-quan-tri-diem-den/01-yeu-cau-nghiep-vu) | Khởi tạo đặc tả ban đầu | PO |

> **Quy tắc bắt buộc:** Cột "Sprint" trong bảng phải là một **Hyperlink** dẫn trực tiếp tới tài liệu triển khai (Phạm vi & AC) của Sprint đó để phục vụ việc truy vết dữ liệu (Traceability).

### Bước 2: Chỉnh sửa nội dung chi tiết
- Thay đổi trực tiếp các đề mục, API Spec hoặc UI Mockup trong file để phản ánh thiết kế mới.
- Đánh dấu các phần mới bằng label `[NEW]` hoặc `[UPDATED]` nếu cần gây chú ý cho Developer.

### Bước 3: Thông báo trong Sprint Backlog
Trong file `Phạm vi & AC` của Sprint hiện tại, hãy thêm mục:
> **### 🛠 Thay đổi thiết kế so với phiên bản cũ**
> - Thay đổi logic tính giá tour (Link tới Product Backlog v1.1).
> - Lý do: Tối ưu UX theo phản hồi của User Testing.

## 3. Quản lý API Spec
- Không xóa các Endpoint cũ nếu chúng đang được Mobile App cũ sử dụng. 
- Sử dụng versioning (e.g. `/api/v1/...` -> `/api/v2/...`) trong tài liệu API Design nếu có thay đổi mang tính "breaking change".

---
*Tài liệu hướng dẫn duy trì hệ thống tri thức dự án.*
