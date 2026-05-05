# Grafana HLC Datasource

Private Grafana datasource plugin for HLC backend Grafana endpoints.
This plugin uses a Grafana backend executable (Go) for all outbound API calls.

## Backend contract

The plugin expects these HLC API endpoints behind the configured base URL:

- `POST /backend/api/grafana/health`
- `POST /backend/api/grafana/search`
- `POST /backend/api/grafana/query`
- `POST /backend/api/grafana/variables/{variable}`

`{variable}` supports: `targets`, `captures`, `metrics`.

Backend must have Grafana API enabled:

- `app.backend.api.grafana.enabled=true`

## Local development

1. Install dependencies:
   - `npm install`
2. Build plugin assets:
   - `npm run build`
   - If local `go` is unavailable, build automatically falls back to Docker (`golang:1.24` image).
3. Run Grafana with local plugin mount:
   - `npm run dev`
4. In Grafana, add datasource `HLC Datasource` and configure:
  - `HLC API URL` (for example `https://hlc.internal`)
   - `API Token` (stored as secure JSON)

## Integration validation checklist

- Datasource `Save & Test` calls `POST /backend/api/grafana/health`
- Query editor dropdowns call:
  - `POST /backend/api/grafana/variables/targets`
  - `POST /backend/api/grafana/variables/captures`
  - `POST /backend/api/grafana/variables/metrics`
- Panel query calls `POST /backend/api/grafana/query`
- Token is transmitted only from Grafana backend plugin to HLC API

## Private packaging

- Build zip artifact: `npm run package`
- Sign private plugin (requires environment):
  - `export GRAFANA_ACCESS_POLICY_TOKEN=<grafana_com_token>`
  - `export GRAFANA_ROOT_URL=https://grafana.customer.example`
  - `npm run sign:private`

Signed artifact can be installed into:

- `/var/lib/grafana/plugins/enteros-hlc-datasource`

Then restart Grafana server.

## Backend build options

- Local Go build only: `npm run build:backend:local`
- Dockerized Go build only: `npm run build:backend:docker`
- Auto mode (default): `npm run build:backend`

## Release readiness

- Marketplace checklist: `docs/MARKETPLACE_RELEASE_CHECKLIST.md`
- CI workflow: `.github/workflows/plugin-ci.yml`
