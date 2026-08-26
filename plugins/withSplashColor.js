// Eigenes Expo Config Plugin.
// Garantiert, dass die Android-Farbe `splashscreen_background` existiert,
// die das generierte res/drawable/splashscreen.xml referenziert.
// Ohne diese Farbe schlägt das AAPT-Resource-Linking im Release-Build fehl.
const { withAndroidColors, AndroidConfig } = require('@expo/config-plugins');

const SPLASH_COLOR = '#0a0e1a';

module.exports = function withSplashColor(config) {
  return withAndroidColors(config, (cfg) => {
    cfg.modResults = AndroidConfig.Colors.setColorItem(
      { $: { name: 'splashscreen_background' }, _: SPLASH_COLOR },
      cfg.modResults
    );
    return cfg;
  });
};
