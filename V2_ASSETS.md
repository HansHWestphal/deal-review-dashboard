

---
## .\package.json

```text
{
  "name": "d365-personal-analytics",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "autoprefixer": "^10.4.27",
    "chart.js": "^4.5.1",
    "date-fns": "^4.1.0",
    "lucide-react": "^1.7.0",
    "postcss": "^8.5.8",
    "react": "^19.2.4",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^19.2.4",
    "tailwindcss": "^4.2.2",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.4",
    "@types/node": "^24.12.0",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.1",
    "eslint": "^9.39.4",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "globals": "^17.4.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.57.0",
    "vite": "^8.0.1"
  }
}

```


---
## .\vite.config.ts

```text
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
})

```


---
## .\src\types.ts

```text
export interface Opportunity {
  id: string;
  name: string;
  accountName: string;
  estimatedRevenue: number;
  actualRevenue: number;
  probability: number;
  stage: string;
  closeDate: string;
  createdOn: string;
  modifiedOn: string;
  ageInDays: number;
  isWon: boolean;
  product: string;
}

export interface DashboardData {
  opportunities: Opportunity[];
  quotaTarget: number;
  weeklyActivities: number;
  lastUpdated: string;
}

export interface KPIData {
  label: string;
  value: number;
  format: 'percent' | 'ratio' | 'number' | 'currency';
  trend?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

```


---
## .\src\utils\excelLoader.ts

```text
import * as XLSX from 'xlsx';
import type { Opportunity, DashboardData } from '../types';

// Hard-coded quota for FY27
const FY27_QUOTA = 5_000_000;

export async function loadExcelData(filePath: string): Promise<DashboardData> {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[];
    
    const opportunities = jsonData.map((row: Record<string, unknown>, index: number): Opportunity => {
      // Parse dates from Excel columns (handles Excel serial numbers)
      const closeDate = parseDate(row['Close Date'] as string | number);
      const createdOn = parseDate(row['Created On'] as string | number);
      const modifiedOn = parseDate(row['Modified On'] as string | number);
      
      // Calculate age in days since Modified On (>60 days = aging deal)
      const ageInDays = calculateDaysSince(modifiedOn);
      
      // Parse revenue amounts - handle "Actual Revenu" (missing 'e')
      const estimatedRevenue = parseNumber(row['Estimated Revenue (TCV)']);
      const actualRevenue = parseNumber(row['Actual Revenu'] || row['Actual Revenue']);
      
      // Determine win status based on actual revenue > 0
      const isWon = actualRevenue > 0;
      
      // Get stage - normalize D365 stage names
      const stage = normalizeStage((row['Sales Stage'] || 'Qualification') as string);
      
      return {
        id: `OPP-${index + 1}`,
        name: (row['Opportunity Name'] || '') as string,
        accountName: (row['Account Name'] || '') as string,
        estimatedRevenue,
        actualRevenue,
        probability: parseNumber(row['Probability']),
        stage,
        closeDate,
        createdOn,
        modifiedOn,
        ageInDays,
        isWon,
        product: (row['Product'] || 'N/A') as string,
      };
    });
    
    // Use hard-coded quota
    const quotaTarget = FY27_QUOTA;
    
    // Calculate weekly activities (opportunities modified in last 7 days)
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyActivities = opportunities.filter(o => {
      const modDate = new Date(o.modifiedOn);
      return modDate >= sevenDaysAgo;
    }).length;
    
    const totalEstimated = opportunities.reduce((sum, o) => sum + o.estimatedRevenue, 0);
    const totalWon = opportunities.reduce((s, o) => s + o.actualRevenue, 0);
    
    console.log(`✅ Loaded ${opportunities.length} opportunities from Excel`);
    console.log(`   FY27 Quota Target: $${(quotaTarget / 1000000).toFixed(2)}M`);
    console.log(`   Total Estimated Revenue (Pipeline): $${(totalEstimated / 1000000).toFixed(2)}M`);
    console.log(`   Total Actual Revenue (Won): $${(totalWon / 1000000).toFixed(2)}M`);
    
    return {
      opportunities,
      quotaTarget,
      weeklyActivities,
      lastUpdated: new Date().toLocaleString(),
    };
  } catch (error) {
    console.error('Error loading Excel file:', error);
    throw error;
  }
}

function parseDate(dateValue: string | number | undefined): string {
  if (!dateValue) return new Date().toISOString().split('T')[0];
  
  if (typeof dateValue === 'number') {
    // Excel date serial number (days since 1900-01-01)
    // Adjust for Excel's leap year bug
    const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
    const isoDate = excelDate.toISOString().split('T')[0];
    return isoDate;
  }
  
  if (typeof dateValue === 'string') {
    // Try to parse as ISO string first
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  }
  
  return new Date().toISOString().split('T')[0];
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function calculateDaysSince(dateString: string): number {
  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Set both to midnight for accurate day calculation
    targetDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const timeDiff = today.getTime() - targetDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    
    return Math.max(0, daysDiff);
  } catch {
    return 0;
  }
}

function normalizeStage(stage: string): string {
  if (!stage) return 'Qualification';
  
  const normalized = stage.toLowerCase().trim();
  
  // Map D365 stage names exactly: Qualify, Develop, Propose, Close
  const stageMap: Record<string, string> = {
    // Qualify stage
    'qualify': 'Qualification',
    'qualification': 'Qualification',
    // Develop stage
    'develop': 'Develop',
    // Propose stage
    'propose': 'Proposal',
    'proposal': 'Proposal',
    // Close stage
    'close': 'Close',
    // Won/Lost (for completeness, but not used in funnel)
    'closed won': 'Won',
    'closedwon': 'Won',
    'closed-won': 'Won',
    'won': 'Won',
    'closed lost': 'Lost',
    'closedlost': 'Lost',
    'closed-lost': 'Lost',
    'lost': 'Lost',
  };
  return stageMap[normalized] || stage;
}

```


