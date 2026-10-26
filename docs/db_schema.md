# Database Schema

**Phụ trách:** Diệu Hiền (Database & DevOps)  
**Trạng thái:** Đã chốt (Sprint 1) & cập nhật chuẩn hóa cho Prisma — đủ để Prisma migrate + seed  

**Stack chốt:** PostgreSQL 16 + **Prisma** (Node).  
**ID:** UUID (`String @id @default(uuid()) @db.Uuid`).  
**Quy ước đặt tên:** Trường trong Prisma/JS dùng `camelCase` (khớp code Backend), ánh xạ xuống PostgreSQL dạng `snake_case` qua `@map` / `@@map`.

---

## 1. Thực thể chính

- **User** (`users`): thông tin tài khoản người dùng.
- **Room** (`rooms`): phòng chat **một loại** (không phân `DIRECT` / `GROUP`). Chat 2 người hay nhiều người chỉ khác **số thành viên** trong `RoomMember`. Không dùng field/enum `type` trên Room.
- **RoomMember** (`room_members`): bảng trung gian lưu thành viên của phòng, dùng khóa chính phức hợp `@@id([roomId, userId])`.
- **Message** (`messages`): tin nhắn được gửi trong phòng.

### 1.1. Cột từng bảng (MVP)

#### User (`@@map("users")`)


| Trường (Prisma/JS) | Cột DB (`@map`) | Kiểu     | Ghi chú                      |
| ------------------ | --------------- | -------- | ---------------------------- |
| `id`               | `id`            | UUID     | PK (`@default(uuid())`)      |
| `email`            | `email`         | String   | Unique, dùng đăng nhập       |
| `passwordHash`     | `password_hash` | String   | bcrypt (không lưu plaintext) |
| `displayName`      | `display_name`  | String   | Tên hiển thị                 |
| `createdAt`        | `created_at`    | DateTime | `@default(now())`            |


#### Room (`@@map("rooms")`)


| Trường (Prisma/JS) | Cột DB (`@map`) | Kiểu     | Ghi chú                                                                                            |
| ------------------ | --------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `id`               | `id`            | UUID     | PK (`@default(uuid())`)                                                                            |
| `name`             | `name`          | String?  | **Nullable** khi chat đôi (FE hiện tên đối phương); **bắt buộc** khi tạo nhóm (≥ 2 người được mời) |
| `createdById`      | `created_by_id` | UUID     | FK → `User.id`                                                                                     |
| `createdAt`        | `created_at`    | DateTime | `@default(now())`                                                                                  |


#### RoomMember (`@@map("room_members")`)


| Trường (Prisma/JS) | Cột DB (`@map`) | Kiểu         | Ghi chú                                              |
| ------------------ | --------------- | ------------ | ---------------------------------------------------- |
| `roomId`           | `room_id`       | UUID         | FK → `Room.id` (`onDelete: Cascade`)                 |
| `userId`           | `user_id`       | UUID         | FK → `User.id` (`onDelete: Cascade`)                 |
| `joinedAt`         | `joined_at`     | DateTime     | `@default(now())`                                    |
| —                  | —               | Composite PK | `@@id([roomId, userId])` (kiêm Unique cặp room–user) |


#### Message (`@@map("messages")`)


| Trường (Prisma/JS) | Cột DB (`@map`) | Kiểu          | Ghi chú                              |
| ------------------ | --------------- | ------------- | ------------------------------------ |
| `id`               | `id`            | UUID          | PK (`@default(uuid())`)              |
| `roomId`           | `room_id`       | UUID          | FK → `Room.id` (`onDelete: Cascade`) |
| `senderId`         | `sender_id`     | UUID          | FK → `User.id` (`onDelete: Cascade`) |
| `content`          | `content`       | Text / String | Nội dung tin (`@db.Text`)            |
| `createdAt`        | `created_at`    | DateTime      | `@default(now())`                    |


**Không lưu DB (MVP):** typing, presence — chỉ qua Socket.

---

## 2. Quan hệ giữa các bảng & Chính sách xóa (`onDelete`)

- **User–Room** (N-N): qua `RoomMember`; một user nhiều room; một room ≥ 2 thành viên.
- **User–Room** (1-N): qua `Room.createdById` (`createdBy`).
- **Room–Message** (1-N): qua `Message.roomId`.
- **User–Message** (1-N): qua `Message.senderId`.
- **Chính sách xóa (**`onDelete: Cascade`**):**
  - Khi xóa `Room` → tự động xóa `RoomMember` và `Message` thuộc room đó.
  - Khi xóa `User` → tự động xóa `RoomMember`, `Message` của user (thuận tiện khi reset/seed dữ liệu test).

---

## 3. Hướng migrate và seed

### 3.1. Migrate

Dùng **Prisma Migrate** (`npx prisma migrate dev`).

Thứ tự bảng khởi tạo:

1. `users`
2. `rooms` (`created_by_id` → `users.id`)
3. `room_members` (PK `(room_id, user_id)`)
4. `messages`
5. Unique + Index (mục 4)

### 3.2. Seed tài khoản demo (local/test) — đơn giản

Cùng password: `123456`


| Email     | Password | displayName |
| --------- | -------- | ----------- |
| `a@a.com` | `123456` | An          |
| `b@b.com` | `123456` | Bình        |
| `c@c.com` | `123456` | Chi         |


- Hash bằng **bcrypt** trước khi ghi `passwordHash`.  
- Upsert theo email.  
- Chỉ seed **user** (không tạo room / tin sẵn — demo sạch trên UI).  
- Chỉ dùng local/test.

---

## 4. Index, Phân trang lịch sử & Query gợi ý cho BE

