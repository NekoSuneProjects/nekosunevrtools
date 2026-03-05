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
