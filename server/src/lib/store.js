/** Helpers dùng chung — data nằm ở Postgres qua Prisma. */

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}

function roomResponse(room) {
  const members = (room.members || [])
    .map((m) => m.user || m)
    .filter(Boolean)
    .map(publicUser);

  return {
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    members,
  };
}

module.exports = { publicUser, roomResponse };
