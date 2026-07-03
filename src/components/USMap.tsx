import { useState } from "react";
import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";
import { STATE_OPTIONS } from "../data/states";
import { useStats } from "../lib/useStats";
import MapTip, { type Tip } from "./MapTip";

// The homepage map is live: every state shades by its real signature + call
// count from /api/stats, same green scale as the stats page, with an instant
// tooltip (state name + numbers) following the cursor.
const NAME_OF: Record<string, string> = Object.fromEntries(STATE_OPTIONS);

type Props = { className?: string };

export default function USMap({ className }: Props) {
  const stats = useStats();
  const [tip, setTip] = useState<Tip>(null);
  const states = stats?.states ?? null;

  let max = 0;
  for (const s of Object.values(states ?? {})) max = Math.max(max, s.signups + s.calls);

  const fill = (abbr: string): string | undefined => {
    const s = states?.[abbr];
    const n = s ? s.signups + s.calls : 0;
    if (n === 0) return undefined; // default gray from .usstate
    const t = max > 0 ? n / max : 1;
    return `rgba(22,163,74,${(0.3 + 0.7 * t).toFixed(3)})`;
  };

  const tipText = (abbr: string): string => {
    const s = states?.[abbr];
    return `${NAME_OF[abbr] ?? abbr}: ${s?.signups ?? 0} signed, ${s?.calls ?? 0} called`;
  };

  return (
    <>
      <svg
        className={className}
        viewBox={US_VIEWBOX}
        role="img"
        aria-label="Map of the United States shaded by signatures and calls per state"
        onMouseLeave={() => setTip(null)}
      >
        {Object.entries(STATE_PATHS).map(([abbr, d]) => (
          <path
            key={abbr}
            d={d}
            className="usstate hoverable"
            style={{ fill: fill(abbr) }}
            onMouseMove={(e) => setTip({ x: e.clientX, y: e.clientY, text: tipText(abbr) })}
          />
        ))}
      </svg>
      <MapTip tip={tip} />
    </>
  );
}
