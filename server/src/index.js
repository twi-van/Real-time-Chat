const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const roomRoutes = require("./routes/rooms");


const { registerSocket } = require("./socket");
const authRoutes = require("./routes/auth");

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

registerSocket(io);

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
