# Đặc tả Màn hình Admin (Admin Screen Specifications)

Hệ thống quản trị được thiết kế theo phong cách hiện đại, sử dụng **HeroUI** và **Tailwind CSS**, tập trung vào khả năng quản lý dữ liệu nhanh chóng (CRUD).

---

## 1. Dashboard (Trang tổng quan)
- **Đường dẫn:** `/admin`
- **Chức năng:**
  - Hiển thị 4 thẻ thống kê chính: Tổng đơn đặt, Tour hoạt động, Số khách hàng, Tổng doanh thu.
  - Bảng "Đơn hàng gần đây": Hiển thị 5 giao dịch mới nhất kèm trạng thái.
  - Khối thông báo hệ thống và tài nguyên.
- **Logic Dữ liệu:** Fetch từ DB bằng Prisma trong React Server Components.

---

## 2. Quản lý Tour & Sản phẩm
- **Đường dẫn:** `/admin/tours`
- **Chức năng:**
  - Bảng liệt kê Tour kèm ảnh demo, mã tour, giá khởi điểm và trạng thái hoạt động.
  - Bộ lọc Search nhanh theo tên Tour.
  - Nút thêm mới và hành động chỉnh sửa/xóa.
- **Màn hình chi tiết:** `/admin/tours/[id]` - Cho phép biên tập thông tin chi tiết, lịch trình (Itinerary) và upload ảnh.

---

## 3. Quản lý Đơn đặt chỗ (Bookings)
- **Đường dẫn:** `/admin/bookings`
- **Chức năng:**
  - Quản lý tập trung cả Tour Booking và Hotel Booking.
  - Hiển thị thông tin khách hàng, dịch vụ, ngày khởi hành/nhận phòng.
  - Cập nhật trạng thái Booking (Pending -> Confirmed -> Completed).

---

## 4. Quản lý Khách hàng (Customers)
- **Đường dẫn:** `/admin/customers`
- **Chức năng:**
  - Hiển thị danh sách Profiles đăng ký.
  - Xem lịch sử đặt tour/phòng của từng khách hàng.
  - Phân quyền (Role) nếu cần thiết.

---

## 5. Cấu hình Hệ thống (System Settings)
- **Các màn hình:** 
  - `/admin/settings/homepage`: **Visual Homepage Builder**. 
    - **Layout**: Two-pane (Sidebar biên tập bên trái, Iframe Preview bên phải).
    - **Chức năng**: Chỉnh sửa trực quan các module Hero, Destinations, Why Vivu, Storytelling. 
    - **Tính năng**: Preview thời gian thực thông qua cơ chế `postMessage`, tự động đồng bộ CSDL thông qua Prisma.
    - **UX**: Sidebar thông minh, tối ưu các ô nhập liệu theo dạng cột đứng để không bị tràn màn hình khi làm việc trên sidebar hẹp.
  - `/admin/seo`: Quản lý Meta tags tập trung cho tất cả các trang.
  - `/admin/legal`: Soạn thảo chính sách bảo mật, điều khoản sử dụng bằng trình soạn thảo nội dung.

---

## 🎨 Hướng dẫn Giao diện (UI Guidelines for AI)
1.  **Layout:** Sidebar bên trái cố định (Collapsible on mobile), Main content bên phải.
2.  **Colors:** Gam màu chuyên nghiệp (Primary: Indigo/Blue600, Dark theme support).
3.  **Components:** Sử dụng Table, Modal, Card, Input từ HeroUI Library.
4.  **UX:** Mọi action nguy hiểm (Xóa) phải có xác nhận qua Modal.
