# Tech Specs: Mobile App (Customer-Only)

Tài liệu này đặc tả kiến trúc kỹ thuật của ứng dụng di động dành cho khách hàng (Vivu Customer App).

---

## 1. Công nghệ (Tech Stack)

- **Framework:** React Native + Expo (Managed Workflow)
- **Navigation:** Expo Router (File-based routing)
- **UI Framework:** NativeWind (Tailwind for React Native)
- **State Management:** Zustand (Global State) + TanStack Query (Server State)
- **Backend:** Supabase (Auth, DB, Storage)
- **Push Notifications:** Expo Notifications + Firebase (FCM)

---

## 2. Kiến trúc Thư mục (Folder Structure)

```text
mobile-app/
├── app/                  # Expo Router pages
│   ├── (auth)/           # Login, Register
│   ├── (main)/           # Home, Search, Bookings (Tabs)
│   └── tour/[id]/        # Product Details
├── components/           # UI Components (Atomic Design)
├── hooks/                # Custom hooks (Auth, API)
├── stores/               # Zustand stores (Wishlist, User)
├── constants/            # Color tokens, API keys
└── services/             # Supabase & Payment clients
```

---

## 3. Xác thực (Authentication)

- **Library:** `@supabase/supabase-js` kết hợp với `expo-secure-store` để lưu JWT an toàn.
- **Workflow:**
  1. User nhập email/pass hoặc Social Login (Google/Apple).
  2. Native App nhận session -> Lưu vào SecureStore.
  3. Sử dụng `SessionContext` để bảo vệ các trang yêu cầu đăng nhập (My Bookings).

---

## 4. Đồng bộ Dữ liệu (Real-time Sync)

- **Wishlist:** Khi user bấm "Thả tim" trên App -> Gửi API cập nhật bảng `wishlist` trong DB -> Web Dashboard cũng cập nhật tương ứng.
- **Booking Status:** Sử dụng **Supabase Realtime** để lắng nghe thay đổi trạng thái đơn hàng (Ví dụ: Từ `PENDING` sang `CONFIRMED`) và hiển thị thông báo ngay lập tức.

---

## 7. Trải nghiệm Nâng cao (Advanced UX)

### 7.1. Shared Element Transitions (SET)
- Sử dụng `react-native-reanimated` kết hợp với `Expo Router`.
- Khi user chạm vào một Tour Card trang Home -> `SharedElement` id của ảnh bìa sẽ được truyền sang trang Detail để tạo hiệu ứng phóng to mượt mà không bị "giật" màn hình.

### 7.2. Micro-interactions với Canvas (Skia)
- Sử dụng `@shopify/react-native-skia` cho các hiệu ứng sương mù (blur) và gradient động ở Hero Section để tạo vẻ **Futuristic**.
- Animation "Thả tim" sẽ được vẽ bằng Skia để đạt hiệu suất 120fps trên các thiết bị hỗ trợ.

### 7.3. Haptic Feedback Spec
- **Ligh Haptic:** Khi cuộn qua các item trong list.
- **Medium Haptic:** Khi bấm nút "Đặt ngay".
- **Success Haptic:** Khi thanh toán thành công (Longer vibration).
