const adlinkflyCompatible = require("./provider/adlinkfly-compatible");
const { ADLINKFLY_BASE_URLS } = require("./provider/presets");

const providers = {
  "adlinkfly-compatible": adlinkflyCompatible
};

module.exports = {
  providers,
  presets: ADLINKFLY_BASE_URLS
};
