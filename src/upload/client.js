const axios = require("axios");
const providers = require("./providers");

class UploadClient {
  constructor(options = {}) {
    this.defaultPlatform = options.platform || "upfiles";
    this.defaultApiKey = options.apiKey || null;
    this.timeoutMs = options.timeoutMs || 60000;
    this.adapters = { ...providers };
  }

  registerPlatform(name, adapter) {
    if (!name || typeof name !== "string") {
      throw new Error("Platform name must be a non-empty string.");
    }

    if (!adapter || typeof adapter.upload !== "function") {
      throw new Error("Adapter must provide an upload(context) function.");
    }

    this.adapters[name] = adapter;
    return this;
  }

  async upload(filePath, options = {}) {
    if (!filePath || typeof filePath !== "string") {
      throw new Error("filePath is required and must be a string.");
    }

    const platform = options.platform || this.defaultPlatform;
    const adapter = this.adapters[platform];
    if (!adapter) {
      throw new Error(
        `Unsupported platform "${platform}". Registered: ${Object.keys(this.adapters).join(", ")}`
      );
    }

    const apiKey = options.apiKey || this.defaultApiKey || null;
    const timeoutMs = options.timeoutMs || this.timeoutMs;
    const headers = options.headers || {};
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : null;

    return adapter.upload({
      filePath,
      apiKey,
      metadata: options.metadata || {},
      headers,
      http: axios.create({ timeout: timeoutMs }),
      onProgress
    });
  }
}

module.exports = {
  UploadClient,
  providers
};
