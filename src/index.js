const { UploadClient, providers: uploadProviders } = require("./upload/client");
const { EarningsClient, shortenerPresets } = require("./earnings");
const { providers: shorturlProviders } = require("./shorturl/providers");
const videoProviders = require("./video/providers");

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
  earnings: {
    Client: EarningsClient
  },
  UploadClient,
  platforms: uploadProviders,
  EarningsClient,
  shortenerPresets
};
