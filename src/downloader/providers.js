const { createDownloaderProvider } = require("./provider/compatible");

const presets = {
  nekosune: "https://dl.nekosunevr.co.uk",
  ballisticok: "https://dl.ballisticok.xyz"
};

const providers = {
  compatible: createDownloaderProvider
};

module.exports = {
  presets,
  providers
};