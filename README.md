# Real-time Chat — Topic 9: WebSockets and Real-Time Communication

**Môn:** Web Programming & Applications (503073)  
**Học kỳ:** I — Năm học 2026–2027  
**Đề tài:** Topic 9 — WebSockets and Real-Time Communication  
**Repo:** https://github.com/twi-van/Real-time-Chat  

## Thành viên

| Họ tên | Vai trò |
|--------|---------|
| Thùy Vân | Backend |
| Kim Lợi | Frontend |
| Diệu Hiền | Database & DevOps |

- Phân công: [`PHAN_CONG.md`](./PHAN_CONG.md)  
- Đặc tả kickoff: [`docs/DAC_TA_DU_AN.md`](./docs/DAC_TA_DU_AN.md)  
- Contract API: [`docs/api-contract.md`](./docs/api-contract.md)  
- UI outline: [`docs/ui-outline.md`](./docs/ui-outline.md)  
- DB schema: [`docs/db_schema.md`](./docs/db_schema.md)  

---

## Sản phẩm

Web app **chat realtime**: đăng nhập → vào **room** (2 người hoặc nhiều người) → gửi/nhận tin không reload; có typing, online/offline; tin lưu DB.

**Một loại room** — không phân `DIRECT` / `GROUP`. Chat đôi hay nhóm chỉ khác số thành viên; UI có nút “Chat mới” và “Tạo nhóm”, cùng gọi `POST /rooms`.

### MVP (bắt buộc)

- Đăng ký / đăng nhập (JWT)  
- Chat theo **room thống nhất** (2 người hoặc nhiều người) + Socket realtime  
- Typing indicator · Online / offline  
- Lịch sử tin nhắn (phân trang cursor)  
- Auth khi nối WebSocket · rate limit cơ bản  
- README (+ Docker DB) để chạy được  

### Không làm trong MVP

- Enum / tách type `DIRECT` vs `GROUP`  
- Join room bằng link/mã công khai  
- Reply / reaction / search / gửi ảnh  

### Stack

Node.js + Socket.io · React + Vite + **JavaScript** + Tailwind · PostgreSQL + Prisma · Docker Compose  

---

## Cấu trúc repo

```text
wedgk/
├── client/                 # Kim Lợi — Frontend
│   └── src/
├── server/                 # Thùy Vân — Backend
│   ├── src/
│   └── prisma/             # Diệu Hiền — DB
├── docs/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── PHAN_CONG.md
└── README.md
```

---

## Cài đặt & chạy

> Repo đang docs + skeleton. Lệnh dưới là khung khi đã có `package.json`.

### Yêu cầu

- Node.js 20+  
- Docker (Postgres) hoặc Postgres local  

### Bước chạy (dự kiến)

```bash
cp .env.example .env
docker compose up -d

cd server && npm install && npx prisma migrate dev && npx prisma db seed && npm run dev
# → http://localhost:3000

cd client && npm install && npm run dev
# → http://localhost:5173
```

### Tài khoản demo (sau seed)

Cùng mật khẩu: **`123456`**

| Email | Password |
|-------|----------|
| `a@a.com` | `123456` |
| `b@b.com` | `123456` |
| `c@c.com` | `123456` |

---

## Kiểm thử demo

1. Hai trình duyệt, hai tài khoản  
2. Tạo room **2 người** và room **nhiều người**  
3. Gửi tin realtime (không F5)  
4. Typing + online/offline  
5. F5 → còn lịch sử  

---

## Bài nộp — deadline **05/11/2026**

- Report (Word + PDF) — **Hiền** khung Word & gộp; mỗi người viết phần mình  
- Source code + README này  
- Video ≤ 20 phút — **Lợi** quay & dựng; cả 3 xuất hiện/nói phần mình  

Lịch từng sprint: xem [`PHAN_CONG.md`](./PHAN_CONG.md).

**Không làm** slide / thuyết trình trên lớp.
