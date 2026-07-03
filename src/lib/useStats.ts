import { useEffect, useState } from "react";

// Shared live-stats hook: one fetch per mount, remembered at module scope so
// revisits paint instantly (same stale-while-revalidate pattern as the stats
// page). The /api/stats endpoint is server-cached, so this stays cheap.
export type StateStat = { signups: number; calls: number };
export type StatsData = {
  totals: { signups: number; calls: number };
  states: Record<string, StateStat>;
  countries: Record<string, { signups: number }>;
};

let lastStats: StatsData | null = null;

export function useStats(): StatsData | null {
  const [stats, setStats] = useState<StatsData | null>(lastStats);

  useEffect(() => {
    let alive = true;
    void fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: StatsData | null) => {
        if (alive && body?.totals && body.states) {
          lastStats = { totals: body.totals, states: body.states, countries: body.countries ?? {} };
          setStats(lastStats);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return stats;
}
