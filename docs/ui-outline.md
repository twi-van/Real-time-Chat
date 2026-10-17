# UI Outline

**Phụ trách:** Kim Lợi (Frontend)
🔗 **Figma:** [Xem thiết kế giao diện](https://www.figma.com/design/p9CSveBM2QmF7iGfhQ2dz8/Untitled?node-id=0-1&t=aMD0eCyfjNMRCHv7-1)

---

## 1. Các màn hình chính

Ứng dụng gồm 3 màn hình và 1 modal:

### 1.1. Màn hình Đăng nhập (`/login`)
- **Card đăng nhập:**
  - Ô nhập: `Email`, `Mật khẩu` (có nút bật/tắt xem mật khẩu).
  - Nút bấm: `Đăng nhập`.
  - Link: Chuyển sang trang Đăng ký.
  - Gợi ý tài khoản demo để test nhanh.

### 1.2. Màn hình Đăng ký (`/register`)
- **Card đăng ký:**
  - Ô nhập: `Tên hiển thị` (displayName), `Email`, `Mật khẩu`, `Xác nhận mật khẩu`.
  - Nút bấm: `Đăng ký tài khoản`.
  - Link: Chuyển sang trang Đăng nhập.

### 1.3. Màn hình Chat chính (`/chat`)
Bố cục chia 2 phần:
- **Cột trái (Sidebar):**
  - Thông tin user đang đăng nhập (Avatar, tên hiển thị, trạng thái online, nút Đăng xuất).
  - Nút `+ Tạo nhóm mới`.
  - Danh sách cuộc trò chuyện: gồm cả chat 1-1 và phòng nhóm (hiển thị tên, tin nhắn mới nhất, giờ gửi, highlight phòng đang chọn).
- **Khung chat (Bên phải):**
  - **Header:** Tên người chat/tên nhóm, trạng thái hoạt động (`Online` / số thành viên).
  - **Vùng tin nhắn:** Hiển thị lịch sử chat, tin nhắn của mình (bên phải), tin nhắn người khác (bên trái kèm tên và giờ), tự cuộn xuống đáy khi có tin mới.
  - **Khu vực Typing:** Hiển thị thông báo khi có người đang gõ phím.
  - **Thanh nhập tin:** Ô nhập văn bản (Enter để gửi, Shift+Enter xuống dòng) và nút Gửi.

### 1.4. Modal Tạo nhóm mới
- Popup mở khi bấm `+ Tạo nhóm mới` ở Sidebar:
  - Ô nhập: `Tên nhóm`.
  - Danh sách chọn thành viên (checkbox nhiều người).
  - Nút `Hủy` và nút `Tạo nhóm`.

---

## 2. Luồng người dùng (User Flow)

```text
[Mở Web] 
   │
   ├── Chưa có token ─────────► [Đăng ký / Đăng nhập] ──(Thành công)──┐
   └── Đã lưu token (hợp lệ) ─────────────────────────────────────────┤
                                                                      ▼
                                                      [Kết nối Socket.io với Token]
                                                                      │
                                                                      ▼
                                                      [Vào màn hình Chat chính]
                                                                      │
                                   ┌──────────────────────────────────┴──────────────────────────────────┐
                                   ▼                                                                     ▼
                         [Chọn phòng chat / nhóm]                                              [Bấm + Tạo nhóm mới]
                                   │                                                                     │
                                   ▼                                                                     ▼
                    [Tải lịch sử tin & Join room Socket]                                       [Mở modal chọn thành viên]
                                   │                                                                     │
                                   ▼                                                                     ▼
                      [Nhập tin nhắn & Chat realtime]                                          [Tạo nhóm & vào chat ngay]
```

1. **Đăng nhập / Đăng ký:** User nhập thông tin -> gọi API nhận JWT token -> lưu token vào trình duyệt.
2. **Khởi tạo kết nối:** Dùng token để kết nối WebSocket (Socket.io handshake).
3. **Chọn Room:** User bấm chọn 1 cuộc trò chuyện ở Sidebar -> tải tin nhắn cũ từ API -> gửi event `join_room` lên socket.
4. **Chat realtime:**
   - Gõ phím -> gửi event `typing` báo cho đối phương.
   - Nhấn gửi -> gửi event `send_message` -> server phát `receive_message` cho cả phòng cùng thấy ngay.

---

## 3. Chỗ hiển thị Typing & Trạng thái Online

### 3.1. Typing Indicator (Đang gõ phím)
- **Vị trí:** Nằm ngay phía trên thanh nhập tin nhắn của khung chat.
- **Cách hiển thị:** Dòng chữ kèm hoạt họa ba chấm: `💬 [Tên người dùng] đang soạn tin...`
- **Hành vi:**
  - Tự động hiện khi người bên kia đang gõ.
  - Tự động biến mất sau 2.5 giây khi người đó dừng gõ hoặc khi tin nhắn đã được gửi.

### 3.2. Trạng thái Online / Offline (Presence)
- **Vị trí hiển thị:**
  - **Tại Sidebar:** Chấm tròn xanh lá (`●`) trên Avatar của mỗi người trong danh sách chat 1-1.
  - **Tại Header khung chat:** Dòng chữ `● Đang hoạt động` (khi chat 1-1) hoặc hiển thị số người trực tuyến (khi chat nhóm).
- **Hành vi:** Server bắn event `presence` khi có người kết nối hoặc ngắt kết nối -> giao diện cập nhật ngay lập tức mà không cần reload.

---

## 4. State cần từ REST API và Socket.io

### 4.1. Dữ liệu từ REST API (Tải ban đầu & Lưu trữ)
| Dữ liệu (State) | Endpoint API | Mục đích trên giao diện |
| :--- | :--- | :--- |
| `currentUser`, `token` | `POST /auth/login`<br>`POST /auth/register` | Lưu phiên đăng nhập và định danh user. |
| `rooms[]` | `GET /rooms` | Hiển thị danh sách hội thoại ở Sidebar. |
| `newRoom` | `POST /rooms` | Tạo phòng nhóm hoặc khởi tạo chat 1-1 mới. |
| `messages[]`, `nextCursor` | `GET /rooms/:id/messages` | Hiển thị lịch sử tin nhắn khi vừa vào phòng; cuộn lên để tải tin cũ hơn. |

### 4.2. Dữ liệu từ Socket.io Events (Thời gian thực)
| Tên Event | Dữ liệu nhận / gửi | Cập nhật trên giao diện |
| :--- | :--- | :--- |
| `join_room` / `leave_room` | `{ roomId }` | Chuyển phòng chat mà không tải lại trang. |
| `send_message` | `{ roomId, content }` | Gửi nội dung tin nhắn tức thì lên server. |
| `receive_message` | `{ id, roomId, content, sender, createdAt }` | Nhận tin nhắn mới -> thêm ngay vào khung chat và cập nhật dòng xem trước ở Sidebar. |
| `typing` | `{ roomId, userId, isTyping }` | Bật/tắt dòng chữ *"Đang soạn tin nhắn..."*. |
| `presence` | `{ userId, status }` | Đổi màu chấm xanh/xám (online/offline) của user. |
