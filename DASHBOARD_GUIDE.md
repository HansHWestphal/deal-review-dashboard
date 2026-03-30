# D365 Personal Command Center — V2 User Guide

**Status:** Actively Maintained (V2, 2026)

---

## Quick Start

- **Recommended:**  
  1. Install dependencies:  
     ```bash
     npm install
     ```
  2. Start the local dev server:  
     ```bash
     npm run dev
     ```
     Open the URL shown in your terminal (typically [http://localhost:5173](http://localhost:5173)).

- **Vercel Demo:**  
  If deployed, open the Vercel URL provided by your team.

- **Production Build (Optional):**  
  Build and preview the static site:
  ```bash
  npm run build
  npm run preview
  ```
  Or serve the `dist/` folder with your preferred static server.

- **CI/CD:**  
  GitHub → Vercel auto-deploys on push to `main`. Output is in `dist/`.

---

## What You Can Do

- **Dashboard Page:**
  - View live KPIs: Quota Attainment %, Pipeline Coverage Ratio, Win Rate %
  - Visualize pipeline with charts: Funnel, Top Opportunities, Weighted Forecast
  - Explore sortable opportunities table, aging deals list, and activity summary

- **Opportunity Details Page:**
  - **Deal Brief:** Executive summary for each opportunity
  - **Deal Health:** Rule-based health signals and risk flags
  - **Manager Coaching: Next Best Action:** Stage-aware recommendations and checklist
  - **Copilot Prompt Generator:** Copy a structured “Risk Analysis + Close Strategy” prompt for Microsoft 365 Copilot

  Access details by clicking any opportunity name in the dashboard table.

---

## Loading Data

- **Default:**  
  Loads with pre-populated sample data on first run.

- **Import Your Data:**  
  1. Export D365 opportunities to Excel with required columns.
  2. Save as: `public/data/d365_opps_export.xlsx`
  3. Click the **Refresh** button in the dashboard banner to load your data.

- **Note:**  
  A new local data pipeline (inbox → test → prod JSON) exists, but the UI currently loads only from the Excel file above. The canonical JSON pipeline is not yet wired into the app.

---

## Offline & Privacy

- 100% local-first: all data is processed in your browser.
- No backend, no APIs, no data leaves your device.
- Works fully offline after initial load.

---

## Development Commands

- `npm run dev` — Start local dev server (hot reload)
- `npm run build` — Build for production
- `npm run preview` — Preview production build locally
- `npm run lint` — Run linter
- `npm run transform:latest` — Run local data pipeline transform (optional)
- `npm run promote` — Promote test data to prod (optional)

---

## Customization

- **Quota Target:**  
  Edit `src/data/sampleData.ts` (`quotaTarget` field).

- **Theme Colors:**  
  Edit CSS variables in `src/index.css` (e.g., `--card-bg`, `--accent`).

- **Sample Data:**  
  Add or modify opportunities in `src/data/sampleData.ts`.

---

## Known Limitations / Open Threads

- “Green deploy” does **not** guarantee data correctness:  
  The app still loads from the legacy Excel file, not the canonical JSON pipeline.
- The canonical JSON pipeline (`data/prod/opportunities.clean.json`) is not yet active at runtime.

---

## Next Steps

- Wire the UI to load from the canonical JSON pipeline.
- Validate end-to-end data correctness and update documentation as needed.
