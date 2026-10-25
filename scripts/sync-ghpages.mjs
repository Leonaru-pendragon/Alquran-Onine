import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const appJsPath = path.join(rootDir, 'gh-pages-app', 'app.js');
const appCssPath = path.join(rootDir, 'gh-pages-app', 'app.css');
const indexHtmlPath = path.join(rootDir, 'index.html');

if (!fs.existsSync(appJsPath) || !fs.existsSync(appCssPath)) {
  throw new Error('Missing gh-pages-app/app.js or gh-pages-app/app.css. Run vite.ghpages.config.ts build first.');
}

const hash = crypto
  .createHash('sha256')
  .update(fs.readFileSync(appJsPath))
  .update(fs.readFileSync(appCssPath))
  .digest('hex')
  .slice(0, 10);

let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

indexHtml = indexHtml
  .replace(
    /window\.__APP_BUILD_ID__\s*=\s*'[^']*';/,
    `window.__APP_BUILD_ID__ = '${hash}';`
  )
  .replace(
    /\.\/gh-pages-app\/app\.css(?:\?v=[^'"]*)?/g,
    `./gh-pages-app/app.css?v=${hash}`
  )
  .replace(
    /\.\/gh-pages-app\/app\.js(?:\?v=[^'"]*)?/g,
    `./gh-pages-app/app.js?v=${hash}`
  );

fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');

// Ensure .nojekyll exists in both root and public/
for (const target of [path.join(rootDir, '.nojekyll'), path.join(rootDir, 'public', '.nojekyll')]) {
  if (!fs.existsSync(target)) {
    fs.writeFileSync(target, '', 'utf8');
  }
}

console.log(`[sync-ghpages] Synced gh-pages-app bundle with cache-busting build ID: ${hash}`);
