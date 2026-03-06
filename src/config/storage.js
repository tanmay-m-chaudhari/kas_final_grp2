const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const config = require("./app");

fs.ensureDirSync(config.uploadDir);

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userDir = path.join(config.uploadDir, req.user.id);
    await fs.ensureDir(userDir);
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const blocked = [".exe", ".bat", ".cmd", ".sh", ".ps1"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (blocked.includes(ext)) {
    return cb(new Error("File type not permitted"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSizeMb * 1024 * 1024 },
});

module.exports = upload;
