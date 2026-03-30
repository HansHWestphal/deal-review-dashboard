# D365 Personal Command Center — Implementation Summary (V2)

## Status: Actively Maintained (V2, 2026)

---

## What it does
A local-first, offline React/TypeScript dashboard for D365 sales analytics. It provides quota attainment, pipeline health, and actionable deal insights, with executive-friendly UI, robust data handling, and a reproducible, pipeline-driven workflow. All data is processed client-side; no backend or APIs.

---

## Current Architecture
- **Framework:** React 19, Vite 8, TypeScript
- **Styling:** Tailwind CSS v4, custom dark theme, CSS vars
- **Charts:** Chart.js, react-chartjs-2
- **Icons:** Lucide React
- **Excel Parsing:** XLSX
- **State:** React hooks (useState, useEffect)
- **Data Pipeline:** Scripts for local transform/promotion (Node.js, see scripts/)

---

## Current UI Overview
- **Dashboard Page:**
  - Top banner with D365 export instructions and refresh
  - KPI cards: Quota Attainment %, Pipeline Coverage Ratio, Win Rate %
  - Charts: Pipeline Funnel, Top Opportunities, Weighted Forecast
  - Tables: Sortable Opportunities Table, Aging Deals List, Activity Summary
- **Opportunity Details Page:**
  - Deal Brief (executive summary)
  - Deal Health (rule-based signals)
  - Manager Coaching: Next Best Action (NBA)
  - Copilot Prompt Generator (Risk Analysis + Close Strategy)
  - Full details: money, timeline, context, product, contact, etc.
  - Consistent card/badge styling, Alithya blue, CSS vars

---

## Data Flow
- **Runtime:** Loads from `public/data/d365_opps_export.xlsx` (default)
- **Sample Data:** Fallback to `src/data/sampleData.ts` if Excel not found
- **Pipeline:**
  - New local pipeline: `data/inbox/OppViewExtract_v1_*.xlsx` → `data/test/opportunities.clean.json` (via `scripts/transform-latest.mjs`)
  - Promotion: `data/test/opportunities.clean.json` → `data/prod/opportunities.clean.json` (via `scripts/promote.mjs`)
  - **Note:** The app UI is not yet wired to use the new JSON pipeline; it still reads the legacy Excel file at runtime.

---

## CI/CD and Deployment
- **Build:** `npm run build` (Vite, TypeScript)
- **Dev:** `npm run dev` (hot reload)
- **Lint:** `npm run lint`
- **Preview:** `npm run preview`
- **Data Pipeline:** `npm run transform:latest`, `npm run promote`
- **Deploy:** GitHub → Vercel auto-deploy on push to main; output in `dist/`

---

## How to Run
1. `npm install`
2. `npm run dev` (for local dev)
3. `npm run build` (for production)
4. Serve `dist/` (e.g., `python -m http.server 3000`)
5. Place your Excel file at `public/data/d365_opps_export.xlsx` and click Refresh in the app

---

## File Structure (V2)
```
project/
├── src/
│   ├── components/         # React components (KPI, charts, tables, summary, banner)
│   ├── data/               # Sample data
│   ├── pages/              # OpportunityDetails page
│   ├── utils/              # Excel loader
│   ├── types.ts            # TypeScript interfaces
│   └── App.tsx             # Main app (routing, dashboard)
├── public/data/            # Excel file for runtime import
├── data/                   # Canonical pipeline (inbox, test, prod)
├── scripts/                # Node transform/promotion scripts
├── dist/                   # Production build output
├── package.json            # Scripts, dependencies
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
├── DASHBOARD_GUIDE.md
└── IMPLEMENTATION_SUMMARY.md
```

---

## Known Constraints / Open Threads
- **Green deploy ≠ data correctness:** The runtime app still loads from the legacy Excel file, not the canonical JSON pipeline.
- **Canonical pipeline exists:** `data/inbox` → `data/test` → `data/prod`, but not yet wired to UI.
- **No backend/API:** All logic is client-side; no server or cloud dependencies.
- **TypeScript enforced:** All new fields are optional and type-safe.

---

## Next Release Tasks
- [ ] Wire the app to load from `data/prod/opportunities.clean.json` (canonical pipeline)
- [ ] End-to-end data correctness validation
- [ ] Expand test coverage for pipeline scripts
- [ ] Continue UI/UX refinements and documentation updates

---

