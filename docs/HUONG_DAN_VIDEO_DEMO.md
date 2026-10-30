# Hướng dẫn quay & dựng video demo

**Môn:** Web Programming & Applications (503073)  
**Đề tài:** Topic 9 — WebSockets and Real-Time Communication  
**Sản phẩm:** Real-time Chat  

**Yêu cầu đề:** **Một** video nộp **≤ 20 phút**, **có tiếng**, **đủ 3 thành viên nói**. Không slide / thuyết trình trên lớp.  
**Deadline:** trước **05/11/2026**  

**Cách nhóm chốt:** Mỗi người **tự quay** phần của mình → **Kim Lợi ghép** 3 (hoặc 4) clip thành **1 file** nộp.  
Không bắt buộc Google Meet (Meet chỉ là lựa chọn khác nếu muốn quay chung).

---

## 1. Mục tiêu video (file cuối sau khi ghép)

Thầy xem **1 clip** là hiểu:

1. Nhóm làm gì (Topic 9 + chat realtime).  
2. App **chạy được** và đủ **MVP**.  
3. Mỗi người đóng góp gì (FE / BE / DB–Docker) — **nghe được giọng từng người**.  
4. WebSocket khác HTTP (nói ngắn + có demo).

---

## 2. Quy trình: quay riêng → ghép một clip

```text
[Hiền quay clip DB/Docker]  ─┐
[Vân quay clip Backend]     ─┼─→  Lợi ghép (CapCut / Premiere / iMovie…)  →  1 file MP4 ≤ 20'
[Lợi quay intro + demo UI + kết] ─┘
```

| Bước | Ai | Việc |
| ---- | -- | ---- |
| 1 | Cả 3 | App chạy được; thống nhất thời lượng từng clip (bảng mục 3) |
| 2 | **Hiền** | Tự quay phần DB/Docker (face + màn hình) |
| 3 | **Vân** | Tự quay phần Backend/Socket |
| 4 | **Lợi** | Quay intro + **demo UI đủ MVP** + so sánh ngắn + kết |
| 5 | Vân & Hiền | Nộp file raw cho Lợi (Drive/Zalo) **trước 04/11** |
| 6 | **Lợi** | Ghép đúng thứ tự mục 4 → export 1 MP4 → nhóm xem lại → nộp |

**Nộp thầy:** chỉ **1 video**. Không nộp 3 file rời.

---

## 3. Thời lượng từng người (budget)

Tổng raw nên ~16–18' để sau cắt còn **≤ 20'**.

| Clip | Người | Thời lượng gửi Lợi | Nội dung bắt buộc |
| ---- | ----- | ------------------ | ----------------- |
| **A** | Lợi | **1–1.5 phút** | Intro: chào thầy, 3 tên + MSSV, Topic 9, sản phẩm |
| **B** | Hiền | **2.5–3.5 phút** | Docker, Postgres, Prisma migrate/seed, README chạy |
| **C** | Vân | **3–4 phút** | JWT REST + auth Socket, events, rate limit (có thể xen `/health` hoặc đoạn code) |
| **D** | Lợi | **7–9 phút** | Demo UI đủ nghiệm thu (mục 6) + 30–60” so sánh WS |
| **E** | Lợi | **1–1.5 phút** | Kết luận MVP / chưa làm gì / cảm ơn + credit 3 người |

Nếu vượt: cắt lý thuyết trước, **giữ demo UI**.

---

## 4. Thứ tự ghép (Lợi làm đúng vậy)

1. **Clip A** — Intro (Lợi)  
2. **Clip B** — DB / Docker (Hiền)  
3. **Clip C** — Backend / Socket (Vân)  
4. **Clip D** — Demo UI + so sánh ngắn (Lợi)  
5. **Clip E** — Kết + credit (Lợi)  

Đầu file (tuỳ chọn): card chữ 3–5 giây  
`503073 · Topic 9 · Real-time Chat · Nhóm …`  

Cuối file: bảng MSSV + họ tên 3 người.

---

## 5. Kịch bản quay từng người (tự quay)

### 5.1. Hiền — Clip B (DB & DevOps)

**Hình:** webcam góc nhỏ + share terminal / Docker Desktop.  
**Nói + làm:**

1. Giới thiệu vai trò: database & DevOps.  
2. `docker compose up -d` → `docker compose ps` (Postgres Up).  
3. Nói Prisma: schema → migrate → seed.  
4. (Tuỳ chọn) chạy nhanh `npx prisma migrate deploy` / `db seed` nếu kịp.  
5. Tài khoản demo: `a@a.com`, `b@b.com`, `c@c.com` / `123456`.  
6. README: máy khác làm theo `.env` → compose → migrate → seed → BE → FE.

**File gửi Lợi:** `clip_Hien_DB_Docker.mp4` (có tiếng).

### 5.2. Vân — Clip C (Backend)

**Hình:** webcam + VS Code / browser `/health` / DevTools.  
**Nói + làm:**

1. Vai trò Backend: Express + Socket.io + JWT.  
2. REST: register/login trả JWT; API cần `Authorization`.  
3. Socket: connect kèm `auth: { token }`; không token → không chat.  
4. Events: `join_room`, `send_message`, `receive_message`, `typing`, `presence`.  
5. Rate limit cơ bản (nói ngắn).  
6. (Tuỳ chọn) mở http://localhost:4000/health → `{"ok":true}`.

**File gửi Lợi:** `clip_Van_Backend.mp4` (có tiếng).

### 5.3. Lợi — Clip A + D + E (Intro, Demo UI, Kết)

**Intro (A):** chào thầy, đọc đủ 3 họ tên + MSSV, Topic 9, chat realtime.  

**Demo UI (D):** 2 cửa sổ trình duyệt (An | Bình), làm đủ mục 6 bên dưới, vừa làm vừa nói.  

