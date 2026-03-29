import type { Opportunity } from '../types';
import { Clock } from 'lucide-react';

interface AgingDealsListProps {
  opportunities: Opportunity[];
}

export function AgingDealsList({ opportunities }: AgingDealsListProps) {
  const agingDeals = opportunities
    .filter(o => !o.isWon && o.ageInDays > 60)
    .sort((a, b) => b.ageInDays - a.ageInDays)
    .slice(0, 8);

  if (agingDeals.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '16px',
        height: '280px',
        overflow: 'auto',
        boxShadow: 'var(--shadow)',
      }}>
        <h3 style={{ color: '#003087', fontSize: '14px', fontWeight: '600', marginTop: 0, marginBottom: '12px' }}>
          Aging Deals (&gt;60 days)
        </h3>
        <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: '24px' }}>
          No aging deals detected ✓
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--card-bg)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '16px',
      height: '280px',
      overflow: 'auto',
      boxShadow: 'var(--shadow)',
    }}>
      <h3 style={{ color: '#003087', fontSize: '14px', fontWeight: '600', marginTop: 0, marginBottom: '12px' }}>
        Aging Deals (&gt;60 days since update)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {agingDeals.map(deal => (
          <div key={deal.id} style={{
            backgroundColor: '#FEF2F2',
            padding: '10px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            border: '1px solid #FECACA',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#DC2626', fontWeight: '600', marginBottom: '2px' }}>
                {deal.name.length > 25 ? deal.name.substring(0, 22) + '...' : deal.name}
              </div>
              <div style={{ color: 'var(--text-light)', fontSize: '11px' }}>
                {deal.accountName} • ${(deal.estimatedRevenue / 1000).toFixed(0)}K
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#DC2626',
              fontWeight: '600',
            }}>
              <Clock size={14} />
              {deal.ageInDays}d
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
