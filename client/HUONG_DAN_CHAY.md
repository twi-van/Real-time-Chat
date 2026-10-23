# HƯỚNG DẪN CHẠY FRONTEND (CLIENT) — REAL-TIME CHAT

**Phụ trách:** Kim Lợi (Frontend)  
**Công nghệ:** React 19 + Vite + Tailwind CSS + Socket.io Client + Lucide Icons  


---

## 1. Yêu Cầu Cài Đặt Ban Đầu

- **Node.js**: phiên bản `>= 18.x` (khuyên dùng Node 20 LTS)
- **Trình duyệt**: Chrome, Edge, Firefox, Brave,...

---

## 2. Hướng Dẫn Cài Đặt & Khởi Chạy

Mở terminal (PowerShell, Command Prompt hoặc Git Bash) và di chuyển vào thư mục `client/`:

```bash
# 1. Di chuyển vào thư mục client
cd client

# 2. Cài đặt các thư viện phụ thuộc (nếu chưa cài)
npm install

# 3. Khởi chạy máy chủ phát triển (Dev server)
npm run dev
```

Sau khi chạy lệnh, màn hình console sẽ hiển thị:
```text
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

👉 Mở trình duyệt web và truy cập địa chỉ: **[http://localhost:5173](http://localhost:5173)**

---

## 3. Tài Khoản Đăng Nhập Mẫu (Mock / Demo)

Bạn có thể đăng nhập bằng bất kỳ tài khoản nào dưới đây (mật khẩu nhập bất kỳ, ví dụ: `123456`):

| Họ tên | Email | Vai trò trong nhóm |
|:---|:---|:---|
| **Kim Lợi** *(Mặc định)* | `a@a.com` | Frontend Lead |
| **Thùy Vân** | `b@b.com` | Backend Lead |
| **Diệu Hiền** | `c@c.com` | Database & DevOps Lead |


*Lưu ý: Bạn cũng có thể bấm **"Đăng ký ngay"** để tạo tài khoản mới bất kỳ.*

---

## 4. Hướng Dẫn Test Các Tính Năng (Sprint 1 đến Sprint 6)

### A. Tải lịch sử tin nhắn bằng Cursor khi cuộn lên (Scroll Pagination)
1. Đăng nhập tài khoản `a@a.com`, chọn phòng chat đôi với **Thùy Vân** (`room-1`).
2. Màn hình tự động tải **20 tin nhắn mới nhất** và cuộn sẵn xuống đáy.
3. Dùng chuột **cuộn lên đỉnh khung chat** (hoặc bấm vào nút `↑ Cuộn lên hoặc bấm để tải tin cũ hơn`).
4. Hệ thống sẽ hiển thị spinner đang tải và chèn tiếp **15 tin nhắn cũ hơn** lên đầu, đồng thời **giữ nguyên vị trí cuộn mượt mà** (không bị giật màn hình).
5. Khi đã nạp hết 35 tin nhắn, hệ thống hiển thị dòng chữ *"Đã tải hết lịch sử trò chuyện"*.

### B. Kiểm thử Hai Tab (Multi-tab concurrency)
1. Mở **Tab 1** (cửa sổ bình thường) tại `http://localhost:5173`: Đăng nhập với email `a@a.com` (Kim Lợi).
2. Mở **Tab 2** (cửa sổ ẩn danh / incognito hoặc trình duyệt khác): Đăng nhập với email `b@b.com` (Thùy Vân).
3. **Phòng chat đôi:** 
   - Tab 1 gửi tin nhắn → Tab 2 nhận tin nhắn thời gian thực, sidebar cập nhật tin nhắn xem trước.
   - Khi Tab 1 đang gõ phím → Tab 2 hiển thị hiệu ứng `... đang soạn tin...`.
4. **Phòng chat nhóm (`Nhóm Đồ Án`):** 
   - Bấm vào nhóm 3 người, cả hai tab đều nhận được tin và hiển thị đúng tên, avatar người gửi.

### C. Tạo cuộc trò chuyện mới & Chống trùng phòng đôi
- **Nút "+ Chat mới":** Chọn 1 người bạn để bắt đầu trò chuyện. Nếu đã từng có phòng với người đó, hệ thống tự động mở lại phòng cũ thay vì tạo trùng (chuẩn Sprint 1 rule).
- **Nút "+ Tạo nhóm":** Nhập tên nhóm bắt buộc, tích chọn từ 2 thành viên trở lên để tạo phòng nhóm.

### D. Kiểm thử Responsive trên Mobile
- Nhấn phím `F12` trên trình duyệt → Bấm icon thiết bị di động (Toggle device toolbar, ví dụ iPhone 12/14 Pro).
- Giao diện tự động thu gọn về 1 cột:
  - Ở màn danh sách phòng: bấm chọn phòng để vào khung chat.
  - Ở khung chat: bấm nút mũi tên quay lại (`←`) trên góc trái header để quay về danh sách phòng.

### E. Kiểm thử Xử lý lỗi phiên làm việc 401
- Mở DevTools (`F12`) → Tab Console, gõ lệnh sau để mô phỏng sự kiện phiên hết hạn:
  ```javascript
  window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.' } }));
  ```
- Hệ thống sẽ ngay lập tức xóa token, chuyển về màn Login và bật Toast thông báo lỗi phiên làm việc trong 4.5 giây.

---

## 5. Cấu Hình Biến Môi Trường (Khi nối Backend thật)

Tạo file `.env` tại thư mục `client/` nếu muốn thay đổi cổng hoặc địa chỉ Backend:

```env
# Địa chỉ REST API backend
VITE_API_URL=http://localhost:3000

# Địa chỉ Socket.io server
VITE_SOCKET_URL=http://localhost:3000
```

---

## 6. Lệnh Đóng Gói (Build Production)

```bash
# Kiểm tra đóng gói bundle cho môi trường production
npm run build

# Xem thử bản đóng gói production chạy trên local
npm run preview
```
