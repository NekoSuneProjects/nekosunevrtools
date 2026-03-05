const FormData = require("form-data");
const { createProgressFilePart } = require("../../utils/file");

async function upload(context) {
  const { filePath, apiKey, metadata, headers, http, onProgress } = context;

  const form = new FormData();
  const filePart = createProgressFilePart(filePath, onProgress);
  form.append("reqtype", "fileupload");
  if (apiKey) {
    form.append("userhash", apiKey);
  }
  form.append("fileToUpload", filePart.stream, filePart.filename);

  for (const [key, value] of Object.entries(metadata || {})) {
    form.append(key, value);
  }

  let response;
  try {
    response = await http.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders(),
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
  if (!raw || /^error/i.test(raw)) {
    throw new Error(raw || "Catbox upload failed.");
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
    platform: "catbox",
    success: true,
    url: raw,
    raw
  };
}

module.exports = {
  upload
};
