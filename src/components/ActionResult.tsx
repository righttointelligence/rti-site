import { useState } from "react";
import { STATE_AI_SNAPSHOTS } from "../data/state-ai-snapshots";
import { STATES } from "../data/states";
import { derivePrimaryAction } from "../lib/recommendation";
import type { ActionKind, ActionLogResult } from "../lib/actions";

// The result panel: one recommended action, one exact ask, one copyable
// message, one official destination, one "I sent it" loop. Counts, provenance,
// and extra contacts live in a collapsed secondary layer below the action.
export default function ActionResult({
  stateKey,
  onConfirm,
}: {
  stateKey: string;
  onConfirm: (kind: ActionKind) => Promise<ActionLogResult>;
}) {
  const s = STATES[stateKey];
  const aiSnapshot = STATE_AI_SNAPSHOTS[stateKey];
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState<ActionLogResult | null>(null);
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!s) return null;

  const action = derivePrimaryAction(s, aiSnapshot);

  const copy = () => {
    navigator.clipboard?.writeText(action.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const confirm = async () => {
    if (confirmed || logging) return;
    setError(null);
    setLogging(true);
    try {
      setConfirmed(await onConfirm("email"));
    } catch {
      setError("Could not log this yet. Please try again.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <section className="beat pad" id="take-action" style={{ minHeight: "auto" }}>
      <div style={{ width: "100%" }}>
        <p className="idx">→ your action</p>
        <div className="result">
          <div className="rhead">
            <span className="rname">{s.name}</span>
            <span className="tag review">{s.reviewStatus}</span>
          </div>
          <div className="rbody">
            <div className="rblock">
              <p className="rk">do this now</p>
              <p className="rv">{action.headline}</p>
            </div>
            <div className="rblock">
              <p className="rk">why this state</p>
              <p className="rv">{action.context}</p>
            </div>
            <div className="rblock">
              <p className="rk">the ask</p>
              <p className="rv">{action.ask}</p>
            </div>
            <div className="rblock">
              <p className="rk">1 / copy this message</p>
              <div className="script">
                <button className={`copy${copied ? " done" : ""}`} onClick={copy}>
                  {copied ? "copied ✓" : "copy"}
                </button>
                <span>{action.script}</span>
              </div>
              <p className="rnote">
                No policy homework required. We picked the first useful action for you, and OII does
                not collect or see your name, email, or address.
              </p>
            </div>
            <div className="rblock">
              <p className="rk">2 / open the official contact page</p>
              <a className="targetbtn" href={action.targetUrl} rel="noreferrer" target="_blank">
                Open official contact page →
              </a>
              <p className="rnote">
                Goes to the <b>{action.targetLabel}</b>. {action.targetNote} If that office asks for
                your address, you enter it there on the official site — not here.
              </p>
            </div>
            <div className="rblock">
              <p className="rk">3 / mark it done</p>
              <div className="confirm">
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm()}
                >
                  {logging ? "logging..." : "✓ I sent it"}
                </button>
              </div>
              {error && <p className="confirmed errorline">{error}</p>}
              {confirmed && (
                <p className="confirmed">
                  logged{confirmed.source === "local" ? " on this browser" : ""} — your action{" "}
                  <b>#{confirmed.rank.toLocaleString()}</b>. thank you for adding your voice. tell a
                  friend and the count climbs.
                </p>
              )}
            </div>
          </div>
        </div>

        <details className="secondary">
          <summary>why this recommendation</summary>
          <div className="secondarybody">
            <p className="rv">
              This recommendation uses the current OII state action pack, official state links, and
              public AI-legislation snapshot. The public path stays simple: copy the message, send
              it through the official page above, and use the receipts here only if you want to
              verify the recommendation.
            </p>
            {aiSnapshot && (
              <p className="rv">
                NCSL lists <b>{aiSnapshot.totalBills}</b> AI-related bills for {s.name} in its
                2025-present tracker, checked {aiSnapshot.checkedAt}.{" "}
                {aiSnapshot.activeBills > 0 ? (
                  <>
                    <b>{aiSnapshot.activeBills}</b> are still marked pending or to governor.
                  </>
                ) : (
                  <>None are currently marked pending or to governor.</>
                )}{" "}
                <a href={aiSnapshot.sourceUrl} rel="noreferrer" target="_blank">
                  Source
                </a>
                .
              </p>
            )}
          </div>
        </details>

        <details className="secondary">
          <summary>sources and official links</summary>
          <div className="secondarybody">
            <p className="rk">more ways to contact officials</p>
            <div className="linkgrid">
              {s.contacts.map((contact) => (
                <a
                  className="sourcelink"
                  href={contact.url}
                  key={contact.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <b>{displayLinkLabel(contact.label)}</b>
                  <span>{displayLinkNote(contact.label, contact.note)}</span>
                </a>
              ))}
            </div>
            <p className="rk" style={{ marginTop: 16 }}>
              provenance — sources behind this recommendation
            </p>
            <div className="sourcegrid">
              {s.sources.map((source) =>
                source.url ? (
                  <a
                    className="sourcelink"
                    href={source.url}
                  key={source.label}
                  rel="noreferrer"
                  target="_blank"
                >
                    <b>{displayLinkLabel(source.label)}</b>
                    <span>{displayLinkNote(source.label, source.note)}</span>
                  </a>
                ) : (
                  <div className="sourcelink" key={source.label}>
                    <b>{displayLinkLabel(source.label)}</b>
                    <span>{displayLinkNote(source.label, source.note)}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}

function displayLinkLabel(label: string) {
  if (/check current AI bills/i.test(label)) {
    return "NCSL AI legislation tracker";
  }
  if (/search|bill status|bills?/i.test(label)) {
    return "Official legislative source";
  }
  return label;
}

function displayLinkNote(label: string, note: string) {
  if (/search|bill status|bills?/i.test(`${label} ${note}`)) {
    return "Used by OII to verify state policy context. You do not need this to take the action.";
  }
  return note;
}
