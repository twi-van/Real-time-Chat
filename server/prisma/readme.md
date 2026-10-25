# Hướng Dẫn Thiết Lập Database & Backend (Quy Trình Triển Khai)

### 1. Luồng Lệnh Khởi Chạy Hệ Thống

Toàn bộ quy trình khởi tạo môi trường, cơ sở dữ liệu và dữ liệu mẫu tuân theo chuỗi bước sau:

$$
\begin{aligned}
\text{Bước 1 (Config):} \quad & \texttt{cp .env.example .env} \\
\text{Bước 2 (Container):} \quad & \texttt{docker compose up -d} \\
\text{Bước 3 (Dependencies):} \quad & \texttt{cd server} \;\longrightarrow\; \texttt{npm install} \\
\text{Bước 4 (Migration):} \quad & \texttt{npx prisma migrate dev} \\
\text{Bước 5 (Data Seed):} \quad & \texttt{npx prisma db seed}
\end{aligned}
$$

---

### 2. Mô Tả Chi Tiết Từng Lệnh

* **Bước 1: Khởi tạo biến môi trường**
  $$
  \texttt{cp .env.example .env}
  $$
  * Mục đích: Sao chép cấu hình mẫu sang file môi trường thực tế `.env`, đảm bảo chuỗi kết nối:
  $$
  \text{DATABASE\_URL} = \texttt{"postgresql://<user>:<password>@localhost:5432/<dbname>?schema=public"}
  $$

* **Bước 2: Khởi động hệ quản trị CSDL PostgreSQL**
  $$
  \texttt{docker compose up -d}
  $$
  * Mục đích: Tạo và chạy container PostgreSQL ở chế độ chạy ngầm (*detached mode*), lắng nghe tại cổng $\text{Port} = 5432$.

* **Bước 3: Điều hướng và cài đặt thư viện**
  $$
  \texttt{cd server} \quad\land\quad \texttt{npm install}
  $$
  * Mục đích: Cài đặt các gói phụ thuộc của Node.js (bao gồm `@prisma/client`, `prisma`, `bcrypt`,...).

* **Bước 4: Đồng bộ cấu trúc bảng (Schema Migration)**
  $$
  \texttt{npx prisma migrate dev}
  $$
  * Mục đích: Quét file $\texttt{schema.prisma}$, tự động sinh script SQL và thực thi vào database để tạo các bảng:
  $$
  \mathcal{T} = \{\texttt{users}, \;\texttt{rooms}, \;\texttt{room\_members}, \;\texttt{messages}\}
  $$

* **Bước 5: Nạp dữ liệu mẫu ban đầu (Database Seeding)**
  $$
  \texttt{npx prisma db seed}
  $$
  * Mục đích: Khởi tạo dữ liệu người dùng thử nghiệm $\mathcal{U}_{\text{demo}}$ phục vụ kiểm thử:
  $$
  \mathcal{U}_{\text{demo}} = 
  \begin{cases}
  \text{User 1:} & \texttt{a@a.com} \;\; (\text{Pass: } 123456) \\
  \text{User 2:} & \texttt{b@b.com} \;\; (\text{Pass: } 123456) \\
  \text{User 3:} & \texttt{c@c.com} \;\; (\text{Pass: } 123456)
  \end{cases}
  $$

---

### 3. Bảng Tóm Tắt Dữ Liệu Seed Demo

$$
\begin{array}{|l|c|c|l|}
\hline
\textbf{Email} & \textbf{Password} & \textbf{Display Name} & \textbf{Ghi chú vai trò} \\
\hline
\texttt{a@a.com} & \texttt{123456} & \text{An} & \text{Thành viên phòng 1-1 \& phòng Nhóm demo} \\
\texttt{b@b.com} & \texttt{123456} & \text{Bình} & \text{Thành viên phòng 1-1 \& phòng Nhóm demo} \\
\texttt{c@c.com} & \texttt{123456} & \text{Chi} & \text{Thành viên phòng Nhóm demo} \\
\hline
\end{array}
$$