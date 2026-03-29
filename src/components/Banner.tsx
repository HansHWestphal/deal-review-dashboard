import { AlertCircle, Download } from 'lucide-react';

interface BannerProps {
  onRefresh: () => void;
  isLoading: boolean;
}

export function Banner({ onRefresh, isLoading }: BannerProps) {
  return (
    <div style={{
      backgroundColor: '#003087',
      borderBottom: '2px solid #E5E7EB',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
        <AlertCircle size={18} color='white' />
        <div style={{ color: 'white', fontSize: '13px' }}>
          <strong>D365 Export Instructions:</strong> Export opportunities with columns: Opportunity Name, Estimated Revenue, Close Date, Sales Stage, Probability, Actual Revenue, Created On, Modified On, Account Name, Product. Save as Excel in{' '}
          <code style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '2px 4px', borderRadius: '2px' }}>
            public/data/d365_opps_export.xlsx
          </code>
        </div>
      </div>
      <button
        onClick={onRefresh}
        disabled={isLoading}
        style={{
          backgroundColor: '#9DC241',
          color: '#003087',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          opacity: isLoading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        <Download size={14} />
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>
    </div>
  );
}
