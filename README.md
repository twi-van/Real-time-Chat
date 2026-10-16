# Real-time Chat — Topic 9: WebSockets and Real-Time Communication

**Môn:** Web Programming & Applications (503073)  
**Học kỳ:** I — Năm học 2026–2027  
**Đề tài:** Topic 9 — WebSockets and Real-Time Communication  

## Thành viên


| Họ tên    | Vai trò           |
| --------- | ----------------- |
| Thùy Vân  | Backend           |
| Kim Lợi   | Frontend          |
| Diệu Hiền | Database & DevOps |


Phân công chi tiết: `[PHAN_CONG.md](./PHAN_CONG.md)`  
Đặc tả kickoff (PM): [`docs/DAC_TA_DU_AN.md`](./docs/DAC_TA_DU_AN.md)

---

## Nội dung

Web app **chat realtime**: đăng nhập → vào room → gửi/nhận tin không reload; có typing, online/offline; tin lưu DB.

### MVP (bắt buộc)

- Đăng ký / đăng nhập (JWT)  
- Chat theo room (join / leave / realtime)  
- Typing indicator · Online/offline  
- Lịch sử tin nhắn  
- Auth khi kết nối WebSocket · rate limit cơ bản  
- README (+ Docker khuyến nghị) để thầy chạy được



### Stack định hướng

Node.js + Socket.io · React + Vite + JavaScript + Tailwind · PostgreSQL + Prisma · Docker Compose  

---



## Cấu trúc repo

```text
wedgk/
├── client/                 # Kim Lợi — Frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── stores/
├── server/                 # Thùy Vân — Backend
│   ├── src/
│   │   ├── auth/
│   │   ├── socket/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/             # Diệu Hiền — DB
├── docs/                   # api-contract · ui-outline · db_schema
├── docker-compose.yml      # stub DB (Hiền hoàn thiện)
├── .env.example
├── .gitignore
├── PHAN_CONG.md
└── README.md
```

---



## Việc tuần 1 (đọc trước khi code)


| Người     | Tự viết                |
| --------- | ---------------------- |
| Thùy Vân  | `docs/api-contract.md` |
| Kim Lợi   | `docs/ui-outline.md`   |
| Diệu Hiền | `docs/db_schema.md`    |


Sau khi sync 3 file trên khớp nhau → code song song.

---



## Cài đặt & chạy

> Sẽ bổ sung lệnh chính xác khi có source (Diệu Hiền cập nhật README phần này).

```bash
# Dự kiến
cp .env.example .env
docker compose up --build
```

---



## Kiểm thử demo (khi đã có app)

1. Hai trình duyệt / hai tài khoản
2. Cùng một room → gửi tin thấy realtime
3. Typing + online/offline
4. F5 vẫn còn lịch sử

---



## Bài nộp (nhóm này)

- Report (Word + PDF)  
- Source code + README này  
- Video ≤ 20 phút (cả nhóm, có tiếng)

