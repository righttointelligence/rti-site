import { useEffect, useRef, useState } from "react";
import { fetchCount } from "../lib/signup";

// The honest movement counter: signups + logged calls, straight from D1.
// Renders nothing until a real number arrives — no fake totals, ever.
// Polls while visible so the number climbs live as people sign, and rolls
// odometer-style from the old value to the new one instead of snapping.
const POLL_MS = 10_000;
const ROLL_MS = 900;

export function useRollingNumber(target: number | null): number | null {
  const [shown, setShown] = useState<number | null>(target);
  const shownRef = useRef<number | null>(target);
  shownRef.current = shown;

  useEffect(() => {
    if (target === null) return;
    const from = shownRef.current;
    if (from === null || from === target) {
      setShown(target);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      setShown(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ROLL_MS, 1);
      const eased = 1 - (1 - p) ** 3;
      setShown(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return target === null ? null : shown;
}

export default function LiveCounter({
  total,
  onTotal,
}: {
  total: number | null;
  onTotal?: (total: number) => void;
}) {
  const [bump, setBump] = useState(false);
  const prev = useRef<number | null>(total);

  // keep the number fresh while the tab is visible
  useEffect(() => {
    let alive = true;
    const poll = async () => {
      if (document.hidden) return;
      const n = await fetchCount();
      if (alive && n !== null) onTotal?.(n);
    };
    const timer = window.setInterval(poll, POLL_MS);
    const onVis = () => {
      if (!document.hidden) void poll();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [onTotal]);

  // pulse when the count actually climbs
  useEffect(() => {
    if (total !== null && prev.current !== null && total > prev.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 1100);
      prev.current = total;
      return () => window.clearTimeout(t);
    }
    prev.current = total;
  }, [total]);

  const shown = useRollingNumber(total);
  if (shown === null || shown < 1) return null;

  return (
    <div className={`bigstat${bump ? " bump" : ""}`} aria-live="polite">
      <b>{shown.toLocaleString("en-US")}</b>
      <span className="statlabel">people have taken action</span>
      <span className="liveline">
        <span className="livedot" /> live count — every signup and call counts
      </span>
    </div>
  );
}
