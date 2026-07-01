import { STATE_PATHS, US_VIEWBOX } from "../data/usStatePaths";

/** States with an active push flagged green. Edit this list as states go live. */
export const ACTIVE_STATES = ["CA", "TX", "NY"];

type Props = { active?: string[]; className?: string };

export default function USMap({ active = ACTIVE_STATES, className }: Props) {
  const on = new Set(active.map((s) => s.toUpperCase()));
  return (
    <svg
      className={className}
      viewBox={US_VIEWBOX}
      role="img"
      aria-label="Map of the United States with states currently taking action highlighted in green"
    >
      {Object.entries(STATE_PATHS).map(([abbr, d]) => (
        <path key={abbr} d={d} className={`usstate${on.has(abbr) ? " on" : ""}`}>
          <title>{abbr}</title>
        </path>
      ))}
    </svg>
  );
}
