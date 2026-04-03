// refresh-data.mjs
// Copies/transforms the newest source extract from inbox to the public/data/ load file if newer
import fs from 'fs';
import path from 'path';

const inboxDir = path.resolve('data/inbox');
const publicDataDir = path.resolve('public/data');
const targetFile = path.join(publicDataDir, 'current.xlsx');

// Find latest source extract
const files = fs.readdirSync(inboxDir)
  .filter(f => f.endsWith('.xlsx'))
  .map(f => ({
    file: f,
    mtime: fs.statSync(path.join(inboxDir, f)).mtime.getTime()
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (!files.length) {
  console.error('No .xlsx files found in inbox.');
  process.exit(1);
}

const latest = path.join(inboxDir, files[0].file);
const latestMtime = files[0].mtime;

let targetMtime = 0;
if (fs.existsSync(targetFile)) {
  targetMtime = fs.statSync(targetFile).mtime.getTime();
}

if (latestMtime > targetMtime) {
  fs.copyFileSync(latest, targetFile);
  console.log(`Copied ${latest} to ${targetFile}`);
} else {
  console.log('No update needed: target is up to date.');
}
