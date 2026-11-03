# Database — file SQL nộp (Diệu Hiền)

Thư mục này chứa **file SQL đính kèm source** theo yêu cầu môn (tạo cấu trúc + khởi tạo dữ liệu).

| File | Nội dung Hiền cần viết |
| ---- | ---------------------- |
| `schema.sql` | DDL — bảng, index, FK (tham chiếu `server/prisma/migrations/.../migration.sql`) |
| `seed.sql` | DML — INSERT 3 user demo (`a@a.com`, `b@b.com`, `c@c.com`) |
| `init.sql` | Gộp schema + seed — **file chính để nộp** |

**Lưu ý:** Khi chạy app theo README gốc vẫn dùng **Prisma** (`npm run db:migrate` + `npm run db:seed`). SQL ở đây **không thay** Prisma; chỉ để nộp / tham chiếu.
