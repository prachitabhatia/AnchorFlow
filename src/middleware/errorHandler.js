const ApiError = require("../utils/ApiError");

module.exports = function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);

  let error = new ApiError(500, "INTERNAL_ERROR", "Internal server error");
  if (err instanceof ApiError) error = err;
  else if (err && err.code === "P2025") error = ApiError.notFound();

  res.status(error.statusCode).json({
    error: { code: error.code, message: error.message, details: error.details ?? null },
  });
};
