const express = require("express");
const bcrypt = require("bcryptjs");
const { prisma } = require("../lib/prisma");
const { publicUser } = require("../lib/store");
const { signToken } = require("../lib/jwt");
const { sendError } = require("../lib/errors");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body || {};

  if (!email || !password || !displayName) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "email, password, displayName are required"
    );
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return sendError(res, 400, "VALIDATION_ERROR", "Email already registered");
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      displayName: String(displayName).trim(),
    },
  });

  return res.status(201).json({
    user: publicUser(user),
    token: signToken(user.id),
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return sendError(
      res,
      400,
      "VALIDATION_ERROR",
      "email and password are required"
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase().trim() },
  });
  if (!user) {
    return sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
  }

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) {
    return sendError(res, 401, "UNAUTHORIZED", "Invalid email or password");
  }

  return res.json({
    user: publicUser(user),
    token: signToken(user.id),
  });
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
