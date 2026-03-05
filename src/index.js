const { UploadClient, providers: uploadProviders } = require("./upload/client");
const { EarningsClient, shortenerPresets } = require("./earnings");
const { providers: shorturlProviders } = require("./shorturl/providers");
const videoProviders = require("./video/providers");
const { DownloaderClient, presets: downloaderPresets, providers: downloaderProviders } = require("./downloader/client");

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
  earnings: {
    Client: EarningsClient
  },
  UploadClient,
  platforms: uploadProviders,
  EarningsClient,
  shortenerPresets,
  DownloaderClient,
  downloaderPresets
};