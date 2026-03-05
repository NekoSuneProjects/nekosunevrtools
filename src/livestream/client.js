const axios = require("axios");
const { presets, providers } = require("./providers");

class LivestreamClient {
  constructor(options = {}) {
    this.timeoutMs = options.timeoutMs || 60000;
    this.apiKey = options.apiKey || null;
    this.baseUrl = resolveBaseUrl(options.baseUrl, options.preset || "nekosune");
    this.provider = providers.nekosune(this.baseUrl);
  }

  useBaseUrl(baseUrl) {
    this.baseUrl = resolveBaseUrl(baseUrl);
    this.provider = providers.nekosune(this.baseUrl);
    return this;
  }

  usePreset(name) {
    this.baseUrl = resolveBaseUrl(null, name);
    this.provider = providers.nekosune(this.baseUrl);
    return this;
  }

  getKick(username, options = {}) {
    return this.provider.getKick(this.buildContext(username, options));
  }

  getTwitch(username, options = {}) {
    return this.provider.getTwitch(this.buildContext(username, options));
  }

  getDlive(username, options = {}) {
    return this.provider.getDlive(this.buildContext(username, options));
  }

  getTrovo(username, options = {}) {
    return this.provider.getTrovo(this.buildContext(username, options));
  }

  getByPlatform(platform, username, options = {}) {
    return this.provider.getByPlatform({
      ...this.buildContext(username, options),
      platform
    }, platform);
  }

  buildContext(username, options) {
    return {
      http: axios.create({ timeout: options.timeoutMs || this.timeoutMs }),
      apiKey: options.apiKey || this.apiKey,
      username
    };
  }
}

function resolveBaseUrl(baseUrl, preset) {
  if (baseUrl) {
    return String(baseUrl).replace(/\/+$/, "");
  }
  if (preset && presets[preset]) {
    return presets[preset];
  }
  throw new Error(`Unknown livestream preset "${preset}". Available: ${Object.keys(presets).join(", ")}`);
}

module.exports = {
  LivestreamClient,
  presets,
  providers
};