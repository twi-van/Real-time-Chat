/** Cursor tin nhắn: (createdAt, id) — opaque string cho FE */

function encodeCursor(createdAt, id) {
  const payload = `${new Date(createdAt).toISOString()}|${id}`;
  return Buffer.from(payload, "utf8").toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor || typeof cursor !== "string") return null;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const createdAt = new Date(iso);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

module.exports = { encodeCursor, decodeCursor };
