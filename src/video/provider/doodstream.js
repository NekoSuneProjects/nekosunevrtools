const FormData = require("form-data");
const { createProgressFilePart } = require("../../utils/file");

const DOOD_API_BASE = "https://doodapi.co";

async function upload(context) {
  const { filePath, apiKey, http, onProgress } = context;
  assertApiKey(apiKey);

  const serverResponse = await http.get(`${DOOD_API_BASE}/api/upload/server`, {
    params: { key: apiKey }
  });
  const serverData = serverResponse.data || {};
  if (serverData.status !== 200 || !serverData.result) {
    throw new Error(serverData.msg || "Failed to get DoodStream upload server.");
  }

  const filePart = createProgressFilePart(filePath, onProgress);
  const form = new FormData();
  form.append("api_key", apiKey);
  form.append("file", filePart.stream, filePart.filename);

  const uploadTarget = buildUploadTarget(serverData.result, apiKey);
  const uploadResponse = await http.post(uploadTarget, form, {
    headers: {
      ...form.getHeaders()
    },
    maxBodyLength: Infinity
  });

  const uploadData = uploadResponse.data || {};
  if (uploadData.status !== 200 || !uploadData.result || !uploadData.result.length) {
    throw new Error(uploadData.msg || "DoodStream upload failed.");
  }

  const uploaded = uploadData.result[0];
  const watchUrl = uploaded.protected_embed || uploaded.download_url || uploaded.url;
  if (!watchUrl) {
    throw new Error("DoodStream did not return a watch/download URL.");
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
    provider: "doodstream",
    success: true,
    videoId: uploaded.filecode || null,
    filecode: uploaded.filecode || null,
    watchUrl,
    raw: uploadData
  };
}

async function cloneFile(context) {
  const { apiKey, fileCode, folderId, http } = context;
  assertApiKey(apiKey);
  if (!fileCode) {
    throw new Error('Missing "fileCode" for doodstream clone.');
  }

  const response = await http.get(`${DOOD_API_BASE}/api/file/clone`, {
    params: {
      key: apiKey,
      file_code: fileCode,
      fld_id: folderId || undefined
    }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream clone failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    result: body.result || null,
    raw: body
  };
}

async function remoteUploadAdd(context) {
  const { apiKey, uploadUrl, folderId, newTitle, http } = context;
  assertApiKey(apiKey);
  if (!uploadUrl) {
    throw new Error('Missing "uploadUrl" for doodstream remote upload.');
  }

  const response = await http.get(`${DOOD_API_BASE}/api/upload/url`, {
    params: {
      key: apiKey,
      url: uploadUrl,
      fld_id: folderId || undefined,
      new_title: newTitle || undefined
    }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream remote upload add failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    filecode: body.result && body.result.filecode ? body.result.filecode : null,
    raw: body
  };
}

async function remoteUploadList(context) {
  const { apiKey, http } = context;
  assertApiKey(apiKey);

  const response = await http.get(`${DOOD_API_BASE}/api/urlupload/list`, {
    params: { key: apiKey }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream remote upload list failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    items: Array.isArray(body.result) ? body.result : [],
    raw: body
  };
}

async function remoteUploadStatus(context) {
  const { apiKey, fileCode, http } = context;
  assertApiKey(apiKey);
  if (!fileCode) {
    throw new Error('Missing "fileCode" for doodstream remote upload status.');
  }

  const response = await http.get(`${DOOD_API_BASE}/api/urlupload/status`, {
    params: {
      key: apiKey,
      file_code: fileCode
    }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream remote upload status failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    items: Array.isArray(body.result) ? body.result : [],
    raw: body
  };
}

async function remoteUploadSlots(context) {
  const { apiKey, http } = context;
  assertApiKey(apiKey);

  const response = await http.get(`${DOOD_API_BASE}/api/urlupload/slots`, {
    params: { key: apiKey }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream remote upload slots failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    totalSlots: body.total_slots || null,
    usedSlots: body.used_slots || null,
    raw: body
  };
}

async function remoteUploadActions(context) {
  const { apiKey, restartErrors, clearErrors, clearAll, deleteCode, http } = context;
  assertApiKey(apiKey);

  const response = await http.get(`${DOOD_API_BASE}/api/urlupload/actions`, {
    params: {
      key: apiKey,
      restart_errors: restartErrors ? 1 : undefined,
      clear_errors: clearErrors ? 1 : undefined,
      clear_all: clearAll ? 1 : undefined,
      delete_code: deleteCode || undefined
    }
  });
  const body = response.data || {};
  if (body.status !== 200) {
    throw new Error(body.msg || "DoodStream remote upload action failed.");
  }

  return {
    provider: "doodstream",
    success: true,
    raw: body
  };
}

function assertApiKey(apiKey) {
  if (!apiKey) {
    throw new Error('Missing apiKey for "doodstream".');
  }
}

function buildUploadTarget(serverUrl, apiKey) {
  const separator = serverUrl.includes("?") ? "&" : "?";
  return `${serverUrl}${separator}${encodeURIComponent(apiKey)}`;
}

module.exports = {
  upload,
  cloneFile,
  remoteUploadAdd,
  remoteUploadList,
  remoteUploadStatus,
  remoteUploadSlots,
  remoteUploadActions
};