---
## .\src\App.tsx

```text
import { useEffect, useState } from 'react';
import type { DashboardData } from './types';
import { loadExcelData } from './utils/excelLoader';
import { sampleData } from './data/sampleData';
import { KPICard } from './components/KPICard';
import { FunnelChart } from './components/FunnelChart';
import { BarChart } from './components/BarChart';
import { ForecastChart } from './components/ForecastChart';
import { OpportunitiesTable } from './components/OpportunitiesTable';
import { AgingDealsList } from './components/AgingDealsList';
import { ActivitySummary } from './components/ActivitySummary';
import { Banner } from './components/Banner';
import './App.css';

function App() {
  const [data, setData] = useState<DashboardData>(sampleData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const excelData = await loadExcelData('/data/d365_opps_export.xlsx');
      setData(excelData);
    } catch (error) {
      console.log('Using sample data (Excel file not found or invalid):', error);
      setData(sampleData);
    } finally {
      setIsLoading(false);
    }
  };

  // Quota Attainment = Closed-Won Actual Revenue / Quota
  const quotaAttainment = (data.opportunities
    .filter(o => o.stage === 'Won')
    .reduce((sum, o) => sum + o.actualRevenue, 0) / data.quotaTarget * 100).toFixed(0);

  // Pipeline Coverage Ratio = sum of Estimated Revenue for all OPEN stages / quota
  // Open stages: Qualification, Develop, Proposal, Close (NOT Won, NOT Lost)
  const openStagePipeline = data.opportunities
    .filter(o => ['Qualification', 'Develop', 'Proposal', 'Close'].includes(o.stage))
    .reduce((sum, o) => sum + o.estimatedRevenue, 0);
  
  const pipelineCoverage = (openStagePipeline / data.quotaTarget).toFixed(1);

  // Win Rate = sum of Actual Revenue where stage = Won / sum of all Actual Revenue (won + lost)
  const wonRevenue = data.opportunities
    .filter(o => o.stage === 'Won')
    .reduce((sum, o) => sum + o.actualRevenue, 0);
  
  const closedRevenue = data.opportunities
    .filter(o => ['Won', 'Lost'].includes(o.stage))
    .reduce((sum, o) => sum + o.actualRevenue, 0);
  
  const winRate = closedRevenue > 0
    ? ((wonRevenue / closedRevenue) * 100).toFixed(0)
    : '0';

  const sparklineData = Array.from({ length: 12 }, () => Math.random() * 100);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <header>
        <div className="alithya-logo">Alithya</div>
        <div style={{ marginLeft: 'auto', color: '#1F2937', fontSize: '14px', fontWeight: '500' }}>
          D365 Personal Command Center
        </div>
      </header>

      <Banner onRefresh={loadData} isLoading={isLoading} />
      
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px 16px',
      }}>
        <h1 style={{
          color: '#003087',
          marginBottom: '24px',
          fontSize: '28px',
          fontWeight: '700',
        }}>
          Sales Analytics Dashboard
        </h1>

        {/* Row 1: KPIs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <KPICard
            label="Quota Attainment %"
            value={`${quotaAttainment}%`}
            format="percent"
            trend={parseInt(quotaAttainment) > 50 ? 'up' : 'down'}
            sparklineData={sparklineData}
          />
          <KPICard
            label="Pipeline Coverage Ratio (4-5x)"
            value={`${pipelineCoverage}x`}
            format="ratio"
            trend={parseFloat(pipelineCoverage) >= 4 ? 'up' : 'down'}
          />
          <KPICard
            label="Win Rate %"
            value={`${winRate}%`}
            format="percent"
            trend={parseInt(winRate) > 30 ? 'up' : 'stable'}
            sparklineData={sparklineData}
          />
        </div>

        {/* Row 2: Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <FunnelChart opportunities={data.opportunities} />
          <BarChart opportunities={data.opportunities} />
          <ForecastChart opportunities={data.opportunities} />
        </div>

        {/* Row 3: Tables & Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          gridColumn: '1 / -1',
        }}>
          <OpportunitiesTable opportunities={data.opportunities} />
          <AgingDealsList opportunities={data.opportunities} />
          <ActivitySummary
            weeklyActivities={data.weeklyActivities}
            totalOpportunities={data.opportunities.length}
            wonOpportunities={data.opportunities.filter(o => o.stage === 'Won').length}
          />
        </div>
      </main>
    </div>
  );
}

export default App;

```


