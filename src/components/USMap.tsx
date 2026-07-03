import { useEffect, useState } from "react";
import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";
import { STATE_OPTIONS } from "../data/states";

// The homepage map is live: every state shades by its real signature + call
// count from /api/stats, same green scale as the stats page. One fetch on
// mount (the endpoint is server-cached), remembered across navigations so
// revisits paint instantly.
type StateStat = { signups: number; calls: number };
let lastStates: Record<string, StateStat> | null = null;

const NAME_OF: Record<string, string> = Object.fromEntries(STATE_OPTIONS);

type Props = { className?: string };

export default function USMap({ className }: Props) {
  const [states, setStates] = useState<Record<string, StateStat> | null>(lastStates);

  useEffect(() => {
    let alive = true;
    void fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { states?: Record<string, StateStat> } | null) => {
        if (alive && body?.states) {
          lastStates = body.states;
          setStates(body.states);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  let max = 0;
  for (const s of Object.values(states ?? {})) max = Math.max(max, s.signups + s.calls);

  const fill = (abbr: string): string | undefined => {
    const s = states?.[abbr];
    const n = s ? s.signups + s.calls : 0;
    if (n === 0) return undefined; // default gray from .usstate
    const t = max > 0 ? n / max : 1;
    return `rgba(22,163,74,${(0.3 + 0.7 * t).toFixed(3)})`;
  };

  return (
    <svg
      className={className}
      viewBox={US_VIEWBOX}
      role="img"
      aria-label="Map of the United States shaded by signatures and calls per state"
    >
      {Object.entries(STATE_PATHS).map(([abbr, d]) => {
        const s = states?.[abbr];
        return (
          <path key={abbr} d={d} className="usstate" style={{ fill: fill(abbr) }}>
            <title>
              {NAME_OF[abbr] ?? abbr}: {s?.signups ?? 0} signed, {s?.calls ?? 0} called
            </title>
          </path>
        );
      })}
    </svg>
  );
}
