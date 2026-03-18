# PO Plan: Mobile App

## 1. Thứ tự Ưu tiên
1. **P0:** Core App (Auth, Home, Search).
2. **P1:** Sync Logic (Web-Mobile parity).
3. **P1:** Push Notifications.
4. **P2:** Offline Support.

## 2. Acceptance Criteria
- [ ] App mở được trên cả iOS Simulator và Android Emulator.
- [ ] Login bằng tài khoản Web thành công.
- [ ] Thông báo đẩy nhận được ngay khi đơn hàng chuyển sang `PAID`.

## 3. Rủi ro
- **Rủi ro:** Hiệu năng app chậm trên máy cấu hình thấp.
- **Giảm thiểu:** Sử dụng FlashList thay cho FlatList và tối ưu hóa image caching.
