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


| Thành viên | Vai trò           | Phạm vi chính                                             |
| ---------- | ----------------- | --------------------------------------------------------- |
| Thùy Vân   | Backend           | REST API, Socket.io, JWT, rate limit (`server/src`)       |
| Kim Lợi    | Frontend          | React UI, gọi API / socket (`client/`)                    |
| Diệu Hiền  | Database & DevOps | Prisma schema / migrate / seed, Docker, README §5–8 & §10 |


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

> **Phụ trách: Diệu Hiền** — bổ sung phần mềm cần cài (Node, Docker, …) và cách kiểm tra.



---

## 6. Cổng dịch vụ

> **Phụ trách: Diệu Hiền** — liệt kê cổng Frontend / Backend / PostgreSQL (khớp `.env.example` và `docker-compose.yml`).



---

## 7. Hướng dẫn cài đặt và chạy

> **Phụ trách: Diệu Hiền** — viết đủ bước: copy `.env` → `docker compose` → migrate → seed → chạy Backend → chạy Frontend.  
> Làm trên máy mình rồi ghi đúng lệnh đã chạy được.



---

## 8. Tài khoản demo

> **Phụ trách: Diệu Hiền** — ghi email / mật khẩu sau seed (xem `server/prisma/seed.js`).



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

> **Phụ trách: Diệu Hiền** — cách dừng FE/BE/Docker và reset DB local rồi seed lại.

*(Để trống — Hiền viết.)*