import { useState } from "react";
import { STATES } from "../data/states";

// The result panel: shows the chosen state's action + copy-able script + confirm loop.
export default function ActionResult({
  stateKey,
  onConfirm,
  rank,
}: {
  stateKey: string;
  onConfirm: () => void;
  rank: number;
}) {
  const s = STATES[stateKey];
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  if (!s) return null;

  const copy = () => {
    navigator.clipboard?.writeText(s.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
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
              <p className="rk">do this first</p>
              <p className="rv">{s.first}</p>
            </div>
            <div className="rblock">
              <p className="rk">the exact ask</p>
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
                  disabled={confirmed}
                  onClick={() => { if (!confirmed) { setConfirmed(true); onConfirm(); } }}
                >
                  ✓ I made the call
                </button>
                <button
                  className="confirmbtn"
                  disabled={confirmed}
                  onClick={() => { if (!confirmed) { setConfirmed(true); onConfirm(); } }}
                >
                  ✓ I sent an email
                </button>
              </div>
              {confirmed && (
                <p className="confirmed">
                  logged — you're action <b>#{rank.toLocaleString()}</b>. thank you for adding your
                  voice. tell a friend and the count climbs.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
