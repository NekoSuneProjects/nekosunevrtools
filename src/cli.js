const path = require("path");
const axios = require("axios");
const { UploadClient, EarningsClient, shortenerPresets } = require("./index");

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
  if (parsed.command === "list-shorteners") {
    process.stdout.write(`${Object.keys(shortenerPresets).join("\n")}\n`);
    return 0;
  }

  printHelp();
  return 1;
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
    } else if (token === "--file" || token === "-f") {
      const value = argv[i + 1];
      i += 1;
      if (value) {
        result.files.push(value);
      }
    } else if (token === "--url") {
      result.url = argv[i + 1];
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
upload2earn CLI

Commands:
  upload            Upload files
  shorten           Convert a URL into monetized short link
  upload-shorten    Upload file then monetize resulting URL
  video-upload      Upload video to video-earn provider
  list-shorteners   Show built-in shortlink preset names

Usage:
  upload2earn upload --file <path> [options]
  upload2earn shorten --url <url> --shortener-preset shrinkme --apikey <key>
  upload2earn upload-shorten --file <path> --upload-platform upfiles --apikey <upload-key> --shortener-preset shrinkme --shortener-apikey <short-key>
  upload2earn video-upload --file <video.mp4> --video-provider doodstream --apikey <key>

Shared options:
  --json                       JSON output
  --help, -h                   Show help

Upload options:
  --platform, -p <name>        Platform: upfiles|fileio|catbox|transfersh (default: upfiles)
  --file, -f <path>            File path (repeatable)
  --apikey, --api-key, -k      API key for provider
  --expires <value>            file.io expiration metadata (example: 1w)
  --meta key=value             Additional metadata field (repeatable)
  --retry, --retries, -r <n>   Retry count per file (default: 0)
  --parallel <n>               Parallel uploads (default: 1)
  --timeout <ms>               Request timeout in milliseconds (default: 60000)

Short-link options:
  --url <url>                  URL to shorten
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
