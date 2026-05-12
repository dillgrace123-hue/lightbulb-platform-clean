# The Lightbulb Platform

This repository is a **static HTML/CSS platform prototype with live integrations**. It began as a clickable prototype, but now includes working Supabase Auth, Supabase-backed editable sections, Airtable-backed dashboard statistics, and Netlify Functions.

There is still no formal frontend framework or build step. The current UI is plain HTML/CSS/JavaScript, with Netlify Functions used where server-side access to live data is needed.

## How to run it locally

1. Clone or download this repository.
2. Open `index.html` in your browser (double-click the file, or use **File → Open**).
3. For the most reliable experience (correct paths and fonts), serve the folder with any static file server, for example:
  - **Python 3:** `python3 -m http.server 8080` then visit `http://localhost:8080`
  - **VS Code / Cursor:** use a “Live Preview” or “Live Server” extension pointed at this folder.

Start at `index.html` for the public entry; use `home_logged_in.html` as the hub that links to each workspace mock.

## Deployment (GitHub + Netlify)

Typical setup:

1. Push this repo to **GitHub** (this folder as the project root).
2. In **Netlify**, choose **Add new site → Import an existing project** and connect the GitHub repository.
3. Build settings: **no build command**; **publish directory** is the repository root (`.`).
4. Netlify will host the HTML files as a static site. Each push to your connected branch can trigger an automatic deploy.

You can also use Netlify **drag-and-drop deploy** of the folder for a one-off preview without GitHub.

## What each file is for


| File                                           | Role                                                            |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `index.html`                                   | Public landing and sign-in style entry into the prototype.      |
| `home_logged_in.html`                          | Logged-in “home” hub with links into each workspace experience. |
| `lightbulb_index.html`                         | Lightbulb workspace screens (prototype).                        |
| `greenlight_index.html`                        | Greenlight workspace screens (prototype).                       |
| `trustee_index.html`                           | Trustee workspace screens (prototype).                          |
| `partner_index.html`                           | Partner workspace screens (prototype).                          |
| `admin_index.html`                             | Admin workspace screens (prototype).                            |
| `lightbulbtrust_main_amination_optimised.jpeg` | Image asset used by the marketing/hero area.                    |


## Current architecture notes

- **Airtable** is currently the source for portfolio records and calculated Lightbulb dashboard metrics, including live grants, active funding, investments, grants ending soon, and average grant size.
- **Supabase** is now used for authentication, role checks, and app-owned editable content. Live Supabase-backed sections currently include `What Needs Attention`, `Timeline`, and `Funding Panel` on the Lightbulb page.
- **Supabase RLS is enabled** for `platform_cards`. Public read access is allowed, while insert/update/delete is restricted to authenticated admin users.
- **Netlify Functions** are used to safely read data from Airtable and Supabase without exposing private server-side credentials in frontend code.
- **Static HTML remains the current UI layer**, but complex editable sections should increasingly be moved into Supabase rather than hardcoded in HTML.
- **Future rebuild:** if the platform continues to grow, the likely next architecture is a proper Next.js app with Supabase Auth, role-based routes, reusable components, and a clearer separation between app state and presentation.

## Prototype limitations

- Some older prototype controls and localStorage-based access logic may still exist in secondary pages.
- Some internal hub links still use `?skipcheck` from the earlier prototype phase.
- The current admin editing experience is functional but still early. Some modals and flows are intentionally simple.
- This is not yet a hardened production app. Authentication, roles, RLS policies, environment variables, and deployment settings should be reviewed before wider use.

## What is live now

- **Supabase sign-in** from `index.html`.
- **Supabase role-aware logged-in homepage** via `home_logged_in.html`.
- **Supabase-backed What Needs Attention cards** on `lightbulb_index.html`, with admin add/edit/remove.
- **Supabase-backed Timeline items** on `lightbulb_index.html`, with admin add/edit/remove.
- **Supabase-backed Funding Panel cards** on `lightbulb_index.html`, with admin add/edit/remove.
- **Airtable-backed Lightbulb dashboard metrics** via Netlify Functions.
- **Platform Content-backed manual dashboard fields** via Airtable.

## What is not live yet

- Full production role-based access across every page.
- Proper user approval workflows.
- Partner submissions and uploads.
- Full Admin Console functionality.
- Production-grade audit logs and deployment hardening.

## Next development phases (high level)

1. **Product and UX lock-in** — finalize flows, content, and responsive behavior from this prototype.
2. **Application shell** — real routing, auth, and role-based access instead of static HTML hand-offs.
3. **Services and data** — APIs, database, and integrations behind the UI.
4. **Hardening** — tests, accessibility, performance, security review, and staged rollout.

Questions or changes to this doc belong in `README.md` only; the HTML files stay as the visual prototype.
## Current build checkpoint

The Lightbulb Portfolio now includes a live Airtable-backed Reporting Hub.

Reports are loaded from the `Reporting` Airtable table through `netlify/functions/reports.js`.

The Reporting Hub defaults to Lightbulb reports, with optional Greenlight and All views. It includes search, report type filtering, latest reports, and a full report library.

Timeline, Funding Panel, and What Needs Attention are Supabase-backed editable sections for admin users.

Partner Interactions remains linked out to Notion from the main dashboard for now.
