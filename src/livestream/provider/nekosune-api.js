function createLivestreamProvider(baseUrl) {
  const root = String(baseUrl || "https://api.nekosunevr.co.uk").replace(/\/+$/, "");

  async function getKick(context) {
    return getByPlatform(context, "kick");
  }

  async function getTwitch(context) {
    return getByPlatform(context, "twitch");
  }

  async function getDlive(context) {
    return getByPlatform(context, "dlive");
  }

  async function getTrovo(context) {
    return getByPlatform(context, "trovo");
  }

  async function getByPlatform(context, platform) {
    const { http, apiKey, username } = context;
    assertApiKey(apiKey);
    if (!username) {
      throw new Error(`Missing username for livestream platform "${platform}".`);
    }
    const response = await http.get(`${root}/v5/social/api/${platform}/${encodeURIComponent(username)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  return {
    getKick,
    getTwitch,
    getDlive,
    getTrovo,
    getByPlatform
  };
}

function assertApiKey(apiKey) {
  if (!apiKey) {
    throw new Error("Missing API key. Pass apiKey in client options or method options.");
  }
}

function buildHeaders(apiKey) {
  return {
    "nekosunevr-api-key": apiKey,
    Authorization: `Bearer ${apiKey}`
  };
}

module.exports = {
  createLivestreamProvider
};