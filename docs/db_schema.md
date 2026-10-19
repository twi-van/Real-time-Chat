# Database Schema

**Phụ trách:** Diệu Hiền (Database & DevOps)  
**Trạng thái:** TODO — viết và chốt với nhóm trong tuần 1  

## 1. Thực thể chính
- **User**: thông tin tài khoản người dùng.
- **Room**: phòng chat, gồm `DIRECT` (trò chuyện 1:1) hoặc `GROUP` (trò chuyện nhóm).
- **RoomMember**: bảng trung gian lưu thành viên của phòng.
- **Message**: tin nhắn được gửi trong phòng.

## 2. Quan hệ giữa các bảng
- **User–User** (1:1): hai người dùng có thể trò chuyện riêng 1:1 thông qua một phòng `DIRECT`; phòng này thường có hai thành viên trong `RoomMember`.
- **User–Room**(N-N): quan hệ nhiều-nhiều thông qua `RoomMember`; một người dùng có thể tham gia nhiều phòng.
- **Room–Message** (1-N): một phòng có thể chứa nhiều tin nhắn.
- **User–Message** (1-N): một người dùng có thể gửi nhiều tin nhắn.
- `RoomMember` tham chiếu `User` và `Room` bằng khóa ngoại; cặp (`room_id`, `user_id`) cần duy nhất.

## 3. Hướng migrate và seed tài khoản demo
### 3.1 Hướng migrate
**Đề xuất:** dùng migration có phiên bản (ví dụ Alembic nếu backend Python + SQLAlchemy, hoặc công cụ migration tương ứng với stack thực tế).

Thứ tự migration ban đầu:

1. Tạo bảng `users`.
2. Tạo bảng `rooms`, với `created_by_id` tham chiếu `users.id`.
3. Tạo bảng `room_members`, tham chiếu `users.id` và `rooms.id`.
4. Tạo bảng `messages`, tham chiếu `rooms.id` và `users.id`.
5. Tạo unique constraint và các index được liệt kê trong mục Indexes.
6. Kiểm tra migration trên database phát triển trước khi áp dụng vào môi trường dùng chung
- Hai tài liệu đầu vào chưa quy định DBMS, công cụ migration hoặc thông tin tài khoản demo; nhóm cần thống nhất các lựa chọn này.

### 3.2 Seed tài khoản demo
- Tạo tài khoản qua seed script hoặc luồng đăng ký, không chèn mật khẩu dạng plaintext.
- Băm mật khẩu bằng Argon2id hoặc bcrypt trước khi lưu `password_hash`.
- Dùng thao tác upsert hoặc kiểm tra email đã tồn tại để seed chạy lặp lại không tạo tài khoản trùng.
- Có thể tạo một số phòng và bản ghi thành viên mẫu để kiểm thử danh sách phòng, chat 1-1 và chat nhóm.
- Không dùng thông tin đăng nhập demo yếu hoặc cố định trong production; không commit bí mật thật vào repository.
**Quy tắc seed:** chỉ seed dữ liệu mẫu ở môi trường local/test. Không ghi mật khẩu demo vào log.

## 4. Ghi chú index và phân trang lịch sử
- `users.email`: unique index để hỗ trợ đăng nhập và ngăn email trùng.
- `room_members(room_id, user_id)`: unique composite index để ngăn thành viên bị thêm trùng trong một phòng.
- `room_members(user_id, room_id)`: index hỗ trợ truy vấn danh sách phòng của người dùng.
- `messages(room_id, created_at, id)`: composite index hỗ trợ tải lịch sử tin nhắn theo phòng và phân trang.
- API có `cursor` và `limit`, nhưng hai tài liệu chưa quy định định dạng cursor. Có thể dùng cặp (`created_at`, `id`) để phân trang ổn định.
- Backend cần giới hạn `limit`, xác thực cursor và kiểm tra quyền truy cập phòng trước khi trả lịch sử.

**Quy tắc phân trang đề xuất:**
- Sắp xếp tin nhắn theo created_at DESC, id DESC.
- Dùng cặp (created_at, id) làm cursor để xử lý trường hợp nhiều tin nhắn có cùng thời điểm.
- Giới hạn giá trị limit để tránh truy vấn quá nhiều dữ liệu.
- Kiểm tra quyền thành viên trước khi trả lịch sử tin nhắn.

## 5. Các quyết định cần nhóm xác nhận

- [ ] DBMS chính thức: PostgreSQL, MySQL hay SQLite.
- [ ] Kiểu ID: số tự tăng hay UUID.
- [ ] Công cụ migration phù hợp với backend thực tế.
- [ ] Thông tin và cách cấp tài khoản demo.
- [ ] Định dạng cursor, thứ tự tin nhắn và giới hạn `limit`.
- [ ] Chính sách xóa user/room và lưu giữ lịch sử tin nhắn.
- [ ] Quy tắc đảm bảo không tạo nhiều phòng `DIRECT` trùng cho cùng một cặp người dùng, nếu sản phẩm yêu cầu.

> Khớp với contract API của Backend trước khi `prisma migrate`.  
