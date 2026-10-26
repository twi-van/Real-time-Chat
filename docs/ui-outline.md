# UI Outline

**Phụ trách:** Kim Lợi (Frontend)

**Trạng thái:** Đã chốt (Sprint 1) — một loại room (không phân DIRECT/GROUP)

**Figma:** [Xem thiết kế giao diện](https://www.figma.com/design/p9CSveBM2QmF7iGfhQ2dz8/Untitled?node-id=0-1&t=aMD0eCyfjNMRCHv7-1)

**MVP UI:** chat theo room thống nhất — có thể 2 người hoặc nhiều người (cùng API tạo room). Không làm Join bằng link.

---

## 1. Các màn hình chính

Ứng dụng gồm 3 màn hình và **2 modal** (cùng gọi `POST /rooms`, khác số người chọn):

### 1.1. Màn hình Đăng nhập (`/login`)

- Ô: Email, Mật khẩu (bật/tắt xem mật khẩu).
- Nút Đăng nhập, link sang Đăng ký, gợi ý tài khoản demo.



### 1.2. Màn hình Đăng ký (`/register`)

- Ô: Tên hiển thị, Email, Mật khẩu, Xác nhận mật khẩu.
- Nút Đăng ký tài khoản, link sang Đăng nhập.



### 1.3. Màn hình Chat chính (`/chat`)

**Sidebar:**

- User hiện tại (avatar, displayName, online, Đăng xuất).
- Nút **Chat mới** → modal chọn 1 người (chat đôi).
- Nút **Tạo nhóm** → modal tên + nhiều người.
- Danh sách room: tên hiển thị, tin mới nhất, giờ, highlight đang chọn.
  - Room đúng 2 member (tính cả mình): hiện tên đối phương.
  - Room nhiều hơn 2 member: hiện `name` nhóm.

**Khung chat:**

- Header: tên (đối phương hoặc tên nhóm), online / số thành viên.
- Vùng tin, typing, ô nhập (Enter gửi, Shift+Enter xuống dòng) + Gửi.



### 1.4. Modal Chat mới (2 người)

- `GET /users` → chọn đúng 1 người.
- Nút Hủy / Bắt đầu chat.
- Gọi API:

```json
{
  "memberIds": ["userIdDuocChon"]
}
```

`POST /rooms` — không gửi `type`; `name` có thể bỏ trống.

- Xong → vào room, `join_room` + tải lịch sử.
- BE chống trùng: nếu đã có room đúng cặp 2 người → API trả room cũ; FE chỉ mở room đó.



### 1.5. Modal Tạo nhóm (từ 3 người kể cả mình)

- Ô Tên nhóm (bắt buộc).
- `GET /users` → checkbox nhiều người.
- Gọi API:

```json
{
  "name": "TenNhom",
  "memberIds": ["id1", "id2"]
}
```

`POST /rooms` — xong → vào room như trên.

---



## 2. Luồng người dùng

```text
[Mở Web]
   |-- Chưa token --> Login/Register --> JWT
   +-- Có token ------------------------+
                                        v
                            [Socket.io + JWT]
                                        v
                            [Màn Chat]
           +-------------+-------------+------------+
           v             v             v            v
    [Chọn room]   [Chat mới]    [Tạo nhóm]   [Đăng xuất]
           |             |             |
           |      POST /rooms   POST /rooms
           |      (1 memberId)  (name + nhieu)
           v             +------+------+
    [messages + join]           v
    [Chat realtime] <---- [Vào room]
```

1. Login/Register → JWT → `/chat`.
2. Nối socket với token.
3. Tạo room: Chat mới (1 người) hoặc Tạo nhóm (tên + nhiều) — cùng `POST /rooms`.
4. Chọn room → lịch sử + `join_room`.
5. Realtime: `typing`, `send_message`, `receive_message`.
6. Đăng xuất: xóa token + disconnect.

**Không làm MVP:** Join room bằng mã/link.

---



## 3. Typing và Online

- **Typing:** trên ô nhập — "Ten đang soạn tin..." (khoảng 2.5s tắt).
- **Presence:** chấm sidebar; header online (room 2 người) hoặc số thành viên (nhóm).

---



## 4. State API / Socket



### REST


| State                      | Endpoint                                  | UI                           |
| -------------------------- | ----------------------------------------- | ---------------------------- |
| `currentUser`, `token`     | `POST /auth/login`, `POST /auth/register` | Phiên đăng nhập              |
| `users[]`                  | `GET /users`                              | Hai modal chọn người         |
| `rooms[]`                  | `GET /rooms`                              | Sidebar (mọi room cùng loại) |
| `newRoom`                  | `POST /rooms`                             | Tạo room (2 người hoặc nhóm) |
| `messages[]`, `nextCursor` | `GET /rooms/:id/messages`                 | Lịch sử                      |




### Socket


| Event                              | UI             |
| ---------------------------------- | -------------- |
| `join_room` / `leave_room`         | Đổi phòng      |
| `send_message` / `receive_message` | Gửi / nhận tin |
| `typing`                           | Đang soạn      |
| `presence`                         | Online/offline |


---



## 5. Quyết định đã chốt (Sprint 1)

- [x] Một loại room — không DIRECT / GROUP
- [x] 3 màn: Login, Register, Chat
- [x] 2 modal: Chat mới (1 người) + Tạo nhóm (tên + nhiều người)
- [x] Cùng `POST /rooms` — khác số `memberIds` / có `name` hay không
- [x] Sidebar: 2 member → tên đối phương; hơn 2 → tên nhóm
- [x] Gọi `GET /users` trong 2 modal
- [x] BE chống trùng chat đôi → FE mở room trả về
- [x] Typing + presence trên UI
- [x] Không làm Join bằng link trong MVP
- [x] Bám `docs/api-contract.md`
- [x] Cập nhật Figma cho khớp 2 nút (Chat mới + Tạo nhóm)

---



## 6. Frontend — Sprint 2 đến 8 (deadline nộp đủ **05/11/2026**)



### Sprint 2 — Skeleton UI + auth + socket · **deadline 25/10/2026**

- [x] Init Vite React JS + Tailwind trong `client/`
- [x] Màn Login / Register (gọi API hoặc mock tạm)
- [x] Layout Chat (sidebar + khung tin)
- [x] `useSocket`: connect JWT, `join_room`, gửi/nhận tin
- [x] Figma khớp 2 nút (đã chốt Sprint 1)



### Sprint 3–4 — Đủ MVP UI · **deadline 28/10/2026**

- [x] Modal Chat mới + Tạo nhóm (`GET /users`, `POST /rooms`)
- [x] Sidebar: tên đối phương / tên nhóm; preview tin
- [x] Typing indicator + online/offline
- [x] Load lịch sử + cursor (cuộn lên)
- [x] Đăng xuất (xóa token + disconnect)
- [x] Nối BE thật, bỏ mock



### Sprint 5–6 — Ổn định MVP · **deadline 31/10/2026**

- [ ] Responsive cơ bản, UX lỗi (toast 401 → login) 
- [ ] Test 2 tab: room đôi + room nhóm
- [ ] Fix bug / polish (không ôm media/search)



### Sprint 7 — Demo sẵn sàng · **deadline 02/11/2026**

- [ ] Chạy theo README cùng Hiền/Vân
- [ ] Chuẩn bị tài khoản demo trên UI



### Sprint 8 — Report + video · **deadline 05/11/2026**

- [ ] Viết report: so sánh WS vs SSE/Long Polling + Implementation Frontend → gửi **Hiền** trước **04/11**
- [ ] Quay và dựng video tối đa 20 phút (chủ trì): có tiếng, đủ 3 thành viên — xong trước **05/11**
- [ ] Demo UI trên video + ghép phần Vân/Hiền