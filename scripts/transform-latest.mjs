// Mode A: Local transform pipeline - transform-latest.mjs
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const inboxDir = path.resolve('data/inbox');
const testOut = path.resolve('data/test/opportunities.clean.json');
const prodMap = path.resolve('data/prod/opportunity_id_map.json');

// Find latest OppViewExtract_v1_*.xlsx
const files = fs.readdirSync(inboxDir)
  .filter(f => /^OppViewExtract_v1_.*\.xlsx$/.test(f))
  .map(f => ({
    file: f,
    mtime: fs.statSync(path.join(inboxDir, f)).mtime.getTime()
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (!files.length) {
  console.error('No OppViewExtract_v1_*.xlsx found in inbox.');
  process.exit(1);
}

const latest = path.join(inboxDir, files[0].file);
const wb = xlsx.readFile(latest);
const sheet = wb.Sheets[wb.SheetNames[0]];
const raw = xlsx.utils.sheet_to_json(sheet);

// Required columns
const required = [
  '(Do Not Modify) Opportunity', 'Topic', 'Account', 'Sales Stage', 'Forecast Category',
  'Est. revenue', 'Modified On'
];
const missing = required.filter(col => !Object.keys(raw[0] || {}).includes(col));
if (missing.length) {
  console.error('Missing required columns:', missing.join(', '));
  process.exit(1);
}

// Helper: probability from forecast category
function parseProbability(fc) {
  if (typeof fc !== 'string') return null;
  const m = fc.match(/^(\d{1,3})%/);
  if (!m) return null;
  return parseInt(m[1], 10) / 100;
}

// Helper: snake_case
function snake(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/\W+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

// Map and transform
let nextOppId = 1;
const clean = raw.map((row, i) => {
  // Use D365 GUID if present, else fallback
  const source_opportunity_id = row['(Do Not Modify) Opportunity'] || row['Opportunity'] || `SRC-${i+1}`;
  const opportunity_id = `OPP-${String(nextOppId++).padStart(3, '0')}`;
  const probability = parseProbability(row['Forecast Category']);
  const estimated_revenue = Number(row['Est. revenue']) || 0;
  const actual_revenue = Number(row['Actual Revenue']) || 0;
  const weighted_revenue = estimated_revenue * (probability ?? 0);
  return {
    opportunity_id,
    source_opportunity_id,
    opportunity_name: row['Topic'] || '',
    account_name: row['Account'] || '',
    sales_stage: row['Sales Stage'] || '',
    forecast_category: row['Forecast Category'] || '',
    probability,
    estimated_revenue,
    actual_revenue,
    weighted_revenue,
    created_date: row['Created On'] || '',
    modified_date: row['Modified On'] || '',
    estimated_close_date: row['Estimated Close Date'] || '',
    next_step_due_date: row['Next Step Due Date'] || '',
    next_step: row['Next Step'] || '',
    description: row['Description'] || '',
    client_need: row['Client Need'] || '',
    client_pain_points: row['Client Pain Points'] || '',
    current_situation: row['Current Situation'] || '',
    rating: row['Rating'] || '',
    timeline: row['Timeline'] || '',
    predictive_score: null
  };
});

// Write clean opportunities
fs.mkdirSync(path.dirname(testOut), { recursive: true });
fs.writeFileSync(testOut, JSON.stringify(clean, null, 2));

// Update/create opportunity_id_map.json
let idMap = {};
if (fs.existsSync(prodMap)) {
  idMap = JSON.parse(fs.readFileSync(prodMap, 'utf8'));
}
for (const row of clean) {
  if (row.source_opportunity_id) {
    idMap[row.source_opportunity_id] = row.opportunity_id;
  }
}
fs.mkdirSync(path.dirname(prodMap), { recursive: true });
fs.writeFileSync(prodMap, JSON.stringify(idMap, null, 2));
