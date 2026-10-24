const { randomUUID } = require("crypto");

const usersById  = new Map();
const usersByEmail = new Map();
const roomsById = new Map();
const messagesById = new Map();

function createRoom({name,memberIds,createdById}){
  const room = {
    id: randomUUID(),
    name: name ?? null,
    createdById,
    memberIds: [...new Set(memberIds)],
    createdAt: new Date(),
  };
  roomsById.set(room.id, room);
  return room;
}
function findRoomById(id) {
  return roomsById.get(id) || null;
}
function isRoomMember(roomId, userId) {
  const room = findRoomById(roomId);
  return Boolean(room && room.memberIds.includes(userId));
}
function createMessage({ roomId, senderId, content }) {
  const message = {
    id: randomUUID(),
    roomId,
    senderId,
    content: String(content).trim(),
    createdAt: new Date(),
  };
  messagesById.set(message.id, message);
  return message;
}
function publicUser(user){
  return {
    id : user.id,
    email : user.email,
    displayName: user.displayName,
  };
}

function createUser({ email, passwordHash, displayName }) {
  const user = {
    id: randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    displayName: displayName.trim(),
    createdAt: new Date(),
  };
  usersById.set(user.id,user);
  usersByEmail.set(user.email, user);
  return user;
}
function findUserByEmail(email){
  return usersByEmail.get(String(email).toLowerCase().trim()) || null;
}
function findUserById(id) {
  return usersById.get(id) || null;
}
module.exports = {
  publicUser,
  createUser,
  findUserByEmail,
  findUserById,
  createRoom,
  findRoomById,
  isRoomMember,
  createMessage,
  roomsById
};