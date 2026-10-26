# ĐẶC TẢ DỰ ÁN

**Loại tài liệu:** Đặc tả mức quản lý dự án (kickoff) — **không** thay thế thiết kế kỹ thuật chi tiết.  
**Môn học:** Web Programming & Applications (503073)  
**Học kỳ:** I — Năm học 2026–2027  
**Đề tài:** Topic 9 — WebSockets and Real-Time Communication  
**Sản phẩm:** Real-time Chat Application  

| Họ tên | Vai trò |
|--------|---------|
| Thùy Vân | Backend |
| Kim Lợi | Frontend |
| Diệu Hiền | Database & DevOps |

---

## 1. Mục tiêu

1. Demo Topic 9: WebSocket persistent, hai chiều; events; broadcast / server push.  
2. Sản phẩm: chat realtime theo **room**, auth JWT, lưu tin.  
3. Bài nộp: **Report** (Hiền khung Word) + **Source/README** + **Video ≤ 20 phút** (Lợi quay/dựng; cả 3 nói). **Không** slide / thuyết trình trên lớp.

---

## 2. Nội dung sản phẩm

Web app: **đăng nhập** → vào **room** → **gửi/nhận tin realtime**; có **typing**, **online/offline**; tin **lưu DB**.

**Room:** **một loại** duy nhất (không `DIRECT` / `GROUP`).  
- Chat 2 người = room đúng 2 thành viên  
- Chat nhóm = room nhiều thành viên  
UI có “Chat mới” / “Tạo nhóm”, cùng `POST /rooms` — khác số người chọn.

**Stack:**

- Frontend: React + Vite + JavaScript + Tailwind  
- Backend: Node.js + JavaScript + Socket.io + REST  
- DB: PostgreSQL + Prisma  
- Vận hành: Docker Compose + `.env.example` + README  

---

## 3. Phạm vi MVP / ngoài phạm vi

### 3.1. Phải có (MVP)

| # | Tính năng | Ghi chú Topic 9 |
|---|-----------|-----------------|
| 1 | Đăng ký / đăng nhập | REST + JWT |
| 2 | Chat theo room (gửi–nhận realtime; leave socket) | WebSocket; **một loại room** |
| 3 | Tạo room 2 người hoặc nhiều người | Cùng API; khác `memberIds` / `name` |
| 4 | Typing indicator | Event realtime |
| 5 | Online / offline | Presence |
| 6 | Lịch sử tin khi mở lại room | Persist DB + cursor |
| 7 | Bảo mật cơ bản trên WS | Auth connect; rate limit |
| 8 | README (+ Docker DB) | Chạy được |

### 3.2. Chưa làm trong MVP

- Tách type `DIRECT` / `GROUP`  
- Join room bằng link/mã công khai  
- Reply / reaction / search / upload ảnh / push / WebRTC  

---

## 4. Phân công

| Thành viên | Việc chính | Folder chính |
|------------|------------|--------------|
| **Thùy Vân** | Backend | `server/` (API, Socket.io, JWT, rate limit) |
| **Kim Lợi** | Frontend | `client/` |
| **Diệu Hiền** | Database & DevOps | `prisma/`, Docker, `.env.example`, README chạy |

Chi tiết: `PHAN_CONG.md`.

---

## 5. Tài liệu thiết kế tuần 1

| Người | File | Nội dung |
|-------|------|----------|
| Thùy Vân | `docs/api-contract.md` | REST + Socket; auth WS; lỗi |
| Kim Lợi | `docs/ui-outline.md` | Màn hình + flow + state |
| Diệu Hiền | `docs/db_schema.md` | Entity + migrate + seed |

Ba file cần **khớp** (đã chốt: **một loại room**). Sau đó code song song.

---

## 6. Cấu trúc repo

```text
wedgk/
├── client/           # Kim Lợi
├── server/           # Thùy Vân
│   └── prisma/       # Diệu Hiền
├── docs/
├── docker-compose.yml
├── .env.example
├── PHAN_CONG.md
└── README.md
```

---

## 7. Milestone & deadline (nộp đủ **05/11/2026**)

| Sprint | Deadline | Mục tiêu |
|--------|----------|----------|
| **1** | **22/10** (Done) | Chốt 3 tài liệu |
| **2** | **25/10** | Auth + chat realtime tối thiểu |
| **3–4** | **28/10** | Typing + presence + ghép FE–BE–DB |
| **5–6** | **31/10** | Ổn định MVP |
| **7** | **02/11** | Docker / README máy sạch |
| **8** | **05/11** | Report + video → **nộp đủ bài** |

Chi tiết từng người: `PHAN_CONG.md` + mục Sprint trong 3 file docs.

---

## 8. Tiêu chí nghiệm thu MVP

1. Hai user, cùng room: gửi tin realtime, không F5.  
2. Tạo được room **2 người** và room **nhiều người**.  
3. Typing + online/offline.  
4. F5 còn lịch sử tin.  
5. Không JWT → không chat qua socket.  
6. README/Docker chạy được trên máy khác.  
7. Nộp: Report + source + video (cả 3, có tiếng). Không slide/thuyết trình.

---

## 9. Tài liệu liên quan

| File | Ai | Mục đích |
|------|-----|----------|
| `PHAN_CONG.md` | Nhóm | Phân công (nội bộ) |
| `README.md` | Hiền + nhóm | Chạy demo |
| `docs/api-contract.md` | Thùy Vân | API/Socket |
| `docs/ui-outline.md` | Kim Lợi | UI |
| `docs/db_schema.md` | Diệu Hiền | DB |
| Report (khung Word + gộp) | **Diệu Hiền** | Nộp cuối |
| Report (nội dung từng chương) | Đúng người phụ trách | Xem `PHAN_CONG.md` |
| Video (quay & dựng) | **Kim Lợi** | ≤ 20 phút; cả 3 nói phần mình |

---

*Đặc tả kickoff — chi tiết kỹ thuật nằm ở 3 file docs của từng thành viên.*
