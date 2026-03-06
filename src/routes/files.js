const router = require("express").Router();
const path = require("path");
const fs = require("fs-extra");
const upload = require("../config/storage");
const { authenticate } = require("../middleware/auth");
const { uploadLimiter } = require("../middleware/rateLimiter");
const fileService = require("../services/fileService");
const { success, fail, paginate } = require("../utils/responseHelper");

router.use(authenticate);

router.post("/upload", uploadLimiter, upload.array("files", 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) return fail(res, "No files uploaded");
    const records = req.files.map((f) =>
      fileService.registerFile(req.user.id, f.originalname, f.filename, f.size)
    );
    return success(res, { uploaded: records }, 201);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const all = fileService.listUserFiles(req.user.id);
    return success(res, paginate(all, page, limit));
  } catch (err) {
    next(err);
  }
});

router.get("/:fileId/download", async (req, res, next) => {
  try {
    const record = fileService.getFileRecord(req.params.fileId);
    if (!record) return fail(res, "File not found", 404);
    if (record.userId !== req.user.id) return fail(res, "Forbidden", 403);

    const filePath = await fileService.getFilePath(req.user.id, record.storedName);
    if (!(await fs.pathExists(filePath))) return fail(res, "File no longer exists on disk", 410);

    record.downloadCount += 1;
    res.setHeader("Content-Disposition", `attachment; filename="${record.originalName}"`);
    res.setHeader("Content-Type", record.mimeType);
    res.sendFile(path.resolve(filePath));
  } catch (err) {
    next(err);
  }
});

router.post("/:fileId/share", async (req, res, next) => {
  try {
    const record = fileService.getFileRecord(req.params.fileId);
    if (!record) return fail(res, "File not found", 404);
    if (record.userId !== req.user.id) return fail(res, "Forbidden", 403);

    const token = fileService.generateShareToken(req.params.fileId);
    return success(res, { shareToken: token, url: `/api/share/${token}` });
  } catch (err) {
    next(err);
  }
});

router.post("/bulk-download", async (req, res, next) => {
  try {
    const { fileIds } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) return fail(res, "fileIds array required");

    const zipPath = await fileService.createZipOfFiles(fileIds, req.user.id);
    res.setHeader("Content-Disposition", 'attachment; filename="files.zip"');
    res.setHeader("Content-Type", "application/zip");
    const stream = fs.createReadStream(zipPath);
    stream.pipe(res);
    stream.on("end", () => fs.remove(zipPath).catch(() => {}));
  } catch (err) {
    next(err);
  }
});

router.delete("/:fileId", async (req, res, next) => {
  try {
    const record = fileService.getFileRecord(req.params.fileId);
    if (!record) return fail(res, "File not found", 404);
    if (record.userId !== req.user.id) return fail(res, "Forbidden", 403);

    await fileService.deletePhysicalFile(req.user.id, record.storedName);
    fileService.deleteFileRecord(req.params.fileId);
    return success(res, { deleted: req.params.fileId });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
