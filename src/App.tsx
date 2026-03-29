import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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
import OpportunityDetails from './pages/OpportunityDetails';
import './App.css';

function DashboardPage({ data }: { data: DashboardData }) {
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
  const wonCount = data.opportunities.filter(o => o.isWon === true).length;
  const lostCount = data.opportunities.filter(o => o.stage === 'Lost').length;
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
  );
}

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
        <Route path="/" element={<DashboardPage data={data} />} />
        <Route path="/opportunity/:id" element={<OpportunityDetails opportunities={data.opportunities} />} />
      </Routes>
    </div>
  );
}

export default App;
