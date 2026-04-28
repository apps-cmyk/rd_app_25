const { getDefaultConfig } = require('expo/metro-config');

/**
 * Metro: custom transformer obfuscates PIN_* / RD_* manager modules in release (see transformer.cjs)
 * https://docs.expo.dev/guides/customizing-metro/
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./transformer.cjs'),
};

module.exports = config;