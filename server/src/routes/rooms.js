const express = require("express");
const { prisma } = require("../lib/prisma");
const { roomResponse, publicUser } = require("../lib/store");
const { authMiddleware } = require("../middleware/auth");
const { sendError } = require("../lib/errors");
const { encodeCursor, decodeCursor } = require("../lib/cursor");
const { asyncHandler } = require("../lib/asyncHandler");
const { isUuid } = require("../lib/validate");

const router = express.Router();
router.use(authMiddleware);

const roomInclude = {
  members: { include: { user: true } },
};

/** Tin mới nhất cho sidebar preview (FE: room.lastMessage) */
const roomListInclude = {
  ...roomInclude,
  messages: {
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 1,
  },
};

async function assertRoomMember(roomId, userId) {
  const row = await prisma.roomMember.findUnique({
    where: { roomId_userId: { roomId, userId } },
  });
  return Boolean(row);
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const rooms = await prisma.room.findMany({
      where: {
        members: { some: { userId: req.user.id } },
      },
      include: roomListInclude,
      orderBy: { createdAt: "desc" },
    });
    return res.json({ rooms: rooms.map(roomResponse) });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { memberIds, name } = req.body || {};

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "memberIds must be a non-empty array"
      );
    }

    const invited = [...new Set(memberIds.map(String))].filter(
      (id) => id !== req.user.id
    );

    for (const id of invited) {
      if (!isUuid(id)) {
        return sendError(
          res,
          400,
          "VALIDATION_ERROR",
          `Invalid member id: ${id}`
        );
      }
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
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

    // Chat đôi: 1 người được mời — chống trùng
    if (invited.length === 1) {
      const otherId = invited[0];
      const candidates = await prisma.room.findMany({
        where: {
          name: null,
          AND: [
            { members: { some: { userId: req.user.id } } },
            { members: { some: { userId: otherId } } },
          ],
        },
        include: { members: { include: { user: true } } },
      });
      const existing = candidates.find((r) => r.members.length === 2);
      if (existing) {
        return res.json({ room: roomResponse(existing) });
      }

      const room = await prisma.room.create({
        data: {
          name: null,
          createdById: req.user.id,
          members: {
            create: allMembers.map((userId) => ({ userId })),
          },
        },
        include: roomInclude,
      });
      return res.status(201).json({ room: roomResponse(room) });
    }

    // Nhóm: name bắt buộc
    if (!name || !String(name).trim()) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "name is required for group rooms"
      );
    }

    const room = await prisma.room.create({
      data: {
        name: String(name).trim(),
        createdById: req.user.id,
        members: {
          create: allMembers.map((userId) => ({ userId })),
        },
      },
      include: roomInclude,
    });
    return res.status(201).json({ room: roomResponse(room) });
  })
);

/**
 * GET /rooms/:id/messages?cursor=&limit=
 * Cursor (createdAt, id) — lấy tin cũ hơn mốc; không cursor = tin mới nhất.
 */
router.get(
  "/:id/messages",
  asyncHandler(async (req, res) => {
    const roomId = req.params.id;

    if (!isUuid(roomId)) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid room id");
    }

    if (!(await assertRoomMember(roomId, req.user.id))) {
      return sendError(res, 403, "FORBIDDEN");
    }

    let limit = Number(req.query.limit);
    if (!Number.isFinite(limit) || limit <= 0) limit = 30;
    if (limit > 50) limit = 50;

    const cursor = decodeCursor(req.query.cursor);
    if (req.query.cursor && !cursor) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid cursor");
    }

    const where = {
      roomId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              {
                AND: [
                  { createdAt: cursor.createdAt },
                  { id: { lt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    };

    const rows = await prisma.message.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: { sender: true },
    });

    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const chronological = [...page].reverse();

    const messages = chronological.map((m) => ({
      id: m.id,
      roomId: m.roomId,
      content: m.content,
      sender: publicUser(m.sender),
      createdAt: m.createdAt,
    }));

    const oldest = page[page.length - 1];
    const nextCursor =
      hasMore && oldest ? encodeCursor(oldest.createdAt, oldest.id) : null;

    return res.json({
      messages,
      ...(nextCursor ? { nextCursor } : {}),
    });
  })
);

module.exports = router;
