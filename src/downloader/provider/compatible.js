function createDownloaderProvider(baseUrl) {
  const normalizedBaseUrl = String(baseUrl || "").replace(/\/+$/, "");
  if (!normalizedBaseUrl) {
    throw new Error("Missing downloader baseUrl.");
  }

  async function createMp3Job(context) {
    return createJob(context, "mp3");
  }

  async function createMp4Job(context) {
    return createJob(context, "mp4");
  }

  async function createJob(context, mode) {
    const { apiKey, http, link, uploadDest } = context;
    assertApiKey(apiKey);
    if (!link) {
      throw new Error(`Missing "link" for ${mode} job.`);
    }

    const response = await http.post(`${normalizedBaseUrl}/api/${mode}/jobs`, {
      link,
      upload_dest: uploadDest || "cdn"
    }, {
      headers: buildAuthHeaders(apiKey)
    });

    const body = response.data || {};
    if (!body.job_id) {
      throw new Error(`Downloader ${mode} job did not return job_id.`);
    }

    return {
      provider: "downloader-compatible",
      jobId: body.job_id,
      raw: body
    };
  }

  async function getJob(context) {
    const { apiKey, http, jobId } = context;
    assertApiKey(apiKey);
    if (!jobId) {
      throw new Error('Missing "jobId".');
    }

    const response = await http.get(`${normalizedBaseUrl}/api/jobs/${encodeURIComponent(jobId)}`, {
      headers: buildAuthHeaders(apiKey)
    });
    return response.data || {};
  }

  async function getInfo(context) {
    const { http, url, flat, fields, cache } = context;
    if (!url) {
      throw new Error('Missing "url" for info endpoint.');
    }
    const response = await http.get(`${normalizedBaseUrl}/api/info`, {
      params: {
        url,
        flat: flat ? 1 : undefined,
        fields: fields || undefined,
        cache: typeof cache === "number" ? cache : undefined
      }
    });
    return response.data || {};
  }

  async function searchYouTube(context) {
    const { http, query, limit } = context;
    if (!query) {
      throw new Error('Missing "query" for youtube search.');
    }
    const response = await http.get(`${normalizedBaseUrl}/api/search/youtube`, {
      params: {
        q: query,
        limit: typeof limit === "number" ? limit : undefined
      }
    });
    return response.data || {};
  }

  function getStreamUrl(context) {
    const { url } = context;
    if (!url) {
      throw new Error('Missing "url" for stream endpoint.');
    }
    return `${normalizedBaseUrl}/api/stream?url=${encodeURIComponent(url)}`;
  }

  async function stream(context) {
    const { http, url, responseType } = context;
    const streamUrl = getStreamUrl({ url });
    const response = await http.get(streamUrl, {
      responseType: responseType || "stream"
    });
    return response;
  }

  return {
    createMp3Job,
    createMp4Job,
    getJob,
    getInfo,
    searchYouTube,
    getStreamUrl,
    stream
  };
}

function assertApiKey(apiKey) {
  if (!apiKey) {
    throw new Error('Missing downloader apiKey. Pass "apiKey" in client options or call options.');
  }
}

function buildAuthHeaders(apiKey) {
  return {
    "x-api-key": apiKey,
    Authorization: `Bearer ${apiKey}`
  };
}

module.exports = {
  createDownloaderProvider
};