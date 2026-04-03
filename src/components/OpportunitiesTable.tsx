import { useState } from 'react';
import { Link } from 'react-router-dom';
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
                  <Link
  to={`/opportunity/${encodeURIComponent(opp.id)}`}
  style={{
    color: 'inherit',
    textDecoration: 'none',
    borderBottom: '1px dotted transparent',
    transition: 'border-color 0.2s',
  }}
  onMouseOver={e => (e.currentTarget.style.borderBottom = '1px solid #003087')}
  onMouseOut={e => (e.currentTarget.style.borderBottom = '1px dotted transparent')}
>
  {opp.name}
</Link>
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
                    backgroundColor: `rgba(157, 194, 65, ${opp.probability})`,
                    color: opp.probability > 0.5 ? '#FFFFFF' : '#1F2937',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    {Math.round(opp.probability * 100)}%
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
