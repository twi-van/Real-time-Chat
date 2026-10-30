# Báo Cáo Kiểm Thử Sprint 5–6: Hai Tab & Tính Năng Hoàn Tất

**Dự án:** Real-time Chat (WebSockets & Real-Time Communication)  
**Phụ trách Frontend:** Kim Lợi  
**Thời gian thực hiện:** Sprint 5–6 (29/10 – 31/10/2026)  
**Trạng thái:** Hoàn tất & Sẵn sàng nghiệm thu

---

## 1. Mục Tiêu & Phạm Vi Kiểm Thử

1. **Tải lịch sử bằng Cursor (Scroll Pagination):**
   - API adapter nhận cursor và limit.
   - Khi chọn phòng: tải trang tin nhắn mới nhất (20 tin) và cuộn xuống đáy.
   - Khi cuộn lên đỉnh (`scrollTop <= 30px`) hoặc bấm nút tải tin cũ: kích hoạt `getMessages(activeRoomId, nextCursor, 15)`.
   - Giữ nguyên vị trí cuộn (`scrollHeight` delta calculation) để người dùng không bị giật màn hình khi tin nhắn cũ được chèn lên đầu.
   - Hiển thị spinner/loading trạng thái và thông báo khi đã tải hết lịch sử.

2. **Responsive Mobile & UX:**
   - Chuyển đổi mượt mà giữa danh sách phòng (sidebar) và màn chat trên thiết bị màn hình nhỏ.
   - Nút back (`ArrowLeft`) quay lại danh sách phòng thuận tiện trên mobile.
   - Tránh tràn viền, vỡ layout, bóng đổ và bo góc chuẩn chỉ theo Figma Sprint 1.

3. **Xử lý phiên làm việc & Lỗi 401 (UNAUTHORIZED):**
   - Bắt mã lỗi HTTP `401` từ bất kỳ request REST nào (`/users`, `/rooms`, `/messages`) hoặc lỗi `UNAUTHORIZED` từ Socket.io handshake.
   - Kích hoạt xóa `token`, `currentUser` trong `localStorage`, đưa về màn hình Login và hiển thị Toast thông báo thân thiện.

4. **Kịch bản Kiểm thử Hai Tab (Multi-tab concurrency):**
   - Tab 1: Đăng nhập User A (Kim Lợi).
   - Tab 2: Đăng nhập User B (Thùy Vân).
   - Kiểm tra tương tác Room đôi (1-1) và Room nhóm (Group ≥ 3 members).

---

## 2. Kết Quả Kiểm Thử Chi Tiết

| STT | Kịch bản kiểm thử | Hành động | Kết quả mong đợi | Kết quả thực tế | Đánh giá |
|:---:|:---|:---|:---|:---|:---:|
| **TC-01** | Tải lịch sử ban đầu | Chọn `room-1` có > 30 tin nhắn | Hiển thị 20 tin nhắn mới nhất, cuộn sẵn xuống đáy | Hiển thị đúng 20 tin mới nhất, nút cuộn ở đáy | **PASS** |
| **TC-02** | Cuộn lên tải thêm bằng Cursor | Cuộn lên đầu trang hoặc bấm "↑ Cuộn lên để tải tin cũ hơn" | Gửi request kèm `cursor`, nạp 15 tin cũ hơn lên đầu danh sách, không giật màn hình | Nạp mượt mà 15 tin cũ, giữ đúng vị trí cuộn, hiển thị "Đã tải hết lịch sử" khi `nextCursor = null` | **PASS** |
| **TC-03** | Đón nhận tin nhắn mới khi đang cuộn | Đang xem tin cũ mà có tin mới gửi đến | Nhận tin nhắn, cập nhật preview sidebar, tự động cuộn xuống nếu đang ở gần đáy | Tin mới cập nhật ngay tức thì | **PASS** |
| **TC-04** | Responsive Mobile | Thu nhỏ viewport (< 768px) | Ẩn khung chat, hiện sidebar toàn màn hình; bấm chọn room chuyển sang chat toàn màn hình; bấm Back quay lại sidebar | Hoạt động trơn tru 100%, không bị tràn ngang | **PASS** |
| **TC-05** | Xử lý lỗi 401 REST & Socket | Token hết hạn / API trả về 401 | Tự động đăng xuất, hiện Toast màu tối bo cong sang trọng, chuyển về màn Login | Toast hiển thị 4.5 giây, chuyển ngay về Login | **PASS** |
| **TC-06** | Test 2 Tab - Room Đôi | Tab A gửi tin cho Tab B | Tab B nhận tin thời gian thực, sidebar cập nhật preview tin mới nhất | Tin nhắn đồng bộ tức thì, avatar và tên đối phương chuẩn | **PASS** |
| **TC-07** | Test 2 Tab - Room Nhóm | Tab A gửi tin vào nhóm 3 người | Tab B và các thành viên khác trong nhóm nhận được tin, hiển thị tên và avatar tác giả | Nhận tin chuẩn xác trong room nhóm | **PASS** |
| **TC-08** | Hiển thị Typing & Presence | Tab A đang gõ tin | Tab B hiển thị `... đang soạn tin...` kèm hiệu ứng bounce dot | Typing indicator hiện 2.5s và tự tắt khi ngừng gõ | **PASS** |
| **TC-09** | Chống trùng Room Đôi | Tab A bấm "Chat mới" với User B đã có room | Chuyển thẳng về room đôi đã tồn tại, không tạo room rác | Trả về room cũ chính xác theo Sprint 1 rule | **PASS** |

---

## 3. Bằng Chứng Mã Nguồn Đã Tối Ưu (Polish)

- **`client/src/pages/ChatDashboard.jsx`:**
  - Bổ sung `loadMoreMessages()` với thuật toán delta height:
    ```js
    const addedHeight = container.scrollHeight - prevScrollHeightRef.current;
    container.scrollTop = addedHeight;
    ```
  - Bổ sung `handleScroll` nhận diện `scrollTop <= 30` để tự động load tin nhắn trước đó.
  - Bổ sung UI trạng thái: Spinner đang tải, nút tải tin cũ hơn, và badge "Đã tải hết lịch sử".
  - Giữ vững giao diện Figma: Clean shadow, pill date divider, bo góc mềm mại, bubble tin nhắn tinh tế.
- **`client/src/api.js`:**
  - Mock adapter hỗ trợ đầy đủ `limit` và `cursor` tương thích chuẩn với đặc tả `GET /rooms/:id/messages?cursor=...&limit=...` của Backend.
  - Xử lý `handleUnauthorized()` đồng bộ cho cả REST API và Socket.io `connect_error`.
- **`client/src/hooks/useSocket.js`:**
  - Bắt lỗi xác thực JWT từ socket server, kích hoạt đăng xuất và toast an toàn.

---

## 4. Kết Luận Sprint 5–6

Tất cả các tiêu chí của **Sprint 5–6 (deadline 31/10/2026)** đã hoàn tất:
- [x] Responsive cơ bản, UX lỗi (toast 401 → login)
- [x] Test 2 tab: room đôi + room nhóm
- [x] Fix bug / polish (load lịch sử bằng cursor cuộn lên mượt mà, không ôm media/search thừa)
Sẵn sàng tiến tới **Sprint 7** (Docker hóa và phối hợp cùng Diệu Hiền, Thùy Vân).
