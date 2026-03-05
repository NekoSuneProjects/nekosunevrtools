const axios = require("axios");
const { UploadClient } = require("./upload/client");
const { providers: shorturlProviders, presets: shortenerPresets } = require("./shorturl/providers");
const videoProviders = require("./video/providers");

class EarningsClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 60000;
    this.uploadClient = options.uploadClient || new UploadClient(options.upload || {});
    this.shorteners = { ...shorturlProviders };
    this.videos = { ...videoProviders };
  }

  registerShortener(name, adapter) {
    if (!name || typeof name !== "string") {
      throw new Error("Shortener name must be a non-empty string.");
    }
    if (!adapter || typeof adapter.shorten !== "function") {
      throw new Error("Shortener adapter must provide shorten(context).");
    }
    this.shorteners[name] = adapter;
    return this;
  }

  registerVideoProvider(name, adapter) {
    if (!name || typeof name !== "string") {
      throw new Error("Video provider name must be a non-empty string.");
    }
    if (!adapter || typeof adapter.upload !== "function") {
      throw new Error("Video adapter must provide upload(context).");
    }
    this.videos[name] = adapter;
    return this;
  }

  async shortenUrl(longUrl, options = {}) {
    if (!longUrl || typeof longUrl !== "string") {
      throw new Error("longUrl is required and must be a string.");
    }

    const providerName = options.provider || "adlinkfly-compatible";
    const adapter = this.shorteners[providerName];
    if (!adapter) {
      throw new Error(`Unsupported shortener provider "${providerName}".`);
    }

    const resolved = resolveShortenerOptions(providerName, options);
    return adapter.shorten({
      longUrl,
      apiKey: options.apiKey || null,
      options: resolved,
      http: axios.create({ timeout: options.timeoutMs || this.timeoutMs })
    });
  }

  async uploadAndShorten(filePath, options = {}) {
    const uploadResult = await this.uploadClient.upload(filePath, {
      platform: options.uploadPlatform,
      apiKey: options.uploadApiKey,
      metadata: options.uploadMetadata,
      headers: options.uploadHeaders,
      timeoutMs: options.timeoutMs || this.timeoutMs,
      onProgress: options.onProgress
    });

    const shortResult = await this.shortenUrl(uploadResult.url, {
      provider: options.shortenerProvider || "adlinkfly-compatible",
      apiKey: options.shortenerApiKey,
      preset: options.shortenerPreset,
      baseUrl: options.shortenerBaseUrl,
      alias: options.alias,
      adsType: options.adsType,
      responseFormat: options.responseFormat,
      timeoutMs: options.timeoutMs || this.timeoutMs
    });

    return {
      success: true,
      upload: uploadResult,
      shortlink: shortResult
    };
  }

  async uploadVideo(filePath, options = {}) {
    const provider = options.provider || "doodstream";
    const adapter = this.videos[provider];
    if (!adapter) {
      throw new Error(`Unsupported video provider "${provider}".`);
    }

    return adapter.upload({
      filePath,
      apiKey: options.apiKey || null,
      metadata: options.metadata || {},
      onProgress: options.onProgress,
      http: axios.create({ timeout: options.timeoutMs || this.timeoutMs })
    });
  }
}

function resolveShortenerOptions(provider, options) {
  if (provider !== "adlinkfly-compatible") {
    return options;
  }

  let baseUrl = options.baseUrl || null;
  if (!baseUrl && options.preset) {
    baseUrl = shortenerPresets[options.preset] || null;
  }
  if (!baseUrl) {
    throw new Error(
      `Missing shortener base URL. Use "baseUrl" or "preset". Presets: ${Object.keys(shortenerPresets).join(", ")}`
    );
  }

  return {
    provider,
    baseUrl,
    alias: options.alias || null,
    adsType: typeof options.adsType === "number" ? options.adsType : null,
    responseFormat: options.responseFormat || "json"
  };
}

module.exports = {
  EarningsClient,
  shortenerPresets
};
