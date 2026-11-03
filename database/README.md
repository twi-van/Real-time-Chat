# Database — file SQL nộp 

Thư mục này chứa **file SQL đính kèm source** theo yêu cầu môn (tạo cấu trúc + khởi tạo dữ liệu).


| File       | Nội dung                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------- |
| `init.sql` | **File nộp** — DDL (bảng, index, FK) + INSERT 3 user demo (`a@a.com`, `b@b.com`, `c@c.com`) |


**Lưu ý:** Khi chạy app theo README gốc vẫn dùng **Prisma** (`npm run db:migrate` + `npm run db:seed`). SQL ở đây **không thay** Prisma; chỉ để nộp / tham chiếu.