import { useState } from "react";
import { STATE_AI_SNAPSHOTS } from "../data/state-ai-snapshots";
import { STATES } from "../data/states";
import { derivePrimaryAction } from "../lib/recommendation";
import { lookupLawmakers, type ActionKind, type ActionLogResult, type Lawmaker } from "../lib/actions";

type LookupStatus = "idle" | "locating" | "loading" | "ready" | "failed";

// The result panel: one recommended call action, one exact ask, one short
// call script, one official lookup, and a call/voicemail/email-fallback loop.
// Counts, provenance, and extra contacts live in a collapsed secondary layer.
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
  const [confirmedKind, setConfirmedKind] = useState<ActionKind | null>(null);
  const [logging, setLogging] = useState<ActionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lawmakers, setLawmakers] = useState<Lawmaker[]>([]);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  if (!s) return null;

  const action = derivePrimaryAction(s, aiSnapshot);
  const callScript = lawmakers.length > 0 ? exactConstituentScript() : action.script;

  const copy = () => {
    navigator.clipboard?.writeText(callScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const findExactLawmakers = () => {
    if (lookupStatus === "locating" || lookupStatus === "loading") return;
    setLookupError(null);

    if (!navigator.geolocation) {
      setLookupStatus("failed");
      setLookupError("This browser cannot share location. Use the official lookup instead.");
      return;
    }

    setLookupStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLookupStatus("loading");
        lookupLawmakers(stateKey, position.coords.latitude, position.coords.longitude)
          .then((result) => {
            setLawmakers(result);
            setLookupStatus("ready");
            if (result.length === 0) {
              setLookupError("No exact state lawmakers came back. Use the official lookup instead.");
            }
          })
          .catch((lookupFailure: unknown) => {
            setLookupStatus("failed");
            setLookupError(lookupErrorMessage(lookupFailure));
          });
      },
      (geoError) => {
        setLookupStatus("failed");
        setLookupError(geoErrorMessage(geoError));
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  };

  const confirm = async (kind: ActionKind) => {
    if (confirmed || logging) return;
    setError(null);
    setLogging(kind);
    try {
      setConfirmed(await onConfirm(kind));
      setConfirmedKind(kind);
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
              <p className="rk">1 / find exact offices</p>
              <button
                className="targetbtn"
                disabled={lookupStatus === "locating" || lookupStatus === "loading"}
                onClick={findExactLawmakers}
                type="button"
              >
                {lookupButtonLabel(lookupStatus)}
              </button>
              {" "}
              <a className="targetbtn" href={action.targetUrl} rel="noreferrer" target="_blank">
                Open official lookup →
              </a>
              {lawmakers.length > 0 && (
                <div className="linkgrid">
                  {lawmakers.map((lawmaker) => (
                    <a
                      className="sourcelink"
                      href={
                        lawmaker.phone ? `tel:${phoneHref(lawmaker.phone)}` : lawmaker.url ?? action.targetUrl
                      }
                      key={`${lawmaker.id}-${lawmaker.chamber}`}
                      rel={lawmaker.phone ? undefined : "noreferrer"}
                      target={lawmaker.phone ? undefined : "_blank"}
                    >
                      <b>{lawmaker.phone ? `Call ${lawmaker.name}` : lawmaker.name}</b>
                      <span>
                        {lawmaker.chamberName}
                        {lawmaker.district ? ` district ${lawmaker.district}` : ""}
                        {lawmaker.phone ? ` · ${lawmaker.phone}` : " · official page"}
                      </span>
                    </a>
                  ))}
                </div>
              )}
              {lookupError && <p className="rnote errorline">{lookupError}</p>}
              <p className="rnote">
                Your browser asks first. RTI uses your location once to find public state
                lawmakers and does not save it. If location fails or you prefer not to share it, use
                the official lookup button.
              </p>
            </div>
            <div className="rblock">
              <p className="rk">2 / say this on the call</p>
              <div className="script">
                <button className={`copy${copied ? " done" : ""}`} onClick={copy}>
                  {copied ? "copied ✓" : "copy"}
                </button>
                <span>{callScript}</span>
              </div>
              <p className="rnote">
                Use this as a call script, not a copy-paste blast. If the office is closed, leave it
                as a voicemail. If exact offices do not load, use the official lookup link above.
              </p>
            </div>
            <div className="rblock">
              <p className="rk">3 / log what happened</p>
              <div className="confirm">
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm("call")}
                >
                  {logging === "call" ? "logging..." : "✓ I called"}
                </button>
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm("voicemail")}
                >
                  {logging === "voicemail" ? "logging..." : "✓ I left voicemail"}
                </button>
                <button
                  className="confirmbtn"
                  disabled={Boolean(confirmed || logging)}
                  onClick={() => void confirm("email_fallback")}
                >
                  {logging === "email_fallback" ? "logging..." : "✓ I used email fallback"}
                </button>
              </div>
              <p className="rnote">
                Calls are the default. Voicemail still counts. Email/contact form is the fallback if
                you cannot call.
              </p>
              {error && <p className="confirmed errorline">{error}</p>}
              {confirmed && (
                <p className="confirmed">
                  logged {actionKindLabel(confirmedKind)}
                  {confirmed.source === "local" ? " on this browser" : ""} — your action{" "}
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
              This recommendation uses the current RTI state action pack, official state links, and
              public AI-legislation snapshot. The public path stays simple: find the official office,
              make the call, and use the receipts here only if you want to verify the recommendation.
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
    return "Used by RTI to verify state policy context. You do not need this to take the action.";
  }
  return note;
}

function actionKindLabel(kind: ActionKind | null) {
  if (kind === "call") return "call";
  if (kind === "voicemail") return "voicemail";
  if (kind === "email_fallback") return "email fallback";
  return "action";
}

function lookupButtonLabel(status: LookupStatus) {
  if (status === "locating") return "asking browser...";
  if (status === "loading") return "finding lawmakers...";
  if (status === "ready") return "Exact offices found";
  return "Use my location →";
}

function geoErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) {
    return "Location was not shared. Use the official lookup instead.";
  }
  if (error.code === error.TIMEOUT) {
    return "Location took too long. Try again or use the official lookup instead.";
  }
  return "Could not get location. Use the official lookup instead.";
}

function lookupErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "worker_not_running") {
    return "Exact lookup runs through the Cloudflare Worker, so this Vite preview cannot call it. Use the official lookup for now.";
  }
  if (message === "no_state_lawmakers_found") {
    return "No exact state lawmakers came back. Use the official lookup instead.";
  }
  return "Could not find exact offices yet. Use the official lookup instead.";
}

function exactConstituentScript() {
  return `Hi, I live in your district. I'm calling as a constituent to ask the member to protect lawful local and open-source AI.\n\nPeople should not need a license or platform approval just to run an open model on their own computer. Please support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.\n\nCan you tell me where the member stands on licensing local AI?`;
}

function phoneHref(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}
