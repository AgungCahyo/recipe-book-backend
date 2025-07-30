module.exports = function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan di server";

  console.error("🔥 Error:", message);

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Optional stack trace for dev
  });
};
