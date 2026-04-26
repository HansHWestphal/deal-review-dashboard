import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Opportunity } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
}

type SortField =
  | 'name'
  | 'estimatedRevenue'
  | 'probability'
  | 'stage'
  | 'closeDate'
  | 'nextStep'
  | 'nextStepDueDate'
  | 'modifiedOn';
type SortOrder = 'asc' | 'desc';
type SortType = 'text' | 'number' | 'date';

export function OpportunitiesTable({ opportunities }: OpportunitiesTableProps) {
  const [sortField, setSortField] = useState<SortField>('estimatedRevenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Only show open opportunities, sorted
  // PATCH: Remove open-only filter, use all passed opportunities (already filtered by lifecycle in App)
  const visibleOpps = opportunities;

  const columns: Array<{
    field: SortField;
    label: string;
    sortType: SortType;
  }> = [
    { field: 'name', label: 'Opportunity', sortType: 'text' },
    { field: 'estimatedRevenue', label: 'Est. Revenue', sortType: 'number' },
    { field: 'probability', label: 'Probability', sortType: 'number' },
    { field: 'stage', label: 'Stage', sortType: 'text' },
    { field: 'closeDate', label: 'Close Date', sortType: 'date' },
    { field: 'nextStep', label: 'Next Step', sortType: 'text' },
    { field: 'nextStepDueDate', label: 'Next Step Due Date', sortType: 'date' },
    { field: 'modifiedOn', label: 'Modified On', sortType: 'date' },
  ];

  const sortColumn = columns.find(column => column.field === sortField) ?? columns[0];

  const sorted = [...visibleOpps].sort((a, b) => {
    const aVal = getSortValue(a, sortField, sortColumn.sortType);
    const bVal = getSortValue(b, sortField, sortColumn.sortType);

    if (aVal == null && bVal == null) {
      return 0;
    }
    if (aVal == null) {
      return 1;
    }
    if (bVal == null) {
      return -1;
    }

    const comparison = typeof aVal === 'string' && typeof bVal === 'string'
      ? aVal.localeCompare(bVal)
      : aVal < bVal ? -1 : aVal > bVal ? 1 : 0;

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
              {columns.map(column => (
                <SortHeader key={column.field} field={column.field} label={column.label} />
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Instrumentation: log visible won opps before render */}
            {(() => { const won = sorted.filter(o => o.isWon); if (won.length) console.log('[OpportunitiesTable] Rendering won:', won.map(o => ({ id: o.id, name: o.name }))); return null; })()}
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
                  {formatDate(opp.closeDate)}
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                  maxWidth: '280px',
                }}>
                  <div
                    title={opp.nextStep || ''}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {opp.nextStep || '—'}
                  </div>
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                }}>
                  {formatDate(opp.nextStepDueDate)}
                </td>
                <td style={{
                  padding: '12px',
                  color: 'var(--text)',
                  whiteSpace: 'nowrap',
                }}>
                  {formatDateTime(opp.modifiedOn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getSortValue(opportunity: Opportunity, field: SortField, sortType: SortType): number | string | null {
  const value = opportunity[field];

  if (sortType === 'number') {
    return typeof value === 'number' ? value : Number(value ?? 0);
  }

  if (sortType === 'date') {
    if (!value) {
      return null;
    }
    const timestamp = Date.parse(String(value));
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  const text = String(value ?? '').trim();
  return text ? text.toLocaleLowerCase() : null;
}

function formatDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const [, year, month, day] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(value?: string): string {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
