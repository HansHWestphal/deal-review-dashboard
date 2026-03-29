interface ActivitySummaryProps {
  weeklyActivities: number;
  totalOpportunities: number;
  wonOpportunities: number;
}

export function ActivitySummary({ weeklyActivities, totalOpportunities, wonOpportunities }: ActivitySummaryProps) {
  const activities = [
    { label: 'Weekly Activities', value: weeklyActivities, color: '#00A3E0' },
    { label: 'Total Opps', value: totalOpportunities, color: '#003087' },
    { label: 'Won Deals', value: wonOpportunities, color: '#9DC241' },
  ];

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      height: '280px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-around',
      boxShadow: 'var(--shadow)',
    }}>
      <h3 style={{ color: '#003087', fontSize: '14px', fontWeight: '600', margin: '0 0 16px 0' }}>
        Activities Summary
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {activities.map((activity) => (
          <div key={activity.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: activity.color,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              color: '#FFFFFF',
              fontSize: '18px',
            }}>
              {activity.value}
            </div>
            <div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
              }}>
                {activity.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
