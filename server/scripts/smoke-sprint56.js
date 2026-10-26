/**
 * Smoke Sprint 5–6: mã lỗi contract + 2 client chat.
 * Chạy: node scripts/smoke-sprint56.js  (server đang listen :4000)
 */
const { io } = require("socket.io-client");

const BASE = process.env.API_URL || "http://localhost:4000";

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function connect(token) {
  return new Promise((resolve, reject) => {
    const s = io(BASE, { auth: { token } });
    const t = setTimeout(() => reject(new Error("socket timeout")), 5000);
    s.on("connect", () => {
      clearTimeout(t);
      resolve(s);
    });
    s.on("connect_error", (e) => {
      clearTimeout(t);
      reject(e);
    });
  });
}

function ack(socket, event, payload) {
  return new Promise((resolve) => {
    socket.emit(event, payload, (res) => resolve(res));
  });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

(async () => {
  console.log("== REST error codes ==");

  let r = await req("POST", "/auth/login", { body: {} });
  assert(r.status === 400 && r.data.error === "VALIDATION_ERROR", "login empty → 400");

  r = await req("POST", "/auth/login", {
    body: { email: "a@a.com", password: "wrong-pass" },
  });
  assert(r.status === 401 && r.data.error === "UNAUTHORIZED", "bad pass → 401");

  r = await req("GET", "/rooms");
  assert(r.status === 401 && r.data.error === "UNAUTHORIZED", "no JWT → 401");

  const loginA = await req("POST", "/auth/login", {
    body: { email: "a@a.com", password: "123456" },
  });
  const loginB = await req("POST", "/auth/login", {
    body: { email: "b@b.com", password: "123456" },
  });
  assert(loginA.status === 200 && loginA.data.token, "login A");
  assert(loginB.status === 200 && loginB.data.token, "login B");
  const tokenA = loginA.data.token;
  const tokenB = loginB.data.token;

  r = await req("GET", "/rooms/not-a-uuid/messages", { token: tokenA });
  assert(r.status === 400 && r.data.error === "VALIDATION_ERROR", "bad room id → 400");

  const fakeRoom = "00000000-0000-4000-8000-000000000099";
  r = await req("GET", `/rooms/${fakeRoom}/messages`, { token: tokenA });
  assert(r.status === 403 && r.data.error === "FORBIDDEN", "not member → 403");

  r = await req("POST", "/rooms", {
    token: tokenA,
    body: { memberIds: [loginB.data.user.id, loginA.data.user.id] },
  });
  // 2 invited after filter self → need name; if only B invited that's 1. 
  // memberIds [B, A] → invited [B] only → direct room OK
  assert(r.status === 200 || r.status === 201, "POST rooms direct");

  r = await req("POST", "/rooms", {
    token: tokenA,
    body: {
      memberIds: [loginB.data.user.id, "00000000-0000-4000-8000-000000000001"],
    },
  });
  // unknown second member after B → if that uuid doesn't exist → 400; group needs name
  // invited = [B, fake] length 2 → name required first
  assert(
    r.status === 400 && r.data.error === "VALIDATION_ERROR",
    "group without name → 400"
  );

  const rooms = await req("GET", "/rooms", { token: tokenA });
  const roomId = rooms.data.rooms.find((x) => x.name == null)?.id;
  assert(roomId, "have direct room");

  console.log("== 2 sockets chat ==");
  const sockA = await connect(tokenA);
  const sockB = await connect(tokenB);
  await ack(sockA, "join_room", { roomId });
  await ack(sockB, "join_room", { roomId });

  const got = new Promise((resolve) => {
    sockB.on("receive_message", (msg) => resolve(msg));
  });
  const send = await ack(sockA, "send_message", {
    roomId,
    content: "sprint56-ok",
  });
  assert(send?.ok, "send ack");
  const msg = await Promise.race([
    got,
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error("no receive")), 3000)
    ),
  ]);
  assert(msg.content === "sprint56-ok", "B received");

  const noJoin = await ack(sockA, "send_message", {
    roomId: fakeRoom,
    content: "x",
  });
  assert(noJoin?.error === "FORBIDDEN" || noJoin?.error === "VALIDATION_ERROR", "bad send");

  sockA.close();
  sockB.close();

  r = await req("GET", "/nope", { token: tokenA });
  assert(r.status === 404, "404 unknown path");

  console.log("\nSPRINT 5-6 SMOKE PASSED");
  process.exit(0);
})().catch((e) => {
  console.error("SMOKE FAILED:", e.message);
  process.exit(1);
});
