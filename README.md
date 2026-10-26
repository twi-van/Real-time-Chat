# Real-time Chat Application

**Topic 9 — WebSockets and Real-Time Communication**  
**Môn học:** Web Programming & Applications (503073)  
**Học kỳ:** I — Năm học 2026–2027


| MSSV     | Họ và tên            | Vai trò           |
| -------- | -------------------- | ----------------- |
| 52400254 | Phan Phạm Thùy Vân   | Backend           |
| 52400211 | Nguyễn Ngọc Kim Lợi  | Frontend          |
| 52400046 | Nguyễn Thị Diệu Hiền | Database & DevOps |


---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Công nghệ](#2-công-nghệ)
3. [Phân công](#3-phân-công)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Yêu cầu môi trường](#5-yêu-cầu-môi-trường)
6. [Cổng dịch vụ](#6-cổng-dịch-vụ)
7. [Hướng dẫn cài đặt và chạy](#7-hướng-dẫn-cài-đặt-và-chạy)
8. [Tài khoản demo](#8-tài-khoản-demo)
9. [Kiểm thử nghiệm thu](#9-kiểm-thử-nghiệm-thu)
10. [Dừng và reset dữ liệu](#10-dừng-và-reset-dữ-liệu)

---



## 1. Giới thiệu

Ứng dụng web **chat thời gian thực** minh họa Topic 9: kết nối WebSocket bền vững, giao tiếp hai chiều, event và server push.

**Luồng chính:** đăng ký / đăng nhập → vào **room** → gửi–nhận tin **không reload trang**; có **typing**, **online/offline**; tin nhắn **lưu PostgreSQL**.

### Mô hình room (MVP)

Chỉ **một loại room** (không phân `DIRECT` / `GROUP`):

- Chat 2 người: room đúng 2 thành viên (`name` có thể trống).
- Chat nhóm: nhiều thành viên (`name` bắt buộc).

Trên giao diện: **Chat mới** / **Tạo nhóm** — cùng endpoint `POST /rooms`.

### Tính năng MVP


| #   | Tính năng                     | Ghi chú                           |
| --- | ----------------------------- | --------------------------------- |
| 1   | Đăng ký / đăng nhập           | REST + JWT                        |
| 2   | Chat theo room (realtime)     | Socket.io                         |
| 3   | Tạo room 2 người hoặc nhóm    | Cùng API, khác `memberIds`/`name` |
| 4   | Typing indicator              | Event realtime                    |
| 5   | Presence online / offline     | Event realtime                    |
| 6   | Lịch sử tin khi mở lại room   | DB + cursor `(createdAt, id)`     |
| 7   | Bảo mật cơ bản trên WebSocket | Auth khi connect; rate limit      |
| 8   | Docker Postgres + README      | Chạy được trên máy khác           |




### Ngoài phạm vi MVP

Tách type `DIRECT`/`GROUP`, join bằng link/mã, reply, reaction, search, gửi ảnh, WebRTC.

---



## 2. Công nghệ


| Tầng     | Stack                                                   |
| -------- | ------------------------------------------------------- |
| Frontend | React, Vite, JavaScript, Tailwind CSS, Socket.io-client |
| Backend  | Node.js, Express, Socket.io, JWT, bcrypt                |
| Database | PostgreSQL 16, Prisma                                   |
| Vận hành | Docker Compose, `.env.example`                          |


---



## 3. Phân công


| Thành viên | Vai trò           | Phạm vi chính                                       |
| ---------- | ----------------- | --------------------------------------------------- |
| Thùy Vân   | Backend           | REST API, Socket.io, JWT, rate limit (`server/src`) |
| Kim Lợi    | Frontend          | React UI, gọi API / socket (`client/`)              |
| Diệu Hiền  | Database & DevOps | Prisma schema / migrate / seed, Docker              |


---



## 4. Cấu trúc thư mục

```text
wedgk/
├── client/                 # Frontend (Kim Lợi)
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/                 # Backend (Thùy Vân)
│   ├── src/                # Express + Socket.io
│   ├── prisma/             # Schema, migrate, seed (Diệu Hiền)
│   ├── scripts/            # Smoke test Backend
│   └── package.json
├── docs/                   # Đặc tả & contract kỹ thuật
├── docker-compose.yml      # PostgreSQL
├── .env.example            # Mẫu biến môi trường (gốc repo)
└── README.md               # File này
```

---



## 5. Yêu cầu môi trường

Cần cài trước khi chạy dự án:


| Phần mềm       | Phiên bản gợi ý                  | Kiểm tra                               |
| -------------- | -------------------------------- | -------------------------------------- |
| Node.js        | 20+ (LTS)                        | `node -v`                              |
| npm            | đi kèm Node                      | `npm -v`                               |
| Docker Desktop | bản mới, đang chạy               | `docker -v` · `docker compose version` |
| Trình duyệt    | Chrome / Edge / Firefox / Safari | —                                      |


Hỗ trợ macOS, Windows, Linux (Windows: dùng Docker Desktop).

---



## 6. Cổng dịch vụ


| Dịch vụ                       | Địa chỉ                                        |
| ----------------------------- | ---------------------------------------------- |
| Frontend (Vite)               | [http://localhost:5173](http://localhost:5173) |
| Backend (HTTP + Socket.io)    | [http://localhost:4000](http://localhost:4000) |
| PostgreSQL (host → container) | localhost:5439 → 5432                          |


Frontend và Backend chạy **hai cổng khác nhau** khi phát triển. Backend đã cấu hình **CORS** cho `http://localhost:5173`.

---



## 7. Hướng dẫn cài đặt và chạy

Thực hiện **đúng thứ tự** từ thư mục gốc repository (sau khi clone).

### Bước 1 — Clone repository

```bash
git clone https://github.com/twi-van/Real-time-Chat.git
cd Real-time-Chat
```



### Bước 2 — Tạo file môi trường

```bash
cp .env.example .env
```

Các biến quan trọng (đã khớp Docker Compose):

```env
PORT=4000
JWT_SECRET=thay-bang-chuoi-bi-mat
DATABASE_URL=postgresql://postgres:postgres@localhost:5439/wedgk_chat?schema=public
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

Khuyến nghị thêm file môi trường cho Frontend:

```bash
cp client/.env.example client/.env
```

Đảm bảo `VITE_API_URL` và `VITE_SOCKET_URL` trỏ tới `http://localhost:4000`.

> **Lưu ý:** Không commit file `.env` (đã nằm trong `.gitignore`).



### Bước 3 — Khởi động database (Docker)

```bash
docker compose up -d
docker compose ps
```

Kỳ vọng: service `db` ở trạng thái **Up**, map cổng **5439**.

### Bước 4 — Backend: cài đặt, migrate, seed, chạy

```bash
cd server
npm install

# Nạp DATABASE_URL từ .env gốc repo (Prisma cần biến này)
set -a && source ../.env && set +a

npx prisma generate
npx prisma migrate deploy
npx prisma db seed

npm run dev
```

Kỳ vọng trên console:

```text
Server listening on http://localhost:4000
```

Kiểm tra nhanh: mở [http://localhost:4000/health](http://localhost:4000/health) → `{"ok":true}`.

Giữ terminal này đang chạy.

> **Windows (PowerShell):** thay `source ../.env` bằng cách đặt biến môi trường thủ công, hoặc dùng Git Bash / WSL để chạy các lệnh trên.



### Bước 5 — Frontend (terminal mới)

```bash
cd client
npm install
npm run dev
```

Kỳ vọng:

```text
➜  Local:   http://localhost:5173/
```

Mở trình duyệt tại **[http://localhost:5173](http://localhost:5173)**.

---



## 8. Tài khoản demo

Sau khi seed, mật khẩu chung: `123456`


| Email     | Tên hiển thị | Mật khẩu |
| --------- | ------------ | -------- |
| `a@a.com` | An           | `123456` |
| `b@b.com` | Bình         | `123456` |
| `c@c.com` | Chi          | `123456` |


---



## 9. Kiểm thử nghiệm thu

Các bước tối thiểu để xác nhận MVP (theo đặc tả đề tài):

1. Mở **hai cửa sổ** trình duyệt (hoặc một cửa sổ ẩn danh).
2. Đăng nhập `a@a.com` và `b@b.com` (mật khẩu `123456`).
3. Tạo **Chat mới** (chọn user kia) hoặc **Tạo nhóm** (có **tên nhóm**).
4. Gửi tin → bên kia nhận **realtime** (không cần F5).
5. Gõ phím → thấy **typing**; đóng tab / đăng xuất → trạng thái **offline**.
6. F5 → vẫn còn **lịch sử** tin nhắn.
7. Không đăng nhập / token sai → không chat qua WebSocket.

Smoke test Backend (tuỳ chọn, khi server đang chạy):

```bash
cd server
node scripts/smoke-sprint56.js
```

---



## 10. Dừng và reset dữ liệu



### Dừng ứng dụng

- Frontend / Backend: `Ctrl+C` trên terminal tương ứng
- PostgreSQL: `docker compose down` (giữ volume dữ liệu)



### Xóa toàn bộ dữ liệu local rồi seed lại

```bash
docker compose down -v
docker compose up -d
cd server
set -a && source ../.env && set +a
npx prisma migrate deploy
npx prisma db seed
```



### Xóa phiên đăng nhập trên trình duyệt

DevTools → Application → Local Storage → xóa `chat_token`, `chat_user` (hoặc Clear site data), rồi F5.

