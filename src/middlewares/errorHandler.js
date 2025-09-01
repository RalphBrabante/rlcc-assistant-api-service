// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  const statusCode = err.status || 500;
  const status = err.status || "error";

  res.status(statusCode).json({
    status: status,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};