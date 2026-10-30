# Hướng Dẫn Chạy Client (Frontend)

**Dành cho:** Hiền và Vân — kiểm tra giao diện kết hợp backend  
**Phụ trách FE:** Kim Lợi

---

## Yêu cầu trước khi chạy

- Node.js `>= 20.x` (kiểm tra: `node -v`)
- Backend đã chạy tại `http://localhost:4000` (xem `server/README.md` hoặc `README.md` gốc)
- PostgreSQL đã chạy qua Docker (`docker compose up -d`)
- Đã seed dữ liệu (`cd server && npm run db:seed`)

---

## Các bước chạy

```powershell
# 1. Vào thư mục client (từ root repo)
cd client

# 2. Tạo file .env từ mẫu (chỉ cần làm 1 lần)
Copy-Item .env.example .env

# 3. Cài thư viện (chỉ cần làm 1 lần hoặc khi có thay đổi package.json)
npm install

# 4. Khởi chạy dev server
npm run dev
```

Mở trình duyệt tại: **http://localhost:5173**

---

## Kiểm thử 2 tab (Sprint 5–6)

1. Mở tab 1 → đăng nhập `a@a.com` / `123456` (user **An**)
2. Mở tab 2 (hoặc cửa sổ ẩn danh) → đăng nhập `b@b.com` / `123456` (user **Bình**)
3. Tab 1: bấm **Chat mới** → chọn Bình → **Bắt đầu chat**
4. Gửi tin từ tab 1 → tab 2 nhận realtime ✅
5. Thử gõ → xem **typing indicator** ở tab kia ✅
6. Tạo nhóm 3 người: bấm **Tạo nhóm** → đặt tên → chọn Bình + Chi ✅

---

## Chạy độc lập khi BE chưa online

FE tự động **fallback sang mock data** khi backend chưa chạy:

- Đăng nhập bất kỳ email (ưu tiên `a@a.com`)
- Xem đầy đủ giao diện: sidebar rooms, tin nhắn, typing, modal tạo phòng
- Gửi tin → mock tự tạo phản hồi sau 1.5 giây (chế độ demo)

> ⚠️ Khi BE online, **tự động dùng BE thật** — không cần thay đổi gì.

---

## Cổng & Biến môi trường

| Biến | Giá trị mặc định |
|------|-----------------|
| `VITE_API_URL` | `http://localhost:4000` |
| `VITE_SOCKET_URL` | `http://localhost:4000` |
| `VITE_PORT` | `5173` |

---

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|-----|------------|-----------|
| Trang trắng / lỗi CORS | BE chưa chạy hoặc CORS chưa cấu hình | Kiểm tra `CLIENT_ORIGIN` trong `server/.env` |
| Socket không kết nối | Token JWT hết hạn hoặc server reject | Đăng xuất → đăng nhập lại |
| Không thấy room | DB chưa seed | `cd server && npm run db:seed` |
| Port 5173 bị chiếm | Có app khác dùng cổng | Đổi `VITE_PORT=5174` trong `client/.env` |
