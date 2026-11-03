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

Nội dung mặc định `.env` trỏ vào backend ở `http://localhost:4000` (đúng theo `README.md` ở thư mục gốc repo).

### 2. Cài đặt thư viện

```bash
npm install
```

### 3. Chạy dev server

```bash
npm run dev
```

Truy cập tại: **http://localhost:5173**

> **Lưu ý:** Cần chạy cơ sở dữ liệu và backend trước (xem `README.md` ở thư mục gốc repo: `docker compose up -d` → `cd server` → `npm run db:migrate` → `npm run db:seed` → `npm run dev`). Nếu backend chưa chạy, giao diện sẽ báo lỗi *"Không kết nối được máy chủ. Hãy chạy Backend (cổng 4000)"* và không đăng nhập được.

---

## Tài khoản demo

Khi backend + database đã seed (`cd server && npm run db:seed`):

| # | Tên | Email | Mật khẩu |
|---|-----|-------|---------|
| 1 | **An** | `a@a.com` | `123456` |
| 2 | **Bình** | `b@b.com` | `123456` |
| 3 | **Chi** | `c@c.com` | `123456` |

> **Lưu ý kiểm thử 2 tài khoản cùng lúc:** Do ứng dụng lưu phiên làm việc trong `localStorage`, hãy mở **1 tab bình thường** (User An) và **1 tab cửa sổ ẩn danh (Incognito)** hoặc dùng trình duyệt khác (User Bình) để hai tài khoản không bị ghi đè phiên đăng nhập lên nhau.

---

## Biến môi trường (`client/.env`)

| Biến | Mặc định | Mô tả |
|------|----------|-------|
| `VITE_API_URL` | `http://localhost:4000` | Backend REST API |
| `VITE_SOCKET_URL` | `http://localhost:4000` | Backend Socket.io |
| `VITE_PORT` | `5173` | Cổng dev server Vite (được đọc và áp dụng qua `vite.config.js`) |

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
│   ├── api.js                 # Service gọi REST API Backend (không còn mock)
│   └── App.jsx                # Root component + router auth & Toast thông báo
├── .env.example
└── package.json
```

---

## Tính năng đã hoàn thành

- [x] Login / Register (gọi REST API thật)
- [x] Chat theo room realtime (Socket.io)
- [x] Tạo chat mới (2 người) — chống trùng room đôi
- [x] Tạo nhóm (≥ 3 người, có tên)
- [x] Typing indicator (2.5s tắt)
- [x] Presence online/offline
- [x] Lịch sử tin nhắn + cursor pagination (cuộn lên tải thêm, giữ vị trí scroll)
- [x] Responsive mobile (< 768px) — sidebar/chat toggle
- [x] Xử lý lỗi 401 → toast + auto logout
- [x] Xử lý lỗi 400, 403, 429 và thông báo mất kết nối máy chủ
- [x] Đăng xuất (xóa token + disconnect socket)

---

## Xử lý sự cố (Troubleshooting)

- **Lỗi CORS / Không gọi được API:** Kiểm tra biến `CLIENT_ORIGIN` trong `server/.env` phải khớp với địa chỉ Frontend (`http://localhost:5173`).
- **Sai cổng kết nối:** Kiểm tra file `client/.env`, đảm bảo `VITE_API_URL=http://localhost:4000` và `VITE_SOCKET_URL=http://localhost:4000`.
- **Không đăng nhập được tài khoản demo:** Đảm bảo bạn đã chạy `cd server && npm run db:seed` để nạp dữ liệu mẫu vào PostgreSQL.
