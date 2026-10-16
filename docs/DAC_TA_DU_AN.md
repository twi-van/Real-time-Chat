# ĐẶC TẢ DỰ ÁN

**Loại tài liệu:** Đặc tả mức quản lý dự án (kickoff) — **không** thay thế thiết kế kỹ thuật chi tiết.  
**Môn học:** Web Programming & Applications (503073)  
**Học kỳ:** I — Năm học 2026–2027  
**Đề tài:** Topic 9 — WebSockets and Real-Time Communication  
**Sản phẩm:** Real-time Chat Application  


| Họ tên    | Vai trò           |
| --------- | ----------------- |
| Thùy Vân  | Backend           |
| Kim Lợi   | Frontend          |
| Diệu Hiền | Database & DevOps |


---

## 1. Mục tiêu

1. Demo đủ rõ Topic 9: kết nối WebSocket persistent, hai chiều; events; broadcast / server push.
2. Sản phẩm: chat realtime (room), có auth và lưu tin.
3. Bài nộp của nhóm: **Report + Source/README + Video ≤ 20 phút** (cả nhóm). **Không làm slide / không thuyết trình trên lớp.**

---



## 2. Nội dung wed

Web app cho phép nhiều người **đăng nhập**, vào **room**, **gửi/nhận tin tức thì** không reload trang; có **typing** và **online/offline**; tin được **lưu** để mở lại còn lịch sử.

**Stack định hướng** (có thể tinh chỉnh khi implement):

- Frontend: React + Vite + JavaScript + Tailwind  
- Backend: Node.js + JavaScript + Socket.io + REST  
- DB: PostgreSQL + Prisma  
- Vận hành: Docker Compose + `.env.example` + README

---



## 3. Phạm vi MVP (bắt buộc) / ngoài phạm vi



### 3.1. Phải có (MVP)


| #   | Tính năng                                | Ghi chú cho Topic 9                         |
| --- | ---------------------------------------- | ------------------------------------------- |
| 1   | Đăng ký / đăng nhập                      | REST + token                                |
| 2   | Chat theo room (join / leave / gửi–nhận) | WebSocket realtime                          |
| 3   | Typing indicator                         | Event realtime                              |
| 4   | Online / offline                         | Presence                                    |
| 5   | Lịch sử tin khi mở lại room              | Persist DB                                  |
| 6   | Bảo mật cơ bản trên WS                   | Auth khi connect; hạn chế spam (rate limit) |
| 7   | README (+ khuyến nghị Docker)            | Thầy chạy được                              |




### 3.2. Chưa làm trong MVP (tuỳ chọn sau)

Reply/reaction, search, upload ảnh, push notification, gọi video/audio (WebRTC).

---



## 4. Phân công & ranh giới 


| Thành viên    | Việc chính        | Folder / deliverable chính                                 | Không làm                   |
| ------------- | ----------------- | ---------------------------------------------------------- | --------------------------- |
| **Thùy Vân**  | Backend           | `server/` (API, Socket.io, JWT, rate limit)                | UI React                    |
| **Kim Lợi**   | Frontend          | `client/` (màn hình, UX, gọi API/socket)                   | Schema DB, logic server     |
| **Diệu Hiền** | Database & DevOps | `prisma/`, Docker, `.env.example`, bổ sung README chạy máy | Handler event / UI chi tiết |


Chi tiết phân công ngắn: xem `PHAN_CONG.md`.

---



## 5. Việc mỗi người tự đặc tả / thiết kế (tuần 1)

PM **không** viết sẵn API payload, wireframe hay schema từng cột. Mỗi người **tự soạn và đưa nhóm review** trong tuần 1:


| Người         | Tài liệu cần nộp nội bộ (tuần 1)       | Nội dung tối thiểu                                                     |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------- |
| **Thùy Vân**  | `docs/api-contract.md`                 | Danh sách REST + Socket events; cách auth WS; mã lỗi chính             |
| **Kim Lợi**   | `docs/ui-outline.md` (hoặc fig/sketch) | Các màn hình; luồng user login → chat; state cần từ socket             |
| **Diệu Hiền** | `docs/db_schema.md`                    | Thực thể User / Room / Member / Message; quan hệ; hướng migrate + seed |


**Buổi sync tuần 1 (≤ 1–2h):** ba bản trên phải khớp nhau (tên event, field cần thiết). Sau đó mới code song song theo nhánh.

---



## 6. Cấu trúc repo (định hướng)

```text
wedgk/
├── client/           # Kim Lợi
├── server/           # Thùy Vân
│   └── prisma/       # Diệu Hiền
├── docs/             # DAC_TA_DU_AN.md · api-contract · ui-outline · db_schema
├── docker-compose.yml
├── .env.example
├── PHAN_CONG.md
└── README.md
```

---



## 7. Milestone


| Tuần     | Mục tiêu chung                                    |
| -------- | ------------------------------------------------- |
| **1**    | Chốt 3 tài liệu mục 5 · skeleton FE / BE / DB     |
| **2**    | Auth + gửi/nhận tin realtime (dù UI còn đơn giản) |
| **3–4**  | Typing + presence + ghép đủ FE–BE–DB              |
| **5–6**  | Ổn định MVP · chỉ thêm optional nếu còn thời gian |
| **7**    | Docker / README máy sạch                          |
| **8**    | Report + video ≤ 20 phút (nộp — không slide/thuyết trình) |


---



## 8. Tiêu chí nghiệm thu MVP

1. Hai user (hai trình duyệt), cùng room: gửi tin thấy ngay, không F5.
2. Có typing và online/offline.
3. F5 vẫn còn lịch sử tin.
4. Không token thì không chat được qua socket.
5. Làm theo README (hoặc Docker) chạy được trên máy khác.
6. Đủ bài nộp: Report (Word + PDF) + source/README + video có tiếng (cả 3 thành viên). Không yêu cầu slide/thuyết trình.

---

## 10. Tài liệu liên quan


| File                   | Cập nhật                           | Mục đích            |
| ---------------------- | ---------------------------------- | ------------------- |
| `503073-Midterm.pdf`   | —                                  | Đề & rubric         |
| `PHAN_CONG.md`         | PM / cả nhóm                       | Ai làm gì           |
| `README.md`            | Diệu Hiền (chạy) + cả nhóm bổ sung | Hướng dẫn chạy demo |
| `docs/api-contract.md` | **Thùy Vân**                       | Đặc tả API/Socket   |
| `docs/ui-outline.md`   | **Kim Lợi**                        | Đặc tả giao diện    |
| `docs/db_schema.md`    | **Diệu Hiền**                      | Đặc tả dữ liệu      |
| Report / Video         | Cả nhóm                            | Nộp cuối            |


---

*Đây là đặc tả kickoff cho quản lý phạm vi và phân công. Chi tiết kỹ thuật do từng thành viên phụ trách viết và thống nhất với nhóm.*