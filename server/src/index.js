const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
const roomRoutes = require("./routes/rooms");
const userRoutes = require("./routes/users");

const { registerSocket } = require("./socket");
const authRoutes = require("./routes/auth");
const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/errorHandler");

const app = express();

const server = http.createServer(app);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: clientOrigin,
  })
);
app.use(express.json({ limit: "32kb" }));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use(notFoundHandler);
app.use(errorHandler);

registerSocket(io);

const PORT = Number(process.env.PORT) || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
