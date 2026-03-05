const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");

function ensureReadableFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  return stat;
}

function createProgressFilePart(filePath, onProgress) {
  const stat = ensureReadableFile(filePath);
  const totalBytes = stat.size;
  const filename = path.basename(filePath);
  const source = fs.createReadStream(filePath);
  const tracked = new PassThrough();
  let transferred = 0;

  if (typeof onProgress === "function") {
    onProgress({
      phase: "start",
      filename,
      totalBytes,
      bytesTransferred: 0,
      percent: totalBytes === 0 ? 100 : 0
    });
  }

  source.on("data", (chunk) => {
    transferred += chunk.length;
    if (typeof onProgress === "function") {
      const percent = totalBytes === 0 ? 100 : Math.min(100, Math.round((transferred / totalBytes) * 100));
      onProgress({
        phase: "uploading",
        filename,
        totalBytes,
        bytesTransferred: transferred,
        percent
      });
    }
  });

  source.on("error", (error) => {
    tracked.destroy(error);
  });

  source.pipe(tracked);

  return {
    stream: tracked,
    filename,
    totalBytes
  };
}

module.exports = {
  ensureReadableFile,
  createProgressFilePart
};
