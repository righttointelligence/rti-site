import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { STATES } from "../data/states";
import { STATE_AI_SNAPSHOTS } from "../data/state-ai-snapshots";
import { derivePrimaryAction } from "../lib/recommendation";
import { abbrForSlug } from "../lib/stateSlug";
import {
  logAction,
  lookupLawmakers,
  type ActionKind,
  type ActionLogResult,
  type Lawmaker,
} from "../lib/actions";
import {
  fetchCivicDataFreshness,
  formatCivicDataFreshness,
  type CivicDataFreshness,
} from "../lib/civicDataFreshness";

type LookupStatus = "idle" | "locating" | "loading" | "ready" | "failed";

// The dedicated, full-screen, single-purpose action page. One state, one ask,
// one script, one place to call, one "I did it" log. Nothing else competes.
export default function Action() {
  const { slug = "" } = useParams();
  const abbr = abbrForSlug(slug);
  const state = abbr ? STATES[abbr] : undefined;

  const [copied, setCopied] = useState(false);
  const [logging, setLogging] = useState<ActionKind | null>(null);
  const [logged, setLogged] = useState<ActionLogResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lawmakers, setLawmakers] = useState<Lawmaker[]>([]);
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [freshness, setFreshness] = useState<CivicDataFreshness | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetchCivicDataFreshness()
      .then((nextFreshness) => {
        if (!cancelled) setFreshness(nextFreshness);
      })
      .catch(() => {
        if (!cancelled) setFreshness(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const action = useMemo(
    () => (state && abbr ? derivePrimaryAction(state, STATE_AI_SNAPSHOTS[abbr]) : null),
    [state, abbr],
  );

  if (!state || !action || !abbr) {
    return (
      <div className="actpage">
        <ActHeader />
        <main className="actmain">
          <p className="acteyebrow">→ not found</p>
          <h1 className="acttitle">Pick your state.</h1>
          <p className="actlede">
            We could not find that state. Head back and choose your state to get your action.
          </p>
          <Link className="targetbtn" to="/#top">
            Choose your state →
          </Link>
        </main>
      </div>
    );
  }

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
        lookupLawmakers(abbr, position.coords.latitude, position.coords.longitude)
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

  const log = async (kind: ActionKind) => {
    if (logged || logging) return;
    setError(null);
    setLogging(kind);
    try {
      setLogged(await logAction(abbr, kind));
    } catch {
      setError("Could not log this yet. Please try again.");
    } finally {
      setLogging(null);
    }
  };

  return (
    <div className="actpage">
      <ActHeader />

      <main className="actmain">
        <p className="acteyebrow">→ your action</p>
        <div className="actstateline">
          <h1 className="acttitle">{state.name}</h1>
          <span className="tag review">{state.reviewStatus}</span>
        </div>
        <p className="actlede">{action.headline}</p>

        <div className="acttrack">
        <div className="actstep actnode">
          <span className="actdot">1</span>
          <p className="actk">find exact offices</p>
          <button
            className="targetbtn"
            disabled={lookupStatus === "locating" || lookupStatus === "loading"}
            onClick={findExactLawmakers}
            type="button"
          >
            {lookupButtonLabel(lookupStatus)}
          </button>
          <p className="actfallback">
            <a className="actlink" href={action.targetUrl} rel="noreferrer" target="_blank">
              Prefer not to share location? Use the official {state.name} lookup →
            </a>
          </p>
          {lawmakers.length > 0 && (
            <div className="lawmakers">
              {lawmakers.map((lawmaker) => (
                <a
                  className="lawcard"
                  href={
                    lawmaker.phone
                      ? `tel:${phoneHref(lawmaker.phone)}`
                      : lawmaker.url ?? action.targetUrl
                  }
                  key={`${lawmaker.id}-${lawmaker.chamber}`}
                  rel={lawmaker.phone ? undefined : "noreferrer"}
                  target={lawmaker.phone ? undefined : "_blank"}
                >
                  <b className="lawname">{lawmaker.name}</b>
                  <span className="lawmeta">
                    {lawmaker.chamberName}
                    {lawmaker.district ? ` · district ${lawmaker.district}` : ""}
                  </span>
                  <span className="lawcall">
                    {lawmaker.phone ? `Call ${lawmaker.phone} →` : "Official page →"}
                  </span>
                </a>
              ))}
            </div>
          )}
          {lookupError && <p className="actnote errorline">{lookupError}</p>}
          <p className="actnote">
            Your browser asks first. RTI uses your location once to find public state lawmakers and
            does not save it.
          </p>
        </div>

        <div className="actstep actnode">
          <span className="actdot">2</span>
          <p className="actk">say this on the call</p>
          <div className="script">
            <button className={`copy${copied ? " done" : ""}`} onClick={copy}>
              {copied ? "copied ✓" : "copy"}
            </button>
            <span>{callScript}</span>
          </div>
          <p className="actnote">
            Use this as a call script, not a copy-paste blast. If the office is closed, leave it as a
            voicemail. If exact offices do not load, use the official lookup link above.
          </p>
        </div>

        <div className="actstep actnode">
          <span className="actdot">3</span>
          <p className="actk">mark it done</p>
          <div className="confirm">
            <button
              className="confirmbtn"
              disabled={Boolean(logged || logging)}
              onClick={() => void log("call")}
            >
              {logging === "call" ? "logging…" : "✓ I called"}
            </button>
            <button
              className="confirmbtn"
              disabled={Boolean(logged || logging)}
              onClick={() => void log("voicemail")}
            >
              {logging === "voicemail" ? "logging…" : "✓ I left a voicemail"}
            </button>
            <button
              className="confirmbtn"
              disabled={Boolean(logged || logging)}
              onClick={() => void log("email_fallback")}
            >
              {logging === "email_fallback" ? "logging…" : "✓ I used email"}
            </button>
          </div>
          {error && <p className="confirmed errorline">{error}</p>}
          {logged && (
            <p className="confirmed">
              logged{logged.source === "local" ? " on this browser" : ""} — your action{" "}
              <b>#{logged.rank.toLocaleString()}</b>. thank you for adding your voice. tell a friend
              and the count climbs.
            </p>
          )}
        </div>
        </div>

        <details className="secondary">
          <summary>why this recommendation + sources</summary>
          <div className="secondarybody">
            <p className="rv">{action.context}</p>
            <p className="actk" style={{ marginTop: 16 }}>the ask</p>
            <p className="rv">{action.ask}</p>
            <p className="actk" style={{ marginTop: 16 }}>official links + provenance</p>
            <div className="linkgrid">
              {state.contacts.map((c) => (
                <a className="sourcelink" href={c.url} key={c.label} rel="noreferrer" target="_blank">
                  <b>{c.label}</b>
                  <span>{c.note}</span>
                </a>
              ))}
            </div>
          </div>
        </details>

        <Link className="actback" to="/#top">
          ← change state
        </Link>
        {freshness && <p className="actnote datafreshness">{formatCivicDataFreshness(freshness)}</p>}
      </main>
    </div>
  );
}

function ActHeader() {
  return (
    <header className="actbar pad">
      <Link to="/" className="brandmini">
        <img className="glyph" src="/oii-logo.png" alt="" />
        <span>Right to Intelligence</span>
      </Link>
      <Link to="/#top" className="actbarlink">
        Change state
      </Link>
    </header>
  );
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
