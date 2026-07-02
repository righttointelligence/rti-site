import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";

// The live stats page. Full-screen split hero (workbench v3): totals stacked
// huge on the left, the interactive US map bleeding off the right. Tap a state
// and the left stack becomes that state's exact numbers. Scroll for the full
// per-state table. Everything feeds from /api/stats — real counts only.
type StateStat = { signups: number; calls: number };
type Stats = {
  totals: { signups: number; calls: number };
  states: Record<string, StateStat>;
};

const NAME_OF: Record<string, string> = Object.fromEntries(STATE_OPTIONS);

async function fetchStats(): Promise<Stats | null> {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as
      | { ok?: unknown; totals?: Stats["totals"]; states?: Stats["states"] }
      | null;
    if (!body?.totals || !body.states) return null;
    return { totals: body.totals, states: body.states };
  } catch {
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      void fetchStats().then((s) => {
        if (alive && s) setStats(s);
      });
    };
    load();
    const timer = window.setInterval(load, 45_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const maxCount = useMemo(() => {
    let max = 0;
    for (const s of Object.values(stats?.states ?? {})) {
      max = Math.max(max, s.signups + s.calls);
    }
    return max;
  }, [stats]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STATE_OPTIONS.map(([abbr, name]) => {
      const s = stats?.states[abbr] ?? { signups: 0, calls: 0 };
      return { abbr, name, ...s, total: s.signups + s.calls };
    })
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.abbr.toLowerCase() === q)
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [stats, query]);

  const activeStates = rows.filter((r) => r.total > 0).length;
  const sel = selected
    ? {
        abbr: selected,
        name: NAME_OF[selected] ?? selected,
        ...(stats?.states[selected] ?? { signups: 0, calls: 0 }),
      }
    : null;

  const fillFor = (abbr: string): string | undefined => {
    const s = stats?.states[abbr];
    const n = s ? s.signups + s.calls : 0;
    if (n === 0) return undefined; // default gray from .usstate
    const t = maxCount > 0 ? n / maxCount : 1;
    return `rgba(22,163,74,${(0.3 + 0.7 * t).toFixed(3)})`;
  };

  const pickState = (abbr: string) => {
    setSelected(abbr === selected ? null : abbr);
  };
  const pickFromTable = (abbr: string) => {
    setSelected(abbr);
    heroRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Nav onHome={false} />
      <main>
        <section className="statshero pad" ref={heroRef}>
          <div className="statsleft" aria-live="polite">
            {sel ? (
              <>
                <p className="idx">→ {sel.name}</p>
                <div className="statsstat">
                  <b>{fmt(sel.signups)}</b>
                  <span>signatures</span>
                </div>
                <div className="statsstat">
                  <b>{fmt(sel.calls)}</b>
                  <span>calls logged</span>
                </div>
                <p className="statsnote">
                  {sel.signups + sel.calls > 0
                    ? `${sel.name} is on the board. Every new name makes the next meeting with a lawmaker heavier.`
                    : `${sel.name} hasn't shown up yet. Be the first — takes ten seconds.`}
                </p>
                <div className="statsactions">
                  <Link className="cta statscta" to={`/action/${slugForAbbr(sel.abbr)}`}>
                    Take action in {sel.name} →
                  </Link>
                  <button className="statsback" type="button" onClick={() => setSelected(null)}>
                    ← whole country
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="idx">→ live stats</p>
                <div className="statsstat">
                  <b>{fmt(stats?.totals.signups ?? 0)}</b>
                  <span>signatures</span>
                </div>
                <div className="statsstat">
                  <b>{fmt(stats?.totals.calls ?? 0)}</b>
                  <span>calls logged</span>
                </div>
                <div className="statsstat">
                  <b>{activeStates}</b>
                  <span>states active</span>
                </div>
                <span className="liveline">
                  <span className="livedot" /> live — refreshes on its own
                </span>
                <p className="statsnote statshint">
                  Tap any state for its exact numbers, or scroll for all 50.
                </p>
              </>
            )}
          </div>
          <figure className="statsmap">
            <svg
              viewBox={US_VIEWBOX}
              role="img"
              aria-label="Interactive map of the United States shaded by activity per state"
            >
              {Object.entries(STATE_PATHS).map(([abbr, d]) => (
                <path
                  key={abbr}
                  d={d}
                  className={`usstate movestate${selected === abbr ? " sel" : ""}`}
                  style={{ fill: fillFor(abbr) }}
                  onClick={() => pickState(abbr)}
                >
                  <title>
                    {NAME_OF[abbr] ?? abbr}: {stats?.states[abbr]?.signups ?? 0} signed,{" "}
                    {stats?.states[abbr]?.calls ?? 0} called
                  </title>
                </path>
              ))}
            </svg>
          </figure>
        </section>

        <section className="statsdetail pad">
          <p className="idx">→ every state</p>
          <p className="statslede">
            Real numbers straight from the database — the same counts we put in front of lawmakers.
            Nothing padded, nothing faked.
          </p>
          <div className="movetablewrap">
            <input
              className="signupinput movesearch"
              type="search"
              placeholder="Search a state…"
              aria-label="Search states"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <table className="movetable">
              <thead>
                <tr>
                  <th>state</th>
                  <th>signatures</th>
                  <th>calls</th>
                  <th>total</th>
                  <th aria-label="action" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.abbr}
                    className={r.total > 0 ? "hasaction" : ""}
                    onClick={() => pickFromTable(r.abbr)}
                  >
                    <td>{r.name}</td>
                    <td>{fmt(r.signups)}</td>
                    <td>{fmt(r.calls)}</td>
                    <td>
                      <b>{fmt(r.total)}</b>
                    </td>
                    <td>
                      <Link
                        className="actlink"
                        to={`/action/${slugForAbbr(r.abbr)}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        act →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
