const { withMainApplication } = require('expo/config-plugins');

/**
 * Local Expo config plugin for AlbumArtExtractor native module.
 *
 * After `expo prebuild`, MainApplication.kt is regenerated from an Expo
 * template and loses any manual edits. This plugin re-injects the
 * AlbumArtExtractorPackage registration on every prebuild run.
 *
 * The Kotlin source files (AlbumArtExtractorModule.kt and
 * AlbumArtExtractorPackage.kt) live permanently in:
 *   android/app/src/main/java/com/tz01x/nmusic/
 * and survive prebuild untouched.
 *
 * Usage in app.json / app.config.js:
 *   plugins: ["./plugins/withAlbumArtExtractor"]
 */
module.exports = function (config) {
  config = withMainApplication(config, (config) => {
    const { contents } = config.modResults;

    // Skip if already registered (idempotent)
    if (contents.includes('AlbumArtExtractorPackage')) {
      return config;
    }

    // 1. Add import
    const withImport = contents.replace(
      'package com.tz01x.nmusic',
      `package com.tz01x.nmusic

import com.tz01x.nmusic.AlbumArtExtractorPackage`
    );

    // 2. Register the package inside PackageList(...).packages.apply { ... }
    const modified = withImport.replace(
      'PackageList(this).packages.apply {',
      `PackageList(this).packages.apply {
          add(AlbumArtExtractorPackage())`
    );

    config.modResults.contents = modified;
    return config;
  });

  return config;
};
