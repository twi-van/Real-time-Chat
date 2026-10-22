# Database Schema

**Phụ trách:** Diệu Hiền (Database & DevOps)  
**Trạng thái:** Đã chốt (Sprint 1) — đủ để Prisma migrate + seed  

**Stack chốt:** PostgreSQL 16 + **Prisma** (Node).  
**ID:** UUID (`String @id @default(uuid())`).

---

## 1. Thực thể chính

- **User**: thông tin tài khoản người dùng.
- **Room**: phòng chat **một loại** (không phân `DIRECT` / `GROUP`). Chat 2 người hay nhiều người chỉ khác **số thành viên** trong `RoomMember`. Không dùng field/enum `type` trên Room.
- **RoomMember**: bảng trung gian lưu thành viên của phòng.
- **Message**: tin nhắn được gửi trong phòng.

### 1.1. Cột từng bảng (MVP)



#### User


| Cột          | Kiểu     | Ghi chú                      |
| ------------ | -------- | ---------------------------- |
| id           | UUID     | PK                           |
| email        | String   | Unique, dùng đăng nhập       |
| passwordHash | String   | bcrypt (không lưu plaintext) |
| displayName  | String   | Tên hiển thị                 |
| createdAt    | DateTime | default now                  |




#### Room


| Cột         | Kiểu     | Ghi chú                                                                                            |
| ----------- | -------- | -------------------------------------------------------------------------------------------------- |
| id          | UUID     | PK                                                                                                 |
| name        | String?  | **Nullable** khi chat đôi (FE hiện tên đối phương); **bắt buộc** khi tạo nhóm (≥ 2 người được mời) |
| createdById | UUID     | FK → User                                                                                          |
| createdAt   | DateTime | default now                                                                                        |




#### RoomMember


| Cột      | Kiểu     | Ghi chú                               |
| -------- | -------- | ------------------------------------- |
| id       | UUID     | PK (hoặc dùng @@id([roomId, userId])) |
| roomId   | UUID     | FK → Room                             |
| userId   | UUID     | FK → User                             |
| joinedAt | DateTime | default now                           |
|          |          | **Unique** `(roomId, userId)`         |




#### Message


| Cột       | Kiểu          | Ghi chú      |
| --------- | ------------- | ------------ |
| id        | UUID          | PK           |
| roomId    | UUID          | FK → Room    |
| senderId  | UUID          | FK → User    |
| content   | Text / String | Nội dung tin |
| createdAt | DateTime      | default now  |


**Không lưu DB (MVP):** typing, presence — chỉ qua Socket.

---



## 2. Quan hệ giữa các bảng

- **User–Room** (N-N): qua `RoomMember`; một user nhiều room; một room ≥ 2 thành viên.
- **Room–Message** (1-N).
- **User–Message** (1-N) qua `senderId`.
- `RoomMember`: FK `User`, `Room`; unique `(room_id, user_id)`.

---



## 3. Hướng migrate và seed



### 3.1. Migrate

Dùng **Prisma Migrate** (`npx prisma migrate dev`).

Thứ tự:

1. `users`
2. `rooms` (`created_by_id` → `users.id`)
3. `room_members`
4. `messages`
5. Unique + index (mục 4)



### 3.2. Seed tài khoản demo (local/test) — đơn giản

Cùng password: `123456`


| Email     | Password | displayName |
| --------- | -------- | ----------- |
| `a@a.com` | `123456` | An          |
| `b@b.com` | `123456` | Bình        |
| `c@c.com` | `123456` | Chi         |


- Hash bằng **bcrypt** trước khi ghi `passwordHash`.  
- Upsert theo email.  
- Thêm: 1 room 2 người (An+Bình) + 1 room nhóm `Nhóm demo` (An+Bình+Chi).  
- Chỉ dùng local/test.

---



## 4. Index và phân trang lịch sử



### Index

- `users.email` — unique  
- `room_members(room_id, user_id)` — unique  
- `room_members(user_id)` — list room của user  
- `messages(room_id, created_at, id)` — lịch sử + cursor



### Cursor (chốt, khớp API)

- Sort: `createdAt DESC`, `id DESC`  
- Cursor = cặp `(createdAt, id)`  
- `limit` mặc định **30**, tối đa **50**  
- Chỉ trả tin nếu user là member của room

---



## 5. Quyết định đã chốt / còn lại

- [x] DBMS: **PostgreSQL**  
- [x] Migration: **Prisma**  
- [x] ID: **UUID**  
- [x] Seed demo: bảng mục 3.2  
- [x] Cursor: `(created_at, id)`, limit 30–50  
- [x] Room một loại; `name` nullable khi chat đôi  
- [x] **Chống trùng chat đôi (MVP):** không tạo trùng room đúng 2 thành viên cho cùng một cặp user — logic ở BE khi `POST /rooms`; room nhóm không áp dụng  
- [ ] Chính sách xóa user/room (có thể để sau MVP)  

> Khớp `docs/api-contract.md` trước khi `prisma migrate`.  

---



## 6. Database & DevOps — Sprint 2 → 8 (deadline nộp đủ **05/11/2026**)

### Sprint 2 — DB chạy được · **deadline 25/10/2026**

- [ ] Viết `server/prisma/schema.prisma` đúng cột mục 1.1  
- [ ] `prisma migrate` + `db seed` (a@a.com / b@b.com / c@c.com, pass `123456`)  
- [ ] `docker compose` Postgres khớp `.env.example`  
- [ ] Báo Vân `DATABASE_URL` + cách chạy migrate

### Sprint 3–4 — Hỗ trợ ghép hệ thống · **deadline 28/10/2026**

- [ ] Sửa schema nếu BE/FE phát hiện thiếu field  
- [ ] Đảm bảo index + seed room mẫu (2 người + nhóm) ổn  
- [ ] Hỗ trợ Vân debug query / migration

### Sprint 5–6 — Ổn định · **deadline 31/10/2026**

- [ ] Seed idempotent (chạy lại không lỗi)  
- [ ] Backup hướng dẫn reset DB local trong README  
- [ ] (Tuỳ chọn) chính sách xóa user/room — chỉ nếu còn thời gian

### Sprint 7 — Docker / README máy sạch · **deadline 02/11/2026**

- [ ] Hoàn thiện README bước chạy (copy `.env`, compose, migrate, seed, FE/BE)  
- [ ] Test trên máy sạch / máy thành viên khác  
- [ ] Tạo **khung Word** report (bìa, mục lục, heading) + format  
- [ ] (Tuỳ chọn) đóng gói thêm service app vào compose

### Sprint 8 — Report + Word + tham gia video · **deadline 05/11/2026**

- [ ] Viết phần: thiết kế hệ thống + Database + Deploy/Docker (draft **04/11**)  
- [ ] Nháp kết luận → nhóm review  
- [ ] Gộp bài Vân/Lợi vào Word, xuất PDF — **05/11**  
- [ ] Tham gia video: nói/demo phần DB/Docker (do **Lợi** quay & dựng — Hiền **không** dựng video)  
