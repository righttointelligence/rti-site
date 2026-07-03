// Instant cursor-following tooltip for the maps — replaces the browser's
// slow native <title> tooltip. Render inside any map container and feed it
// {x, y, text} from mouse events; null hides it.
export type Tip = { x: number; y: number; text: string } | null;

export default function MapTip({ tip }: { tip: Tip }) {
  if (!tip) return null;
  return (
    <div
      className="maptip"
      style={{ left: tip.x + 14, top: tip.y + 16 }}
      role="status"
      aria-live="polite"
    >
      {tip.text}
    </div>
  );
}
