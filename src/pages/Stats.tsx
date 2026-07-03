import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { useRollingNumber } from "../components/LiveCounter";
import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";
import { COUNTRY_OPTIONS } from "../data/countries";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";

// The live stats page. Full-screen split hero (workbench v3): totals stacked
// huge on the left, the interactive map bleeding off the right. Two views:
// the US map (the fight we can vote in) and the world map (everyone standing
// with it). Tap a state or country and the left stack becomes its numbers.
// Polls every 10s and rolls the numbers odometer-style — same live feel as
// the homepage counter.
type StateStat = { signups: number; calls: number };
type Stats = {
  totals: { signups: number; calls: number };
  states: Record<string, StateStat>;
  countries: Record<string, { signups: number }>;
};

type View = "us" | "world";

const NAME_OF: Record<string, string> = Object.fromEntries(STATE_OPTIONS);
const COUNTRY_NAME_OF: Record<string, string> = Object.fromEntries(COUNTRY_OPTIONS);

// The world map path data is the single heaviest asset in the app (~120KB of
// SVG geometry) and it only renders behind the "World" toggle. It loads as its
// own chunk in the background right after the stats page mounts — navigation
// stays fully synchronous (no suspense flash), and by the time anyone reaches
// for the toggle the map is already here. Cached at module scope so it loads
// at most once per session.
type WorldData = typeof import("../data/worldCountryPaths");
let worldCache: WorldData | null = null;

const POLL_MS = 10_000;

async function fetchStats(): Promise<Stats | null> {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as
      | {
          ok?: unknown;
          totals?: Stats["totals"];
          states?: Stats["states"];
          countries?: Stats["countries"];
        }
      | null;
    if (!body?.totals || !body.states) return null;
    return { totals: body.totals, states: body.states, countries: body.countries ?? {} };
  } catch {
    return null;
  }
}

const fmt = (n: number) => n.toLocaleString("en-US");

// Last stats survive navigation: leaving and returning to /stats renders the
// previous numbers instantly (no blank flash) while a fresh fetch updates them.
let lastStats: Stats | null = null;

