const { withAndroidManifest } = require("@expo/config-plugins");

function withDisableForceDark(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application[0];
    application.$["android:forceDarkAllowed"] = "false";
    return config;
  });
}

module.exports = withDisableForceDark;