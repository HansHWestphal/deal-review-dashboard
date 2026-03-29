import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { Opportunity } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface FunnelChartProps {
  opportunities: Opportunity[];
}

export function FunnelChart({ opportunities }: FunnelChartProps) {
  const stages = ['Qualification', 'Develop', 'Proposal', 'Close'];
  const stageCounts = stages.map(stage => 
    opportunities.filter(o => o.stage === stage).length
  );

  // Navy for open stages (Qualify, Develop), Green for Proposal/Close
  const colors = [
    '#003087',  // Qualification - Navy
    '#003087',  // Develop - Navy
    '#9DC241',  // Proposal - Green
    '#9DC241',  // Close - Green
  ];

  const data = {
    labels: stages,
    datasets: [{
      data: stageCounts,
      backgroundColor: colors,
      borderColor: 'var(--card-bg)',
      borderWidth: 2,
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
        Sales Pipeline Funnel
      </h3>
      <Doughnut data={data} options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: 'var(--text)', font: { size: 11 } },
          },
        },
      }} />
    </div>
  );
}
