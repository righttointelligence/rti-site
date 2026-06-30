# Free Intelligence — Open Intelligence Institute

Landing site for the Open Intelligence Institute: protect the right to run local AI.

Stack: **React 19 + Vite 7 + Tailwind v4 + react-router**, deployed to **Cloudflare Workers static assets**.

## Develop

```bash
bun install
bun run dev        # http://localhost:5173
```

## Build + deploy (Cloudflare)

```bash
bun run build      # tsc + vite build -> dist/
bunx wrangler login   # once
bun run deploy     # build + wrangler deploy (Workers static assets, SPA fallback)
```

`wrangler.jsonc` serves `./dist` with `not_found_handling: single-page-application`. No Worker script — assets only.

## Structure

- `src/pages/Home.tsx` — the homepage (locked design: hero + boot neural net + live count + take-action flow + manifesto beats).
- `src/pages/Template.tsx` — scaffold for About / Principles / Take Action (filled in later).
- `src/components/NeuralBoot.tsx` + `src/lib/boot-net.ts` — the interactive boot+sapling neural net (canvas).
- `src/lib/boot-points.ts` — the logo sampled into node points (boot = ink, leaves = green). Regenerate from `oii-logo.png` if the logo changes.
- `src/data/states.ts` — per-state action scripts (placeholder copy, needs review).
- `src/index.css` — Tailwind v4 theme tokens + the exact homepage styles (ported 1:1 from the prototype).

## Notes

- Counts (`12,480`) are front-end placeholders. Wire a real edge counter (Workers KV / Durable Object) before launch: `GET /api/stats`, `POST /api/act`.
- Design source of truth lived in the GHOST vault prototype `projects/local-ai-freedom/design-catalogue/oii-canonical.html`.
