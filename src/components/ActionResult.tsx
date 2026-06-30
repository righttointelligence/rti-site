import { useState } from "react";
import { STATE_AI_SNAPSHOTS } from "../data/state-ai-snapshots";
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
  const aiSnapshot = STATE_AI_SNAPSHOTS[stateKey];
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState<ActionLogResult | null>(null);
  const [logging, setLogging] = useState<ActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  if (!s) return null;

  const routingGuidance = aiSnapshot
    ? getRoutingGuidance(s.name, aiSnapshot.activeBills, aiSnapshot.enactedBills)
    : null;

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
            <span className={`tag ${s.prio}`}>tier {s.tier}</span>
            <span className="tag review">{s.reviewStatus}</span>
          </div>
          <div className="rbody">
            <div className="rblock">
              <p className="rk">what is happening</p>
              <p className="rv">{s.first}</p>
            </div>
            {aiSnapshot && (
              <div className="rblock">
                <p className="rk">AI bill snapshot</p>
                <p className="rv">
                  NCSL lists <b>{aiSnapshot.totalBills}</b> AI-related bills for {s.name} in its
                  2025-present tracker, checked {aiSnapshot.checkedAt}.{" "}
                  {aiSnapshot.activeBills > 0 ? (
                    <>
                      <b>{aiSnapshot.activeBills}</b> are still marked pending or to governor. Open
                      the state bill search before contacting officials and ask for local/open AI
                      safe-harbor language in anything moving now.
                    </>
                  ) : (
                    <>
                      None are currently marked pending or to governor. The useful move is an
                      affirmative safe-harbor ask before the next AI bill is written.
                    </>
                  )}{" "}
                  <a href={aiSnapshot.sourceUrl} rel="noreferrer" target="_blank">
                    Source
                  </a>
                  .
                </p>
              </div>
            )}
            {routingGuidance && (
              <div className="rblock">
                <p className="rk">what this means</p>
                <p className="rv">{routingGuidance}</p>
              </div>
            )}
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
              <p className="rk">who to contact</p>
              <div className="linkgrid">
                {s.contacts.map((contact) => (
                  <a
                    className="sourcelink"
                    href={contact.url}
                    key={contact.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <b>{contact.label}</b>
                    <span>{contact.note}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="rblock">
              <p className="rk">provenance</p>
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
                      <b>{source.label}</b>
                      <span>{source.note}</span>
                    </a>
                  ) : (
                    <div className="sourcelink" key={source.label}>
                      <b>{source.label}</b>
                      <span>{source.note}</span>
                    </div>
                  ),
                )}
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
                  logged{confirmed.source === "local" ? " on this browser" : ""} — your action{" "}
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

function getRoutingGuidance(stateName: string, activeBills: number, enactedBills: number) {
  if (activeBills >= 50) {
    return `${stateName} is a high-volume AI bill state. Do not try to read everything first. Start with the official bill search, search "artificial intelligence" and "automated decision", then send the safe-harbor ask to your own state legislators and any committee office attached to a moving bill.`;
  }

  if (activeBills >= 10) {
    return `${stateName} has enough active AI bills that timing matters. Check the official bill search first, then ask your state legislators to add local/open AI safe-harbor language before the bill text hardens.`;
  }

  if (activeBills > 0) {
    return `${stateName} has a smaller active AI queue. Open the official bill search, look at the active AI bills, and ask the sponsor or your own legislator to protect lawful local model ownership, research, and execution.`;
  }

  if (enactedBills > 0) {
    return `${stateName} has already enacted some AI-related law in the tracker. The useful move is implementation pressure: ask legislators, the governor, and the attorney general to keep lawful local/open AI outside licensing or preclearance rules.`;
  }

  return `${stateName} is a pre-legislation state for this issue. That is still useful. Ask your legislators to introduce an affirmative Local AI Freedom safe harbor before the first broad AI bill is written.`;
}
