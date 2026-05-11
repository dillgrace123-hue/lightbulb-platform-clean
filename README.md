# The Lightbulb Platform (static prototype)

This repository is a **static HTML/CSS prototype** of The Lightbulb Platform. There is no build step, no server-side code, and no real authentication or database—pages are linked together so you can click through flows and review layout and copy in a browser.

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


## Prototype limitations

- **Role access** is simulated (not enforced like production RBAC).
- Some **internal hub links** use `?skipcheck` to bypass prototype-only access checks so pages open without a stored demo user.
- This is **not** real authentication or security.
- **Later:** proper user roles and access control should be implemented with **Supabase Auth** (or equivalent), not static HTML checks.

## What is not live yet

- **Real sign-in** and **user accounts** (navigation is simulated with static links).
- **Backend APIs**, **saved data**, and **form submissions** that persist anywhere.
- **Production integrations** (anything that looks like a dashboard or list is sample UI unless wired to a real service in a future version).

## Next development phases (high level)

1. **Product and UX lock-in** — finalize flows, content, and responsive behavior from this prototype.
2. **Application shell** — real routing, auth, and role-based access instead of static HTML hand-offs.
3. **Services and data** — APIs, database, and integrations behind the UI.
4. **Hardening** — tests, accessibility, performance, security review, and staged rollout.

Questions or changes to this doc belong in `README.md` only; the HTML files stay as the visual prototype.