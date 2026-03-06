const fs = require("fs-extra");
const path = require("path");
const archiver = require("archiver");
const mime = require("mime-types");
const { v4: uuidv4 } = require("uuid");
const config = require("../config/app");

const fileRegistry = new Map();

function registerFile(userId, originalName, storedName, size) {
  const id = uuidv4();
  const record = {
    id,
    userId,
    originalName,
    storedName,
    size,
    mimeType: mime.lookup(originalName) || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    downloadCount: 0,
    shareToken: null,
  };
  fileRegistry.set(id, record);
  return record;
}

function getFileRecord(fileId) {
  return fileRegistry.get(fileId) || null;
}

function listUserFiles(userId) {
  return [...fileRegistry.values()].filter((f) => f.userId === userId);
}

function deleteFileRecord(fileId) {
  return fileRegistry.delete(fileId);
}

function generateShareToken(fileId) {
  const record = fileRegistry.get(fileId);
  if (!record) return null;
  record.shareToken = uuidv4();
  return record.shareToken;
}

function findByShareToken(token) {
  for (const f of fileRegistry.values()) {
    if (f.shareToken === token) return f;
  }
  return null;
}

async function getFilePath(userId, storedName) {
  return path.join(config.uploadDir, userId, storedName);
}

async function deletePhysicalFile(userId, storedName) {
  const filePath = await getFilePath(userId, storedName);
  await fs.remove(filePath);
}

async function createZipOfFiles(fileIds, userId) {
  const tmpPath = path.join(config.uploadDir, `${uuidv4()}.zip`);
  const output = fs.createWriteStream(tmpPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  await new Promise((resolve, reject) => {
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);

    for (const fid of fileIds) {
      const rec = fileRegistry.get(fid);
      if (rec && rec.userId === userId) {
        const fp = path.join(config.uploadDir, userId, rec.storedName);
        if (fs.existsSync(fp)) {
          archive.file(fp, { name: rec.originalName });
        }
      }
    }
    archive.finalize();
  });

  return tmpPath;
}

module.exports = {
  registerFile,
  getFileRecord,
  listUserFiles,
  deleteFileRecord,
  generateShareToken,
  findByShareToken,
  getFilePath,
  deletePhysicalFile,
  createZipOfFiles,
};
