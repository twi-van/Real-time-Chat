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

Để cài đặt và chạy dự án trên máy local, cần chuẩn bị các phần mềm sau:


| Phần mềm             | Phiên bản yêu cầu | Lệnh kiểm tra phiên bản                 |
| -------------------- | ----------------- | --------------------------------------- |
| **Node.js**          | `>= 20.x`         | `node -v`                               |
| **npm**              | `>= 10.x`         | `npm -v`                                |
| **Docker & Compose** | Docker Desktop    | `docker -v` và `docker compose version` |
| **Git**              | Bất kỳ            | `git --version`                         |


> **Lưu ý:** Đảm bảo Docker Desktop đang chạy trước khi khởi tạo cơ sở dữ liệu PostgreSQL, và các cổng `5173` (Frontend), `4000` (Backend), `5439` (PostgreSQL) không bị chiếm dụng bởi ứng dụng khác.

---



## 6. Cổng dịch vụ

Các cổng mặc định được cấu hình trong `.env.example`, `client/.env.example` và `docker-compose.yml`:


| Dịch vụ                      | Cổng (Host) | Cổng (Container) | Địa chỉ / Kết nối mặc định                                               |
| ---------------------------- | ----------- | ---------------- | ------------------------------------------------------------------------ |
| **Frontend (React + Vite)**  | `5173`      | —                | `http://localhost:5173`                                                  |
| **Backend (Express + WS)**   | `4000`      | —                | `http://localhost:4000` (REST API & Socket.io)                           |
| **Database (PostgreSQL 16)** | `5439`      | `5432`           | `postgresql://postgres:postgres@localhost:5439/wedgk_chat?schema=public` |


---



## 7. Hướng dẫn cài đặt và chạy

Thực hiện lần lượt các bước dưới đây từ thư mục gốc của dự án:

### Bước 1: Thiết lập biến môi trường (`.env`)

Copy các file mẫu `.env.example` thành `.env` ở thư mục gốc, thư mục `server` (cho Prisma CLI) và thư mục `client`:

**Trên Windows (PowerShell):**

```powershell
Copy-Item .env.example .env
Copy-Item .env.example server/.env
Copy-Item client/.env.example client/.env
```

**Trên macOS / Linux (Bash):**

```bash
cp .env.example .env
cp .env.example server/.env
cp client/.env.example client/.env
```

*(Các giá trị mặc định trong* `.env.example` *đã khớp sẵn với cấu hình Docker Compose ở cổng* `5439` *và Backend ở cổng* `4000`*).*

### Bước 2: Khởi động PostgreSQL bằng Docker Compose

```bash
docker compose up -d
```

Kiểm tra container `db` đã chạy (`Up`):

```bash
docker compose ps
```



### Bước 3: Cài đặt thư viện, chạy Migration và Seed dữ liệu (Backend)

```bash
cd server
npm install
npm run db:migrate
npm run db:seed
```



### Bước 4: Chạy Backend Server

Giữ terminal tại thư mục `server/` và chạy:

```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:4000` (có thể kiểm tra nhanh bằng `http://localhost:4000/health`).

### Bước 5: Cài đặt và chạy Frontend (Client)

Mở một **terminal mới** từ thư mục gốc dự án:

```bash
cd client
npm install
npm run dev
```

Truy cập ứng dụng trên trình duyệt tại địa chỉ: `http://localhost:5173`

---



## 8. Tài khoản demo

Sau khi chạy lệnh `npm run db:seed` (từ file `server/prisma/seed.js`), hệ thống khởi tạo sẵn **3 tài khoản demo** (chưa tạo sẵn room hay tin nhắn để tiện kiểm thử từ đầu):


| STT | Tên hiển thị (`displayName`) | Email     | Mật khẩu |
| --- | ---------------------------- | --------- | -------- |
| 1   | **An**                       | `a@a.com` | `123456` |
| 2   | **Bình**                     | `b@b.com` | `123456` |
| 3   | **Chi**                      | `c@c.com` | `123456` |


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



### Dừng các dịch vụ đang chạy

1. **Dừng Frontend & Backend:** Nhấn tổ hợp phím `Ctrl + C` tại mỗi cửa sổ terminal đang chạy `npm run dev`.
2. **Dừng container PostgreSQL (giữ nguyên dữ liệu DB):**
  ```bash
   docker compose stop
  ```
   Hoặc tắt và gỡ container (vẫn giữ volume `pgdata`):



### Reset toàn bộ dữ liệu Database và Seed lại từ đầu

**Cách 1: Reset bằng Prisma (khi Docker PostgreSQL đang chạy)**

```bash
cd server
npx prisma migrate reset --force
```

*(Lệnh này sẽ tự động xóa sạch dữ liệu, áp dụng lại toàn bộ migrations và tự chạy lại* `prisma/seed.js`*).*

**Cách 2: Xóa hẳn Docker Volume (**`pgdata`**) và khởi tạo lại**

```bash
docker compose down -v
docker compose up -d
cd server
npm run db:migrate
npm run db:seed
```

