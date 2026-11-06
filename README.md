# Real-time Chat

**Topic 9 — WebSockets and Real-Time Communication**  
**Môn:** Web Programming & Applications (503073)  
**Học kỳ:** I, năm học 2026–2027

| MSSV | Họ và tên | Vai trò |
| --- | --- | --- |
| 52400254 | Phan Phạm Thùy Vân | Backend |
| 52400211 | Nguyễn Ngọc Kim Lợi | Frontend |
| 52400046 | Nguyễn Thị Diệu Hiền | Database và DevOps |

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Công nghệ](#2-công-nghệ)
3. [Phân công](#3-phân-công)
4. [Cấu trúc thư mục](#4-cấu-trúc-thư-mục)
5. [Yêu cầu môi trường](#5-yêu-cầu-môi-trường)
6. [Cổng dịch vụ](#6-cổng-dịch-vụ)
7. [Setup và Run](#7-setup-và-run)
8. [Tài khoản demo](#8-tài-khoản-demo)
9. [Kiểm thử](#9-kiểm-thử)
10. [Dừng và reset dữ liệu](#10-dừng-và-reset-dữ-liệu)
11. [File SQL](#11-file-sql)

## 1. Giới thiệu

Ứng dụng chat thời gian thực. Người dùng đăng ký hoặc đăng nhập, vào phòng, rồi gửi và nhận tin mà không tải lại trang. Có trạng thái đang nhập, online/offline, và tin được lưu trong PostgreSQL.

Chỉ có một loại phòng:

- Hai người: phòng có đúng 2 thành viên, tên phòng có thể để trống.
- Nhóm: từ 3 thành viên, bắt buộc có tên.

Trên giao diện, **Chat mới** và **Tạo nhóm** đều gọi `POST /rooms`.

| Tính năng | Cách làm |
| --- | --- |
| Đăng ký, đăng nhập | REST, JWT |
| Chat trong phòng | Socket.io |
| Tạo phòng đôi hoặc nhóm | Cùng API, khác `memberIds` và `name` |
| Đang nhập | Sự kiện trong phòng |
| Online / offline | Sự kiện presence |
| Lịch sử tin | PostgreSQL, phân trang bằng cursor |
| Bảo mật socket | JWT khi kết nối, giới hạn tốc độ |
| Mất mạng | Client tự kết nối lại và vào lại phòng |

Ngoài phạm vi: tách loại phòng direct/group, vào phòng bằng link, trả lời, cảm xúc, tìm kiếm, gửi ảnh, WebRTC.

## 2. Công nghệ

| Tầng | Công nghệ |
| --- | --- |
| Frontend | React, Vite, JavaScript, Tailwind CSS, Socket.io-client |
| Backend | Node.js, Express, Socket.io, JWT, bcrypt |
| Database | PostgreSQL 16, Prisma |
| Chạy local | Docker Compose |

## 3. Phân công

| Thành viên | Vai trò | Phần làm |
| --- | --- | --- |
| Thùy Vân | Backend | REST API, Socket.io, JWT, giới hạn tốc độ (`server/src`) |
| Kim Lợi | Frontend | Giao diện React, gọi API và socket (`client/`) |
| Diệu Hiền | Database và DevOps | Prisma, Docker, `database/init.sql` |

## 4. Cấu trúc thư mục

```text
├── client/                 # Frontend
│   ├── src/
│   ├── .env.example
│   └── package.json
├── server/                 # Backend
│   ├── src/                # Express và Socket.io
│   ├── prisma/             # Schema, migrate, seed
│   ├── scripts/smoke.js    # Kiểm tra mã lỗi và gửi nhận một tin
│   ├── test.js             # Đo độ trễ 50 tin (cần phòng đã tạo)
│   └── package.json
├── database/
│   ├── init.sql            # Tạo bảng và 3 user demo
│   └── README.md
├── docs/
│   └── report.docx
├── docker-compose.yml
├── .env.example
└── README.md
```

## 5. Yêu cầu môi trường

| Phần mềm | Phiên bản | Kiểm tra |
| --- | --- | --- |
| Node.js | 20 trở lên | `node -v` |
| npm | 10 trở lên | `npm -v` |
| Docker Desktop | bản hiện tại | `docker -v` và `docker compose version` |
| Git | bất kỳ | `git --version` |

Mở Docker Desktop trước khi tạo database. Các cổng 5173, 4000 và 5439 phải đang trống.

## 6. Cổng dịch vụ

| Dịch vụ | Cổng trên máy | Địa chỉ |
| --- | --- | --- |
| Frontend | 5173 | http://localhost:5173 |
| Backend (REST và Socket.io) | 4000 | http://localhost:4000 |
| PostgreSQL 16 | 5439 (trong container là 5432) | `postgresql://postgres:postgres@localhost:5439/wedgk_chat?schema=public` |

## 7. Setup và Run

Làm lần lượt từ thư mục gốc của project.

### Bước 1. Tạo file môi trường

Windows (PowerShell):

```powershell
Copy-Item .env.example .env
Copy-Item .env.example server/.env
Copy-Item client/.env.example client/.env
```

macOS / Linux:

```bash
cp .env.example .env
cp .env.example server/.env
cp client/.env.example client/.env
```

Giá trị mẫu đã trỏ PostgreSQL cổng 5439 và backend cổng 4000.

### Bước 2. Bật PostgreSQL

```bash
docker compose up -d
docker compose ps
```

Container database phải ở trạng thái Up.

### Bước 3. Cài backend, tạo bảng, nạp dữ liệu mẫu

```bash
cd server
npm install
npm run db:migrate
npm run db:seed
```

### Bước 4. Chạy backend

Vẫn ở thư mục `server`:

```bash
npm run dev
```

Server lắng nghe http://localhost:4000. Mở http://localhost:4000/health phải thấy `{"ok":true}`.

### Bước 5. Chạy frontend

Terminal mới, từ thư mục gốc:

```bash
cd client
npm install
npm run dev
```

Mở http://localhost:5173.

## 8. Tài khoản demo

`npm run db:seed` tạo 3 tài khoản. Chưa có phòng và tin nhắn.

| Tên | Email | Mật khẩu |
| --- | --- | --- |
| An | a@a.com | 123456 |
| Bình | b@b.com | 123456 |
| Chi | c@c.com | 123456 |

## 9. Kiểm thử

1. Mở hai cửa sổ trình duyệt (một cửa sổ thường, một cửa sổ ẩn danh).
2. Đăng nhập `a@a.com` và `b@b.com`, mật khẩu `123456`.
3. Tạo chat mới hoặc tạo nhóm có tên.
4. Gửi tin. Bên kia nhận ngay, không cần tải lại trang.
5. Gõ chữ chưa gửi thì bên kia thấy đang nhập. Đóng tab hoặc đăng xuất thì trạng thái chuyển offline.
6. Tải lại trang thì tin cũ vẫn còn.
7. Chưa đăng nhập hoặc token sai thì không chat qua socket.

Khi backend đang chạy, có thể chạy thêm hai script trong thư mục `server`.

`scripts/smoke.js` kiểm tra mã lỗi REST và hai socket gửi nhận một tin. Script tự tạo phòng đôi nếu chưa có.

```bash
cd server
node scripts/smoke.js
```

`test.js` đo độ trễ: đăng nhập A và B, vào một phòng chung đã có, gửi 50 tin, rồi in độ trễ trung bình. Cần tạo phòng chat giữa hai tài khoản trên giao diện trước.

```bash
cd server
node test.js
```

## 10. Dừng và reset dữ liệu

Dừng frontend và backend bằng Ctrl+C ở từng terminal.

Dừng PostgreSQL, giữ dữ liệu:

```bash
docker compose stop
```

Tắt container, vẫn giữ volume `pgdata`:

```bash
docker compose down
```

Xóa dữ liệu và nạp lại bằng Prisma, khi container database đang chạy:

```bash
cd server
npx prisma migrate reset --force
```

Xóa cả volume rồi tạo lại:

```bash
docker compose down -v
docker compose up -d
cd server
npm run db:migrate
npm run db:seed
```

## 11. File SQL

`database/init.sql` gồm lệnh tạo bảng, khóa, index và 3 user demo (`a@a.com`, `b@b.com`, `c@c.com`).

Để chạy ứng dụng, dùng mục 7 (Docker và Prisma). File `init.sql` dùng để nộp và đối chiếu. Không bắt buộc chạy `psql -f database/init.sql` khi demo.

Khi nộp source, không đưa `node_modules`, `target` hay `vendor`. Các thư mục đó đã có trong `.gitignore`.
