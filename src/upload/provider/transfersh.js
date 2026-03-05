const path = require("path");
const { createProgressFilePart } = require("../../utils/file");

async function upload(context) {
  const { filePath, headers, http, onProgress } = context;
  const filePart = createProgressFilePart(filePath, onProgress);
  const fileName = encodeURIComponent(path.basename(filePath));

  let response;
  try {
    response = await http.put(`https://transfer.sh/${fileName}`, filePart.stream, {
      headers: {
        "Content-Type": "application/octet-stream",
        ...headers
      },
      maxBodyLength: Infinity,
      responseType: "text",
      transformResponse: [(data) => data]
    });
  } catch (error) {
    if (typeof onProgress === "function") {
      onProgress({
        phase: "error",
        filename: filePart.filename,
        totalBytes: filePart.totalBytes,
        bytesTransferred: 0,
        percent: 0,
        message: error.message
      });
    }
    throw error;
  }

  const raw = String(response.data || "").trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    throw new Error(raw || "transfer.sh upload failed.");
  }
  if (typeof onProgress === "function") {
    onProgress({
      phase: "complete",
      filename: filePart.filename,
      totalBytes: filePart.totalBytes,
      bytesTransferred: filePart.totalBytes,
      percent: 100
    });
  }

  return {
    platform: "transfersh",
    success: true,
    url: raw,
    raw
  };
}

module.exports = {
  upload
};
