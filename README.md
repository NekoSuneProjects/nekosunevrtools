# nekosunevrtools

Node.js SDK + CLI for:

- File upload platforms (`upfiles`, `fileio`, `catbox`, `transfersh`)
- Monetized short links (AdLinkFly-compatible APIs, including many adfly-like networks)
- Video upload-to-earn provider integration (`doodstream`)
- Live progress callbacks + Discord webhook embed progress bars

## Install

```bash
npm install @nekosuneprojects/nekosunevrtools
```

## SDK Usage

### Category namespaces

```js
const sdk = require("@nekosuneprojects/nekosunevrtools");

// Requested style:
// sdk.upload.providers.upfiles
// sdk.shorturl.providers["adlinkfly-compatible"]
// sdk.video.providers.doodstream
```

### Upload with progress

```js
const { UploadClient } = require("@nekosuneprojects/nekosunevrtools");

const client = new UploadClient({
  platform: "upfiles",
  apiKey: process.env.UPFILES_API_KEY
});

const result = await client.upload("C:/path/file.zip", {
  onProgress(p) {
    console.log(`${p.phase} ${p.percent}%`);
  }
});

console.log(result.url);
```

### Shorten URL for earnings

```js
const { EarningsClient } = require("@nekosuneprojects/nekosunevrtools");

const earn = new EarningsClient();
const short = await earn.shortenUrl("https://example.com/my-file", {
  provider: "adlinkfly-compatible",
  preset: "shrinkme",
  apiKey: process.env.SHRINKME_API_KEY
});

console.log(short.shortUrl);
```

### Upload then auto-shorten

```js
const { EarningsClient } = require("@nekosuneprojects/nekosunevrtools");

const earn = new EarningsClient({
  upload: {
    platform: "upfiles",
    apiKey: process.env.UPFILES_API_KEY
  }
});

const result = await earn.uploadAndShorten("C:/path/file.zip", {
  shortenerProvider: "adlinkfly-compatible",
  shortenerPreset: "shrinkme",
  shortenerApiKey: process.env.SHRINKME_API_KEY
});

console.log(result.upload.url);
console.log(result.shortlink.shortUrl);
```

### Video upload-to-earn (DoodStream)

```js
const { EarningsClient } = require("@nekosuneprojects/nekosunevrtools");

const earn = new EarningsClient();
const video = await earn.uploadVideo("C:/videos/movie.mp4", {
  provider: "doodstream",
  apiKey: process.env.DOODSTREAM_API_KEY,
  onProgress(p) {
    console.log(`${p.percent}%`);
  }
});

console.log(video.watchUrl);
```

## CLI Usage

### Upload files

```bash
nekosunevrtools upload --file ./archive.zip --platform upfiles --apikey YOUR_UPFILES_KEY
```

### Create monetized short link

```bash
nekosunevrtools shorten --url "https://example.com/file" --shortener-preset shrinkme --apikey YOUR_SHRINKME_KEY
```

### Upload then monetize link

```bash
nekosunevrtools upload-shorten \
  --file ./archive.zip \
  --upload-platform upfiles \
  --apikey YOUR_UPFILES_KEY \
  --shortener-preset shrinkme \
  --shortener-apikey YOUR_SHRINKME_KEY
```

### Video upload-to-earn

```bash
nekosunevrtools video-upload --file ./video.mp4 --video-provider doodstream --apikey YOUR_DOODSTREAM_KEY
```

### Discord embed progress bar

```bash
nekosunevrtools upload \
  --file ./video.mp4 \
  --platform upfiles \
  --apikey YOUR_UPFILES_KEY \
  --discord-webhook "https://discord.com/api/webhooks/ID/TOKEN" \
  --discord-title "Upload Status"
```

### List built-in shortener presets

```bash
nekosunevrtools list-shorteners
```

## AdLinkFly-compatible presets

Use `--shortener-preset <name>` or SDK `preset`:

- `shrtfly`
- `exei`
- `shrinkme`
- `shrinkearn`
- `clksh`
- `lnkc`
- `zinkme`
- `short2url`
- `urlnama`
- `adshorti`
- `shrtbr`
- `linkmonetizado`
- `clicksfly`
- `urlsfly`
- `wefly`
- `adbull`
- `linksly`
- `droplink`
- `adbitfly`
- `earnlink`
- `easycut`
- `megaurl`
- `shortzon`
- `shortiio`
- `adlinkcash`
- `adlinkic`
- `shorte`
- `link1s`
- `cutpay`
- `adz7short`

You can also use custom base URL:

```bash
nekosunevrtools shorten --url "https://example.com" --base-url "https://yourdomain.com/api" --apikey YOUR_KEY
```

## Notes

- Not every short-link/video platform has a public API. This package provides a pluggable system so you can add more.
- API/provider availability and payout rules can change by platform and country.

## Publish

```bash
npm login
npm publish --access public
```

## Downloader API (dl.nekosunevr.co.uk compatible)

Supports compatible hosts like:
- `https://dl.nekosunevr.co.uk`
- `https://dl.ballisticok.xyz`

SDK:

