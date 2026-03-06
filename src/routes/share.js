const router = require("express").Router();
const path = require("path");
const fs = require("fs-extra");
const fileService = require("../services/fileService");
const { fail } = require("../utils/responseHelper");

router.get("/:token", async (req, res, next) => {
  try {
    const record = fileService.findByShareToken(req.params.token);
    if (!record) return fail(res, "Invalid or expired share link", 404);

    const filePath = await fileService.getFilePath(record.userId, record.storedName);
    if (!(await fs.pathExists(filePath))) return fail(res, "File no longer available", 410);

    record.downloadCount += 1;
    res.setHeader("Content-Disposition", `attachment; filename="${record.originalName}"`);
    res.setHeader("Content-Type", record.mimeType);
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
