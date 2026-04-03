import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { DashboardData, Opportunity } from './types';
import { loadExcelData } from './utils/excelLoader';
import { sampleData, isDemoMode } from './data/sampleData';
import { KPICard } from './components/KPICard';
import { FunnelChart } from './components/FunnelChart';
import { BarChart } from './components/BarChart';
import { ForecastChart } from './components/ForecastChart';
import { OpportunitiesTable } from './components/OpportunitiesTable';
import { AgingDealsList } from './components/AgingDealsList';
import { ActivitySummary } from './components/ActivitySummary';
import { Banner } from './components/Banner';
import OpportunityDetails from './pages/OpportunityDetails';
import './App.css';


// Lifecycle filters are exploratory lenses; KPIs are computed from the canonical dataset per the Dashboard Semantics Contract.


function DashboardPage({ data, dataSource }: { data: DashboardData, dataSource: string }) {
  const [lifecycleFilter, setLifecycleFilter] = useState<{ open: boolean; won: boolean; lost: boolean }>({ open: true, won: false, lost: false });

  function filterOpportunitiesByLifecycleSet(opps: Opportunity[], filter: { open: boolean; won: boolean; lost: boolean }): Opportunity[] {
    // Lifecycle filters are exploratory lenses; KPIs are computed from the canonical dataset per the Dashboard Semantics Contract.
    const selected = Object.entries(filter).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) return [];
    return opps.filter(o => {

      // Align with loader: isWon is the canonical win indicator
      const isWon = o.isWon === true;
      const isLost = o.stage === 'Lost' || o.status === 'Lost' || o.statusReason?.toLowerCase() === 'lost';
      const isOpen = !isWon && !isLost;
      return (filter.open && isOpen) || (filter.won && isWon) || (filter.lost && isLost);
    });
  }

  const filteredOpps = filterOpportunitiesByLifecycleSet(data.opportunities, lifecycleFilter);

  // --- Dashboard Semantics Contract: KPIs are always computed from the full, unfiltered opportunity dataset. ---
  // Quota Attainment = sum of actualRevenue where isWon === true / quotaTarget
  const quotaAttainment = (
    data.opportunities
      .filter(o => o.isWon === true)
      .reduce((sum, o) => sum + o.actualRevenue, 0) / data.quotaTarget * 100
  ).toFixed(0);

  // Pipeline Coverage Ratio = sum of estimatedRevenue for opportunities where isWon === false and stage !== 'Lost' / quotaTarget
  const openStagePipeline = data.opportunities
    .filter(o => o.isWon === false && o.stage !== 'Lost')
    .reduce((sum, o) => sum + o.estimatedRevenue, 0);
  
  const pipelineCoverage = (openStagePipeline / data.quotaTarget).toFixed(1);

  // Win Rate = wonCount / (wonCount + lostCount)
  const wonCount = data.opportunities.filter(o => o.isWon === true || o.stage === 'Won').length;
  const lostCount = data.opportunities.filter(o => {
    const isLost = o.stage === 'Lost' || o.status === 'Lost';
    const fc = typeof o.forecastCategory === 'string' ? o.forecastCategory.trim() : '';
    const sr = typeof o.statusReason === 'string' ? o.statusReason.trim().toLowerCase() : '';
    const isNonQualified = fc.startsWith('0%');
    const isDuplicateError = sr === 'error/duplicate';
    return isLost && !isNonQualified && !isDuplicateError;
  }).length;
  const winRate = (wonCount + lostCount) > 0
    ? ((wonCount / (wonCount + lostCount)) * 100).toFixed(0)
    : '0';

  const sparklineData = Array.from({ length: 12 }, () => Math.random() * 100);

  return (
    <main style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px 16px',
    }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 600, marginRight: 12 }}>Show:</label>
        <label style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={lifecycleFilter.open}
            onChange={e => {
              const next = { ...lifecycleFilter, open: e.target.checked };
              if (!next.open && !next.won && !next.lost) next.open = true; // auto-recheck Open if all unchecked
              setLifecycleFilter(next);
            }}
          /> Open
        </label>
        <label style={{ marginRight: 8 }}>
          <input
            type="checkbox"
            checked={lifecycleFilter.won}
            onChange={e => {
              const next = { ...lifecycleFilter, won: e.target.checked };
              if (!next.open && !next.won && !next.lost) next.open = true;
              setLifecycleFilter(next);
            }}
          /> Won
        </label>
        <label>
          <input
            type="checkbox"
            checked={lifecycleFilter.lost}
            onChange={e => {
              const next = { ...lifecycleFilter, lost: e.target.checked };
              if (!next.open && !next.won && !next.lost) next.open = true;
              setLifecycleFilter(next);
            }}
          /> Lost
        </label>
      </div>
      <div style={{ fontSize: '0.8em', color: '#888', marginBottom: 8, border: '1px solid #eee', padding: 6, borderRadius: 4 }}>
        <div>Debug panel:</div>
        <div>Data source: {dataSource}</div>
        <div>Demo mode: {isDemoMode() ? 'true' : 'false'}</div>
        <div>Total opportunities: {data.opportunities.length}</div>
        <div>isWon true count: {data.opportunities.filter(o => o.isWon === true).length}</div>
        <div>
          <span>actualRevenue {'>'} 0 count: {data.opportunities.filter(o => o.actualRevenue > 0).length}</span>
        </div>
        <div>Lost count: {data.opportunities.filter(o => o.stage === 'Lost' || o.status === 'Lost' || (o.statusReason?.toLowerCase() === 'lost')).length}</div>
        <div>Sample:</div>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {data.opportunities.slice(0, 3).map((o, i) => (
            <li key={i}>
              {o.name} | actualRevenue: {o.actualRevenue} | isWon: {String(o.isWon)} | stage: {o.stage} | status: {o.status} | statusReason: {o.statusReason}
            </li>
          ))}
        </ul>
      </div>
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
        <FunnelChart opportunities={filteredOpps} />
        <BarChart opportunities={filteredOpps} />
        <ForecastChart opportunities={filteredOpps} />
      </div>

      {/* Row 3: Tables & Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        gridColumn: '1 / -1',
      }}>
        <OpportunitiesTable opportunities={filteredOpps} />
        <AgingDealsList opportunities={filteredOpps} />
        <ActivitySummary
          weeklyActivities={data.weeklyActivities}
          totalOpportunities={filteredOpps.length}
          wonOpportunities={filteredOpps.filter(o => o.stage === 'Won').length}
        />
      </div>
    </main>
  );
}

function App() {
  const [data, setData] = useState<DashboardData>(sampleData);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<string>('sampleData fallback');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const excelPath = '/data/current.xlsx';
    try {
      const excelData = await loadExcelData(excelPath);
      setData(excelData);
      setDataSource('current.xlsx');
    } catch (error) {
      setData(sampleData);
      setDataSource('sampleData fallback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <header>
        <div className="alithya-logo">Alithya</div>
        <div style={{ marginLeft: 'auto', color: '#1F2937', fontSize: '14px', fontWeight: '500' }}>
          D365 Personal Command Center
        </div>
      </header>

      <Banner onRefresh={loadData} isLoading={isLoading} />
      <Routes>
        <Route path="/" element={<DashboardPage data={data} dataSource={dataSource} />} />
        <Route path="/opportunity/:id" element={<OpportunityDetails opportunities={data.opportunities} />} />
      </Routes>
    </div>
  );
}

export default App;
