# Right to Intelligence

Landing site for the Right to Intelligence: protect the right to run local AI.

Stack: **React 19 + Vite 7 + Tailwind v4 + react-router**, deployed to **Cloudflare Workers static assets** with **Cloudflare D1** for no-PII action logs.

## Develop

```bash
bun install
bun run dev        # http://localhost:5173
bun run dev:worker # http://localhost:8787, static app + Cloudflare Worker API
```

`bun run dev` runs Vite only. It is enough for frontend work, but exact lawmaker lookup
requires the Cloudflare Worker route at `POST /api/lawmakers`. On a Vite-only localhost
server, the page will show the official lookup fallback instead of exact offices.

Use `bun run dev:worker` when testing action logging, exact lawmaker lookup, or any
`/api/*` route locally. Exact lawmaker lookup runs from owned static civic-data assets;
no Open States API key is needed for visitor lookup.

## Build + deploy (Cloudflare)

```bash
bun run build      # tsc + vite build -> dist/
bunx wrangler login   # once
bunx wrangler d1 create free_intelligence_actions
# paste the returned database_id into wrangler.jsonc
bunx wrangler d1 migrations apply free_intelligence_actions --remote
bun run deploy     # build + wrangler deploy (Worker + static assets)
```

`wrangler.jsonc` serves `./dist` with `not_found_handling: single-page-application` and routes `POST /api/actions` and `POST /api/lawmakers` through `worker.ts`.

## Storage choice

Use Cloudflare D1 as the first durable source of truth.

The site only needs a small append-only civic action log right now: state, action type, and timestamp. D1 is the right default because it gives us SQL, easy counts by state/action/date, migrations, exportability, and no need to collect personal information.

Do not use KV as the source of truth for action logs. KV is better later for cached public totals. Do not start with Durable Objects unless the site needs strict real-time coordination or abuse controls. Do not start with a separate backend until the movement needs accounts, moderation, or richer volunteer workflows.

## Structure

- `src/pages/Home.tsx` — the homepage (locked design: hero + boot neural net + take-action flow + manifesto beats).
- `src/pages/Template.tsx` — shared shell for About / Principles / Take Action.
- `src/components/NeuralBoot.tsx` + `src/lib/boot-net.ts` — the interactive boot+sapling neural net (canvas).
- `src/lib/boot-points.ts` — the logo sampled into node points (boot = ink, leaves = green). Regenerate from `oii-logo.png` if the logo changes.
- `src/data/states.ts` — all 50 state action packs, with source-verified draft status, official contact routes, scripts, and provenance.
- `src/data/state-ai-snapshots.ts` — NCSL AI legislation snapshot counts for every state, checked 2026-06-30.
- `src/data/state-policy-links.ts` — official state legislature, bill-search, legislator lookup, and calendar links for every state.
- `src/data/state-official-links.ts` — USA.gov-derived state portal, governor, and attorney general links for every state.
- `src/lib/actions.ts` — browser action logging client, with local fallback for development.
- `src/lib/recommendation.ts` — derives one primary action (headline, context, ask, short call script, and one official lookup) from a state's pack + NCSL snapshot. It routes people to the official state legislator lookup first, then official state/governor fallback routes if needed. Never targets bill search.
- `worker.ts` — Cloudflare Worker API for persistent action logs and exact lawmaker lookup from owned Census boundary + Open States bulk-data assets.
- `migrations/0001_actions.sql` — D1 table for state/action/timestamp only.
- `src/index.css` — Tailwind v4 theme tokens + the exact homepage styles (ported 1:1 from the prototype).

## Notes

- The homepage no longer shows a fake public action count. Confirmed actions are logged through `POST /api/actions` once D1 is configured.
- The action log intentionally stores no name, email, ZIP, address, IP, or user agent.
- All 50 states are selectable. Selecting a state produces one call-first action packet with no policy homework: a recommended call action, the exact ask, one short call script, an optional browser-location lookup for exact state lawmakers, an official lookup fallback, and confirmation buttons for `I called`, `I left voicemail`, or `I used email fallback`. NCSL counts, provenance, and extra contacts live in collapsed "why this recommendation" and "sources and official links" sections below the action. The primary flow never tells visitors to search, read, or check bills, and bill search is never the primary target.
- Exact lawmaker lookup uses `navigator.geolocation` only after the visitor clicks the button. The Worker resolves the coordinate against owned Census district geometry, joins it to the local Open States bulk legislator dataset, returns public state-lawmaker names and phone numbers, and does not write location to D1. Open States `/people.geo` is used only by the dev-time verification script, not by visitor lookup.
- All 50 states now carry source-verified draft packs. New Jersey's pack uses official 2026 legislature search/API results for AI data-center energy, automated-decision, and public-sector generative-AI bills. Illinois's pack uses official 104th General Assembly search/API results and bill pages for SB315, SB316, and HB35. The final five promotions, Hawaii, Idaho, Indiana, Wisconsin, and Wyoming, were manually verified in browser against official legislature portals on 2026-06-30 after automated retrieval was blocked or incomplete.
- The NCSL snapshot is a public-tracker summary, not a substitute for human-reviewed state packs. It should be refreshed before launch and promoted only with retrieval dates visible.
- Design source of truth lived in the GHOST vault prototype `projects/local-ai-freedom/design-catalogue/oii-canonical.html`.