**So sánh ngắn (trong D hoặc sát cuối D):** WS kênh mở sẵn, server đẩy tin — khác HTTP mỗi lần request phải hỏi lại.  

**Kết (E):** đủ MVP; chưa làm ảnh / WebRTC…; cảm ơn thầy.

**File:** `clip_Loi_Intro.mp4`, `clip_Loi_DemoUI.mp4`, `clip_Loi_Ket.mp4`  
(hoặc 1 file dài Lợi tự cắt trước khi ghép với Vân/Hiền).

---

## 6. Demo UI bắt buộc trong clip của Lợi (khớp nghiệm thu)

Chuẩn bị: Docker + BE + FE chạy; seed xong; 2 cửa sổ (thường + ẩn danh).

| Cảnh | Việc | ~Thời gian |
| ---- | ---- | ---------- |
| A | Login `a@a.com` và `b@b.com` (pass `123456`) | 1' |
| B | **Chat mới** An↔Bình: gửi–nhận **realtime**, không F5 | 2' |
| C | **Typing** khi gõ chưa gửi | 1' |
| D | **Offline:** đóng tab/logout Bình → An thấy offline | 1' |
| E | **F5** An → còn lịch sử tin | 1' |
| F | **Tạo nhóm** có tên → chat nhóm realtime | 1.5' |
| G | (Tuỳ chọn ngắn) chưa login / xóa token → không chat | 0.5–1' |

Nói to từng bước: *“An gửi — Bình nhận ngay, không reload.”*

---

## 7. Quy ước file gửi Lợi (tránh loạn)

| Mục | Quy ước |
| --- | ------ |
| Định dạng | MP4 (ưu tiên), hoặc MOV |
| Độ phân giải | 1080p hoặc 720p; **cùng kiểu nằm ngang** |
| Âm thanh | Có tiếng rõ; test nghe trước khi gửi |
| Tên file | `clip_Hien_DB_Docker.mp4`, `clip_Van_Backend.mp4`, … |
| Deadline raw | **04/11/2026** (để Lợi kịp dựng) |
| Nơi nộp nội bộ | Drive / Zalo nhóm (thống nhất 1 folder) |

---

## 8. Việc Lợi làm khi ghép

1. Import đủ clip A→E theo mục 4.  
2. Cắt đoạn im lặng / “ờ… / xin lỗi quay lại”.  
3. Chỉnh volume tương đối đều giữa 3 người.  
4. (Tuỳ chọn) chữ tiêu đề ngắn đầu mỗi phần: `Database — Diệu Hiền`, …  
5. Export **một** MP4; kiểm tra tổng thời lượng **≤ 20:00**.  
6. Tên file nộp gợi ý: `503073_Topic9_RealtimeChat_Nhom.mp4`  
7. Gửi nhóm xem 1 lần trước khi nộp chính thức.

Phần mềm gợi ý: CapCut, DaVinci Resolve, Premiere, iMovie, Clipchamp.

---

## 9. Gợi ý lời thoại ngắn

### Lợi — mở đầu

> Em chào thầy. Nhóm gồm Phan Phạm Thùy Vân, Nguyễn Ngọc Kim Lợi, Nguyễn Thị Diệu Hiền.  
> Đề tài Topic 9 — WebSockets. Sản phẩm là ứng dụng chat realtime: đăng nhập, chat theo room, typing, online/offline, lưu tin PostgreSQL.

### Hiền — DB / Docker

> Em phụ trách database và DevOps. Nhóm dùng PostgreSQL trong Docker Compose, Prisma schema–migrate–seed.  
> Tài khoản demo: a@a.com, b@b.com, c@c.com, mật khẩu 123456.  
> README hướng dẫn chạy từ máy sạch: env, compose, migrate, seed, backend, frontend.

### Vân — Backend / Socket

> Em phụ trách backend. REST dùng JWT; khi connect Socket.io client gửi token, server verify.  
> Các event chính: join_room, send_message, receive_message, typing, presence. Có rate limit cơ bản.

### Lợi — khi demo gửi tin

> An gửi tin — Bình nhận ngay, không cần tải lại trang. Đây là kênh WebSocket hai chiều, server đẩy tin tới room.

### Lợi — kết

> Demo đủ MVP Topic 9. Phần chưa làm: gửi ảnh, reaction, WebRTC… Cảm ơn thầy đã theo dõi.

---

## 10. Checklist nộp

- [ ] Mỗi người đã quay xong phần mình (có tiếng)  
- [ ] Lợi đã ghép **1** file ≤ 20 phút  
- [ ] Nghe được đủ 3 giọng (Hiền, Vân, Lợi)  
- [ ] Demo đủ: chat đôi realtime, nhóm, typing, presence, F5 còn tin  
- [ ] Không thay bằng slide thuyết trình trên lớp  
- [ ] Nộp kèm Report (Word+PDF) + Source/README — **05/11/2026**

---

## 11. Lịch gợi ý

| Việc | Deadline |
| ---- | -------- |
| App ổn định + README chạy được | **02/11** |
| Hiền + Vân gửi clip raw cho Lợi | **04/11** |
| Lợi quay xong intro/demo/kết + ghép bản nháp | **04/11–05/11** sáng |
| Nhóm xem lại → nộp | **05/11** |

---

## 12. (Tuỳ chọn) Quay chung Google Meet

Nếu đổi ý muốn quay chung: cả 3 vào Meet, **một người share** màn demo, từng người bật mic khi tới phần mình, ghi 1 take.  
Vẫn phải ra **1 video ≤ 20'**. Không bắt buộc nếu đã theo quy trình quay riêng + ghép ở trên.

---

*File nội bộ nhóm — hỗ trợ quay video; không thay Report Word.*
