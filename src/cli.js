const path = require("path");
const axios = require("axios");
const { UploadClient, EarningsClient, shortenerPresets, DownloaderClient, downloaderPresets, LivestreamClient, livestreamPresets, GamesClient, gamesPresets } = require("./index");

async function runCli(argv = process.argv.slice(2)) {
  const parsed = parseArgs(argv);

  if (parsed.help || !parsed.command) {
    printHelp();
    return 0;
  }

  if (parsed.command === "upload") {
    return runUploadCommand(parsed);
  }
  if (parsed.command === "shorten") {
    return runShortenCommand(parsed);
  }
  if (parsed.command === "upload-shorten") {
    return runUploadShortenCommand(parsed);
  }
  if (parsed.command === "video-upload") {
    return runVideoUploadCommand(parsed);
  }
  if (parsed.command === "download-mp3") {
    return runDownloadJobCreateCommand(parsed, "mp3");
  }
  if (parsed.command === "download-mp4") {
    return runDownloadJobCreateCommand(parsed, "mp4");
  }
  if (parsed.command === "download-job") {
    return runDownloadJobStatusCommand(parsed);
  }
  if (parsed.command === "download-info") {
    return runDownloadInfoCommand(parsed);
  }
  if (parsed.command === "download-search") {
    return runDownloadSearchCommand(parsed);
  }
  if (parsed.command === "download-stream-url") {
    return runDownloadStreamUrlCommand(parsed);
  }
  if (parsed.command === "list-shorteners") {
    process.stdout.write(`${Object.keys(shortenerPresets).join("\n")}\n`);
    return 0;
  }
  if (parsed.command === "live-kick") {
    return runLivestreamCommand(parsed, "kick");
  }
  if (parsed.command === "live-twitch") {
    return runLivestreamCommand(parsed, "twitch");
  }
  if (parsed.command === "live-dlive") {
    return runLivestreamCommand(parsed, "dlive");
  }
  if (parsed.command === "live-trovo") {
    return runLivestreamCommand(parsed, "trovo");
  }
  if (parsed.command === "live") {
    return runLivestreamCommand(parsed, parsed.streamPlatform);
  }
  if (parsed.command === "coc-clan") {
    return runClashOfClansClanCommand(parsed);
  }
  if (parsed.command === "coc-player") {
    return runClashOfClansPlayerCommand(parsed);
  }
  if (parsed.command === "division2-player" || parsed.command === "td2-player") {
    return runDivision2PlayerCommand(parsed);
  }
  if (parsed.command === "fortnite-player" || parsed.command === "fn-player") {
    return runFortnitePlayerCommand(parsed);
  }
  if (parsed.command === "fortnite-creatorcode" || parsed.command === "fn-creatorcode") {
    return runFortniteCreatorCodeCommand(parsed);
  }
  if (parsed.command === "fortnite-item-shop" || parsed.command === "fn-item-shop") {
    return runFortniteItemShopCommand(parsed);
  }
  if (parsed.command === "wynncraft-profile" || parsed.command === "wc-profile") {
    return runWynncraftProfileCommand(parsed);
  }
  if (parsed.command === "hypixel-profile" || parsed.command === "hp-profile") {
    return runHypixelProfileCommand(parsed);
  }
  if (parsed.command === "rocketleague-player" || parsed.command === "rl-player") {
    return runRocketLeaguePlayerCommand(parsed);
  }
  if (parsed.command === "apexlegends-player" || parsed.command === "apex-player") {
    return runApexLegendsPlayerCommand(parsed);
  }
  if (parsed.command === "battlefield1-player" || parsed.command === "bf1-player") {
    return runBattlefield1PlayerCommand(parsed);
  }
  if (parsed.command === "battlefield5-player" || parsed.command === "bf5-player") {
    return runBattlefield5PlayerCommand(parsed);
  }
  if (parsed.command === "battlefield2042-player" || parsed.command === "bf2042-player") {
    return runBattlefield2042PlayerCommand(parsed);
  }
  if (parsed.command === "battlefield6-player" || parsed.command === "bf6-player") {
    return runBattlefield6PlayerCommand(parsed);
  }
  if (parsed.command === "list-livestream-presets") {
    process.stdout.write(`${Object.keys(livestreamPresets).join("\n")}\n`);
    return 0;
  }
  if (parsed.command === "list-games-presets") {
    process.stdout.write(`${Object.keys(gamesPresets).join("\n")}\n`);
    return 0;
  }  if (parsed.command === "list-download-presets") {
    process.stdout.write(`${Object.keys(downloaderPresets).join("\n")}\n`);
    return 0;
  }

  printHelp();
  return 1;
}

