# Grafana Marketplace Release Checklist

Use this checklist before every marketplace submission or update.

## 1) Plugin Metadata and Identity

- [ ] `plugin.json` has stable public plugin ID (do not rename after publishing).
- [ ] `plugin.json` uses `backend: true` and correct `executable` prefix.
- [ ] `info.version` is bumped for every release.
- [ ] `info.updated` matches release date.
- [ ] Logos/screenshots are present and production quality.
- [ ] Plugin name/description are clear for catalog users.

## 2) Security and Backend Connection

- [ ] Backend URL is configurable via `jsonData.apiUrl`.
- [ ] Secret token is stored only in `secureJsonData.apiToken`.
- [ ] No token or secret is logged in frontend or backend logs.
- [ ] Backend plugin uses HTTPS endpoint in production environments.
- [ ] `CheckHealth` returns clear user-facing errors (auth/network/timeout).

## 3) Functional Validation

- [ ] Datasource `Save & Test` succeeds.
- [ ] Variable APIs work (`targets`, `captures`, `metrics`).
- [ ] Query API returns expected time series data.
- [ ] Empty/malformed query handling is graceful.
- [ ] Timeout/error behavior is validated.

## 4) Build and Packaging

- [ ] `npm run build` completes cleanly.
- [ ] Frontend assets are generated in `dist/`.
- [ ] Backend binaries are generated for:
  - [ ] `linux_amd64`
  - [ ] `linux_arm64`
- [ ] Zip artifact is produced (`grafana-hlc-datasource.zip`).
- [ ] Artifact contains `plugin.json`, frontend assets, and backend binaries.

## 5) CI/CD Quality Gates

- [ ] CI runs on pull requests and main branch.
- [ ] CI executes frontend and backend builds.
- [ ] CI uploads packaged artifact for review/testing.
- [ ] Optional: plugin validator/check is configured.

## 6) Release Notes and Docs

- [ ] `README.md` contains install/config/connect instructions.
- [ ] Changelog entry added for current version.
- [ ] Upgrade notes added for breaking changes.
- [ ] Support/contact info is included.

## 7) Submission Readiness

- [ ] Publisher account and ownership details are up to date.
- [ ] Signed artifact is generated with marketplace-compatible signing flow.
- [ ] Submission includes test instructions and demo credentials (if required).
- [ ] Internal smoke test done on clean Grafana instance.

## HLC Backend Contract Reminder

Expected API routes behind configured `apiUrl`:

- `POST /backend/api/grafana/health`
- `POST /backend/api/grafana/query`
- `POST /backend/api/grafana/variables/targets`
- `POST /backend/api/grafana/variables/captures`
- `POST /backend/api/grafana/variables/metrics`
