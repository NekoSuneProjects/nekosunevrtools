const FormData = require("form-data");
const { createProgressFilePart } = require("../../utils/file");

async function upload(context) {
  const { filePath, apiKey, metadata, headers, http, onProgress } = context;

  if (!apiKey) {
    throw new Error('Missing apiKey for "upfiles". Pass apiKey in client config or upload options.');
  }

  const form = new FormData();
  const filePart = createProgressFilePart(filePath, onProgress);
  form.append("token", apiKey);
  form.append("file", filePart.stream, filePart.filename);

  for (const [key, value] of Object.entries(metadata || {})) {
    form.append(key, value);
  }
  let response;
  try {
    response = await http.post("https://api.upfiles.com/upload", form, {
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
  const success = body.status === "success" && Boolean(body.url);
  if (!success) {
    throw new Error(body.message || "UpFiles upload failed.");
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
    platform: "upfiles",
    success: true,
    url: body.url,
    raw: body
  };
}

module.exports = {
  upload
};
