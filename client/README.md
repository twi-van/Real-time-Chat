# Client — React Frontend

**Phụ trách:** Kim Lợi (Frontend)  
**Stack:** React 19, Vite, Tailwind CSS, Socket.io-client

---

## Hướng dẫn chạy nhanh

### 1. Thiết lập biến môi trường

```bash
# Trên Windows (PowerShell)
Copy-Item .env.example .env

# Trên macOS/Linux
cp .env.example .env
```

Nội dung mặc định `.env` trỏ vào backend ở `http://localhost:4000` (đúng theo README gốc).

### 2. Cài đặt thư viện

```bash
npm install
```

### 3. Chạy dev server

```bash
npm run dev
```

Truy cập tại: **http://localhost:5173**

> **Lưu ý:** Cần backend đang chạy ở `http://localhost:4000`. Nếu backend chưa chạy, giao diện vẫn hoạt động với **dữ liệu mock** (tự động fallback).

---

## Tài khoản demo

Khi backend + database đã seed (`npm run db:seed`):

| # | Tên | Email | Mật khẩu |
|---|-----|-------|---------|
| 1 | **An** | `a@a.com` | `123456` |
| 2 | **Bình** | `b@b.com` | `123456` |
| 3 | **Chi** | `c@c.com` | `123456` |

Mở 2 tab trình duyệt → đăng nhập 2 tài khoản khác nhau → test chat realtime.

---

## Biến môi trường (`client/.env`)

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `VITE_API_URL` | `http://localhost:4000` | Backend REST API |
| `VITE_SOCKET_URL` | `http://localhost:4000` | Backend Socket.io |
| `VITE_PORT` | `5173` | Cổng dev server Vite |

---

## Cấu trúc thư mục

```text
client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          # Màn đăng nhập
│   │   ├── Register.jsx       # Màn đăng ký
│   │   └── ChatDashboard.jsx  # Màn chat chính (sidebar + khung tin)
│   ├── components/
│   │   ├── NewChatModal.jsx   # Modal chat mới (2 người)
│   │   └── CreateGroupModal.jsx # Modal tạo nhóm
│   ├── hooks/
│   │   └── useSocket.js       # Hook quản lý Socket.io
│   ├── api.js                 # Service gọi REST API + mock fallback
│   ├── mockData.js            # Dữ liệu mock khi BE offline
│   └── App.jsx                # Root component + router auth
├── .env.example
└── package.json
```

---

## Tính năng đã hoàn thành

- [x] Login / Register (gọi API + mock fallback)
- [x] Chat theo room realtime (Socket.io)
- [x] Tạo chat mới (2 người) — chống trùng room đôi
- [x] Tạo nhóm (≥ 3 người, có tên)
- [x] Typing indicator (2.5s tắt)
- [x] Presence online/offline
- [x] Lịch sử tin nhắn + cursor pagination (cuộn lên tải thêm)
- [x] Responsive mobile (< 768px) — sidebar/chat toggle
- [x] Xử lý lỗi 401 → toast + auto logout
- [x] Đăng xuất (xóa token + disconnect socket)
