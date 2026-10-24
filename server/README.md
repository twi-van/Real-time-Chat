# server — Backend

**Phụ trách:** Thùy Vân (code) · Diệu Hiền (`prisma/`)

Stack: Node.js + JavaScript + Express + Socket.io + JWT.

```text
src/
├── index.js      # entry: HTTP + Socket.io
├── auth/         # register, login, JWT
├── socket/       # WebSocket events
├── routes/       # REST API
├── middleware/   # auth, rate limit
└── lib/          # helpers (store, jwt, errors)
prisma/           # schema, migrate, seed (Diệu Hiền)
```

Bám [`docs/api-contract.md`](../docs/api-contract.md).

## Chạy local

```bash
# từ gốc repo
cp .env.example .env   # nếu chưa có
cd server
npm install
npm run dev
# → http://localhost:4000/health
```