function buildDownloaderClient(parsed) {
  return new DownloaderClient({
    apiKey: parsed.apiKey || null,
    baseUrl: parsed.downloaderBaseUrl || parsed.baseUrl || null,
    preset: parsed.downloaderPreset || "nekosune",
    timeoutMs: parsed.timeoutMs || 120000
  });
}

function buildLivestreamClient(parsed) {
  return new LivestreamClient({
    apiKey: parsed.apiKey || null,
    baseUrl: parsed.livestreamBaseUrl || null,
    preset: parsed.livestreamPreset || "nekosune",
    timeoutMs: parsed.timeoutMs || 60000
  });
}

function buildGamesClient(parsed) {
  return new GamesClient({
    apiKey: parsed.apiKey || null,
    baseUrl: parsed.gamesBaseUrl || null,
    preset: parsed.gamesPreset || "nekosune",
    timeoutMs: parsed.timeoutMs || 60000
  });
}

async function runLivestreamCommand(parsed, explicitPlatform) {
  const platform = explicitPlatform || parsed.streamPlatform;
  const username = parsed.username || parsed.url;
  if (!platform) {
    throw new Error("Missing livestream platform. Use live-kick/live-twitch/live-dlive/live-trovo or --stream-platform.");
  }
  if (!username) {
    throw new Error("Missing --username for livestream command.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for livestream command.");
  }

  const client = buildLivestreamClient(parsed);
  let result;
  if (platform === "kick") {
    result = await client.getKick(username);
  } else if (platform === "twitch") {
    result = await client.getTwitch(username);
  } else if (platform === "dlive") {
    result = await client.getDlive(username);
  } else if (platform === "trovo") {
    result = await client.getTrovo(username);
  } else {
    result = await client.getByPlatform(platform, username);
  }

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const online = result && result.livestream ? result.livestream.online : null;
    process.stdout.write(`${result.displayname || result.username || username} online=${String(Boolean(online))}\n`);
  }
  return 0;
}

