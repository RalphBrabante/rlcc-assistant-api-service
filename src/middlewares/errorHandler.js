// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  const statusCode = Number(err.code || err.status || 500);
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    code: statusCode,
    message,
    details: err.details,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
