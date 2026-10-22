# PHÂN CÔNG - MIDTERM TOPIC 9

## WebSockets and Real-Time Communication

**Môn:** Web Programming & Applications (503073)  
**Nhóm:** 3 thành viên — **mỗi người 1 việc chính**, làm song song  
**Sản phẩm:** Real-time Chat (room thống nhất, typing, online, JWT, lưu DB)

**Deadline nộp đủ bài:** **05/11/2026** (Report Word+PDF + Source/README + Video ≤ 20 phút)

---

## 0. LỊCH SPRINT & DEADLINE (bắt buộc)

| Sprint | Thời gian | Deadline (cuối ngày) | Mục tiêu chung | Trạng thái |
|--------|-----------|----------------------|----------------|------------|
| **1** | ~16/10 – 22/10 | **22/10/2026** | Chốt 3 docs (contract, UI, DB) | **Done** |
| **2** | 23/10 – 25/10 | **25/10/2026** | Auth + chat realtime tối thiểu (FE/BE/DB skeleton chạy) | Todo |
| **3–4** | 26/10 – 28/10 | **28/10/2026** | Typing, presence, ghép đủ FE–BE–DB, đủ API/UI MVP | Todo |
| **5–6** | 29/10 – 31/10 | **31/10/2026** | Ổn định MVP, test 2 tab, fix bug | Todo |
| **7** | 01/11 – 02/11 | **02/11/2026** | Docker DB + README máy sạch chạy được | Todo |
| **8** | 03/11 – 05/11 | **05/11/2026** | Report + Video xong → **nộp đủ** | Todo |

**Nộp cuối (05/11):** Report (Word+PDF) · Source + README · Video ≤ 20' (có tiếng, đủ 3 người nói). Không slide/thuyết trình.

Chi tiết việc từng người theo sprint: xem mục 6 trong `docs/api-contract.md` (Vân), `docs/ui-outline.md` (Lợi), `docs/db_schema.md` (Hiền).

---

## 1. PHÂN CÔNG CODE

| Người | Vai trò | Phạm vi code |
|-------|---------|--------------|
| **THÙY VÂN** | **Backend** | REST API + Socket.io + Auth JWT + rate limit |
| **KIM LỢI** | **Frontend** | Toàn bộ React UI + gọi API + socket client |
| **DIỆU HIỀN** | **Database & DevOps** | Prisma/schema, migrate, seed, Docker, README, `.env.example` |

---

## 2. PHÂN CÔNG BÁO CÁO (REPORT)

### Diệu Hiền — khung Word + format + gộp file

- Tạo file Word theo template khoa (bìa, mục lục, heading) — **deadline khung: 02/11** (Sprint 7)
- Thống nhất **format**; nhận bài từng người → dán đúng chương → chỉnh lần cuối — **deadline gộp: 05/11**
- **Không** viết hết nội dung report thay người khác

### Nội dung ai viết — **nộp draft cho Hiền trước 04/11**

| Phần report | Người viết | Deadline draft |
|-------------|------------|----------------|
| Lý thuyết (HTTP vs WS, handshake…) | **Thùy Vân** | **04/11** |
| Security trên WS (JWT, rate limit…) | **Thùy Vân** | **04/11** |
| So sánh (WS vs SSE / Long Polling…) | **Kim Lợi** | **04/11** |
| Implementation Frontend | **Kim Lợi** | **04/11** |
| Thiết kế hệ thống + Database | **Diệu Hiền** | **04/11** |
| Deploy / Docker / hướng dẫn chạy | **Diệu Hiền** | **04/11** |
| Kết luận | Hiền nháp → cả nhóm review | **05/11** sáng |

---

## 3. PHÂN CÔNG VIDEO

| Việc | Người | Deadline |
|------|--------|----------|
| **Quay & dựng video** (≤ 20 phút, có tiếng) | **Kim Lợi** chủ trì | **05/11** |
| Xuất hiện / nói phần mình trên video | Cả 3 | Quay xong trước **05/11** |
| Cung cấp clip/demo phần kỹ thuật | Mỗi người hỗ trợ Lợi | Theo lịch Lợi (trước **04/11**) |

---

## 4. BÀI NỘP (05/11/2026)

- [ ] Report (Word + PDF) — Hiền khung & gộp; mỗi người viết phần mình  
- [ ] Source + README  
- [ ] Video ≤ 20 phút — **Lợi** quay/dựng; cả 3 tham gia nói  

**Không làm** slide / thuyết trình trên lớp.
