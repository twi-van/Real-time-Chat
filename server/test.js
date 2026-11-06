const { io } = require("socket.io-client");
const http = require("http");

const SERVER_URL = "http://localhost:4000";

function requestAPI(endpoint, method = "GET", data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, SERVER_URL);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const req = http.request(
      url,
      { method, headers },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: body ? JSON.parse(body) : {} });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runBenchmark() {
  console.log("=== BẮT ĐẦU KIỂM THỬ HIỆU NĂNG AN TOÀN ===");

  // 1. Đăng nhập
  console.log("1. Đang đăng nhập tài khoản seed...");
  const resLoginA = await requestAPI("/auth/login", "POST", { email: "a@a.com", password: "123456" });
  const resLoginB = await requestAPI("/auth/login", "POST", { email: "b@b.com", password: "123456" });

  const tokenA = resLoginA.data.token;
  const tokenB = resLoginB.data.token;

  if (!tokenA || !tokenB) {
    console.error("Lỗi: Không lấy được token đăng nhập. Hãy kiểm tra server và database seed.");
    process.exit(1);
  }

  // 2. Lấy phòng chat chung
  const resRooms = await requestAPI("/rooms", "GET", null, tokenA);
  const rooms = Array.isArray(resRooms.data) ? resRooms.data : resRooms.data.rooms || [];

  const targetRoom = rooms.find((r) => {
    // Kiểm tra cấu trúc members trong room object
    const members = r.members || [];
    return members.some((m) => (m.userId || m.user?.id || m.id) === resLoginB.data.user.id);
  }) || rooms[0]; // fallback nếu cấu trúc members không lồng user

  const targetRoomId = targetRoom.id;
  console.log(`-> Đang kiểm thử trên Room ID chung: ${targetRoomId}`);

  // 3. Kết nối Socket
  const socketA = io(SERVER_URL, {
    auth: { token: tokenA },
    transports: ["websocket", "polling"],
  });
  const socketB = io(SERVER_URL, {
    auth: { token: tokenB },
    transports: ["websocket", "polling"],
  });

  await Promise.all([
    new Promise((res) => socketA.on("connect", res)),
    new Promise((res) => socketB.on("connect", res)),
  ]);

  // Join room kèm callback ack để đảm bảo server đã duyệt vào phòng
  const joinResA = await new Promise((res) => socketA.emit("join_room", { roomId: targetRoomId }, res));
  const joinResB = await new Promise((res) => socketB.emit("join_room", { roomId: targetRoomId }, res));

  console.log("-> Trạng thái Join Room của User A:", joinResA);
  console.log("-> Trạng thái Join Room của User B:", joinResB);

  if (joinResA?.error || joinResB?.error) {
    console.error("Không thể join room hợp lệ. Dừng test.");
    process.exit(1);
  }

  // 4. Đo NFR01 (Độ trễ tin nhắn 50 lần)
  console.log("\n2. Đang đo NFR01: Độ trễ tin nhắn...");
  const latencies = [];
  const TOTAL_PINGS = 50;

  for (let i = 1; i <= TOTAL_PINGS; i++) {
    const sendTime = Date.now();

    const latency = await new Promise((resolve) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve({ error: "TIMEOUT" });
      }, 2000);

      function onMsg(data) {
        clearTimeout(timer);
        cleanup();
        resolve({ diff: Date.now() - sendTime });
      }

      function cleanup() {
        socketB.off("receive_message", onMsg);
      }

      socketB.on("receive_message", onMsg);

      // Gửi tin nhắn kèm callback ack
      socketA.emit(
        "send_message",
        { roomId: targetRoomId, content: `Ping test #${i}` },
        (ackRes) => {
          if (ackRes?.error) {
            console.warn(`[Lần #${i}] Server từ chối send_message:`, ackRes);
          }
        }
      );
    });

    if (latency && !latency.error) {
      latencies.push(latency.diff);
    } else {
      console.warn(`[Cảnh báo] Lần gửi #${i} không nhận được tin sau 2s`);
    }

    // Giãn cách 80ms để không chạm Rate Limit của server
    await sleep(80);
  }

  if (latencies.length > 0) {
    const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);
    console.log(`\n[KẾT QUẢ NFR01]`);
    console.log(`- Thành công: ${latencies.length}/${TOTAL_PINGS} lần`);
    console.log(`- Độ trễ trung bình: ${avg} ms (Yêu cầu: < 500 ms)`);
    console.log(`- Độ trễ lớn nhất (Max): ${Math.max(...latencies)} ms`);
    console.log(`- Độ trễ nhỏ nhất (Min): ${Math.min(...latencies)} ms`);
  }

  socketA.disconnect();
  socketB.disconnect();
  swarm.forEach((s) => s.disconnect());
  console.log("\n=== HOÀN TẤT KIỂM THỬ HIỆU NĂNG ===");
  process.exit(0);
}

runBenchmark().catch(console.error);