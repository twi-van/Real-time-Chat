const { sendError } = require("../lib/errors");

function errorHandler(err, req, res, _next) {
  console.error("API error:", err?.code || err?.name, err?.message);

  // Prisma: unique constraint (email trùng race)
  if (err?.code === "P2002") {
    return sendError(res, 400, "VALIDATION_ERROR", "Duplicate value");
  }

  // Prisma: record không tồn tại
  if (err?.code === "P2025") {
    return sendError(res, 403, "FORBIDDEN");
  }

  // UUID / input sai kiểu
  if (
    err?.name === "PrismaClientValidationError" ||
    err?.code === "P2023"
  ) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid data");
  }

  return sendError(res, 500, "VALIDATION_ERROR", "Internal server error");
}

function notFoundHandler(_req, res) {
  return sendError(res, 404, "VALIDATION_ERROR", "Not found");
}

module.exports = { errorHandler, notFoundHandler };
