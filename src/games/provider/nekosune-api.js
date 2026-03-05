function createGamesProvider(baseUrl) {
  const root = String(baseUrl || "https://api.nekosunevr.co.uk").replace(/\/+$/, "");

  async function getClashOfClansClan(context) {
    const { http, apiKey, clanTag } = context;
    assertApiKey(apiKey);
    const tag = normalizeTag(clanTag, "clanTag");

    const response = await http.get(`${root}/v5/games/api/clashofclans/clans/${encodeURIComponent(tag)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getClashOfClansPlayer(context) {
    const { http, apiKey, playerTag } = context;
    assertApiKey(apiKey);
    const tag = normalizeTag(playerTag, "playerTag");

    const response = await http.get(`${root}/v5/games/api/clashofclans/players/${encodeURIComponent(tag)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getDivision2Player(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/division2/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getFortnitePlayer(context) {
    const { http, apiKey, username, timeWindow } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedTimeWindow = String(timeWindow || "lifetime").trim().toLowerCase();
    if (!normalizedTimeWindow) {
      throw new Error("Missing timeWindow.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("timeWindow", normalizedTimeWindow);

    const response = await http.post(`${root}/v5/games/api/fortnite/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getFortniteCreatorCode(context) {
    const { http, apiKey, creatorCode } = context;
    assertApiKey(apiKey);

    const normalizedCreatorCode = String(creatorCode || "").trim();
    if (!normalizedCreatorCode) {
      throw new Error("Missing creatorCode.");
    }

    const response = await http.get(`${root}/v5/games/api/fortnite/creatorcode/${encodeURIComponent(normalizedCreatorCode)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getFortniteItemShop(context) {
    const { http, apiKey } = context;
    assertApiKey(apiKey);

    const response = await http.get(`${root}/v5/games/api/fortnite/item-shop`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getWynncraftProfile(context) {
    const { http, apiKey, username } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }

    const response = await http.get(`${root}/v5/games/api/wynncraft/profile/${encodeURIComponent(normalizedUsername)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getHypixelProfile(context) {
    const { http, apiKey, username } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }

    const response = await http.get(`${root}/v5/games/api/hypixel/profile/${encodeURIComponent(normalizedUsername)}`, {
      headers: buildHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getRocketLeaguePlayer(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/rocketleague/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getApexLegendsPlayer(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/apexlegends/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getBattlefield1Player(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/battlefield1/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getBattlefield5Player(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/battlefield5/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getBattlefield2042Player(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "ea").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/battlefield2042/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  async function getBattlefield6Player(context) {
    const { http, apiKey, username, platform } = context;
    assertApiKey(apiKey);

    const normalizedUsername = String(username || "").trim();
    if (!normalizedUsername) {
      throw new Error("Missing username.");
    }
    const normalizedPlatform = String(platform || "psn").trim().toLowerCase();
    if (!normalizedPlatform) {
      throw new Error("Missing platform.");
    }

    const payload = new URLSearchParams();
    payload.set("username", normalizedUsername);
    payload.set("platform", normalizedPlatform);

    const response = await http.post(`${root}/v5/games/api/battlefield6/player`, payload.toString(), {
      headers: {
        ...buildHeaders(apiKey),
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    return response.data || {};
  }

  return {
    getClashOfClansClan,
    getClashOfClansPlayer,
    getDivision2Player,
    getFortnitePlayer,
    getFortniteCreatorCode,
    getFortniteItemShop,
    getWynncraftProfile,
    getHypixelProfile,
    getRocketLeaguePlayer,
    getApexLegendsPlayer,
    getBattlefield1Player,
    getBattlefield5Player,
    getBattlefield2042Player,
    getBattlefield6Player
  };
}

function normalizeTag(tag, fieldName) {
  if (!tag) {
    throw new Error(`Missing ${fieldName}.`);
  }
  return String(tag).replace(/^#/, "").trim().toUpperCase();
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
  createGamesProvider
};
