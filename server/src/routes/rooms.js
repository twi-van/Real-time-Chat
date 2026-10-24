const express = require("express");
const {
  roomsById,
  findUserById,
  publicUser,
  createRoom,
  isRoomMember,
} = require("../lib/store");
const { authMiddleware } = require("../middleware/auth");
const { sendError } = require("../lib/errors");

const router = express.Router();
router.use(authMiddleware); // mọi route dưới đây đều cần token

// helper: room trong Map → JSON cho FE
function roomResponse(room) {
  return {
    id: room.id,
    name: room.name,
    createdAt: room.createdAt,
    members: room.memberIds
      .map((id) => findUserById(id))
      .filter(Boolean)
      .map(publicUser),
  };
}
router.get("/", (req, res) => {
    const rooms = [...roomsById.values()]
      .filter((room) => room.memberIds.includes(req.user.id))
      .map(roomResponse);
    return res.json({ rooms });
  });

  router.post("/", (req, res) => {
    const { memberIds, name } = req.body || {};
  
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "memberIds must be a non-empty array"
      );
    }
  
    // Bỏ chính mình nếu FE vô tình gửi; server sẽ tự thêm
    const invited = [...new Set(memberIds.map(String))].filter(
      (id) => id !== req.user.id
    );
  
    for (const id of invited) {
      if (!findUserById(id)) {
        return sendError(res, 400, "VALIDATION_ERROR", `Unknown member: ${id}`);
      }
    }
  
    const allMembers = [...new Set([req.user.id, ...invited])];
  
    if (allMembers.length < 2) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Room needs at least 2 members"
      );
    }
  
    // --- Chat đôi: đúng 1 người được mời ---
    if (invited.length === 1) {
      const otherId = invited[0];
      const existing = [...roomsById.values()].find((room) => {
        if (room.memberIds.length !== 2) return false;
        return (
          room.memberIds.includes(req.user.id) &&
          room.memberIds.includes(otherId)
        );
      });
      if (existing) {
        return res.json({ room: roomResponse(existing) }); // không tạo mới
      }
  
      const room = createRoom({
        name: null,
        memberIds: allMembers,
        createdById: req.user.id,
      });
      return res.status(201).json({ room: roomResponse(room) });
    }
  
    // --- Nhóm: ≥ 2 người mời → name bắt buộc ---
    if (!name || !String(name).trim()) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "name is required for group rooms"
      );
    }
  
    const room = createRoom({
      name: String(name).trim(),
      memberIds: allMembers,
      createdById: req.user.id,
    });
    return res.status(201).json({ room: roomResponse(room) });
  });
module.exports = router;