```js
const { DownloaderClient } = require("@nekosuneprojects/nekosunevrtools");

const dl = new DownloaderClient({
  apiKey: process.env.DL_API_KEY,
  preset: "nekosune" // or "ballisticok"
});

const job = await dl.createMp3Job("https://www.youtube.com/watch?v=...", {
  uploadDest: "cdn"
});

const done = await dl.waitForJob(job.jobId, {
  onProgress: (state) => console.log(state.status, state.upload && state.upload.label)
});

console.log(done.url);
```

CLI:

```bash
nekosunevrtools download-mp3 --url "https://www.youtube.com/watch?v=..." --apikey YOUR_KEY --upload-dest cdn --wait
nekosunevrtools download-mp4 --url "https://www.youtube.com/watch?v=..." --apikey YOUR_KEY --downloader-preset ballisticok --wait
nekosunevrtools download-job --job-id <job-id> --apikey YOUR_KEY
nekosunevrtools download-info --url "https://www.youtube.com/watch?v=..." --fields basic --flat
nekosunevrtools download-search --query "alan walker faded" --limit 5
nekosunevrtools download-stream-url --url "https://example.com/file.mp3"
nekosunevrtools list-download-presets
```

## Livestream API

Uses `nekosunevr-api-key`/Bearer auth with user-provided API key.

SDK example:

```js
const { LivestreamClient } = require("@nekosuneprojects/nekosunevrtools");

const live = new LivestreamClient({
  apiKey: process.env.NEKOSUNEVR_API_KEY
});

const twitch = await live.getTwitch("nekosunevr");
console.log(twitch.livestream && twitch.livestream.online);
```

CLI examples:

```bash
nekosunevrtools live-kick --username mugstv --apikey YOUR_KEY --json
nekosunevrtools live-twitch --username nekosunevr --apikey YOUR_KEY --json
nekosunevrtools live-dlive --username nekosunevr --apikey YOUR_KEY --json
nekosunevrtools live-trovo --username nekosunevr --apikey YOUR_KEY --json
```

## Games API (Clash of Clans + The Division 2 + Fortnite + Wynncraft + Hypixel + Rocket League + Apex Legends + Battlefield 1 + Battlefield 5 + Battlefield 2042 + Battlefield 6)

SDK:

```js
const { GamesClient } = require("@nekosuneprojects/nekosunevrtools");

const games = new GamesClient({
  apiKey: process.env.NEKOSUNEVR_API_KEY
});

const clan = await games.getClashOfClansClan("2LLJYCUU8");
const player = await games.getClashOfClansPlayer("G99PGRC8V");
const division2 = await games.getDivision2Player("ChisdealHDYT", "psn");
const fortnite = await games.getFortnitePlayer("NekoSuneVR", "lifetime");
const creator = await games.getFortniteCreatorCode("NekoSuneVR");
const itemShop = await games.getFortniteItemShop();
const wynncraft = await games.getWynncraftProfile("NekoSuneVR");
const hypixel = await games.getHypixelProfile("NekoSuneVR");
const rocketLeague = await games.getRocketLeaguePlayer("ChisdealHDYT", "psn");
const apex = await games.getApexLegendsPlayer("ChisdealHDYT", "psn");
const battlefield1 = await games.getBattlefield1Player("ChisdealHDYT", "psn");
const battlefield5 = await games.getBattlefield5Player("ChisdealHDYT", "psn");
const battlefield2042 = await games.getBattlefield2042Player("NekoSuneVR", "ea");
const battlefield6 = await games.getBattlefield6Player("ChisdealHDYT", "psn");
```

CLI:

```bash
nekosunevrtools coc-clan --clan-tag 2LLJYCUU8 --apikey YOUR_KEY --json
nekosunevrtools coc-player --player-tag G99PGRC8V --apikey YOUR_KEY --json
nekosunevrtools division2-player --username ChisdealHDYT --division-platform psn --apikey YOUR_KEY --json
nekosunevrtools fortnite-player --username NekoSuneVR --time-window lifetime --apikey YOUR_KEY --json
nekosunevrtools fortnite-creatorcode --creator-code NekoSuneVR --apikey YOUR_KEY --json
nekosunevrtools fortnite-item-shop --apikey YOUR_KEY --json
nekosunevrtools wynncraft-profile --username NekoSuneVR --apikey YOUR_KEY --json
nekosunevrtools hypixel-profile --username NekoSuneVR --apikey YOUR_KEY --json
nekosunevrtools rocketleague-player --username ChisdealHDYT --game-platform psn --apikey YOUR_KEY --json
nekosunevrtools apexlegends-player --username ChisdealHDYT --game-platform psn --apikey YOUR_KEY --json
nekosunevrtools battlefield1-player --username ChisdealHDYT --game-platform psn --apikey YOUR_KEY --json
nekosunevrtools battlefield5-player --username ChisdealHDYT --game-platform psn --apikey YOUR_KEY --json
nekosunevrtools battlefield2042-player --username NekoSuneVR --game-platform ea --apikey YOUR_KEY --json
nekosunevrtools battlefield6-player --username ChisdealHDYT --game-platform psn --apikey YOUR_KEY --json
```
