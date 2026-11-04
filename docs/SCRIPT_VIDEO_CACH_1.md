# Kịch bản video demo — Cách 1 (quay riêng → ghép)

**Môn:** Web Programming & Applications (503073)  
**Topic 9 — WebSockets and Real-Time Communication**  
**Sản phẩm:** Real-time Chat  

**Yêu cầu nộp thầy:** 1 video ≤ 20 phút, có tiếng, đủ 3 người nói. Không slide / thuyết trình trên lớp.  
**Deadline raw gửi Lợi:** trước **04/11/2026**  
**Ghép + nộp:** **05/11/2026**

**Cách làm:** Mỗi người tự quay phần mình → gửi file cho **Kim Lợi** → Lợi ghép **1 MP4** nộp thầy.

**Thứ tự ghép:**  
Intro (Lợi) → DB/Docker (Hiền) → Backend (Vân) → Demo UI (Lợi) → Kết (Lợi)

---

## Thời lượng gợi ý

| Clip | Người | ~Thời lượng | File gửi Lợi |
|------|--------|-------------|--------------|
| A | Lợi | 1–1.5' | `clip_Loi_Intro.mp4` |
| B | Hiền | 2.5–3.5' | `clip_Hien_DB_Docker.mp4` |
| C | Vân | 3–4' | `clip_Van_Backend.mp4` |
| D | Lợi | 7–9' | `clip_Loi_DemoUI.mp4` |
| E | Lợi | 1–1.5' | `clip_Loi_Ket.mp4` |

Tổng raw ~16–18' để sau cắt còn ≤ 20'.

---

## 1. Kim Lợi — Intro (~1–1.5')

**Hình:** Webcam (tuỳ thêm card chữ tên nhóm 3–5”).

**Nói:**

1. Chào thầy, giữa kỳ môn Lập trình Web.  
2. Đọc đủ 3 họ tên + MSSV.  
3. Topic 9 — WebSockets; sản phẩm chat realtime.  
4. Vai trò: Lợi – Frontend; Vân – Backend; Hiền – Database & DevOps.  
5. “Tiếp theo Hiền trình bày phần DB / Docker…”

---

## 2. Diệu Hiền — DB & DevOps (~2.5–3.5')

**Hình:** Webcam góc nhỏ + share terminal / Docker Desktop.  
**Chuẩn bị:** Docker Desktop bật; sẵn thư mục project.

| # | Làm trên màn | Nói |
|---|--------------|-----|
| 1 | — | Em phụ trách database & DevOps |
| 2 | `docker compose up -d` → `docker compose ps` | Postgres chạy bằng Docker Compose |
| 3 | (Tuỳ) mở `schema.prisma` / migrate | Prisma: schema → migrate → seed |
| 4 | — | Tài khoản demo: `a@a.com`, `b@b.com`, `c@c.com` / `123456` |
| 5 | Mở README mục Setup & Run | Máy sạch: `.env` → compose → migrate → seed → BE → FE |
| 6 | — | “Phần Backend xin mời Vân…” |

**Không cần:** demo chat UI (để Lợi).

---

## 3. Thùy Vân — Backend / Socket (~3–4')

**Hình:** Webcam + VS Code / browser.  
**Chuẩn bị:** Server `http://localhost:4000` đang chạy.

| # | Làm trên màn | Nói |
|---|--------------|-----|
| 1 | — | Em phụ trách Backend: Express + Socket.io + JWT |
| 2 | (Tuỳ) login REST hoặc chỉ code | REST login/register trả JWT; API cần Authorization |
| 3 | Chỉ `auth: { token }` | Connect Socket bắt buộc JWT; sai/thiếu → không chat |
| 4 | — | Sau connect: kênh `user:{userId}`; events: `join_room`, `send_message`, `receive_message`, `typing`, `presence` |
| 5 | — | Gửi tin: validate → rate limit → lưu DB → đẩy tin tới `user:{id}` từng member |
| 6 | (Tuỳ) mở `/health` | `{"ok":true}` |
| 7 | — | “Phần giao diện xin mời Lợi…” |

**Không cần:** demo đủ 2 tab (Lợi làm).

---

## 4. Kim Lợi — Demo UI (~7–9')

**Hình:** 2 cửa sổ trình duyệt (thường + ẩn danh) = user A | user B.  
**Chuẩn bị:** Docker + BE + FE + seed xong.

| Cảnh | Việc | ~ | Nói to |
|------|------|---|--------|
| Login | A: `a@a.com` · B: `b@b.com` (pass `123456`) | 1' | Đây là 2 user demo |
| Chat đôi | Chat mới A↔B; gửi–nhận **không F5** | 2' | Realtime — không reload |
| Typing | A gõ chưa gửi | 1' | B thấy đang nhập |
| Sidebar (tuỳ) | Tin phòng khác → lên đầu / in đậm chưa đọc | 0.5–1' | UX danh sách hội thoại |
| Offline | Đóng tab / logout B | 1' | A thấy B offline |
| Lịch sử | F5 cửa sổ A | 1' | Còn tin cũ |
| Nhóm | Tạo nhóm có tên → chat realtime | 1.5' | Room nhiều người |
| (Tuỳ) | Chưa login / xóa token | 0.5–1' | Không chat qua Socket |
| So sánh | — | 30–60” | WS = kênh mở, server đẩy tin; HTTP = mỗi lần phải hỏi lại |

---

## 5. Kim Lợi — Kết (~1–1.5')

**Nói:**

1. Nhóm đã đủ MVP Topic 9: chat room, typing, presence, JWT, lưu DB, README/Docker.  
2. (Tuỳ, 1 câu) Ngoài MVP chưa làm: gửi ảnh / WebRTC / join bằng link — không phải thiếu đề.  
3. Cảm ơn thầy; hiện lại 3 tên + MSSV.

---

## Quy ước file gửi Lợi

| Mục | Quy ước |
|-----|---------|
| Định dạng | MP4 (ưu tiên), nằm ngang 720p hoặc 1080p |
| Âm thanh | Có tiếng rõ; nghe thử trước khi gửi |
| Tên file | Đúng bảng thời lượng ở trên |
| Deadline raw | Trước **04/11/2026** |
| Nơi gửi | Drive / Zalo folder nhóm |

---

## Việc Lợi khi ghép

1. Import clip A → B → C → D → E.  
2. Cắt đoạn im lặng / “ờ… / xin lỗi quay lại”.  
3. Chỉnh volume tương đối đều.  
4. (Tuỳ) chữ tiêu đề đầu mỗi phần: `Database — Diệu Hiền`, `Backend — Thùy Vân`, …  
5. Export **một** MP4; tổng thời lượng **≤ 20:00**.  
6. Tên file nộp gợi ý: `503073_Topic9_RealtimeChat_Nhom.mp4`  
7. Gửi nhóm xem 1 lần trước khi nộp chính thức.

Phần mềm gợi ý: CapCut, DaVinci Resolve, Premiere, iMovie, Clipchamp.

---

## Checklist trước khi nộp

- [ ] ≤ 20', có tiếng, nghe rõ 3 giọng  
- [ ] Demo đủ MVP (chat realtime, typing, presence, F5 còn lịch sử, room đôi + nhóm, không JWT thì không chat)  
- [ ] Chỉ **1** file video nộp thầy  
- [ ] Không thay bằng slide thuyết trình trên lớp  