### 4.1. Index

- `users(email)` — `@unique`
- `room_members(room_id, user_id)` — `@@id([roomId, userId])` (Composite PK kiêm unique index)
- `room_members(user_id)` — `@@index([userId])` (tối ưu query lấy danh sách room của user)
- `messages(room_id, created_at DESC, id DESC)` — `@@index([roomId, createdAt(sort: Desc), id(sort: Desc)])` (tối ưu lịch sử + cursor)
- `messages(created_at, id)` — `@@unique([createdAt, id])` (cho phép dùng cả Prisma native cursor `createdAt_id` hoặc `WHERE` keyset)

### 4.2. Cursor phân trang tin nhắn (chốt, khớp API)

- Sort: `createdAt DESC`, `id DESC`  
- Cursor = cặp `(createdAt, id)`  
- `limit` mặc định **30**, tối đa **50**  
- Chỉ trả tin nếu user là member của room.
- **Cách query khuyến nghị ở BE (**`GET /rooms/:id/messages`**):**
  ```js
  const messages = await prisma.message.findMany({
    where: {
      roomId,
      ...(cursorDate && cursorId
        ? {
            OR: [
              { createdAt: { lt: cursorDate } },
              { createdAt: cursorDate, id: { lt: cursorId } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
    include: {
      sender: { select: { id: true, email: true, displayName: true } },
    },
  });
  ```

### 4.3. Query danh sách Room kèm tin nhắn mới nhất cho Sidebar (`GET /rooms`)

Để FE hiển thị được **tên phòng/đối phương, tin mới nhất và giờ** trên Sidebar mà không cần thêm cột dư thừa vào bảng `Room`, BE có thể query:

```js
const rooms = await prisma.room.findMany({
  where: {
    members: { some: { userId: currentUserId } },
  },
  include: {
    members: {
      include: {
        user: { select: { id: true, email: true, displayName: true } },
      },
    },
    messages: {
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 1,
      include: {
        sender: { select: { id: true, email: true, displayName: true } },
      },
    },
  },
});
```

---

## 5. Quyết định đã chốt

- [x] DBMS: **PostgreSQL 16**  
- [x] Migration: **Prisma**  
- [x] ID: **UUID** (`@db.Uuid`)  
- [x] `RoomMember`: dùng khóa chính phức hợp `@@id([roomId, userId])`, bỏ cột `id` rời  
- [x] Ánh xạ tên: Prisma dùng `camelCase`, DB dùng `snake_case` qua `@map` / `@@map`  
- [x] Seed demo: bảng mục 3.2  
- [x] Cursor: `(createdAt, id)`, limit 30–50  
- [x] Room một loại; `name` nullable khi chat đôi  
- [x] **Chống trùng chat đôi (MVP):** không tạo trùng room đúng 2 thành viên cho cùng một cặp user — logic ở BE khi `POST /rooms`; room nhóm không áp dụng  
- [x] Chính sách xóa: `onDelete: Cascade` trên các bảng phụ thuộc (`RoomMember`, `Message`)  

Khớp `docs/api-contract.md` và `server/prisma/schema.prisma`.

---

## 6. Database & DevOps — Sprint 2 → 8 (deadline nộp đủ **05/11/2026**)

### Sprint 2 — DB chạy được · **deadline 25/10/2026**

- [x] Viết `server/prisma/schema.prisma` đúng cột mục 1.1  
- [x] `prisma migrate` + `db seed` ([a@a.com](mailto:a@a.com) / [b@b.com](mailto:b@b.com) / [c@c.com](mailto:c@c.com), pass `123456`)  
- [x] `docker compose` Postgres khớp `.env.example`  
- [x] Báo Vân `DATABASE_URL` + cách chạy migrate

### Sprint 3–4 — Hỗ trợ ghép hệ thống · **deadline 28/10/2026**

- [x] Sửa schema nếu BE/FE phát hiện thiếu field (MVP đủ; không thiếu cột)  
- [x] Đảm bảo **index** ổn (members `userId`; messages cursor `(roomId, createdAt, id)`)  
- [x] Seed **chỉ 3 user** demo (`a@a.com` / `b@b.com` / `c@c.com`) — **không** seed room / tin mẫu (demo sạch, tạo room trên UI)  
- [x] Hỗ trợ Vân debug query / migration. (Vân đã test)

### Sprint 5–6 — Ổn định · **deadline 31/10/2026**

- [ ] Seed idempotent (upsert user theo email; chạy lại không lỗi)  
- [ ] Hướng dẫn reset DB local trong README (§10)  
- [ ] (Tuỳ chọn) chính sách xóa user/room nâng cao — chỉ nếu còn thời gian

### Sprint 7 — Docker / README máy sạch · **deadline 02/11/2026**

- [ ] Hoàn thiện README bước chạy (copy `.env`, compose, migrate, seed, FE/BE)  (Vân đã làm vào check fix nếu có lỗi ).
- [ ] Test trên máy sạch / máy thành viên khác  
- [ ] Tạo **khung Word** report (bìa, mục lục, heading) + format  
- [ ] (Tuỳ chọn) đóng gói thêm service app vào compose

### Sprint 8 — Report + Word + tham gia video · **deadline 05/11/2026**

- [ ] Viết phần: thiết kế hệ thống + Database + Deploy/Docker (draft **04/11**)  
- [ ] Nháp kết luận → nhóm review  
- [ ] Gộp bài Vân/Lợi vào Word, xuất PDF — **05/11**  
- [ ] Tham gia video: nói/demo phần DB/Docker (do **Lợi** quay & dựng — Hiền **không** dựng video)  