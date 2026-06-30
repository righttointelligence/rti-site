import { useEffect, useRef, useState } from "react";

// Animated count-up with cubic ease-out, then tracks live increments from props.
export default function CountUp({ value, dur = 1500 }: { value: number; dur?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    // first mount: ease from 0 to value; later: ease from current display to new value
    let raf = 0;
    const from = started.current ? display : 0;
    const to = value;
    started.current = true;
    let t0: number | null = null;
    const step = (t: number) => {
      if (t0 === null) t0 = t;
      const p = Math.min((t - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (to - from) * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <b>{display.toLocaleString()}</b>;
}
