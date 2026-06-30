# Free Intelligence — Open Intelligence Institute

Landing site for the Open Intelligence Institute: protect the right to run local AI.

Stack: **React 19 + Vite 7 + Tailwind v4 + react-router**, deployed to **Cloudflare Workers static assets** with **Cloudflare D1** for no-PII action logs.

## Develop

```bash
bun install
bun run dev        # http://localhost:5173
```

## Build + deploy (Cloudflare)

```bash
bun run build      # tsc + vite build -> dist/
bunx wrangler login   # once
bunx wrangler d1 create free_intelligence_actions
# paste the returned database_id into wrangler.jsonc
bunx wrangler d1 migrations apply free_intelligence_actions --remote
bun run deploy     # build + wrangler deploy (Worker + static assets)
```

`wrangler.jsonc` serves `./dist` with `not_found_handling: single-page-application` and routes `POST /api/actions` through `worker.ts`.

## Storage choice

Use Cloudflare D1 as the first durable source of truth.

The site only needs a small append-only civic action log right now: state, action type, and timestamp. D1 is the right default because it gives us SQL, easy counts by state/action/date, migrations, exportability, and no need to collect personal information.

Do not use KV as the source of truth for action logs. KV is better later for cached public totals. Do not start with Durable Objects unless the site needs strict real-time coordination or abuse controls. Do not start with a separate backend until the movement needs accounts, moderation, or richer volunteer workflows.

## Structure

- `src/pages/Home.tsx` — the homepage (locked design: hero + boot neural net + take-action flow + manifesto beats).
- `src/pages/Template.tsx` — shared shell for About / Principles / Take Action.
- `src/components/NeuralBoot.tsx` + `src/lib/boot-net.ts` — the interactive boot+sapling neural net (canvas).
- `src/lib/boot-points.ts` — the logo sampled into node points (boot = ink, leaves = green). Regenerate from `oii-logo.png` if the logo changes.
- `src/data/states.ts` — all 50 state action packs, with baseline provenance for every state and source-verified draft overrides where deeper research exists.
- `src/lib/actions.ts` — browser action logging client, with local fallback for development.
- `worker.ts` — Cloudflare Worker API for persistent action logs.
- `migrations/0001_actions.sql` — D1 table for state/action/timestamp only.
- `src/index.css` — Tailwind v4 theme tokens + the exact homepage styles (ported 1:1 from the prototype).

## Notes

- The homepage no longer shows a fake public action count. Confirmed actions are logged through `POST /api/actions` once D1 is configured.
- The action log intentionally stores no name, email, ZIP, address, IP, or user agent.
- All 50 states are selectable. Baseline states route users to official state/federal lookup sources and the NCSL AI legislation tracker; California, Colorado, and Texas currently carry deeper source-verified draft packs.
- Design source of truth lived in the GHOST vault prototype `projects/local-ai-freedom/design-catalogue/oii-canonical.html`.
