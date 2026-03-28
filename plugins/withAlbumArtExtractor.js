const { withMainApplication } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Local Expo config plugin for AlbumArtExtractor native module.
 *
 * After `expo prebuild`, MainApplication.kt is regenerated from an Expo
 * template and loses any manual edits. This plugin re-injects the
 * AlbumArtExtractorPackage registration on every prebuild run.
 *
 * The Kotlin source files (AlbumArtExtractorModule.kt and
 * AlbumArtExtractorPackage.kt) live permanently in:
 *   plugins/album-art-extractor-template/
 * and are copied to the Android source tree on every prebuild.
 *
 * Usage in app.json / app.config.js:
 *   plugins: ["./plugins/withAlbumArtExtractor"]
 */
const PLUGIN_NAME = 'withAlbumArtExtractor';
const TEMPLATE_DIR = path.join(__dirname, 'album-art-extractor-template');

module.exports = function (config) {
  // Register the package and copy Kotlin source files
  config = withMainApplication(config, (config) => {
    const { contents } = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const ANDROID_SRC = path.join(projectRoot, 'android/app/src/main/java/com/tz01x/nmusic');

    // ----- Copy Kotlin source files -----
    const templateFiles = [
      'AlbumArtExtractorModule.kt',
      'AlbumArtExtractorPackage.kt',
    ];

    for (const file of templateFiles) {
      const srcPath = path.join(TEMPLATE_DIR, file);
      const destPath = path.join(ANDROID_SRC, file);

      if (!fs.existsSync(srcPath)) {
        console.warn(`[${PLUGIN_NAME}] Template not found: ${srcPath}`);
        continue;
      }

      // Create destination directory if needed
      if (!fs.existsSync(ANDROID_SRC)) {
        fs.mkdirSync(ANDROID_SRC, { recursive: true });
      }

      // Copy only if the file is missing (preserve manual edits)
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`[${PLUGIN_NAME}] Created ${destPath}`);
      }
    }

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
