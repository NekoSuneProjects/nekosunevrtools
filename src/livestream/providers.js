const { createLivestreamProvider } = require("./provider/nekosune-api");

const presets = {
  nekosune: "https://api.nekosunevr.co.uk"
};

const providers = {
  nekosune: createLivestreamProvider
};

module.exports = {
  presets,
  providers
};