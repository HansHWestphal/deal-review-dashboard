D365 Personal Analytics (v2)
A local‑first personal analytics dashboard for D365 sellers, focused on quota attainment, pipeline health, and deal quality — built to support real manager conversations, not just reporting.

🎯 Why this exists
I didn’t have an easy way to answer basic but critical questions from my own D365 data:

How am I actually tracking vs FY quota?
Which deals matter most right now?
Where are my biggest risks — and what should I do next?

Rather than wait for centralized reporting or build directly inside D365, I built a lightweight, local‑first tool that lets me reason over my own exported data with clarity and intent.

🧠 What this is (and isn’t)
This is:

A personal analytics dashboard
A deal‑review and coaching aid
A reproducible pattern for local analytics
A safe, sanitized demo others can explore

This is not:

A replacement for official CRM reporting
A multi‑user or hosted system
A production SaaS product


🧩 Key Features

Quota vs Attainment dashboard
Opportunity detail pages with:

Deal Brief (executive summary)
Deal health signals
Rule‑based next‑best actions


Local‑first execution

No backend
No auth
No data leaves your machine


Public demo deployment

Sanitized dataset
Hosted on Vercel via GitHub CI/CD




📁 Data Model & Pipeline (Current State)
✅ What works today

App runs locally via npm run dev
Production demo auto‑deploys via GitHub → Vercel
Strict production builds (npm run build) enforced

⚠️ Important clarification
The current runtime data source for the app is a legacy Excel file:
public/data/current.xlsx

A structured D365 → transform → prod pipeline exists on disk, but is not yet wired into the UI. This is intentional and documented — data correctness is being validated deliberately, not assumed.

🏗️ Architecture Overview
D365 Export (Excel)
        ↓
 Local-first App (React + Vite)
        ↓
 Dashboard & Deal Review UI

Public demo:
GitHub → Vercel (auto-deploy on main)


🚀 Running Locally
Shellnpm installnpm run devShow more lines
To validate production readiness:
Shellnpm run buildShow more lines

✅ Project Status

UI: Stable (v2)
CI/CD: Fully operational
Data pipeline: Implemented, pending runtime wiring
Next milestone: End‑to‑end data correctness validation

See Project-Snapshot-d365-personal-analytics-v2.docx for detailed decision history and open threads.

📌 Why this repo is public
This project is intentionally public to:

Share a practical, reproducible pattern
Show how I reason about data, trade‑offs, and tooling
Support a longer‑form write‑up on the thinking behind it


✍️ Related Writing
A Substack post is in progress covering:

My experience with Copilot and Github Copilot CLI

