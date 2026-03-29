import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import type { Opportunity } from '../types';

interface OpportunityDetailsProps {
  opportunities: Opportunity[];
}

const badgeStyle = (bg: string, color: string = '#fff') => ({
  display: 'inline-block',
  backgroundColor: bg,
  color,
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 600,
  marginRight: 8,
});

const cardStyle: React.CSSProperties = {
  background: 'var(--card-bg)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  boxShadow: 'var(--shadow)',
  padding: 24,
  margin: '0 auto',
  maxWidth: 600,
  color: 'var(--text)',
};

const labelStyle: React.CSSProperties = {
  color: '#003087',
  fontWeight: 600,
  fontSize: 13,
  marginBottom: 2,
};

const valueStyle: React.CSSProperties = {
  fontWeight: 500,
  fontSize: 15,
  marginBottom: 12,
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
};

const OpportunityDetails: React.FC<OpportunityDetailsProps> = ({ opportunities }) => {
  const { id } = useParams<{ id: string }>();
  const opp = opportunities.find(o => o.id === id);

  // --- Deal Health Signals ---
  function parseDateSafe(dateStr?: string) {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  }
  const today = new Date();
  const signals: { label: string; color: string; explanation: string }[] = [];

  if (opp) {
    // Stale Deal
    const modified = parseDateSafe(opp.modifiedOn);
    if (modified && (today.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24) > 14) {
      signals.push({
        label: 'Stale Deal',
        color: '#b91c1c',
        explanation: 'This deal has not been updated in over 2 weeks. Consider following up.'
      });
    }
    // Next Step Overdue
    // @ts-ignore: nextStepDueDate may not exist on type
    const nextStepDue = parseDateSafe((opp as any).nextStepDueDate);
    if (nextStepDue && nextStepDue < today) {
      signals.push({
        label: 'Next Step Overdue',
        color: '#eab308',
        explanation: 'The next step due date has passed. Action is required to keep momentum.'
      });
    }
    // Close Date Risk
    const closeDate = parseDateSafe(opp.closeDate);
    if (closeDate && (closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) < 21 && opp.probability < 50) {
      signals.push({
        label: 'Close Date Risk',
        color: '#f59e42',
        explanation: 'Close date is soon but probability is low. Review deal status and forecast.'
      });
    }
    // Late Stage / Low Confidence
    if ((opp.stage === 'Proposal' || opp.stage === 'Close') && opp.probability < 40) {
      signals.push({
        label: 'Late Stage / Low Confidence',
        color: '#003087',
        explanation: 'Deal is in a late stage but confidence is low. Escalate or review with team.'
      });
    }
    // No Next Step
    // @ts-ignore: nextStep may not exist on type
    const nextStep = ((opp as any).nextStep || '').trim();
    if (!nextStep || nextStep.toLowerCase() === 'n/a') {
      signals.push({
        label: 'No Next Step',
        color: '#64748b',
        explanation: 'No next step is defined. Add a clear next action to drive progress.'
      });
    }
    // No Primary Contact
    // @ts-ignore: contact may not exist on type
    const contact = ((opp as any).contact || '').trim();
    if (!contact || contact.toLowerCase() === 'n/a') {
      signals.push({
        label: 'No Primary Contact',
        color: '#64748b',
        explanation: 'No primary contact is set. Assign a contact to ensure communication.'
      });
    }
  }

  if (!opp) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', marginTop: 48 }}>
        <Link to="/" style={{ color: '#003087', textDecoration: 'underline', fontWeight: 600, display: 'block', marginBottom: 16 }}>
          ← Back to Dashboard
        </Link>
        <div style={{ color: '#b91c1c', fontWeight: 700, fontSize: 18 }}>Opportunity not found</div>
      </div>
    );
  }

  const weightedValue = opp.estimatedRevenue * (opp.probability / 100);

  // --- Deal Brief (Executive Summary) ---
  // NBA headline logic (reuse from NBA section)
  let nbaHeadline = '';
  const stage = opp.stage;
  const nextStep = (opp.nextStep || '').trim();
  const contact = (opp.contact || '').trim();
  const timeline = (opp.timeline || '').trim();
  const forecastCategory = (opp.forecastCategory || '').trim();
  const rating = (opp.rating || '').trim();
  const nextStepDueDate = opp.nextStepDueDate;
  const probability = opp.probability;
  const closeDate = opp.closeDate;
  const actualRevenue = opp.actualRevenue;
  const lateStage = stage === 'Proposal' || stage === 'Close';
  const probStageMismatch = lateStage && probability < 40;
  if (stage === 'Qualification' && !nextStep) {
    nbaHeadline = 'Schedule a discovery follow-up and define success criteria.';
  } else if (stage === 'Qualification' && !contact) {
    nbaHeadline = 'Identify the primary stakeholder or champion.';
  } else if (stage === 'Develop' && probability < 40) {
    nbaHeadline = 'Validate problem impact and buying criteria; confirm decision timeline.';
  } else if (stage === 'Develop' && !timeline) {
    nbaHeadline = 'Confirm decision timeline and key milestones.';
  } else if (stage === 'Proposal' && forecastCategory !== 'Commit') {
    nbaHeadline = 'Confirm decision process and stakeholders; lock mutual action plan.';
  } else if (stage === 'Proposal' && !nextStepDueDate) {
    nbaHeadline = 'Assign a dated customer action.';
  } else if (stage === 'Close' && actualRevenue === 0) {
    nbaHeadline = 'Confirm procurement steps and signature plan; align close date realism.';
  } else if (stage === 'Close' && closeDate && (() => { const d = new Date(closeDate); return !isNaN(d.getTime()) && (d.getTime() - Date.now()) / (1000*60*60*24) < 14; })()) {
    nbaHeadline = 'Create a close plan and confirm all approvals and blockers.';
  } else if (!nbaHeadline && probStageMismatch) {
    nbaHeadline = 'Re-baseline the close plan and address low confidence in late stage.';
  } else if (!nbaHeadline) {
    nbaHeadline = 'Advance the opportunity to the next logical stage.';
  }

  return (
    <div style={{ ...cardStyle, marginTop: 48 }}>
      {/* Deal Brief */}
      <div style={{ ...sectionStyle, background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderRadius: 8, padding: 20, marginBottom: 32 }}>
        <div style={{ color: '#003087', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Deal Brief</div>
        <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
          <b>Account / Opportunity:</b> {opp.accountName} — {opp.name} ({opp.product}), <b>Est. Revenue:</b> ${opp.estimatedRevenue.toLocaleString()}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
          <b>Customer Problem / Why:</b> {opp.description?.trim() ? opp.description : (timeline ? timeline : 'Not documented')}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
          <b>Current Status / Where:</b> {opp.stage}, {opp.probability}% probability, Forecast: {opp.forecastCategory || 'N/A'}, Rating: {opp.rating || 'N/A'}, Close: {opp.closeDate}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>
          <b>Key Risk / Blocker:</b> {signals.length > 0 ? signals[0].label + ': ' + signals[0].explanation : 'No major risks flagged'}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text)' }}>
          <b>Immediate Focus / What’s Next:</b> {nextStep ? `${nextStep}${nextStepDueDate ? ' (Due: ' + nextStepDueDate + ')' : ''}` : nbaHeadline}
        </div>
      </div>
      {/* Deal Health */}
      <div style={{ ...sectionStyle, marginBottom: 32 }}>
        <div style={{ color: '#003087', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Deal Health</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {signals.length === 0 ? (
            <span style={{ ...badgeStyle('#9DC241', '#1F2937'), fontWeight: 600 }}>
              Healthy / No major flags detected
            </span>
          ) : (
            signals.map(sig => (
              <div key={sig.label} style={{
                background: 'var(--card-bg)',
                border: `1px solid ${sig.color}`,
                borderRadius: 8,
                boxShadow: 'var(--shadow)',
                color: sig.color,
                padding: '10px 16px',
                marginBottom: 8,
                minWidth: 180,
                fontSize: 13,
                fontWeight: 500,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}>
                <span style={{ fontWeight: 700 }}>{sig.label}</span>
                <span style={{ color: 'var(--text)', fontWeight: 400, fontSize: 12 }}>{sig.explanation}</span>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Manager Coaching: Next Best Action */}
      <div style={{ ...sectionStyle, background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderRadius: 8, padding: 20, marginBottom: 32 }}>
        <div style={{ color: '#003087', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Manager Coaching: Next Best Action</div>
        {(() => {
          // NBA logic
          const checklist: string[] = [];
          let nba = '';
          let why = '';
          let suggestedStage = '';
          const stage = opp.stage;
          // @ts-ignore
          const nextStep = (opp.nextStep || '').trim();
          // @ts-ignore
          const contact = (opp.contact || '').trim();
          // @ts-ignore
          const timeline = (opp.timeline || '').trim();
          // @ts-ignore
          const forecastCategory = (opp.forecastCategory || '').trim();
          // @ts-ignore
          // @ts-ignore
          const nextStepDueDate = opp.nextStepDueDate;
          const probability = opp.probability;
          const closeDate = opp.closeDate;
          const actualRevenue = opp.actualRevenue;

          // Helper: probability-stage mismatch
          const lateStage = stage === 'Proposal' || stage === 'Close';
          const probStageMismatch = lateStage && probability < 40;

          if (stage === 'Qualification') {
            if (!nextStep) {
              nba = 'Schedule a discovery follow-up and define success criteria.';
              why = 'Clear next steps and criteria ensure the deal progresses beyond initial interest.';
              suggestedStage = 'Develop';
              checklist.push('Book discovery call with customer', 'Document success criteria', 'Align on next steps');
            } else if (!contact) {
              nba = 'Identify the primary stakeholder or champion.';
              why = 'Engaging the right contact increases deal momentum and qualification accuracy.';
              suggestedStage = 'Develop';
              checklist.push('Research and assign primary contact', 'Validate stakeholder influence', 'Update CRM contact info');
            }
          } else if (stage === 'Develop') {
            if (probability < 40) {
              nba = 'Validate problem impact and buying criteria; confirm decision timeline.';
              why = 'Low probability signals gaps in value or process clarity.';
              suggestedStage = 'Proposal';
              checklist.push('Review customer pain points', 'Confirm buying criteria', 'Clarify decision timeline');
            } else if (!timeline) {
              nba = 'Confirm decision timeline and key milestones.';
              why = 'A clear timeline helps forecast accuracy and resource planning.';
              suggestedStage = 'Proposal';
              checklist.push('Discuss timeline with customer', 'Identify key milestones', 'Update opportunity timeline');
            }
          } else if (stage === 'Proposal') {
            if (forecastCategory !== 'Commit') {
              nba = 'Confirm decision process and stakeholders; lock mutual action plan.';
              why = 'Commit forecast requires clear process and stakeholder alignment.';
              suggestedStage = 'Close';
              checklist.push('Review decision process', 'Identify all stakeholders', 'Finalize mutual action plan');
            } else if (!nextStepDueDate) {
              nba = 'Assign a dated customer action.';
              why = 'Dated actions drive accountability and keep the deal moving.';
              suggestedStage = 'Close';
              checklist.push('Define next customer action', 'Set due date', 'Communicate expectations');
            }
          } else if (stage === 'Close') {
            if (actualRevenue === 0) {
              nba = 'Confirm procurement steps and signature plan; align close date realism.';
              why = 'Unrealized revenue at close stage signals risk of slippage.';
              suggestedStage = 'Closed Won';
              checklist.push('Review procurement process', 'Confirm signature plan', 'Validate close date');
            } else if (closeDate && (() => { const d = new Date(closeDate); return !isNaN(d.getTime()) && (d.getTime() - Date.now()) / (1000*60*60*24) < 14; })()) {
              nba = 'Create a close plan and confirm all approvals and blockers.';
              why = 'Deals closing soon need a clear plan to avoid last-minute delays.';
              suggestedStage = 'Closed Won';
              checklist.push('Draft close plan', 'List required approvals', 'Identify and resolve blockers');
            }
          }

          // Manager-style adjustments
          if (!nba && probStageMismatch) {
            nba = 'Re-baseline the close plan and address low confidence in late stage.';
            why = 'Low probability in late stage signals misalignment or risk of slippage.';
            suggestedStage = stage;
            checklist.push('Review deal status with team', 'Update close plan', 'Communicate risks to management');
          }
          if (!nba) {
            nba = 'Advance the opportunity to the next logical stage.';
            why = 'Progression is key to maintaining pipeline health.';
            suggestedStage = stage;
            checklist.push('Review current status', 'Define next step', 'Engage customer for feedback');
          }
          if (!rating || rating.toLowerCase() === 'low' || rating.toLowerCase() === 'n/a') {
            checklist.push('Re-qualify deal health');
          }

          return (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}><span style={{ color: '#003087' }}>Next Best Action:</span> {nba}</div>
              <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}><span style={{ color: '#003087', fontWeight: 600 }}>Why this matters:</span> {why}</div>
              <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ color: '#003087', fontWeight: 600 }}>Suggested next stage:</span> {suggestedStage}</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', fontSize: 13 }}>
                {checklist.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          );
        })()}
      </div>
      {/* Copilot: Risk Analysis + Close Strategy */}
      <div style={{ ...sectionStyle, background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderRadius: 8, padding: 20, marginBottom: 32 }}>
        <div style={{ color: '#003087', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Copilot: Risk Analysis + Close Strategy (Manager View)</div>
        <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>
          Copy this prompt into M365 Copilot to get a manager-style risk review and close plan.
        </div>
        <CopilotPrompt opp={opp} signals={signals} />
      </div>
      {/* Header */}
      <div style={sectionStyle}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#003087', marginBottom: 8 }}>{opp.name}</div>
        <div style={{ marginBottom: 8 }}>
          <span style={labelStyle}>Account:</span> <span style={valueStyle}>{opp.accountName}</span>
        </div>
        <div>
          <span style={badgeStyle('#003087')}>{opp.stage}</span>
          <span style={badgeStyle('#9DC241', '#1F2937')}>{opp.probability}% Probability</span>
          {opp.isWon && <span style={badgeStyle('#2563eb')}>WON</span>}
        </div>
      </div>

      {/* Money */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Estimated Revenue</div>
        <div style={valueStyle}>${opp.estimatedRevenue.toLocaleString()}</div>
        <div style={labelStyle}>Actual Revenue</div>
        <div style={valueStyle}>${opp.actualRevenue.toLocaleString()}</div>
        <div style={labelStyle}>Weighted Value</div>
        <div style={valueStyle}>${weightedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      </div>

      {/* Timeline */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Close Date</div>
        <div style={valueStyle}>{opp.closeDate}</div>
        <div style={labelStyle}>Created On</div>
        <div style={valueStyle}>{opp.createdOn}</div>
        <div style={labelStyle}>Modified On</div>
        <div style={valueStyle}>{opp.modifiedOn}</div>
        <div style={labelStyle}>Age (days)</div>
        <div style={valueStyle}>{opp.ageInDays}</div>
      </div>

      {/* Context */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Product</div>
        <div style={valueStyle}>{opp.product}</div>
      </div>

      <Link to="/" style={{ color: '#003087', textDecoration: 'underline', fontWeight: 600 }}>
        ← Back to Dashboard
      </Link>
    </div>
  );
};

// --- Copilot Prompt Generator ---

const CopilotPrompt: React.FC<{ opp: Opportunity; signals: { label: string }[] }> = ({ opp, signals }) => {
  const [copied, setCopied] = useState(false);
  if (!opp) return null;
  const safe = (v: any) => (v && v !== '' ? v : 'N/A');
  const weightedValue = opp.estimatedRevenue * (opp.probability / 100);
  const dealHealthSummary = signals.length > 0 ? signals.map(s => s.label).join(', ') : 'No major flags';
  const prompt = `Only use the data provided below. If something is missing, state what is missing and proceed with best-practice assumptions clearly labeled.\nKeep it practical and concise; no generic sales theory.\n\n---\n
Opportunity Name: ${safe(opp.name)}
Account: ${safe(opp.accountName)}
Product: ${safe(opp.product)}
Sales Stage: ${safe(opp.stage)}
Probability: ${safe(opp.probability)}
Forecast Category: ${safe(opp.forecastCategory)}
Rating: ${safe(opp.rating)}
Estimated Revenue (TCV): $${safe(opp.estimatedRevenue)}
Actual Revenue: $${safe(opp.actualRevenue)}
Weighted Value: $${weightedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
Close Date: ${safe(opp.closeDate)}
Timeline: ${safe(opp.timeline)}
Next Step: ${safe(opp.nextStep)}
Next Step Due Date: ${safe(opp.nextStepDueDate)}
Contact: ${safe(opp.contact)}
Created On: ${safe(opp.createdOn)}
Modified On: ${safe(opp.modifiedOn)}
Age in days: ${safe(opp.ageInDays)}
Description: ${safe(opp.description)}
Deal Health Summary: ${dealHealthSummary}

---

Please respond in this structure:

- Executive summary (2–3 bullets): is the close date realistic, and is the stage credible?
- Top risks (ranked 1–5) with “why it matters” and “how to mitigate”
- Missing info / key questions (5 questions I should answer)
- Close strategy / mutual action plan: milestones + recommended dates (next 30 days)
- Forecast call recommendation (Commit / Best Case / Pipeline / Omitted) + rationale
- Next 72 hours plan: 3 concrete actions I should take
`;
  return (
    <div>
      <textarea
        readOnly
        value={prompt}
        style={{ width: '100%', minHeight: 220, fontSize: 13, fontFamily: 'monospace', color: 'var(--text)', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8, padding: 10, resize: 'vertical' }}
      />
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(prompt);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        style={{ background: '#003087', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
      >
        {copied ? 'Copied!' : 'Copy Prompt'}
      </button>
    </div>
  );
};

export default OpportunityDetails;