export default function StatsPage() {
  const [stats, setStatsState] = useState<Stats | null>(lastStats);
  const setStats = (s: Stats) => {
    lastStats = s;
    setStatsState(s);
  };
  const [view, setView] = useState<View>("us");
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [world, setWorld] = useState<WorldData | null>(worldCache);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (worldCache) return;
    let alive = true;
    void import("../data/worldCountryPaths").then((m) => {
      worldCache = m;
      if (alive) setWorld(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (document.hidden) return;
      void fetchStats().then((s) => {
        if (alive && s) setStats(s);
      });
    };
    load();
    const timer = window.setInterval(load, POLL_MS);
    const onVis = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const usTotal = useMemo(() => {
    let n = 0;
    for (const s of Object.values(stats?.states ?? {})) n += s.signups + s.calls;
    return n;
  }, [stats]);

  const maxState = useMemo(() => {
    let max = 0;
    for (const s of Object.values(stats?.states ?? {})) {
      max = Math.max(max, s.signups + s.calls);
    }
    return max;
  }, [stats]);

  const maxCountry = useMemo(() => {
    let max = usTotal;
    for (const c of Object.values(stats?.countries ?? {})) {
      max = Math.max(max, c.signups);
    }
    return max;
  }, [stats, usTotal]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (view === "us") {
      return STATE_OPTIONS.map(([abbr, name]) => {
        const s = stats?.states[abbr] ?? { signups: 0, calls: 0 };
        return { abbr, name, ...s, total: s.signups + s.calls };
      })
        .filter((r) => !q || r.name.toLowerCase().includes(q) || r.abbr.toLowerCase() === q)
        .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    }
    // world view: the US as one row + every country on the board
    const world = [
      { abbr: "US", name: "United States", signups: usTotal, calls: 0, total: usTotal },
      ...Object.entries(stats?.countries ?? {}).map(([abbr, c]) => ({
        abbr,
        name: COUNTRY_NAME_OF[abbr] ?? abbr,
        signups: c.signups,
        calls: 0,
        total: c.signups,
      })),
    ];
    return world
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.abbr.toLowerCase() === q)
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [stats, query, view, usTotal]);

  const activePlaces =
    view === "us"
      ? Object.values(stats?.states ?? {}).filter((s) => s.signups + s.calls > 0).length
      : Object.keys(stats?.countries ?? {}).length + (usTotal > 0 ? 1 : 0);

  const sel = selected
    ? view === "us"
      ? {
          abbr: selected,
          name: NAME_OF[selected] ?? selected,
          ...(stats?.states[selected] ?? { signups: 0, calls: 0 }),
        }
      : {
          abbr: selected,
          name: selected === "US" ? "United States" : (COUNTRY_NAME_OF[selected] ?? selected),
          signups: selected === "US" ? usTotal : (stats?.countries[selected]?.signups ?? 0),
          calls: 0,
        }
    : null;

  // Live odometer roll on the headline totals — the map's own numbers.
  const rollSignups = useRollingNumber(stats ? stats.totals.signups : null);
  const rollCalls = useRollingNumber(stats ? stats.totals.calls : null);

  const fillUS = (abbr: string): string | undefined => {
    const s = stats?.states[abbr];
    const n = s ? s.signups + s.calls : 0;
    if (n === 0) return undefined; // default gray from .usstate
    const t = maxState > 0 ? n / maxState : 1;
    return `rgba(22,163,74,${(0.3 + 0.7 * t).toFixed(3)})`;
  };

  const fillWorld = (code: string): string | undefined => {
    const n = code === "US" ? usTotal : (stats?.countries[code]?.signups ?? 0);
    if (n === 0) return undefined;
    const t = maxCountry > 0 ? n / maxCountry : 1;
    return `rgba(22,163,74,${(0.3 + 0.7 * t).toFixed(3)})`;
  };

  const pickPlace = (code: string) => {
    setSelected(code === selected ? null : code);
  };
  const pickFromTable = (code: string) => {
    setSelected(code);
    heroRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  };
  const switchView = (v: View) => {
    setView(v);
    setSelected(null);
    setQuery("");
  };

  return (
    <>
      <Nav />
      <main>
        <section className={`statshero pad${view === "world" ? " world" : ""}`} ref={heroRef}>
          <div className="statsleft" aria-live="polite">
            {sel ? (
              <>
                <p className="idx">→ {sel.name}</p>
                <div className="statsstat">
                  <b>{fmt(sel.signups)}</b>
                  <span>signatures</span>
                </div>
                {view === "us" && (
                  <div className="statsstat">
                    <b>{fmt(sel.calls)}</b>
                    <span>calls logged</span>
                  </div>
                )}
                <p className="statsnote">
                  {sel.signups + sel.calls > 0
                    ? `${sel.name} is on the board. Every new name makes the next meeting with a lawmaker heavier.`
                    : `${sel.name} hasn't shown up yet. Be the first — takes ten seconds.`}
                </p>
                <div className="statsactions">
                  {view === "us" ? (
                    <Link className="cta statscta" to={`/action/${slugForAbbr(sel.abbr)}`}>
                      Take action in {sel.name} →
                    </Link>
                  ) : (
                    <Link className="cta statscta" to="/">
                      Sign from anywhere →
                    </Link>
                  )}
                  <button className="statsback" type="button" onClick={() => setSelected(null)}>
                    {view === "us" ? "← whole country" : "← whole world"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="idx">→ live stats</p>
                <div className="statsstat">
                  <b>{fmt(rollSignups ?? 0)}</b>
                  <span>signatures</span>
                </div>
                <div className="statsstat">
                  <b>{fmt(rollCalls ?? 0)}</b>
                  <span>calls logged</span>
                </div>
                <div className="statsstat">
                  <b>{activePlaces}</b>
                  <span>{view === "us" ? "states active" : "countries active"}</span>
                </div>
                <span className="liveline">
                  <span className="livedot" /> live — updates on its own
                </span>
                <p className="statsnote statshint">
                  {view === "us"
                    ? "Tap any state for its exact numbers, or scroll for all 50."
                    : "Tap any country for its numbers. The US push is the main front — the world stands with it."}
                </p>
              </>
            )}
          </div>
          <figure className="statsmap">
            <div className="mapswitch" role="tablist" aria-label="Map view">
              <button
                type="button"
                role="tab"
                aria-selected={view === "us"}
                className={`mapswitchbtn${view === "us" ? " on" : ""}`}
                onClick={() => switchView("us")}
              >
                US
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={view === "world"}
                className={`mapswitchbtn${view === "world" ? " on" : ""}`}
                onClick={() => switchView("world")}
              >
                World
              </button>
            </div>
            {view === "us" ? (
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
                    style={{ fill: fillUS(abbr) }}
                    onClick={() => pickPlace(abbr)}
                  >
                    <title>
                      {NAME_OF[abbr] ?? abbr}: {stats?.states[abbr]?.signups ?? 0} signed,{" "}
                      {stats?.states[abbr]?.calls ?? 0} called
                    </title>
                  </path>
                ))}
              </svg>
            ) : world ? (
              <svg
                viewBox={world.WORLD_VIEWBOX}
                role="img"
                aria-label="Interactive world map shaded by signatures per country"
              >
                {Object.entries(world.WORLD_PATHS).map(([code, d]) => (
                  <path
                    key={code}
                    d={d}
                    className={`usstate movestate${selected === code ? " sel" : ""}`}
                    style={{ fill: fillWorld(code) }}
                    onClick={() => pickPlace(code)}
                  >
                    <title>
                      {world.WORLD_NAMES[code] ?? COUNTRY_NAME_OF[code] ?? code}:{" "}
                      {code === "US" ? usTotal : (stats?.countries[code]?.signups ?? 0)} signed
                    </title>
                  </path>
                ))}
              </svg>
            ) : null}
          </figure>
        </section>

        <section className="statsdetail pad">
          <p className="idx">{view === "us" ? "→ every state" : "→ around the world"}</p>
          <p className="statslede">
            Real numbers straight from the database — the same counts we put in front of lawmakers.
            Nothing padded, nothing faked.
          </p>
          <div className="movetablewrap">
            <input
              className="signupinput movesearch"
              type="search"
              placeholder={view === "us" ? "Search a state…" : "Search a country…"}
              aria-label={view === "us" ? "Search states" : "Search countries"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <table className="movetable">
              <thead>
                <tr>
                  <th>{view === "us" ? "state" : "country"}</th>
                  <th>signatures</th>
                  {view === "us" && <th>calls</th>}
                  <th>total</th>
                  {view === "us" && <th aria-label="action" />}
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
                    {view === "us" && <td>{fmt(r.calls)}</td>}
                    <td>
                      <b>{fmt(r.total)}</b>
                    </td>
                    {view === "us" && (
                      <td>
                        <Link
                          className="actlink"
                          to={`/action/${slugForAbbr(r.abbr)}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          act →
                        </Link>
                      </td>
                    )}
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
