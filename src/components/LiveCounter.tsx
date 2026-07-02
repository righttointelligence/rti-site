// The honest movement counter: signups + logged calls, straight from D1.
// Renders nothing until a real number arrives — no fake totals, ever.
export default function LiveCounter({ total }: { total: number | null }) {
  if (total === null || total < 1) return null;
  return (
    <div className="bigstat" aria-live="polite">
      <b>{total.toLocaleString("en-US")}</b>
      <span className="statlabel">people have taken action</span>
      <span className="liveline">
        <span className="livedot" /> live count — every signup and call counts
      </span>
    </div>
  );
}
