interface KPICardProps {
  label: string;
  value: string | number;
  format: 'percent' | 'currency' | 'ratio' | 'number';
  trend?: 'up' | 'down' | 'stable';
  sparklineData?: number[];
}

export function KPICard({ label, value, trend = 'stable' }: KPICardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return '#10b981';
    if (trend === 'down') return '#ef4444';
    return '#9DC241';
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      color: 'var(--text)',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '8px', fontWeight: '500' }}>
        {label}
      </div>
      <div style={{
        fontSize: '28px',
        fontWeight: '700',
        color: '#003087',
        marginBottom: '8px',
      }}>
        {value}
      </div>
      <div style={{
        height: '3px',
        backgroundColor: getTrendColor(),
        borderRadius: '2px',
      }} />
    </div>
  );
}

