# Scaffold Efficiency Program (Folder-Based Web App)

This is a static, file-based prototype of the **Scaffold Efficiency Program**.
It runs directly from the project folder with **no localhost server**, no build process, and no runtime dependencies.

## How to open the app

1. Open the project folder.
2. Double-click `index.html` (or right-click and open in your browser).
3. The app runs in `file://` mode and uses browser `localStorage` for persistence.

## How to run from GitHub (GitHub Pages)

Important: opening `index.html` inside the GitHub repository file viewer does not run the app.
GitHub shows source files there, not an executing web app.

Use GitHub Pages:

1. Open repository **Settings** > **Pages**.
2. Under **Build and deployment**, select **Source: GitHub Actions**.
3. Push to `main` (or re-run the workflow) and wait for workflow `Deploy static app to GitHub Pages` to finish.
4. Open the site URL:
   `https://<your-github-username>.github.io/ScaffoldEffecincy/`

## Folder structure

- `index.html`: App shell and tab layout
- `styles.css`: UI styling for KPI cards, tables, alerts, and forms
- `app.js`: Main app state, event handling, calculations orchestration, and persistence flow
- `data/rates.js`: Default configurable pricing engine rates
- `data/seedData.js`: Realistic demo dataset loaded into localStorage on first run
- `components/templates.js`: Shared formatting/template helpers
- `components/renderers.js`: Screen renderers for each tab
- `utils/dateUtils.js`: Date utilities for standing-day calculations
- `utils/storage.js`: localStorage load/save/reset
- `utils/billingEngine.js`: Core billing logic and charge calculation helpers

## Where billing logic is stored

Primary billing logic is in:

- `utils/billingEngine.js`

It explicitly separates and calculates:

- quantity
- ownership type
- status
- days standing
- applicable rate
- daily charge
- monthly estimate

## How to modify rates

You can modify rates in two ways:

1. In-app: open **Admin / Rate Settings** tab, edit values, click **Save Rates**.
2. In code: edit defaults in `data/rates.js` under `window.AppConfig.defaultRates`.

Current default billing behavior implemented:

- Contractor-owned:
  - On Site or Laydown Yard: `0.0025` cents/unit/day
  - Standing <= 90 days: `0.01` cents/unit/day
  - Standing > 90 days: `0.015` cents/unit/day
- Facility-owner-owned:
  - Active on-site statuses (On Site, Laydown Yard, Standing): flat `0.0025` cents/unit/day
- Dismantled and Removed Off Site default to `0` accrual.

## How demo data works

- Seed data is embedded in `data/seedData.js` (no JSON fetch calls, compatible with locked-down `file://` environments).
- On first load, seed data is copied to localStorage.
- Changes are persisted in localStorage automatically.
- Use **Admin / Rate Settings > Reset Demo Data** to restore original sample records.

Demo data includes:

- Contractor-owned material in laydown
- Contractor-owned standing under 90 days
- Contractor-owned standing over 90 days
- Facility-owner-owned standing material
- Multiple scaffolds across multiple units/areas

## Limitations of folder-based storage

- Data is local to one browser profile on one machine (localStorage).
- No authentication or user-level access control.
- No multi-user synchronization.
- No server-side audit enforcement.
- Browser storage clearing will remove saved data.

## Migration readiness notes

The app structure is intentionally modular so it can be moved later to a full SaaS stack:

- billing engine isolated in utility module
- renderers separated from state logic
- centralized storage adapter (`utils/storage.js`) can be replaced with API/database calls
- entity model already includes scaffold/material/status history and billing history arrays