---
## .\src\components\OpportunitiesTable.tsx

```text
import { useState } from 'react';
import type { Opportunity } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

type SortField = 'name' | 'estimatedRevenue' | 'probability' | 'closeDate' | 'ageInDays';
type SortOrder = 'asc' | 'desc';

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const [sortField, setSortField] = useState<SortField>('estimatedRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Only show open opportunities, sorted
  const openOpps = opportunities.filter(o => !o.isWon);
  
  const sorted = [...openOpps].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (sortField === 'name' || sortField === 'closeDate') {
      aVal = String(a[sortField]);
      bVal = String(b[sortField]);
    } else {
      aVal = Number(a[sortField]);
      bVal = Number(b[sortField]);
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      onClick={() => handleSort(field)}
      style={{
        cursor: 'pointer',
        padding: '8px 12px',
        textAlign: 'left',
        fontWeight: '600',
        fontSize: '12px',
        color: '#003087',
        borderBottom: '2px solid var(--border)',
        userSelect: 'none',
        backgroundColor: '#F9FAFB',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {label}
        {sortField === field && (
          sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </div>
    </th>
  );

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
      gridColumn: '1 / -1',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <h3 style={{ color: '#003087', fontSize: '14px', fontWeight: '600', margin: 0 }}>
          Top Opportunities (Sortable)
        </h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
        }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB' }}>
              <SortHeader field="name" label="Opportunity" />
              <SortHeader field="estimatedRevenue" label="Est. Revenue" />
              <SortHeader field="probability" label="Probability" />
              <th style={{
                padding: '8px 12px',
                textAlign: 'left',
                fontWeight: '600',
                fontSize: '12px',
                color: '#003087',
                borderBottom: '2px solid var(--border)',
                backgroundColor: '#F9FAFB',
              }}>Stage</th>
              <SortHeader field="closeDate" label="Close Date" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((opp, idx) => (
              <tr key={opp.id} style={{
                borderBottom: '1px solid var(--border)',
                backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB',
              }}>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                  fontWeight: '500',
                }}>
                  {opp.name}
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                  fontWeight: '500',
                }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(opp.estimatedRevenue)}
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: `rgba(157, 194, 65, ${opp.probability / 100})`,
                    color: opp.probability > 50 ? '#FFFFFF' : '#1F2937',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {opp.probability}%
                  </span>
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                }}>
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: ['Qualification', 'Develop'].includes(opp.stage) ? '#003087' : ['Proposal', 'Close'].includes(opp.stage) ? '#9DC241' : '#E5E7EB',
                    color: ['Qualification', 'Develop', 'Proposal', 'Close'].includes(opp.stage) ? '#FFFFFF' : '#1F2937',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                  }}>
                    {opp.stage}
                  </span>
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                }}>
                  {opp.closeDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

```
