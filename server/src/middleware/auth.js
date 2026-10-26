const { verifyToken } = require("../lib/jwt");
const { prisma } = require("../lib/prisma");
const { publicUser } = require("../lib/store");
const { sendError } = require("../lib/errors");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return sendError(res, 401, "UNAUTHORIZED");
  }

  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    return sendError(res, 401, "UNAUTHORIZED");
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      return sendError(res, 401, "UNAUTHORIZED");
    }
    req.user = publicUser(user);
    return next();
  } catch {
    return sendError(res, 401, "UNAUTHORIZED");
  }
}

module.exports = { authMiddleware };
