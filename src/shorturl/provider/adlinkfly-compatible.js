async function shorten(context) {
  const { longUrl, apiKey, http, options } = context;
  const baseUrl = options && options.baseUrl;
  if (!baseUrl) {
    throw new Error('Missing shortlink baseUrl for "adlinkfly-compatible" provider.');
  }
  if (!apiKey) {
    throw new Error('Missing shortlink apiKey for "adlinkfly-compatible" provider.');
  }

  const params = {
    api: apiKey,
    url: longUrl
  };

  if (options.alias) {
    params.alias = options.alias;
  }
  if (typeof options.adsType === "number") {
    params.type = options.adsType;
  }

  const wantsText = options.responseFormat === "text";
  if (!wantsText) {
    params.format = "json";
  } else {
    params.format = "text";
  }

  const response = await http.get(baseUrl, { params });
  const body = response.data;

  if (wantsText) {
    const shortUrl = String(body || "").trim();
    if (!shortUrl || !/^https?:\/\//i.test(shortUrl)) {
      throw new Error(shortUrl || "Shortlink provider returned invalid text response.");
    }
    return {
      provider: options.provider || "adlinkfly-compatible",
      success: true,
      shortUrl,
      raw: body
    };
  }

  if (!body || body.status === "error") {
    const message = normalizeErrorMessage(body && body.message);
    throw new Error(message || "Shortlink provider returned an error.");
  }

  const shortUrl = body.shortenedUrl || body.shortened_url || body.shortened || body.url;
  if (!shortUrl || !/^https?:\/\//i.test(String(shortUrl))) {
    throw new Error("Shortlink provider did not return a valid short URL.");
  }

  return {
    provider: options.provider || "adlinkfly-compatible",
    success: true,
    shortUrl: String(shortUrl),
    raw: body
  };
}

function normalizeErrorMessage(message) {
  if (Array.isArray(message)) {
    return message.join(", ");
  }
  return message ? String(message) : "";
}

module.exports = {
  shorten
};
