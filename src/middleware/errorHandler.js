const multer = require("multer");

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ error: "File exceeds size limit" });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "File type not permitted") {
    return res.status(400).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
}

module.exports = errorHandler;
