const axios = require("axios");
const { presets, providers } = require("./providers");

class DownloaderClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 120000;
    this.apiKey = options.apiKey || null;
    this.baseUrl = resolveBaseUrl(options.baseUrl, options.preset || "nekosune");
    this.provider = providers.compatible(this.baseUrl);
  }

  useBaseUrl(baseUrl) {
    this.baseUrl = resolveBaseUrl(baseUrl);
    this.provider = providers.compatible(this.baseUrl);
    return this;
  }

  usePreset(name) {
    this.baseUrl = resolveBaseUrl(null, name);
    this.provider = providers.compatible(this.baseUrl);
    return this;
  }

  async createMp3Job(link, options = {}) {
    return this.provider.createMp3Job({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      link,
      uploadDest: options.uploadDest || "cdn"
    });
  }

  async createMp4Job(link, options = {}) {
    return this.provider.createMp4Job({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      link,
      uploadDest: options.uploadDest || "cdn"
    });
  }

  async getJob(jobId, options = {}) {
    return this.provider.getJob({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      jobId
    });
  }

  async waitForJob(jobId, options = {}) {
    const intervalMs = Math.max(500, options.intervalMs || 2000);
    const timeoutMs = Math.max(intervalMs, options.timeoutMs || 300000);
    const started = Date.now();

    while (true) {
      const state = await this.getJob(jobId, options);
      if (typeof options.onProgress === "function") {
        options.onProgress(state);
      }
      if (state && state.status === "done") {
        return state;
      }
      if (state && (state.status === "error" || state.status === "failed")) {
        throw new Error(state.message || "Downloader job failed.");
      }
      if (Date.now() - started > timeoutMs) {
        throw new Error("Downloader job wait timed out.");
      }
      await sleep(intervalMs);
    }
  }

  async getInfo(url, options = {}) {
    return this.provider.getInfo({
      http: this.createHttp(options),
      url,
      flat: Boolean(options.flat || options.flatPlaylist),
      fields: options.fields || "basic",
      cache: typeof options.cache === "number" ? options.cache : 1
    });
  }

  async searchYouTube(query, options = {}) {
    return this.provider.searchYouTube({
      http: this.createHttp(options),
      query,
      limit: typeof options.limit === "number" ? options.limit : 5
    });
  }

  getStreamUrl(url) {
    return this.provider.getStreamUrl({ url });
  }

  async stream(url, options = {}) {
    return this.provider.stream({
      http: this.createHttp(options),
      url,
      responseType: options.responseType || "stream"
    });
  }

  createHttp(options = {}) {
    return axios.create({ timeout: options.timeoutMs || this.timeoutMs });
  }
}

function resolveBaseUrl(baseUrl, preset) {
  if (baseUrl) {
    return String(baseUrl).replace(/\/+$/, "");
  }
  if (preset && presets[preset]) {
    return presets[preset];
  }
  throw new Error(`Unknown downloader preset "${preset}". Available: ${Object.keys(presets).join(", ")}`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  DownloaderClient,
  presets,
  providers
};