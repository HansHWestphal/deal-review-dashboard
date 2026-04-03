// scripts/data-refresh.mjs
// Node-only script to transform the latest D365 export into public/data/current.xlsx
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const INBOX_DIR = path.resolve('public/inbox');
const OUT_XLSX = path.resolve('public/data/current.xlsx');
const OUT_META = path.resolve('public/data/current.meta.json');

const RAW_PREFIX = 'Hans FY27 Opp Tracker';
const RAW_EXT = '.xlsx';

const RAW_TO_TARGET = {
  'Topic': 'Opportunity Name',
  'Account': 'Account',
  'Description': 'Description',
  'Current Situation': 'Current Situation',
  'Client Need': 'Client Need',
  'Client Pain Points': 'Client Pain Points',
  'Next Step': 'Next Step',
  'Next Step Due Date': 'Next Step Due Date',
  'Est. close date': 'Close Date',
  'Est. revenue': 'Estimated Revenue (TCV)',
  'Contact': 'Contact',
  'Rating': 'Rating',
  'Sales Stage': 'Sales Stage',
  'Probability': 'Probability',
  'Created On': 'Created On',
  'Modified On': 'Modified On',
  'MSFT Workload Product': 'Product',
  'Forecast Category': 'Forecast Category',
  'Actual Revenue': 'Actual Revenue',
  'Status': 'Status',
};

const TARGET_COLUMNS = [
  'GUID',
  'Opportunity Name', 'Account', 'Description', 'Current Situation', 'Client Need', 'Client Pain Points',
  'Next Step', 'Next Step Due Date', 'Close Date', 'Estimated Revenue (TCV)',
  'Contact', 'Rating', 'Sales Stage', 'Probability', 'Created On', 'Modified On',
  'Product', 'Forecast Category', 'Actual Revenue', 'Status', 'Status Reason',
];

function findLatestFile() {
  const files = fs.readdirSync(INBOX_DIR)
    .filter(f => f.startsWith(RAW_PREFIX) && f.endsWith(RAW_EXT))
    .map(f => ({
      name: f,
      mtime: fs.statSync(path.join(INBOX_DIR, f)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);
  return files[0]?.name;
}

function computeProbability(row) {
  const fc = row['Forecast Category'] || '';
  if (/^\d+%/.test(fc)) {
    return parseFloat(fc) / 100;
  }
  let prob = row['Probability'];
  if (typeof prob === 'string') prob = parseFloat(prob);
  if (typeof prob === 'number') {
    if (prob > 1) return prob / 100;
    return prob;
  }
  return '';
}

function main() {
  const latest = findLatestFile();
  if (!latest) {
    console.error('No matching D365 export found in public/inbox');
    process.exit(1);
  }
  const srcPath = path.join(INBOX_DIR, latest);
  console.log(`Transforming source: ${srcPath}`);
  const wb = xlsx.readFile(srcPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws);

  // Validation: required columns
  const REQUIRED_COLS = [
    'Topic', 'Account', 'Description', 'Next Step', 'Next Step Due Date', 'Est. close date', 'Est. revenue'
  ];
  const presentCols = rows.length > 0 ? Object.keys(rows[0]) : [];
  const missing = REQUIRED_COLS.filter(col => !presentCols.includes(col));
  if (missing.length) {
    console.error('Source headers:', presentCols);
    if (rows.length > 0) {
      console.error('First row sample:', rows[0]);
    }
    throw new Error(`Missing required columns in source: ${missing.join(', ')}`);
  }

  function toIsoDate(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'number') {
      // Excel serial date to UTC YYYY-MM-DD
      const utc = new Date(Math.round((value - 25569) * 86400 * 1000));
      return utc.toISOString().split('T')[0];
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return value;
    return value;
  }

  // Filter out rows where Status == "Lost" AND (Forecast Category begins with "0%" OR Status Reason equals "Error/duplicate")
  let filteredCount = 0;
  const filteredRows = rows.filter(row => {
    const status = String(row['Status'] ?? '').trim();
    const fc = String(row['Forecast Category'] ?? '').trim();
    const sr = String(row['Status Reason'] ?? '').trim().toLowerCase();
    if (status === 'Lost' && (fc.startsWith('0%') || sr === 'error/duplicate')) {
      filteredCount++;
      return false;
    }
    return true;
  });

  const outRows = filteredRows.map(row => {
    const out = {};
    // Add GUID from D365 export
    out['GUID'] = row['(Do Not Modify) Opportunity'] ?? '';
    for (const [raw, target] of Object.entries(RAW_TO_TARGET)) {
      if (target === 'Probability') continue; // handled below
      // Normalize date fields
      if ([
        'Next Step Due Date', 'Close Date', 'Created On', 'Modified On'
      ].includes(target)) {
        out[target] = toIsoDate(row[raw]);
      } else {
        out[target] = row[raw] ?? '';
      }
    }
    out['Probability'] = computeProbability(row);
    // Map Status Reason (append at end)
    out['Status Reason'] = row['Status Reason'] ?? '';
    return out;
  });

  // Drop Predictive Score, ensure column order
  const outData = [TARGET_COLUMNS];
  for (const row of outRows) {
    outData.push(TARGET_COLUMNS.map(col => row[col] ?? ''));
  }

  const outWb = xlsx.utils.book_new();
  const outWs = xlsx.utils.aoa_to_sheet(outData);
  xlsx.utils.book_append_sheet(outWb, outWs, 'Sheet1');
  xlsx.writeFile(outWb, OUT_XLSX);

  fs.writeFileSync(OUT_META, JSON.stringify({
    source: latest,
    refreshed: new Date().toISOString()
  }, null, 2));

  console.log(`Filtered out ${filteredCount} row(s) where Status == "Lost" and (Forecast Category starts with "0%" or Status Reason is Error/duplicate).`);
  console.log(`Wrote ${OUT_XLSX} from ${latest}`);
}

main();
