import { useState } from "react";
import { STATES } from "../data/states";
import type { ActionKind, ActionLogResult } from "../lib/actions";

// The result panel: shows the chosen state's action + copy-able script + confirm loop.
export default function ActionResult({
  stateKey,
  onConfirm,
}: {
  stateKey: string;
  onConfirm: (kind: ActionKind) => Promise<ActionLogResult>;
}) {
  const s = STATES[stateKey];
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState<ActionLogResult | null>(null);
  const [logging, setLogging] = useState<ActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!s) return null;

  const copy = () => {
    navigator.clipboard?.writeText(s.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const confirm = async (kind: ActionKind) => {
    if (confirmed || logging) return;
    setError(null);
    setLogging(kind);
    try {
      setConfirmed(await onConfirm(kind));
    } catch {
      setError("Could not log this yet. Please try again.");
    } finally {
      setLogging(null);
    }
  };

  return (
    <section className="beat pad" id="take-action" style={{ minHeight: "auto" }}>
      <div style={{ width: "100%" }}>
        <p className="idx">→ your action</p>
        <div className="result">
          <div className="rhead">
            <span className="rname">{s.name}</span>
            <span className={`tag ${s.prio}`}>priority: {s.prio}</span>
            <span className="tag review">needs review</span>
          </div>
          <div className="rbody">
            <div className="rblock">
              <p className="rk">what is happening</p>
              <p className="rv">{s.first}</p>
            </div>
            <div className="rblock">
              <p className="rk">what to ask for</p>
              <p className="rv">{s.ask}</p>
            </div>
            <div className="rblock">
              <p className="rk">what to say — tap to copy</p>
              <div className="script">
                <button className={`copy${copied ? " done" : ""}`} onClick={copy}>
                  {copied ? "copied ✓" : "copy"}
                </button>
                <span>{s.script}</span>
              </div>
            </div>
            <div className="rblock">
              <p className="rk">did it? add your voice to the count</p>
              <div className="confirm">
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm("call")}
                >
                  {logging === "call" ? "logging..." : "✓ I made the call"}
                </button>
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm("email")}
                >
                  {logging === "email" ? "logging..." : "✓ I sent an email"}
                </button>
              </div>
              {error && <p className="confirmed errorline">{error}</p>}
              {confirmed && (
                <p className="confirmed">
                  logged{confirmed.source === "local" ? " on this browser" : ""} — you're action{" "}
                  <b>#{confirmed.rank.toLocaleString()}</b>. thank you for adding your voice. tell a
                  friend and the count climbs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
