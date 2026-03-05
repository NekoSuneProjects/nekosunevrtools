const { createGamesProvider } = require("./provider/nekosune-api");

const presets = {
  nekosune: "https://api.nekosunevr.co.uk"
};

const providers = {
  nekosune: createGamesProvider
};

module.exports = {
  presets,
  providers
};