async function runClashOfClansClanCommand(parsed) {
  const tag = parsed.clanTag || parsed.tag;
  if (!tag) {
    throw new Error("Missing --clan-tag for coc-clan.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for coc-clan.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getClashOfClansClan(tag);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.name || "Clan"} ${result.tag || ""} members=${result.memberCount || 0}\n`);
  }
  return 0;
}

async function runClashOfClansPlayerCommand(parsed) {
  const tag = parsed.playerTag || parsed.tag;
  if (!tag) {
    throw new Error("Missing --player-tag for coc-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for coc-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getClashOfClansPlayer(tag);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.name || "Player"} ${result.tag || ""} th=${result.townHallLevel || "?"}\n`);
  }
  return 0;
}

async function runDivision2PlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for division2-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for division2-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getDivision2Player(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runFortnitePlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const timeWindow = parsed.timeWindow || "lifetime";

  if (!username) {
    throw new Error("Missing --username for fortnite-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for fortnite-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getFortnitePlayer(username, timeWindow);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const accountName = result && result.data && result.data.account ? result.data.account.name : username;
    const wins = result && result.data && result.data.stats && result.data.stats.all && result.data.stats.all.overall
      ? result.data.stats.all.overall.wins
      : 0;
    process.stdout.write(`${accountName} timeWindow=${timeWindow} wins=${wins}\n`);
  }
  return 0;
}

async function runFortniteCreatorCodeCommand(parsed) {
  const creatorCode = parsed.creatorCode || parsed.code || parsed.username || parsed.url;

  if (!creatorCode) {
    throw new Error("Missing --creator-code for fortnite-creatorcode.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for fortnite-creatorcode.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getFortniteCreatorCode(creatorCode);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const code = result && result.data ? result.data.code : creatorCode;
    const status = result && result.data ? result.data.status : "unknown";
    process.stdout.write(`${code} status=${status}\n`);
  }
  return 0;
}

async function runFortniteItemShopCommand(parsed) {
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for fortnite-item-shop.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getFortniteItemShop();
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const data = result && result.data ? result.data : {};
    const date = data.date || "unknown";
    const entries = Array.isArray(data.entries) ? data.entries.length : 0;
    process.stdout.write(`date=${date} entries=${entries}\n`);
  }
  return 0;
}

async function runWynncraftProfileCommand(parsed) {
  const username = parsed.username || parsed.url;

  if (!username) {
    throw new Error("Missing --username for wynncraft-profile.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for wynncraft-profile.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getWynncraftProfile(username);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.username || username} online=${String(Boolean(result.online))}\n`);
  }
  return 0;
}

async function runHypixelProfileCommand(parsed) {
  const username = parsed.username || parsed.url;

  if (!username) {
    throw new Error("Missing --username for hypixel-profile.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for hypixel-profile.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getHypixelProfile(username);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const displayName = result.displayname || username;
    const level = result.level || 0;
    process.stdout.write(`${displayName} level=${level}\n`);
  }
  return 0;
}

async function runRocketLeaguePlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for rocketleague-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for rocketleague-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getRocketLeaguePlayer(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runApexLegendsPlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for apexlegends-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for apexlegends-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getApexLegendsPlayer(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runBattlefield1PlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for battlefield1-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for battlefield1-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getBattlefield1Player(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runBattlefield5PlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for battlefield5-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for battlefield5-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getBattlefield5Player(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runBattlefield2042PlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "ea";

  if (!username) {
    throw new Error("Missing --username for battlefield2042-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for battlefield2042-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getBattlefield2042Player(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runBattlefield6PlayerCommand(parsed) {
  const username = parsed.username || parsed.url;
  const platform = parsed.divisionPlatform || parsed.platform || "psn";

  if (!username) {
    throw new Error("Missing --username for battlefield6-player.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for battlefield6-player.");
  }

  const client = buildGamesClient(parsed);
  const result = await client.getBattlefield6Player(username, platform);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const source = result && result.profile && result.profile.data ? result.profile.data : null;
    const handle = source && source.platformInfo ? source.platformInfo.platformUserHandle : username;
    process.stdout.write(`${handle} platform=${platform}\n`);
  }
  return 0;
}

async function runDownloadJobCreateCommand(parsed, mode) {
  if (!parsed.url) {
    throw new Error(`Missing --url for download-${mode}.`);
  }
  if (!parsed.apiKey) {
    throw new Error(`Missing --apikey for download-${mode}.`);
  }

  const downloader = buildDownloaderClient(parsed);
  const createFn = mode === "mp3" ? downloader.createMp3Job.bind(downloader) : downloader.createMp4Job.bind(downloader);
  const job = await createFn(parsed.url, {
    uploadDest: parsed.uploadDest || "cdn"
  });

  if (parsed.wait) {
    const finalState = await downloader.waitForJob(job.jobId, {
      intervalMs: parsed.intervalMs || 2000,
      timeoutMs: parsed.timeoutMs || 300000,
      onProgress: (state) => {
        const label = (state.upload && state.upload.label) || state.status || "working";
        process.stdout.write(`[job ${state.job_id}] ${label}\n`);
      }
    });

    if (parsed.json) {
      process.stdout.write(`${JSON.stringify({ job, final: finalState }, null, 2)}\n`);
    } else {
      process.stdout.write(`job_id=${job.jobId}\n`);
      process.stdout.write(`status=${finalState.status}\n`);
      if (finalState.url) {
        process.stdout.write(`${finalState.url}\n`);
      }
    }
    return 0;
  }

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(job, null, 2)}\n`);
  } else {
    process.stdout.write(`${job.jobId}\n`);
  }
  return 0;
}

async function runDownloadJobStatusCommand(parsed) {
  if (!parsed.jobId) {
    throw new Error("Missing --job-id for download-job.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for download-job.");
  }

  const downloader = buildDownloaderClient(parsed);
  const state = await downloader.getJob(parsed.jobId);
  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(state, null, 2)}\n`);
  } else {
    process.stdout.write(`status=${state.status || "unknown"}\n`);
    if (state.url) {
      process.stdout.write(`${state.url}\n`);
    }
  }
  return 0;
}

async function runDownloadInfoCommand(parsed) {
  if (!parsed.url) {
    throw new Error("Missing --url for download-info.");
  }

  const downloader = buildDownloaderClient(parsed);
  const info = await downloader.getInfo(parsed.url, {
    flat: parsed.flat,
    fields: parsed.fields || "basic",
    cache: typeof parsed.cache === "number" ? parsed.cache : 1
  });

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(info, null, 2)}\n`);
  } else {
    process.stdout.write(`${info.title || info.id || "ok"}\n`);
  }
  return 0;
}

async function runDownloadSearchCommand(parsed) {
  if (!parsed.query) {
    throw new Error("Missing --query for download-search.");
  }

  const downloader = buildDownloaderClient(parsed);
  const result = await downloader.searchYouTube(parsed.query, {
    limit: parsed.limit || 5
  });

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    const items = Array.isArray(result.items) ? result.items : [];
    for (const item of items) {
      process.stdout.write(`${item.title || "(no title)"} - ${item.url || ""}\n`);
    }
  }
  return 0;
}

async function runDownloadStreamUrlCommand(parsed) {
  if (!parsed.url) {
    throw new Error("Missing --url for download-stream-url.");
  }

  const downloader = buildDownloaderClient(parsed);
  const streamUrl = downloader.getStreamUrl(parsed.url);
  process.stdout.write(`${streamUrl}\n`);
  return 0;
}

async function runUploadCommand(parsed) {
  const files = parsed.files;
  if (files.length === 0) {
    throw new Error("No file path provided. Use --file <path>.");
  }

  const platform = parsed.platform || "upfiles";
  const concurrency = Math.max(1, parsed.parallel || 1);
  const retries = Math.max(0, parsed.retries || 0);
  const timeoutMs = parsed.timeoutMs || 60000;
  const metadata = parsed.metadata;
  const apiKey = parsed.apiKey || null;

  const client = new UploadClient({
    platform,
    apiKey,
    timeoutMs
  });

  const discord = parsed.discordWebhook ? new DiscordProgressReporter(parsed.discordWebhook, parsed.discordTitle) : null;
  const tasks = files.map((filePath) => () => uploadWithRetries({
    client,
    filePath,
    platform,
    retries,
    apiKey,
    metadata,
    discord
  }));

  const results = await runConcurrently(tasks, concurrency);
  return printResults(results, parsed.json);
}

async function runShortenCommand(parsed) {
  if (!parsed.url) {
    throw new Error("Missing --url for shorten command.");
  }
  const client = new EarningsClient({
    timeoutMs: parsed.timeoutMs || 60000
  });
  const result = await client.shortenUrl(parsed.url, {
    provider: "adlinkfly-compatible",
    apiKey: parsed.apiKey || null,
    preset: parsed.shortenerPreset || null,
    baseUrl: parsed.baseUrl || null,
    alias: parsed.alias || null,
    adsType: Number.isFinite(parsed.adsType) ? parsed.adsType : null
  });

  if (parsed.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(`${result.shortUrl}\n`);
  }
  return 0;
}

async function runUploadShortenCommand(parsed) {
  const files = parsed.files;
  if (files.length === 0) {
    throw new Error("No file path provided. Use --file <path>.");
  }
  if (!parsed.apiKey && (parsed.uploadPlatform || parsed.platform || "upfiles") === "upfiles") {
    throw new Error("Missing --apikey for upfiles upload.");
  }
  if (!parsed.shortenerApiKey && !parsed.apiKey) {
    throw new Error("Missing shortener API key. Use --shortener-apikey or --apikey.");
  }

  const earnings = new EarningsClient({
    timeoutMs: parsed.timeoutMs || 60000,
    upload: {
      platform: parsed.uploadPlatform || parsed.platform || "upfiles",
      apiKey: parsed.apiKey || null
    }
  });
  const discord = parsed.discordWebhook ? new DiscordProgressReporter(parsed.discordWebhook, parsed.discordTitle) : null;

  const tasks = files.map((filePath) => async () => {
    try {
      const fileName = path.basename(filePath);
      const result = await earnings.uploadAndShorten(filePath, {
        uploadPlatform: parsed.uploadPlatform || parsed.platform || "upfiles",
        uploadApiKey: parsed.apiKey || null,
        uploadMetadata: parsed.metadata,
        shortenerProvider: "adlinkfly-compatible",
        shortenerApiKey: parsed.shortenerApiKey || parsed.apiKey || null,
        shortenerPreset: parsed.shortenerPreset || null,
        shortenerBaseUrl: parsed.baseUrl || null,
        alias: parsed.alias || null,
        adsType: Number.isFinite(parsed.adsType) ? parsed.adsType : null,
        onProgress: createProgressHandler({
          fileName,
          attempt: 1,
          retries: 0,
          discord
        })
      });
      if (discord) {
        await discord.complete(fileName, result.shortlink.shortUrl);
      }
      return {
        ok: true,
        file: filePath,
        result
      };
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (discord) {
        await discord.fail(path.basename(filePath), message);
      }
      return {
        ok: false,
        file: filePath,
        error: message
      };
    }
  });

  const results = await runConcurrently(tasks, Math.max(1, parsed.parallel || 1));
  return printResults(results, parsed.json);
}

async function runVideoUploadCommand(parsed) {
  const files = parsed.files;
  if (files.length === 0) {
    throw new Error("No file path provided. Use --file <path>.");
  }
  if (!parsed.apiKey) {
    throw new Error("Missing --apikey for video upload provider.");
  }

  const provider = parsed.videoProvider || "doodstream";
  const earnings = new EarningsClient({
    timeoutMs: parsed.timeoutMs || 60000
  });
  const discord = parsed.discordWebhook ? new DiscordProgressReporter(parsed.discordWebhook, parsed.discordTitle) : null;

  const tasks = files.map((filePath) => async () => {
    try {
      const fileName = path.basename(filePath);
      const result = await earnings.uploadVideo(filePath, {
        provider,
        apiKey: parsed.apiKey,
        onProgress: createProgressHandler({
          fileName,
          attempt: 1,
          retries: 0,
          discord
        })
      });
      if (discord) {
        await discord.complete(fileName, result.watchUrl);
      }
      return {
        ok: true,
        file: filePath,
        result
      };
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (discord) {
        await discord.fail(path.basename(filePath), message);
      }
      return {
        ok: false,
        file: filePath,
        error: message
      };
    }
  });

  const results = await runConcurrently(tasks, Math.max(1, parsed.parallel || 1));
  return printResults(results, parsed.json);
}

function printResults(results, asJson) {
  const success = results.filter((item) => item.ok).length;
  const failed = results.length - success;
  if (asJson) {
    process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
  } else {
    for (const result of results) {
      if (result.ok) {
        const finalUrl = getResultUrl(result.result);
        process.stdout.write(`[ok] ${result.file} -> ${finalUrl}\n`);
      } else {
        process.stdout.write(`[fail] ${result.file} -> ${result.error}\n`);
      }
    }
    process.stdout.write(`Done: ${success} success, ${failed} failed.\n`);
  }
  return failed > 0 ? 1 : 0;
}

function getResultUrl(result) {
  if (!result) {
    return "";
  }
  if (result.url) {
    return result.url;
  }
  if (result.watchUrl) {
    return result.watchUrl;
  }
  if (result.shortlink && result.shortlink.shortUrl) {
    return result.shortlink.shortUrl;
  }
  return "";
}

async function uploadWithRetries(params) {
  const { client, filePath, platform, retries, apiKey, metadata, discord } = params;
  let attempt = 0;
  while (attempt <= retries) {
    attempt += 1;
    try {
      const fileName = path.basename(filePath);
      const progressHandler = createProgressHandler({ fileName, attempt, retries, discord });

      const result = await client.upload(filePath, {
        platform,
        apiKey,
        metadata,
        onProgress: progressHandler
      });
      await maybeReportComplete(discord, fileName, result.url);
      return {
        ok: true,
        file: filePath,
        attempts: attempt,
        result
      };
    } catch (error) {
      const message = error && error.message ? error.message : String(error);
      if (attempt > retries) {
        await maybeReportFail(discord, path.basename(filePath), message);
        return {
          ok: false,
          file: filePath,
          attempts: attempt,
          error: message
        };
      }
      process.stdout.write(`[retry] ${filePath} attempt ${attempt}/${retries + 1}: ${message}\n`);
    }
  }
}

function createProgressHandler({ fileName, attempt, retries, discord }) {
  let lastPercent = -1;
  return (progress) => {
    const percent = typeof progress.percent === "number" ? progress.percent : 0;
    if (percent !== lastPercent && (percent % 5 === 0 || percent === 100)) {
      process.stdout.write(`[${fileName}] ${percent}% (attempt ${attempt}/${retries + 1})\n`);
      lastPercent = percent;
    }
    if (discord) {
      discord.update(fileName, percent, progress.phase || "uploading").catch(() => {});
    }
  };
}

async function maybeReportComplete(discord, fileName, url) {
  if (!discord) {
    return;
  }
  await discord.complete(fileName, url);
}

async function maybeReportFail(discord, fileName, message) {
  if (!discord) {
    return;
  }
  await discord.fail(fileName, message);
}

class DiscordProgressReporter {
  constructor(webhookUrl, title) {
    this.webhookUrl = webhookUrl;
    this.title = title || "Upload Progress";
    this.messages = new Map();
    this.lastUpdate = new Map();
  }

  async update(fileName, percent, phase) {
    const now = Date.now();
    const key = fileName;
    const last = this.lastUpdate.get(key) || 0;
    if (percent !== 100 && now - last < 3000 && percent % 10 !== 0) {
      return;
    }
    this.lastUpdate.set(key, now);

    const embed = {
      title: this.title,
      description: `${fileName}\n${buildProgressBar(percent)} ${percent}%`,
      color: 0x3498db,
      fields: [
        { name: "Status", value: phase || "uploading", inline: true }
      ],
      timestamp: new Date().toISOString()
    };

    await this.upsertMessage(fileName, embed);
  }

  async complete(fileName, url) {
    const embed = {
      title: this.title,
      description: `${fileName}\n${buildProgressBar(100)} 100%`,
      color: 0x2ecc71,
      fields: [
        { name: "Status", value: "completed", inline: true },
        { name: "URL", value: truncate(url, 1024), inline: false }
      ],
      timestamp: new Date().toISOString()
    };
    await this.upsertMessage(fileName, embed);
  }

  async fail(fileName, message) {
    const embed = {
      title: this.title,
      description: `${fileName}\n${buildProgressBar(0)} 0%`,
      color: 0xe74c3c,
      fields: [
        { name: "Status", value: "failed", inline: true },
        { name: "Error", value: truncate(message, 1024), inline: false }
      ],
      timestamp: new Date().toISOString()
    };
    await this.upsertMessage(fileName, embed);
  }

  async upsertMessage(fileName, embed) {
    const messageId = this.messages.get(fileName);
    if (!messageId) {
      const response = await axios.post(`${this.webhookUrl}?wait=true`, { embeds: [embed] });
      const createdId = response && response.data && response.data.id;
      if (createdId) {
        this.messages.set(fileName, createdId);
      }
      return;
    }
    await axios.patch(`${this.webhookUrl}/messages/${messageId}`, { embeds: [embed] });
  }
}

function buildProgressBar(percent) {
  const clamped = Math.max(0, Math.min(100, Math.floor(percent)));
  const size = 20;
  const filled = Math.round((clamped / 100) * size);
  return `[${"#".repeat(filled)}${"-".repeat(size - filled)}]`;
}

function truncate(text, max) {
  const value = String(text || "");
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 3)}...`;
}

async function runConcurrently(tasks, concurrency) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (index < tasks.length) {
      const taskIndex = index;
      index += 1;
      results[taskIndex] = await tasks[taskIndex]();
    }
  });
  await Promise.all(workers);
  return results;
}

function parseArgs(argv) {
  const firstToken = argv[0];
  const hasCommand = firstToken && !String(firstToken).startsWith("-");
  const result = {
    command: hasCommand ? firstToken : null,
    files: [],
    metadata: {},
    help: false,
    json: false
  };

  for (let i = hasCommand ? 1 : 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--help" || token === "-h") {
      result.help = true;
    } else if (token === "--json") {
      result.json = true;
    } else if (token === "--wait") {
      result.wait = true;
    } else if (token === "--flat" || token === "--flat-playlist") {
      result.flat = true;
    } else if (token === "--file" || token === "-f") {
      const value = argv[i + 1];
      i += 1;
      if (value) {
        result.files.push(value);
      }
    } else if (token === "--username") {
      result.username = argv[i + 1];
      i += 1;
    } else if (token === "--stream-platform") {
      result.streamPlatform = argv[i + 1];
      i += 1;
    } else if (token === "--clan-tag") {
      result.clanTag = argv[i + 1];
      i += 1;
    } else if (token === "--player-tag") {
      result.playerTag = argv[i + 1];
      i += 1;
    } else if (token === "--tag") {
      result.tag = argv[i + 1];
      i += 1;
    } else if (token === "--livestream-preset") {
      result.livestreamPreset = argv[i + 1];
      i += 1;
    } else if (token === "--livestream-base-url") {
      result.livestreamBaseUrl = argv[i + 1];
      i += 1;
    } else if (token === "--games-preset") {
      result.gamesPreset = argv[i + 1];
      i += 1;
    } else if (token === "--games-base-url") {
      result.gamesBaseUrl = argv[i + 1];
      i += 1;
    } else if (token === "--division-platform" || token === "--game-platform") {
      result.divisionPlatform = argv[i + 1];
      i += 1;
    } else if (token === "--time-window") {
      result.timeWindow = argv[i + 1];
      i += 1;
    } else if (token === "--creator-code" || token === "--code") {
      result.creatorCode = argv[i + 1];
      i += 1;
    } else if (token === "--url") {
      result.url = argv[i + 1];
      i += 1;
    } else if (token === "--job-id") {
      result.jobId = argv[i + 1];
      i += 1;
    } else if (token === "--query" || token === "-q") {
      result.query = argv[i + 1];
      i += 1;
    } else if (token === "--limit") {
      result.limit = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--fields") {
      result.fields = argv[i + 1];
      i += 1;
    } else if (token === "--cache") {
      result.cache = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--upload-dest") {
      result.uploadDest = argv[i + 1];
      i += 1;
    } else if (token === "--downloader-preset") {
      result.downloaderPreset = argv[i + 1];
      i += 1;
    } else if (token === "--downloader-base-url") {
      result.downloaderBaseUrl = argv[i + 1];
      i += 1;
    } else if (token === "--interval") {
      result.intervalMs = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--platform" || token === "-p") {
      result.platform = argv[i + 1];
      i += 1;
    } else if (token === "--upload-platform") {
      result.uploadPlatform = argv[i + 1];
      i += 1;
    } else if (token === "--video-provider") {
      result.videoProvider = argv[i + 1];
      i += 1;
    } else if (token === "--apikey" || token === "--api-key" || token === "-k") {
      result.apiKey = argv[i + 1];
      i += 1;
    } else if (token === "--shortener-apikey") {
      result.shortenerApiKey = argv[i + 1];
      i += 1;
    } else if (token === "--shortener-preset") {
      result.shortenerPreset = argv[i + 1];
      i += 1;
    } else if (token === "--base-url") {
      result.baseUrl = argv[i + 1];
      i += 1;
    } else if (token === "--alias") {
      result.alias = argv[i + 1];
      i += 1;
    } else if (token === "--ads-type") {
      result.adsType = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--timeout") {
      result.timeoutMs = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--retry" || token === "--retries" || token === "-r") {
      result.retries = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--parallel") {
      result.parallel = Number(argv[i + 1]);
      i += 1;
    } else if (token === "--discord-webhook") {
      result.discordWebhook = argv[i + 1];
      i += 1;
    } else if (token === "--discord-title") {
      result.discordTitle = argv[i + 1];
      i += 1;
    } else if (token === "--expires") {
      result.metadata.expires = argv[i + 1];
      i += 1;
    } else if (token === "--meta") {
      const pair = argv[i + 1];
      i += 1;
      if (pair && pair.includes("=")) {
        const eqIndex = pair.indexOf("=");
        const key = pair.slice(0, eqIndex);
        const value = pair.slice(eqIndex + 1);
        result.metadata[key] = value;
      }
    }
  }

  return result;
}

function printHelp() {
  const helpText = `
nekosunevrtools CLI

Commands:
  upload                   Upload files
  shorten                  Convert a URL into monetized short link
  upload-shorten           Upload file then monetize resulting URL
  video-upload             Upload video to video-earn provider
  download-mp3             Create MP3 download job
  download-mp4             Create MP4 download job
  download-job             Get download job status
  download-info            Fetch metadata for URL
  download-search          Search YouTube
  download-stream-url      Build /api/stream URL
  live-kick                Get Kick livestream data
  live-twitch              Get Twitch livestream data
  live-dlive               Get DLive livestream data
  live-trovo               Get Trovo livestream data
  live                     Get livestream data by --stream-platform
  coc-clan                 Get Clash of Clans clan by tag
  coc-player               Get Clash of Clans player by tag
  division2-player         Get The Division 2 player by username/platform
  td2-player               Alias for division2-player
  fortnite-player          Get Fortnite player by username/time window
  fn-player                Alias for fortnite-player
  fortnite-creatorcode     Get Fortnite creator code details
  fn-creatorcode           Alias for fortnite-creatorcode
  fortnite-item-shop       Get current Fortnite item shop
  fn-item-shop             Alias for fortnite-item-shop
  wynncraft-profile        Get Wynncraft profile by username
  wc-profile               Alias for wynncraft-profile
  hypixel-profile          Get Hypixel profile by username
  hp-profile               Alias for hypixel-profile
  rocketleague-player      Get Rocket League player by username/platform
  rl-player                Alias for rocketleague-player
  apexlegends-player       Get Apex Legends player by username/platform
  apex-player              Alias for apexlegends-player
  battlefield1-player      Get Battlefield 1 player by username/platform
  bf1-player               Alias for battlefield1-player
  battlefield5-player      Get Battlefield 5 player by username/platform
  bf5-player               Alias for battlefield5-player
  battlefield2042-player   Get Battlefield 2042 player by username/platform
  bf2042-player            Alias for battlefield2042-player
  battlefield6-player      Get Battlefield 6 player by username/platform
  bf6-player               Alias for battlefield6-player
  list-shorteners          Show built-in shortlink preset names
  list-download-presets    Show downloader API host presets
  list-livestream-presets  Show livestream API host presets
  list-games-presets       Show games API host presets

Usage:
  nekosunevrtools download-mp3 --url <link> --apikey <key> [--upload-dest cdn]
  nekosunevrtools download-job --job-id <id> --apikey <key>
  nekosunevrtools live-kick --username mugstv --apikey YOUR_KEY
  nekosunevrtools coc-clan --clan-tag 2LLJYCUU8 --apikey YOUR_KEY

Downloader options:
  --downloader-preset <name>   Host preset: nekosune|ballisticok (default: nekosune)
  --downloader-base-url <url>  Custom compatible host base URL
  --upload-dest <name>         cdn|thirdparty|ipfs
  --job-id <id>                Job ID for status lookup
  --query, -q <text>           Search query
  --limit <n>                  Search limit (1-25)
  --fields <basic|full>        Info response fields
  --flat                       Use flat playlist mode
  --cache <0|1>                Info cache toggle
  --wait                       Poll job until done
  --interval <ms>              Poll interval (default: 2000)
  --url <url>                  Target URL/link
  --apikey, --api-key, -k      API key for secured endpoints

Livestream options:
  --username <name>            Streamer username
  --stream-platform <name>     kick|twitch|dlive|trovo (used with live)
  --livestream-preset <name>   API host preset (default: nekosune)
  --livestream-base-url <url>  Custom API base URL

Games options:
  --clan-tag <tag>             Clash of Clans clan tag
  --player-tag <tag>           Clash of Clans player tag
  --tag <tag>                  Generic tag alias
  --username <name>            Game username (varies by endpoint)
  --division-platform <name>   Game platform for supported commands (default: psn)
  --game-platform <name>       Alias for --division-platform
  --time-window <name>         Fortnite stats window (default: lifetime)
  --creator-code <value>       Fortnite creator code
  --games-preset <name>        API host preset (default: nekosune)
  --games-base-url <url>       Custom API base URL

Shared options:
  --json                       JSON output
  --help, -h                   Show help

Upload options:
  --platform, -p <name>        Platform: upfiles|fileio|catbox|transfersh (default: upfiles)
  --file, -f <path>            File path (repeatable)
  --expires <value>            file.io expiration metadata (example: 1w)
  --meta key=value             Additional metadata field (repeatable)
  --retry, --retries, -r <n>   Retry count per file (default: 0)
  --parallel <n>               Parallel uploads (default: 1)
  --timeout <ms>               Request timeout in milliseconds (default: 60000)

Short-link options:
  --shortener-preset <name>    Preset from list-shorteners
  --base-url <url>             Custom AdLinkFly-compatible API base URL
  --shortener-apikey <key>     API key for shortener (or reuse --apikey)
  --alias <value>              Custom short alias
  --ads-type <1|2>             1=interstitial, 2=banner for many AdLinkFly APIs

Video-earn options:
  --video-provider <name>      Currently: doodstream

Discord progress options:
  --discord-webhook <url>      Discord webhook URL for embed progress updates
  --discord-title <text>       Discord embed title (default: Upload Progress)
`;
  process.stdout.write(helpText);
}
module.exports = {
  runCli
};





