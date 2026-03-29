import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import type { Opportunity } from '../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

interface ForecastChartProps {
  opportunities: Opportunity[];
}

export function ForecastChart({ opportunities }: ForecastChartProps) {
  const closeDateGroups = new Map<string, number>();
  
  opportunities.forEach(opp => {
    if (!opp.isWon) {
      const value = opp.estimatedRevenue * (opp.probability / 100);
      const date = opp.closeDate;
      closeDateGroups.set(date, (closeDateGroups.get(date) || 0) + value);
    }
  });

  const sortedDates = Array.from(closeDateGroups.keys()).sort();
  const labels = sortedDates.slice(0, 15).map(d => d.substring(5));
  const data = sortedDates.slice(0, 15).map(d => (closeDateGroups.get(d) || 0) / 1000);

  const chartData = {
    labels,
    datasets: [{
      label: 'Weighted Forecast ($K)',
      data,
      borderColor: '#00A3E0',
      backgroundColor: 'rgba(0, 163, 224, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#00A3E0',
      pointBorderColor: 'var(--card-bg)',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      height: '280px',
      boxShadow: 'var(--shadow)',
    }}>
      <h3 style={{ marginBottom: '12px', color: '#003087', fontSize: '14px', fontWeight: '600' }}>
        Weighted Forecast by Close Date
      </h3>
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            ticks: { color: 'var(--text)', font: { size: 10 } },
            grid: { color: '#f0f0f0' },
            border: { display: false },
          },
          y: {
            ticks: { color: 'var(--text)', font: { size: 10 } },
            grid: { color: '#f0f0f0' },
            border: { display: false },
          },
        },
      }} />
    </div>
  );
}
