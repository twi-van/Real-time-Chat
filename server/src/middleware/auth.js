const { verifyToken } = require("../lib/jwt");
const { findUserById, publicUser } = require("../lib/store");
const { sendError } = require("../lib/errors");

function authMiddleware(req,res,next){
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return sendError(res, 401, "UNAUTHORIZED");
    }

    const token = header.slice("Bearer ".length).trim(); //lấy chuỗi token
    if (!token) {
        return sendError(res, 401, "UNAUTHORIZED");
    }
    try {
        const payload = verifyToken(token);
        const user = findUserById(payload.userId);
        if (!user) {
          return sendError(res, 401, "UNAUTHORIZED");
        }
        req.user = publicUser(user);
        return next(); //chuyển vào route
      } catch {
        return sendError(res, 401, "UNAUTHORIZED");
      }
    }
    module.exports = { authMiddleware };
