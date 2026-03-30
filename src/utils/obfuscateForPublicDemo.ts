// src/utils/obfuscateForPublicDemo.ts
import type { Opportunity } from '../types';

function isDemoMode(): boolean {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('vercel.app')) return true;
    if (window.location.hostname.includes('public-demo')) return true;
    if (window.location.hostname === 'demo.local') return true;
    if (import.meta.env && import.meta.env.VITE_PUBLIC_DEMO === 'true') return true;
  }
  return false;
}

function scrubText(text?: string): string {
  if (!text) return '';
  let t = text;
  // Remove emails
  t = t.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[redacted-email]');
  // Remove GUIDs
  t = t.replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '[redacted-guid]');
  // Remove URLs
  t = t.replace(/https?:\/\/\S+/g, '[redacted-url]');
  // Remove long numeric IDs
  t = t.replace(/\b\d{8,}\b/g, '[redacted-id]');
  return t;
}

export function obfuscateForPublicDemo(opp: Opportunity): Opportunity {
  // Obfuscate for demo mode or for OPP-26
  const shouldObfuscate = isDemoMode() || opp.id === 'OPP-26';
  if (!shouldObfuscate) return opp;
  return {
    ...opp,
    name: 'Sample Opportunity',
    accountName: 'Sample Customer',
    contact: 'Sample Contact',
    description: 'Sanitized for public demo. Replace with your own deal context.',
    nextStep: 'Sanitized for public demo.',
    nextStepDueDate: opp.nextStepDueDate || '',
    product: opp.product ? 'Sample Product' : '',
    forecastCategory: scrubText(opp.forecastCategory),
    rating: scrubText(opp.rating),
    timeline: scrubText(opp.timeline),
    id: opp.id === 'OPP-26' ? 'OPP-26' : scrubText(opp.id),
  };
}
