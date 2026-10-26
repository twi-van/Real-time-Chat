const express = require("express");
const { prisma } = require("../lib/prisma");
const { publicUser } = require("../lib/store");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

/** GET /users?q= — list user (trừ mình), phục vụ Chat mới / Tạo nhóm */
router.get("/", async (req, res) => {
  const q = String(req.query.q || "")
    .trim()
    .toLowerCase();

  const users = await prisma.user.findMany({
    where: {
      id: { not: req.user.id },
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { displayName: "asc" },
    take: 50,
  });

  return res.json({ users: users.map(publicUser) });
});

module.exports = router;
