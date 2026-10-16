# API & Socket Contract

**Phụ trách:** Thùy Vân (Backend)  
**Trạng thái:** Bản nháp mẫu — chỉnh rồi tick checklist + báo nhóm sync  

**Cách dùng file này:** đây là “menu” chung. **Frontend** chỉ gọi đúng path/event ghi ở đây. Đổi gì → sửa file trước, rồi mới sửa code.  

---

## 1. Danh sách REST


| Method | Path                  | Auth? | Mục đích          | Request (tóm tắt)                                    | Response (tóm tắt)          |
| ------ | --------------------- | ----- | ----------------- | ---------------------------------------------------- | --------------------------- |
| POST   | `/auth/register`      | Không | Đăng ký           | `email`, `password`, `displayName`                   | `user`, `token`             |
| POST   | `/auth/login`         | Không | Đăng nhập         | `email`, `password`                                  | `user`, `token`             |
| GET    | `/rooms`              | JWT   | Lấy room của mình | —                                                    | `rooms[]`                   |
| POST   | `/rooms`              | JWT   | Tạo room          | `name`, `type` (`GROUP` hoặc `DIRECT`), `memberIds?` | `room`                      |
| POST   | `/rooms/:id/join`     | JWT   | Vào room          | —                                                    | `room` / ok                 |
| GET    | `/rooms/:id/messages` | JWT   | Lịch sử tin       | query: `cursor?`, `limit?`                           | `messages[]`, `nextCursor?` |


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

