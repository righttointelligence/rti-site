# Civic Lookup RFC Review

Date: 2026-07-01

## Question

Review the current exact-lawmaker lookup implementation and answer three questions:

1. Is the runtime path fully off live Open States API calls?
2. Are the remaining New Hampshire lower-house district mismatches worth fixing now?
3. What old Open States API references or stale messages still need cleanup so the repo is not misleading?

## Current facts to verify from the repo

- `worker.ts` returns `source: "owned-census-openstates-bulk"` from `/api/lawmakers`.
- `worker.ts` reads static assets from `env.ASSETS`:
  - `/civic-data/census/tiger2024/district-index/${state}.json`
  - `/civic-data/census/tiger2024/districts/...`
  - `/civic-data/openstates/legislators/current/${state}.json`
- `tools/civic-data/import-openstates-legislators.ts` uses Open States current-legislator CSV bulk data as an import source.
- `tools/civic-data/verify-openstates-geo.ts` still calls Open States `/people.geo`, but only as a verification tool.
- The current owned-data coverage check found:
  - 50 states present
  - 7,359 total lawmakers
  - 7,300 geographic lawmakers currently match owned Census district geometry
  - 2 Maine tribal seats intentionally do not map to point-in-district Census geometry
  - 57 remaining mismatches are all New Hampshire lower-house districts
- `README.md`, `src/pages/Action.tsx`, and `src/components/ActionResult.tsx` may still contain stale copy that says an Open States key is required for exact lookup.

## Review scope

Read-only review. Do not edit files.

Inspect these files at minimum:

- `worker.ts`
- `src/lib/actions.ts`
- `src/pages/Action.tsx`
- `src/components/ActionResult.tsx`
- `README.md`
- `civic-data/README.md`
- `tools/civic-data/import-openstates-legislators.ts`
- `tools/civic-data/verify-openstates-geo.ts`
- `civic-data/openstates/legislators/current/NH.json`
- `civic-data/census/tiger2024/district-index/NH.json`

## Deliverable

Return a concise RFC with:

- Runtime dependency verdict: whether visitor lookup can run without `OPENSTATES_API_KEY`.
- New Hampshire diagnosis: what the 57 mismatches are, why they mismatch, and whether they affect typical exact-lawmaker lookup.
- Fix options ranked by value:
  - do nothing for launch
  - hide/soft-fallback New Hampshire lower-house exact lookup
  - add an NH-specific mapping table
  - find/import an official NH district mapping source
- Recommended next action for launch.
- Stale copy/docs to clean up, with exact files.

Do not propose broad rewrites. Keep the recommendation launch-focused.
