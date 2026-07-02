import { useMemo, useState, type ReactElement } from "react";
import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";
import { STATE_OPTIONS } from "../data/states";

// ---------------------------------------------------------------------------
// Dev-only workbench: 5 FULL-SCREEN stats-module treatments for /stats.
// Each variant is a 100svh, full-width hero using the real map + real classes.
// Demo numbers are fixture data so the design reads at movement scale.
// Route is stripped from production builds (import.meta.env.DEV in App.tsx).
// ---------------------------------------------------------------------------

const NAME_OF: Record<string, string> = Object.fromEntries(STATE_OPTIONS);

// Fixture: plausible at-scale numbers so type sizes and shading are honest to
// the future, not the launch night.
const DEMO: Record<string, { signups: number; calls: number }> = {
  CA: { signups: 1284, calls: 231 },
  TX: { signups: 862, calls: 144 },
  NY: { signups: 641, calls: 98 },
  FL: { signups: 512, calls: 71 },
  WA: { signups: 289, calls: 64 },
  MT: { signups: 173, calls: 51 },
  CO: { signups: 141, calls: 22 },
  NH: { signups: 96, calls: 31 },
  GA: { signups: 88, calls: 9 },
  IL: { signups: 74, calls: 12 },
};
const TOTAL_SIGNUPS = Object.values(DEMO).reduce((n, s) => n + s.signups, 0);
const TOTAL_CALLS = Object.values(DEMO).reduce((n, s) => n + s.calls, 0);
const TOTAL = TOTAL_SIGNUPS + TOTAL_CALLS;
const ACTIVE = Object.keys(DEMO).length;
const MAX = Math.max(...Object.values(DEMO).map((s) => s.signups + s.calls));

const countOf = (abbr: string) => {
  const s = DEMO[abbr];
  return s ? s.signups + s.calls : 0;
};
const fillFor = (abbr: string): string | undefined => {
  const n = countOf(abbr);
  if (n === 0) return undefined;
  return `rgba(22,163,74,${(0.3 + 0.7 * (n / MAX)).toFixed(3)})`;
};

function Map({
  onPick,
  selected,
  className,
}: {
  onPick?: (abbr: string) => void;
  selected?: string | null;
  className?: string;
}) {
  return (
    <svg className={className} viewBox={US_VIEWBOX} role="img" aria-label="US activity map">
      {Object.entries(STATE_PATHS).map(([abbr, d]) => (
        <path
          key={abbr}
          d={d}
          className={`usstate movestate${selected === abbr ? " sel" : ""}`}
          style={{ fill: fillFor(abbr) }}
          onClick={onPick ? () => onPick(abbr) : undefined}
        >
          <title>
            {NAME_OF[abbr] ?? abbr}: {countOf(abbr)}
          </title>
        </path>
      ))}
    </svg>
  );
}

const fmt = (n: number) => n.toLocaleString("en-US");

type V = { id: string; title: string; note: string; render: () => ReactElement };

// --- v1: map colossus — the map IS the screen, counter floats over it -------
function V1() {
  return (
    <section className="wbfull">
      <Map className="wb1map" />
      <div className="wb1over">
        <p className="idx">→ live stats</p>
        <p className="wb1num">{fmt(TOTAL)}</p>
        <p className="wb1label">people moving on local AI</p>
        <span className="liveline">
          <span className="livedot" /> live — {fmt(TOTAL_SIGNUPS)} signed · {fmt(TOTAL_CALLS)}{" "}
          called · {ACTIVE} states
        </span>
      </div>
    </section>
  );
}

// --- v2: counter first — one colossal number, map as watermark --------------
function V2() {
  return (
    <section className="wbfull wb2">
      <Map className="wb2map" />
      <div className="wb2stack">
        <p className="idx">→ live stats</p>
        <p className="wb2num">{fmt(TOTAL)}</p>
        <p className="wb2label">every signature. every call. counted.</p>
        <div className="wb2strip">
          <span>
            <b>{fmt(TOTAL_SIGNUPS)}</b> signatures
          </span>
          <span>
            <b>{fmt(TOTAL_CALLS)}</b> calls logged
          </span>
          <span>
            <b>{ACTIVE}</b> states active
          </span>
          <span className="liveline">
            <span className="livedot" /> live
          </span>
        </div>
      </div>
    </section>
  );
}

