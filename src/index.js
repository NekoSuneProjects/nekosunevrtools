const { UploadClient, providers: uploadProviders } = require("./upload/client");
const { EarningsClient, shortenerPresets } = require("./earnings");
const { providers: shorturlProviders } = require("./shorturl/providers");
const videoProviders = require("./video/providers");
const { DownloaderClient, presets: downloaderPresets, providers: downloaderProviders } = require("./downloader/client");
const { LivestreamClient, presets: livestreamPresets, providers: livestreamProviders } = require("./livestream/client");
const { GamesClient, presets: gamesPresets, providers: gamesProviders } = require("./games/client");

module.exports = {
  upload: {
    Client: UploadClient,
    providers: uploadProviders
  },
  shorturl: {
    providers: shorturlProviders,
    presets: shortenerPresets
  },
  video: {
    providers: videoProviders
  },
  downloader: {
    Client: DownloaderClient,
    providers: downloaderProviders,
    presets: downloaderPresets
  },
  livestream: {
    Client: LivestreamClient,
    providers: livestreamProviders,
    presets: livestreamPresets
  },
  games: {
    Client: GamesClient,
    providers: gamesProviders,
    presets: gamesPresets
  },
  earnings: {
    Client: EarningsClient
  },
  UploadClient,
  platforms: uploadProviders,
  EarningsClient,
  shortenerPresets,
  DownloaderClient,
  downloaderPresets,
  LivestreamClient,
  livestreamPresets,
  GamesClient,
  gamesPresets
};