/** Helpers dùng chung — data nằm ở Postgres qua Prisma. */

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

function lastMessageResponse(message) {
  if (!message) return null;
  return {
    content: message.content,
    createdAt: message.createdAt,
    senderId: message.senderId,
  };
}

function roomResponse(room) {
  const members = (room.members || [])
    .map((m) => m.user || m)
    .filter(Boolean)
    .map(publicUser);

  // GET /rooms có thể include messages take 1 (mới nhất)
  const latest =
    room.lastMessage ||
    (Array.isArray(room.messages) ? room.messages[0] : null);

  return {
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    members,
    lastMessage: lastMessageResponse(latest),
  };
}

module.exports = { publicUser, roomResponse };
