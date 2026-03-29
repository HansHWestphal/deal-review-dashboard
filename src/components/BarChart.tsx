import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import type { Opportunity } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
  opportunities: Opportunity[];
}

export function BarChart({ opportunities }: BarChartProps) {
  const topOpps = opportunities
    .filter(o => !o.isWon)
    .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
    .slice(0, 10);

  const data = {
    labels: topOpps.map(o => o.name.length > 20 ? o.name.substring(0, 17) + '...' : o.name),
    datasets: [{
      label: 'Estimated Revenue ($K)',
      data: topOpps.map(o => o.estimatedRevenue / 1000),
      backgroundColor: '#00A3E0',
      borderColor: 'var(--border)',
      borderWidth: 0,
      borderRadius: 4,
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
        Top 10 Open Opportunities
      </h3>
      <Bar data={data} options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y' as const,
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
            ticks: { color: 'var(--text)', font: { size: 9 } },
            grid: { display: false },
          },
        },
      }} />
    </div>
  );
}
