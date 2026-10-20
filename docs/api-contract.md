# API & Socket Contract

**Phụ trách:** Thùy Vân (Backend)  
**Trạng thái:** Đã chốt (Sprint 1) 

**Cách dùng:** Frontend chỉ gọi đúng path/event ghi ở đây. Đổi gì → sửa file trước, rồi mới sửa code.

---

## 1. Danh sách REST


| Method | Path                  | Auth? | Mục đích                              | Request (tóm tắt)                        | Response (tóm tắt)                               |
| ------ | --------------------- | ----- | ------------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| POST   | `/auth/register`      | Không | Đăng ký                               | `email`, `password`, `displayName`       | `user`, `token`                                  |
| POST   | `/auth/login`         | Không | Đăng nhập                             | `email`, `password`                      | `user`, `token`                                  |
| GET    | `/users`              | JWT   | List user (modal Chat mới / Tạo nhóm) | `q?` tuỳ chọn                            | `users[]`: `id`, `displayName`, `email`          |
| GET    | `/rooms`              | JWT   | Room của mình                         | —                                        | `rooms[]` (kèm `members` hoặc đủ để FE hiện tên) |
| POST   | `/rooms`              | JWT   | Tạo room                              | xem note dưới                            | `room`                                           |
| GET    | `/rooms/:id/messages` | JWT   | Lịch sử tin                           | `cursor?`, `limit?` (max 50, default 30) | `messages[]`, `nextCursor?`                      |


**Model room (chốt MVP):** chỉ **một loại room** — không có `type` `DIRECT` / `GROUP`.  
Chat 2 người hay nhiều người đều là room + `memberIds`; khác nhau ở số thành viên.

**`POST /rooms`:**

```json
{ "memberIds": ["id1"] }
```

Ví dụ tạo nhóm:

```json
{ "name": "Nhom demo", "memberIds": ["id1", "id2"] }
```

- Server **tự thêm** current user vào members.  
- `name`: **tuỳ chọn** — chat đôi có thể **không gửi** field này; nhóm (≥ 2 người được mời) thì **bắt buộc** có `name`.  
- **Chốt MVP — chống trùng chat đôi:** nếu `memberIds` chỉ 1 người (cộng mình = 2) và đã tồn tại room **đúng 2 thành viên** là đúng cặp đó → **trả room cũ**, không tạo mới. Room nhóm (≥ 3 thành viên) **không** áp dụng rule này.

**Hoãn MVP:** `POST /rooms/:id/join` (join bằng link) — UI không dùng.

**Cursor tin nhắn:** `(createdAt, id)` — khớp `docs/db_schema.md` (đã chốt).

---



## 2. Danh sách Socket events


| Event             | Hướng        | Người gửi                 | Payload (tóm tắt)                              | dùng khi                |
| ----------------- | ------------ | ------------------------- | ---------------------------------------------- | ----------------------- |
| `join_room`       | C → S        | Client                    | `{ roomId }`                                   | Vào phòng chat          |
| `leave_room`      | C → S        | Client                    | `{ roomId }`                                   | Rời phòng               |
| `send_message`    | C → S        | Client                    | `{ roomId, content }`                          | Gửi tin                 |
| `receive_message` | S → C        | Server                    | `{ id, roomId, content, sender, createdAt }`   | Server đẩy tin cho room |
| `typing`          | C → S → room | Client (server broadcast) | `{ roomId, userId, isTyping }`                 | Đang gõ / hết gõ        |
| `presence`        | S → C        | Server                    | `{ userId, status }` (`online` hoặc `offline`) | Ai online/offline       |


`C` = Client (FE), `S` = Server (BE).

**Luồng gửi tin :**

1. FE đã connect socket (có JWT).
2. FE `emit("join_room", { roomId })`.
3. FE `emit("send_message", { roomId, content })`.
4. BE lưu DB → `emit("receive_message", ...)` tới mọi người trong room (kể cả người gửi nếu cần).

---



## 3. Cách gửi JWT khi connect Socket.io



### Quy ước nhóm

