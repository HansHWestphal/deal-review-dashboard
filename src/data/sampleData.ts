import type { DashboardData, Opportunity } from '../types';

import { obfuscateDatasetForDemo } from '../utils/obfuscateDatasetForDemo';
import { obfuscateAmountForDemo } from '../utils/obfuscateAmountForDemo';

export function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) {
      console.log('[isDemoMode] TRUE: hostname includes vercel.app');
      return true;
    }
    if (window.location.hostname.includes('public-demo')) {
      console.log('[isDemoMode] TRUE: hostname includes public-demo');
      return true;
    }
    if (window.location.hostname === 'demo.local') {
      console.log('[isDemoMode] TRUE: hostname is demo.local');
      return true;
    }
    if (import.meta.env && import.meta.env.VITE_PUBLIC_DEMO === 'true') {
      console.log('[isDemoMode] TRUE: VITE_PUBLIC_DEMO env var is true');
      return true;
    }
  }
  console.log('[isDemoMode] FALSE: none of the demo conditions matched');
  return false;
}
const rawOpportunities: Opportunity[] = [
  {
    id: 'OPP-001',
    name: 'Enterprise Cloud Migration',
    accountName: 'Acme Corp',
    estimatedRevenue: 250000,
    actualRevenue: 0,
    probability: 85,
    stage: 'Proposal',
    closeDate: '2026-04-15',
    createdOn: '2026-02-15',
    modifiedOn: '2026-03-20T14:30:00.000Z',
    ageInDays: 8,
    isWon: false,
    product: 'Cloud Services',
    nextStep: 'Confirm solution scope with infrastructure lead',
    nextStepDueDate: '2026-03-27',
  },
  {
    id: 'OPP-002',
    name: 'Digital Transformation Initiative',
    accountName: 'TechFlow Inc',
    estimatedRevenue: 180000,
    actualRevenue: 0,
    probability: 60,
    stage: 'Develop',
    closeDate: '2026-05-30',
    createdOn: '2026-02-01',
    modifiedOn: '2026-03-15T16:00:00.000Z',
    ageInDays: 13,
    isWon: false,
    product: 'Consulting',
    nextStep: 'Schedule architecture workshop with client team',
    nextStepDueDate: '2026-03-25',
  },
  {
    id: 'OPP-003',
    name: 'Data Analytics Platform',
    accountName: 'Global Industries',
    estimatedRevenue: 150000,
    actualRevenue: 150000,
    probability: 100,
    stage: 'Won',
    closeDate: '2026-03-15',
    createdOn: '2026-01-15',
    modifiedOn: '2026-03-15',
    ageInDays: 13,
    isWon: true,
    product: 'Analytics',
  },
  {
    id: 'OPP-004',
    name: 'AI Solution Implementation',
    accountName: 'Innovation Labs',
    estimatedRevenue: 220000,
    actualRevenue: 0,
    probability: 90,
    stage: 'Proposal',
    closeDate: '2026-03-30',
    createdOn: '2026-02-10',
    modifiedOn: '2026-03-22T18:15:00.000Z',
    ageInDays: 6,
    isWon: false,
    product: 'AI/ML',
    nextStep: 'Send revised statement of work for approval',
    nextStepDueDate: '2026-03-24',
  },
  {
    id: 'OPP-005',
    name: 'Security Audit & Implementation',
    accountName: 'Finance First',
    estimatedRevenue: 95000,
    actualRevenue: 0,
    probability: 50,
    stage: 'Qualification',
    closeDate: '2026-06-15',
    createdOn: '2025-12-01',
    modifiedOn: '2026-01-20T11:45:00.000Z',
    ageInDays: 67,
    isWon: false,
    product: 'Security',
    nextStep: 'Confirm audit scope and internal sponsor',
    nextStepDueDate: '2026-01-28',
  },
  {
    id: 'OPP-006',
    name: 'Cloud Infrastructure Upgrade',
    accountName: 'Retail Dynamics',
    estimatedRevenue: 320000,
    actualRevenue: 320000,
    probability: 100,
    stage: 'Won',
    closeDate: '2026-02-28',
    createdOn: '2025-12-15',
    modifiedOn: '2026-02-28',
    ageInDays: 28,
    isWon: true,
    product: 'Infrastructure',
  },
  {
    id: 'OPP-007',
    name: 'Integration Services',
    accountName: 'HealthCare Plus',
    estimatedRevenue: 110000,
    actualRevenue: 0,
    probability: 40,
    stage: 'Qualification',
    closeDate: '2026-07-10',
    createdOn: '2025-11-01',
    modifiedOn: '2025-12-15T09:00:00.000Z',
    ageInDays: 104,
    isWon: false,
    product: 'Integration',
    nextStep: 'Identify integration owner and kickoff timing',
    nextStepDueDate: '2025-12-22',
  },
  {
    id: 'OPP-008',
    name: 'Automation Framework',
    accountName: 'Manufacturing Corp',
    estimatedRevenue: 275000,
    actualRevenue: 0,
    probability: 80,
    stage: 'Close',
    closeDate: '2026-04-10',
    createdOn: '2026-01-25',
    modifiedOn: '2026-03-18T13:20:00.000Z',
    ageInDays: 10,
    isWon: false,
    product: 'Automation',
    nextStep: 'Lock commercial terms with procurement',
    nextStepDueDate: '2026-03-21',
  },
  {
    id: 'OPP-009',
    name: 'Compliance Management System',
    accountName: 'Legal Advisors LLC',
    estimatedRevenue: 85000,
    actualRevenue: 85000,
    probability: 100,
    stage: 'Won',
    closeDate: '2026-03-10',
    createdOn: '2026-01-10',
    modifiedOn: '2026-03-10',
    ageInDays: 18,
    isWon: true,
    product: 'Compliance',
  },
  {
    id: 'OPP-010',
    name: 'Customer Portal Development',
    accountName: 'E-Commerce Solutions',
    estimatedRevenue: 165000,
    actualRevenue: 0,
    probability: 65,
    stage: 'Close',
    closeDate: '2026-05-05',
    createdOn: '2026-02-20',
    modifiedOn: '2026-03-19T15:10:00.000Z',
    ageInDays: 9,
    isWon: false,
    product: 'Development',
    nextStep: 'Review implementation timeline with PMO',
    nextStepDueDate: '2026-03-26',
  },
];

/**
 * Demo-safe dataset transform:
 * - Applies text/name/account obfuscation (obfuscateDatasetForDemo)
 * - Applies deterministic amount obfuscation per opp and field (obfuscateAmountForDemo)
 */
const baseOpps: Opportunity[] = isDemoMode()
  ? obfuscateDatasetForDemo(rawOpportunities).map((o) => ({
      ...o,
      estimatedRevenue: obfuscateAmountForDemo(o.estimatedRevenue, `${o.id}:estimatedRevenue`),
      actualRevenue: obfuscateAmountForDemo(o.actualRevenue, `${o.id}:actualRevenue`),
    }))
  : rawOpportunities;

export const sampleData: DashboardData = {
  quotaTarget: isDemoMode()
    ? obfuscateAmountForDemo(1000000, 'quotaTarget')
    : 1000000,
  weeklyActivities: (() => {
    const now = new Date(isDemoMode() ? '2026-03-29T00:00:00.000Z' : Date.now());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return baseOpps.filter((o) => new Date(o.modifiedOn) >= sevenDaysAgo).length;
  })(),
  lastUpdated: isDemoMode() ? '2026-03-29T00:00:00.000Z' : new Date().toISOString(),
  opportunities: baseOpps,
};
