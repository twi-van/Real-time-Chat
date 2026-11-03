# UI Outline

**Phụ trách:** Kim Lợi (Frontend)

**Trạng thái:** Đã chốt (Sprint 1) — một loại room (không phân DIRECT/GROUP)

**Figma:** [Xem thiết kế giao diện](https://www.figma.com/design/p9CSveBM2QmF7iGfhQ2dz8/Untitled?node-id=0-1&t=aMD0eCyfjNMRCHv7-1)

**MVP UI:** chat theo room thống nhất — có thể 2 người hoặc nhiều người (cùng API tạo room). Không làm Join bằng link.

---

## 1. Các màn hình chính

Ứng dụng gồm 3 màn hình và **2 modal** (cùng gọi `POST /rooms`, khác số người chọn):

### 1.1. Màn hình Đăng nhập (`/login`)

- Ô nhập: Email, Mật khẩu (bật/tắt xem mật khẩu).
- Nút Đăng nhập, link chuyển sang Đăng ký, gợi ý danh sách tài khoản demo (nhấp để tự điền).
- Validation: kiểm tra email hợp lệ và mật khẩu không để trống.

### 1.2. Màn hình Đăng ký (`/register`)

- Ô nhập: Tên hiển thị (`displayName`), Email, Mật khẩu (tối thiểu 6 ký tự), Xác nhận mật khẩu.
- Validation: kiểm tra mật khẩu xác nhận trùng khớp, cảnh báo lỗi trực quan dưới form.
- Nút Đăng ký tài khoản, link chuyển sang Đăng nhập.

### 1.3. Màn hình Chat chính (`/chat`)

**Sidebar (Cột bên trái):**

- User hiện tại: Avatar, `displayName`, chấm xanh online, nút Đăng xuất.
- Nút **+ Chat mới** → mở modal chọn 1 người (chat đôi).
- Nút **+ Tạo nhóm** → mở modal đặt tên nhóm + chọn nhiều người.
- Danh sách room:
  - Tên hiển thị: Room đúng 2 thành viên (tính cả mình) hiện tên đối phương; Room từ 3 thành viên trở lên hiện tên nhóm (`name`).
  - Preview tin nhắn mới nhất (`lastMessage`), mốc thời gian gửi (`createdAt`), highlight phòng đang chọn.
  - Tự động cập nhật `lastMessage` và đưa phòng có tin mới lên đầu danh sách khi có sự kiện `receive_message`.

**Khung chat (Phân vùng bên phải):**

- Header: Tên phòng (đối phương hoặc tên nhóm), trạng thái online / số lượng thành viên.
- Vùng tin nhắn:
  - Phân trang bằng Cursor (`cursor`, `limit`), cuộn lên đỉnh (`scrollTop <= 30`) để tải thêm tin cũ.
  - Thuật toán Delta Scroll Height giữ nguyên vị trí góc nhìn của người dùng, không bị giật màn hình khi tin cũ chèn lên đầu.
  - Lọc trùng tin nhắn (dedupe theo `id`) để người gửi không bị trùng lặp tin khi nhận lại `receive_message`.
- Vùng soạn thảo:
  - Typing indicator: Hiển thị tên người đang soạn tin ("An đang soạn tin..." hoặc "An, Bình đang soạn tin...") kèm 3 chấm nảy sinh động.
  - Ô nhập liệu: Nhấn `Enter` để gửi tin, `Shift + Enter` để xuống dòng. Giới hạn độ dài tin nhắn (tối đa 5000 ký tự khớp validation của Backend).
  - Gửi sự kiện `typing`: Gửi `isTyping: true` khi gõ phím, tự động gửi `isTyping: false` sau 2.5 giây ngừng gõ, khi bấm gửi tin hoặc khi chuyển phòng khác.

### 1.4. Modal Chat mới (2 người)

- `GET /users` → hiển thị danh sách người dùng trong hệ thống (trừ bản thân), chọn đúng 1 người.
- Nút Hủy / Bắt đầu chat.
- Gọi API: `POST /rooms`
```json
{
  "memberIds": ["userIdDuocChon"]
}
```
*(Không gửi `type`; `name` có thể bỏ trống).*
- Sau khi tạo thành công → tự động mở phòng, `join_room` và tải lịch sử tin nhắn.
- Cơ chế chống trùng chat đôi của Backend: nếu đã tồn tại room đúng 2 người giữa cặp này → API trả về room cũ; Frontend chỉ việc mở phòng đó, không tạo phòng rác.

### 1.5. Modal Tạo nhóm (từ 3 người kể cả mình)

- Ô Tên nhóm (`name` — bắt buộc, tối thiểu 1 ký tự).
- `GET /users` → checkbox chọn nhiều người (ít nhất 2 người khác để cùng mình thành nhóm $\ge 3$ thành viên).
- Gọi API: `POST /rooms`
```json
{
  "name": "Tên Nhóm",
  "memberIds": ["id1", "id2"]
}
```
- Sau khi tạo thành công → tự động mở phòng nhóm mới, kích hoạt socket và đưa lên đầu danh sách.

---

## 2. Luồng người dùng & Quản lý phiên (Session & Route Guard)

```text
[Mở Web]
   |-- Chưa có token --> Chặn vào /chat, điều hướng sang /login hoặc /register
   +-- Đã có token -------------------------------------------------------------+
                                                                                v
                                                                    [Socket.io + JWT Handshake]
                                                                                v
                                                                            [Màn Chat]
                    +-------------------+-------------------+-------------------+
                    v                   v                   v                   v
               [Chọn room]         [Chat mới]          [Tạo nhóm]          [Đăng xuất]
                    |                   |                   |                   |
                    |              POST /rooms         POST /rooms         Xóa token/user
                    |              (1 memberId)       (name + nhiều)       Disconnect socket
                    v                   +-------------------+                   v
           [messages + join_room]                 v                          Về /login
                    |                       [Vào room mới]
                    v
            [Chat realtime]
```

### Quản lý phiên làm việc & Route Guard:
- Do API Contract không có endpoint `GET /auth/me`, Frontend lưu trữ đồng thời cả `chat_token` (JWT) và `chat_user` (JSON thông tin user: `id`, `displayName`, `email`) trong `localStorage`.
- **Route Guard**:
  - Nếu chưa có `token` hoặc `user` trong storage $\rightarrow$ Tự động chuyển hướng về màn hình `/login`.
  - Nếu đã có `token` hợp lệ $\rightarrow$ Tự động vào thẳng giao diện `/chat`.
  - Khi người dùng bấm **Đăng xuất** $\rightarrow$ Xóa toàn bộ `chat_token`, `chat_user`, gọi `socket.disconnect()` và đưa về màn hình `/login`.

---

## 3. Typing và Trạng thái Trực tuyến (Presence)

- **Typing Indicator**:
  - Khi nhận event Socket `typing` (`{ roomId, userId, isTyping }`), Frontend tra cứu `displayName` của người gõ từ danh sách `room.members`.
  - Nếu có 1 người gõ: `"Tên đang soạn tin..."`.
  - Nếu có từ 2 người gõ cùng lúc: `"Tên 1, Tên 2 đang soạn tin..."`.
  - Tự động hủy trạng thái typing sau 2.5 – 3 giây hoặc khi người đó gửi tin / chuyển phòng.
- **Presence (Online / Offline)**:
  - Lắng nghe event Socket `presence` (`{ userId, status: 'online' | 'offline' }`).
  - Cập nhật chấm tròn xanh hiển thị trạng thái của đối phương trên Sidebar và Header khung chat.

---

## 4. Xử lý Lỗi Giao diện & Kết nối (UI Error Handling)

Bảng quy ước bắt mã lỗi và phản hồi giao diện người dùng:

| Tình huống / Mã lỗi | Nguồn phát sinh | Hành vi xử lý trên giao diện (UI) |
|---|---|---|
| **401 UNAUTHORIZED** | REST API hoặc Socket `connect_error` | Xóa sạch `chat_token`, `chat_user` trong storage, điều hướng về `/login` và hiển thị Toast màu tối: *"Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."* (tự tắt sau 4.5s). |
| **400 VALIDATION_ERROR** | Form đăng ký hoặc gửi tin nhắn | Hiển thị thông báo lỗi trực tiếp dưới ô nhập liệu hoặc Toast: *"Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."* |
| **403 FORBIDDEN** | Gửi tin nhắn khi chưa join phòng | Hiển thị Toast cảnh báo: *"Bạn không có quyền gửi tin nhắn trong phòng này."*, tự động thử phát lại `join_room`. |
| **429 RATE_LIMITED** | Gửi tin nhắn quá nhanh | Hiển thị Toast: *"Bạn gửi quá nhanh. Vui lòng thử lại sau."*, tạm thời khóa nút Gửi trong giây lát. |
| **Network Error / BE tắt** | Fetch API bị lỗi kết nối | Hiển thị thông báo: *"Không kết nối được máy chủ. Hãy chạy Backend (cổng 4000)."* |
| **Socket Disconnected** | Mất mạng hoặc rớt kết nối Socket | `isConnected = false`, nút gửi tin cảnh báo *"Mất kết nối máy chủ"*, tự động thử kết nối lại (`reconnectionAttempts: 5`). Khi có mạng lại, tự động phát `join_room` lại phòng hiện tại. |

---

## 5. State Quản lý (REST & Socket)

### REST Endpoints:
- `POST /auth/login`, `POST /auth/register`: Cấp phát JWT và thông tin tài khoản.
- `GET /users`: Lấy danh sách người dùng cho 2 modal.
- `GET /rooms`: Tải danh sách phòng của người dùng kèm tin nhắn mới nhất.
- `POST /rooms`: Khởi tạo phòng chat đôi hoặc phòng nhóm.
- `GET /rooms/:id/messages?cursor=...&limit=...`: Tải lịch sử tin nhắn theo con trỏ thời gian.

### Socket Events:
- `join_room` / `leave_room`: Vào / rời kênh nhận tin thời gian thực của phòng.
- `send_message` / `receive_message`: Phát / nhận tin nhắn thời gian thực.
- `typing`: Đồng bộ trạng thái gõ phím.
- `presence`: Đồng bộ trạng thái trực tuyến của các thành viên.

---

## 6. Lịch sử Triển khai Frontend theo Sprint

### Sprint 2 — Skeleton UI + auth + socket (Hoàn tất 25/10/2026)
- [x] Khởi tạo dự án Vite React JS + Tailwind CSS trong thư mục `client/`
- [x] Màn hình Login / Register
- [x] Bố cục Split-view Chat (Sidebar + Khung tin nhắn)
- [x] Hook `useSocket`: kết nối JWT handshake, `join_room`, gửi/nhận tin
- [x] Figma chuẩn hóa 2 nút (+ Chat mới và + Tạo nhóm)

### Sprint 3–4 — Đủ MVP UI & Nối Backend thật (Hoàn tất 28/10/2026)
- [x] Modal Chat mới + Tạo nhóm (`GET /users`, `POST /rooms`)
- [x] Sidebar hiển thị tên đối phương / tên nhóm; xem trước tin mới nhất
- [x] Typing indicator + chấm xanh online/offline
- [x] Tải lịch sử tin nhắn ban đầu + cursor pagination
- [x] Đăng xuất (xóa token/user + disconnect socket)
- [x] Nối Backend thật hoàn toàn (đã gỡ bỏ toàn bộ mock data cũ)

### Sprint 5–6 — Ổn định MVP (Hoàn tất 31/10/2026)
- [x] Responsive giao diện Mobile (< 768px), chuyển đổi mượt mà giữa Sidebar và Khung chat qua nút Back
- [x] Xử lý lỗi tập trung: bắt lỗi 401 UNAUTHORIZED, 400, 403, 429 và thông báo Toast
- [x] Kiểm thử kịch bản 2 tab: chat 1-1 và chat nhóm thời gian thực
- [x] Tối ưu thuật toán cuộn không giật (Delta Scroll Height) khi tải tin cũ

### Sprint 7 — Demo sẵn sàng & Chạy máy sạch (Hoàn tất 02/11/2026)
- [x] Đồng bộ tài khoản demo trên giao diện (`An`, `Bình`, `Chi`) khớp với seed PostgreSQL của Backend
- [x] Viết tài liệu `client/README.md` và `client/HUONG_DAN_CHAY.md` phục vụ nghiệm thu
- [x] Kiểm tra tương thích cổng `5173` (Frontend), `4000` (Backend) và biến môi trường qua `vite.config.js`

### Sprint 8 — Báo cáo & Video (Hạn nộp 05/11/2026)
- [x] Hoàn thành nội dung báo cáo Word phần Frontend: So sánh giải pháp Real-time (Chương 3) & Implementation Frontend (Chương 5, 6)
- [ ] Tham gia ghi hình và dựng video demo (chủ trì: Lợi) trước ngày 05/11