Client kết nối:

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: { token: accessToken }, // accessToken = JWT lấy từ login
});
```

Server (BE): đọc `socket.handshake.auth.token` → verify JWT → đúng thì cho connect, sai/thiếu thì reject (`UNAUTHORIZED`).

---



## 4. Lỗi chính

đặt tên lỗi thống nhất -> FE biết hiện gì (toast / về login).

### REST (HTTP status gợi ý)


| Situation                    | HTTP | Body gợi ý                                          |
| ---------------------------- | ---- | --------------------------------------------------- |
| Sai email/password           | 401  | `{ "error": "UNAUTHORIZED", "message": "..." }`     |
| Thiếu/sai JWT                | 401  | `{ "error": "UNAUTHORIZED" }`                       |
| Không đủ quyền (vd. room lạ) | 403  | `{ "error": "FORBIDDEN" }`                          |
| Sai dữ liệu (thiếu field)    | 400  | `{ "error": "VALIDATION_ERROR", "message": "..." }` |
| Spam / quá nhiều request     | 429  | `{ "error": "RATE_LIMITED" }`                       |




### Socket


| Situation                          | Cách báo                                                        |
| ---------------------------------- | --------------------------------------------------------------- |
| Connect không có / sai JWT         | Không cho connect; FE nhận lỗi `connect_error` / `UNAUTHORIZED` |
| Gửi tin thiếu `roomId` / `content` | Ack hoặc emit lỗi `{ error: "VALIDATION_ERROR" }`               |
| Gửi quá nhanh                      | `{ error: "RATE_LIMITED" }`                                     |
| Chưa join room mà gửi tin          | `{ error: "FORBIDDEN" }`                                        |


FE nên: gặp `UNAUTHORIZED` → xóa token, về màn Login.

---



## 5. Quyết định đã chốt (Sprint 1)

- [x] REST: register, login, `GET /users`, rooms, messages  
- [x] Một loại room — không `type` DIRECT/GROUP  
- [x] `POST /rooms`: `{ name?, memberIds[] }` — server tự thêm current user  
- [x] Chat đôi: `name` có thể trống; nhóm: `name` bắt buộc  
- [x] Chống trùng room đúng 2 thành viên (cùng cặp user)  
- [x] Hoãn `POST /rooms/:id/join` (join link)  
- [x] Cursor tin: `(createdAt, id)` · limit default 30 / max 50  
- [x] Socket: `join_room`, `leave_room`, `send_message`, `receive_message`, `typing`, `presence`  
- [x] JWT qua `auth: { token }` khi connect Socket  
- [x] Lỗi: 400 / 401 / 403 / 429 + mã `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `RATE_LIMITED`  

---



## 6. Backend — Sprint 2 → 8



### Sprint 2 — Auth + chat realtime tối thiểu

- [ ] Init `server/` (Node + JS + Express/Fastify + Socket.io)  
- [ ] `POST /auth/register`, `POST /auth/login` → JWT  
- [ ] Middleware JWT cho REST  
- [ ] Socket connect + verify `auth.token`  
- [ ] `join_room` / `send_message` / `receive_message` (2 client chat được)  
- [ ] Nối Prisma khi Hiền có migrate (hoặc memory tạm rồi thay)



### Sprint 3–4 — Đủ contract + ghép FE

- [ ] `GET /users`, `GET/POST /rooms` (chống trùng chat đôi), `GET .../messages` + cursor  
- [ ] `typing`, `presence`, `leave_room`  
- [ ] Rate limit connect / send_message  
- [ ] Fix theo feedback FE (Lợi)



### Sprint 5–6 — Ổn định MVP

- [ ] Xử lý lỗi đúng mã contract (401/403/400/429)  
- [ ] Test Postman + 2 tab với FE  
- [ ] Polish / bugfix (không ôm optional)



### Sprint 7 — Vận hành

- [ ] Hỗ trợ Hiền: env, port, CORS, proxy WS nếu cần  
- [ ] Kiểm tra chạy theo README trên máy sạch



### Sprint 8 — Report + video

- [ ] Viết phần report: lý thuyết HTTP vs WS + Security (JWT, rate limit) → gửi **Hiền** gộp Word  
- [ ] Tham gia video: nói/demo phần Backend (do **Lợi** quay & dựng)  