// src/utils/obfuscateDatasetForDemo.ts
import type { Opportunity } from '../types';

const TERMS = [
  'Upgrade',
  'Migration',
  'Modernization',
  'Agent Accelerator',
  'Platform Refresh',
  'Cloud Enablement',
  'Security Hardening',
  'Data Optimization',
  'Integration Update',
  'Governance Rollout',
];

function scrubText(text?: string): string {
  if (!text) return '';
  let t = text;
  t = t.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted-email]');
  t = t.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '[redacted-guid]');
  t = t.replace(/https?:\/\/\S+/g, '[redacted-url]');
  t = t.replace(/\b\d{8,}\b/g, '[redacted-id]');
  return t;
}

import { obfuscateAmountForDemo } from './obfuscateAmountForDemo';

export function obfuscateDatasetForDemo(opps: Opportunity[]): Opportunity[] {
  return opps.map((opp, i) => {
    const term = TERMS[i % TERMS.length];
    const wave = (i % 5) + 1;
    return {
      ...opp,
      name: `${term} – Wave ${wave}`,
      accountName: `Sample Customer ${wave}`,
      contact: `Sample Contact ${wave}`,
      description: 'Sanitized for public demo. Replace with your own deal context.',
      nextStep: 'Sanitized for public demo.',
      timeline: scrubText(opp.timeline),
      forecastCategory: scrubText(opp.forecastCategory),
      rating: scrubText(opp.rating),
      id: `OPP-${i+1}`,
      estimatedRevenue: obfuscateAmountForDemo(opp.estimatedRevenue, `${opp.id}-estimatedRevenue`),
      actualRevenue: obfuscateAmountForDemo(opp.actualRevenue, `${opp.id}-actualRevenue`),
    };
  });
}
