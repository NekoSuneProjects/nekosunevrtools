const FormData = require("form-data");
const { createProgressFilePart } = require("../../utils/file");

async function upload(context) {
  const { filePath, metadata, headers, http, onProgress } = context;

  const form = new FormData();
  const filePart = createProgressFilePart(filePath, onProgress);
  form.append("file", filePart.stream, filePart.filename);

  if (metadata.expires) {
    form.append("expires", metadata.expires);
  }

  let response;
  try {
    response = await http.post("https://file.io", form, {
      headers: {
        ...form.getHeaders(),
        ...headers
      },
      maxBodyLength: Infinity
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

  const body = response.data || {};
  const link = body.link || body.url;
  const success = Boolean(body.success && link);
  if (!success) {
    throw new Error(body.message || "file.io upload failed.");
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
    platform: "fileio",
    success: true,
    url: link,
    raw: body
  };
}

module.exports = {
  upload
};
