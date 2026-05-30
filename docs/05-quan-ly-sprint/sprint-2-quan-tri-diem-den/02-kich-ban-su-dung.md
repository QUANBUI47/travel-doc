# [Sprint 2] Kịch bản Sử dụng (Use Case Scenarios)

Mô tả chi tiết luồng thao tác của người dùng Admin khi quản trị điểm đến.

## 1. Kịch bản: Thêm mới Điểm đến
- **Actor**: Admin.
- **Luồng chính (Happy Path)**:
    1. Admin click "Thêm mới" từ Dashboard Quản trị.
    2. Nhập tên: "Vịnh Hạ Long".
    3. Chọn vùng miền: "Miền Bắc".
    4. Kéo thả bộ sưu tập ảnh (5 ảnh).
    5. Nhập mô tả: "Kỳ quan thiên nhiên thế giới...".
    6. Click "Lưu".
    7. Hệ thống thông báo Thành công và đẩy dữ liệu lên Cloudinary.

## 2. Kịch bản: Kiểm tra ràng buộc khi xóa
- **Actor**: Admin.
- **Luồng lỗi**:
    1. Admin chọn xóa "Đà Lạt".
    2. Hệ thống kiểm tra DB: Phát hiện 03 Tour "Đà Lạt - Thành phố mộng mơ" đang Active.
    3. Hệ thống hiển thị Modal cảnh báo: "Không thể xóa. Vui lòng gỡ bỏ các Tour liên quan trước."
    4. Thao tác xóa bị chặn.
