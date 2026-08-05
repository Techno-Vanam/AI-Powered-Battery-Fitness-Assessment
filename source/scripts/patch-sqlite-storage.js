/**
 * react-native-sqlite-storage still references jcenter(), which modern Gradle removed.
 * Re-apply after every npm install.
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-sqlite-storage',
  'platforms',
  'android',
  'build.gradle',
);

if (!fs.existsSync(target)) {
  process.exit(0);
}

const original = fs.readFileSync(target, 'utf8');
const patched = original.replace(/\bjcenter\(\)/g, 'mavenCentral()');

if (patched !== original) {
  fs.writeFileSync(target, patched);
  console.log('[postinstall] Patched react-native-sqlite-storage jcenter() → mavenCentral()');
}
