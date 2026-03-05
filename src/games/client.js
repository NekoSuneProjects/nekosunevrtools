const axios = require("axios");
const { presets, providers } = require("./providers");

class GamesClient {
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

  getClashOfClansClan(clanTag, options = {}) {
    return this.provider.getClashOfClansClan({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      clanTag
    });
  }

  getClashOfClansPlayer(playerTag, options = {}) {
    return this.provider.getClashOfClansPlayer({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      playerTag
    });
  }

  getDivision2Player(username, platform = "psn", options = {}) {
    return this.provider.getDivision2Player({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getFortnitePlayer(username, timeWindow = "lifetime", options = {}) {
    return this.provider.getFortnitePlayer({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      timeWindow
    });
  }

  getFortniteCreatorCode(creatorCode, options = {}) {
    return this.provider.getFortniteCreatorCode({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      creatorCode
    });
  }

  getFortniteItemShop(options = {}) {
    return this.provider.getFortniteItemShop({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey
    });
  }

  getWynncraftProfile(username, options = {}) {
    return this.provider.getWynncraftProfile({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username
    });
  }

  getHypixelProfile(username, options = {}) {
    return this.provider.getHypixelProfile({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username
    });
  }

  getRocketLeaguePlayer(username, platform = "psn", options = {}) {
    return this.provider.getRocketLeaguePlayer({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getApexLegendsPlayer(username, platform = "psn", options = {}) {
    return this.provider.getApexLegendsPlayer({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getBattlefield1Player(username, platform = "psn", options = {}) {
    return this.provider.getBattlefield1Player({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getBattlefield5Player(username, platform = "psn", options = {}) {
    return this.provider.getBattlefield5Player({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getBattlefield2042Player(username, platform = "ea", options = {}) {
    return this.provider.getBattlefield2042Player({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
    });
  }

  getBattlefield6Player(username, platform = "psn", options = {}) {
    return this.provider.getBattlefield6Player({
      http: this.createHttp(options),
      apiKey: options.apiKey || this.apiKey,
      username,
      platform
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
  throw new Error(`Unknown games preset "${preset}". Available: ${Object.keys(presets).join(", ")}`);
}

module.exports = {
  GamesClient,
  presets,
  providers
};