// --- v3: split — numbers left, edge-to-edge map right ------------------------
function V3() {
  return (
    <section className="wbfull wb3">
      <div className="wb3left">
        <p className="idx">→ live stats</p>
        <div className="wb3stat">
          <b>{fmt(TOTAL_SIGNUPS)}</b>
          <span>signatures</span>
        </div>
        <div className="wb3stat">
          <b>{fmt(TOTAL_CALLS)}</b>
          <span>calls logged</span>
        </div>
        <div className="wb3stat">
          <b>{ACTIVE}</b>
          <span>states active</span>
        </div>
        <span className="liveline">
          <span className="livedot" /> live — refreshes on its own
        </span>
      </div>
      <Map className="wb3map" />
    </section>
  );
}

// --- v4: dashboard — full map + top-states leaderboard bar -------------------
function V4() {
  const top = Object.entries(DEMO)
    .map(([abbr, s]) => ({ abbr, total: s.signups + s.calls }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  return (
    <section className="wbfull wb4">
      <div className="wb4head">
        <p className="wb4num">{fmt(TOTAL)}</p>
        <p className="wb4label">
          people moving · <span className="livedot" /> live
        </p>
      </div>
      <Map className="wb4map" />
      <div className="wb4bar">
        {top.map((t, i) => (
          <span key={t.abbr} className="wb4cell">
            <em>#{i + 1}</em> {NAME_OF[t.abbr]} <b>{fmt(t.total)}</b>
          </span>
        ))}
        <span className="wb4cell wb4more">all 50 →</span>
      </div>
    </section>
  );
}

// --- v5: state spotlight — tap a state, the screen becomes that state -------
function V5() {
  const [sel, setSel] = useState<string | null>("CA");
  const stat = sel ? DEMO[sel] ?? { signups: 0, calls: 0 } : null;
  const total = useMemo(() => (stat ? stat.signups + stat.calls : TOTAL), [stat]);
  return (
    <section className="wbfull wb5">
      <div className="wb5big" aria-live="polite">
        <p className="idx">→ {sel ? NAME_OF[sel] : "united states"}</p>
        <p className="wb5num">{fmt(total)}</p>
        <p className="wb5label">
          {sel
            ? `${fmt(stat!.signups)} signed · ${fmt(stat!.calls)} called in ${NAME_OF[sel]}`
            : "every signature and call, counted"}
        </p>
        {sel && (
          <button className="wb5clear" type="button" onClick={() => setSel(null)}>
            ← back to the whole country
          </button>
        )}
      </div>
      <Map className="wb5map" selected={sel} onPick={(a) => setSel(a === sel ? null : a)} />
    </section>
  );
}

const VARIANTS: V[] = [
  {
    id: "v1",
    title: "v1 — map colossus",
    note: "The map IS the screen, edge to edge. Counter floats over the empty midwest. Loudest map presence.",
    render: () => <V1 />,
  },
  {
    id: "v2",
    title: "v2 — counter first",
    note: "One colossal number owns the viewport; map ghosts behind it as a watermark. Loudest number.",
    render: () => <V2 />,
  },
  {
    id: "v3",
    title: "v3 — split screen",
    note: "Numbers stacked huge on the left, full-height map bleeding off the right edge. Most balanced.",
    render: () => <V3 />,
  },
  {
    id: "v4",
    title: "v4 — dashboard",
    note: "Big total up top, full map center, top-5 state leaderboard bar pinned to the bottom. Most info.",
    render: () => <V4 />,
  },
  {
    id: "v5",
    title: "v5 — state spotlight",
    note: "Interactive: tap a state and the whole screen becomes that state's counter. Most personal.",
    render: () => <V5 />,
  },
];

export default function Workbench() {
  const [active, setActive] = useState(0);
  const v = VARIANTS[active];
  return (
    <div className="wb">
      <style>{CSS}</style>
      <div className="wbbar">
        {VARIANTS.map((x, i) => (
          <button
            key={x.id}
            className={`wbbtn${i === active ? " on" : ""}`}
            onClick={() => setActive(i)}
            type="button"
          >
            {x.id}
          </button>
        ))}
        <span className="wbnote">
          <b>{v.title}</b> — {v.note}
        </span>
      </div>
      {v.render()}
    </div>
  );
}

const CSS = `
.wb { min-height: 100svh; background: var(--paper, #f4f4f0); }
.wbbar { position: sticky; top: 0; z-index: 50; display: flex; gap: 8px; align-items: center;
  padding: 10px 16px; background: #1a1a18; color: #f4f4f0; font-family: var(--mono);
  font-size: 12.5px; }
.wbbtn { background: none; border: 1px solid #555; color: #ccc; font-family: var(--mono);
  font-size: 12px; padding: 4px 10px; cursor: pointer; }
.wbbtn.on { background: #22c55e; border-color: #22c55e; color: #111; font-weight: 700; }
.wbnote { margin-left: 12px; color: #aaa; }
.wbnote b { color: #f4f4f0; }

.wbfull { position: relative; height: calc(100svh - 45px); width: 100%; overflow: hidden; }

/* v1 map colossus */
.wb1map { position: absolute; inset: 0; width: 100%; height: 100%; padding: 3vh 2vw;
  box-sizing: border-box; }
.wb1over { position: absolute; top: 6vh; left: 5vw; max-width: 46vw; pointer-events: none; }
.wb1num { font-family: var(--display); font-weight: 800; font-size: clamp(72px, 11vw, 170px);
  line-height: 0.95; letter-spacing: -0.03em; margin: 10px 0 0; }
.wb1label { font-family: var(--mono); font-size: 15px; color: var(--gray, #555); margin: 12px 0 14px; }

/* v2 counter first */
.wb2map { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0.22; padding: 4vh 4vw;
  box-sizing: border-box; pointer-events: none; }
.wb2stack { position: relative; height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; }
.wb2num { font-family: var(--display); font-weight: 800; font-size: clamp(110px, 19vw, 300px);
  line-height: 0.9; letter-spacing: -0.04em; margin: 8px 0 0; }
.wb2label { font-family: var(--mono); font-size: clamp(14px, 1.6vw, 19px); color: var(--gray, #555);
  margin: 18px 0 0; }
.wb2strip { display: flex; gap: 34px; margin-top: 5vh; font-family: var(--mono); font-size: 14px;
  color: var(--gray, #555); flex-wrap: wrap; justify-content: center; }
.wb2strip b { font-size: 20px; color: var(--ink, #1a1a18); margin-right: 6px; }

/* v3 split */
.wb3 { display: grid; grid-template-columns: minmax(320px, 0.8fr) 1.4fr; }
.wb3left { display: flex; flex-direction: column; justify-content: center; gap: 4vh;
  padding-left: 5vw; }
.wb3stat b { display: block; font-family: var(--display); font-weight: 800;
  font-size: clamp(56px, 7.5vw, 120px); line-height: 0.95; letter-spacing: -0.03em; }
.wb3stat span { font-family: var(--mono); font-size: 14px; color: var(--gray, #555); }
.wb3map { height: 100%; width: 100%; padding: 4vh 0 4vh 2vw; box-sizing: border-box; }

/* v4 dashboard */
.wb4 { display: flex; flex-direction: column; }
.wb4head { text-align: center; padding-top: 3.5vh; }
.wb4num { font-family: var(--display); font-weight: 800; font-size: clamp(64px, 9vw, 140px);
  line-height: 0.95; letter-spacing: -0.03em; margin: 0; }
.wb4label { font-family: var(--mono); font-size: 14px; color: var(--gray, #555); margin: 8px 0 0; }
.wb4map { flex: 1; min-height: 0; width: 100%; padding: 2vh 6vw; box-sizing: border-box; }
.wb4bar { display: flex; border-top: 1.5px solid var(--ink, #1a1a18); font-family: var(--mono);
  font-size: 13.5px; }
.wb4cell { flex: 1; padding: 16px 12px; border-right: 1px solid rgba(26,26,24,0.15);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.wb4cell em { color: #16a34a; font-style: normal; margin-right: 6px; }
.wb4cell b { float: right; }
.wb4more { flex: 0 0 auto; color: #16a34a; text-decoration: underline; cursor: pointer; }

/* v5 spotlight */
.wb5 { display: grid; grid-template-columns: minmax(340px, 0.9fr) 1.3fr; align-items: center; }
.wb5big { padding-left: 5vw; }
.wb5num { font-family: var(--display); font-weight: 800; font-size: clamp(90px, 13vw, 210px);
  line-height: 0.92; letter-spacing: -0.04em; margin: 8px 0 0; }
.wb5label { font-family: var(--mono); font-size: 15px; color: var(--gray, #555); margin: 16px 0 0; }
.wb5clear { margin-top: 22px; background: none; border: none; padding: 0; font-family: var(--mono);
  font-size: 13px; color: #16a34a; text-decoration: underline; text-underline-offset: 3px;
  cursor: pointer; }
.wb5map { height: 100%; width: 100%; padding: 5vh 3vw; box-sizing: border-box; }

@media (max-width: 860px) {
  .wb3, .wb5 { grid-template-columns: 1fr; }
  .wb3map, .wb5map { min-height: 40vh; }
  .wb1over { max-width: 90vw; }
}
`;
