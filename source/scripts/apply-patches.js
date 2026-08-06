#!/usr/bin/env node
/**
 * apply-patches.js
 *
 * Copies our app-owned HybridFrameOutput.kt (which delegates BoofCV calibration
 * to com.sports.MarkerCalibrationDetector) over the version installed by npm.
 *
 * This runs automatically via the "postinstall" npm script after every:
 *   npm install
 *   npm ci
 *   node_modules deletion + reinstall
 *
 * The BoofCV dependency itself lives in android/app/build.gradle (app-owned),
 * NOT in node_modules/react-native-vision-camera/android/build.gradle.
 */

const fs = require('fs');
const path = require('path');

const src = path.join(
  __dirname,
  '..',
  'patches',
  'HybridFrameOutput.kt'
);

const dst = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-vision-camera',
  'android',
  'src',
  'main',
  'java',
  'com',
  'margelo',
  'nitro',
  'camera',
  'hybrids',
  'outputs',
  'HybridFrameOutput.kt'
);

if (!fs.existsSync(src)) {
  console.warn('[apply-patches] Source patch file not found:', src);
  process.exit(0);
}

if (!fs.existsSync(path.dirname(dst))) {
  console.warn('[apply-patches] VisionCamera not installed yet, skipping patch.');
  process.exit(0);
}

try {
  fs.copyFileSync(src, dst);
  console.log('[apply-patches] Applied HybridFrameOutput.kt patch successfully.');
} catch (e) {
  console.error('[apply-patches] Failed to apply patch:', e.message);
  process.exit(1);
}
