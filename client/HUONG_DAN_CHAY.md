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

## 4. Cấu Hình Biến Môi Trường (Khi nối Backend thật)

Tạo file `.env` tại thư mục `client/` nếu muốn thay đổi cổng hoặc địa chỉ Backend:

```env
# Địa chỉ REST API backend
VITE_API_URL=http://localhost:3000

# Địa chỉ Socket.io server
VITE_SOCKET_URL=http://localhost:3000
```

---

## 5. Lệnh Đóng Gói (Build Production)

```bash
# Kiểm tra đóng gói bundle cho môi trường production
npm run build

# Xem thử bản đóng gói production chạy trên local
npm run preview
```
