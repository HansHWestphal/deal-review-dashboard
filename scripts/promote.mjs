// Mode A: Local transform pipeline - promote.mjs
import fs from 'fs';
import path from 'path';

const src = path.resolve('data/test/opportunities.clean.json');
const dest = path.resolve('data/prod/opportunities.clean.json');

if (!fs.existsSync(src)) {
  console.error('Source file does not exist:', src);
  process.exit(1);
}
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log('Promoted', src, 'to', dest);
