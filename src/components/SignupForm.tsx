import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevIcon } from "./icons";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";
import { saveZip, submitSignup } from "../lib/signup";

// The hero's primary action. The CTA stays put in the hero; tapping it opens a
// focused modal — dimmed page behind, one ask per step: email, state, then an
// optional zip, then the bridge to the call.
type Step = "email" | "state" | "zip" | "done";

export default function SignupForm({ onTotal }: { onTotal?: (total: number) => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [stateKey, setStateKey] = useState("");
  const [zip, setZip] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    if (open && step === "email") emailRef.current?.focus();
  }, [open, step]);

  // lock page scroll + close on Esc while the modal is up. iOS Safari ignores
  // overflow:hidden on body, so freeze the body in place with position:fixed
  // and restore the scroll position on close.
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const b = document.body.style;
    const prev = { position: b.position, top: b.top, left: b.left, right: b.right, overflow: b.overflow };
    b.position = "fixed";
    b.top = `-${y}px`;
    b.left = "0";
    b.right = "0";
    b.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stepRef.current !== "done") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      b.position = prev.position;
      b.top = prev.top;
      b.left = prev.left;
      b.right = prev.right;
      b.overflow = prev.overflow;
      window.scrollTo(0, y);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // iOS: the keyboard shrinks the *visual* viewport but position:fixed tracks
  // the layout viewport. The dim must stay full-screen, so never resize the
  // overlay — instead pad it to match the visible area so the centered card
  // rides above the keyboard while everything behind stays dimmed.
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const el = overlayRef.current;
      if (!el) return;
      const below = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.paddingTop = `${Math.max(14, vv.offsetTop + 14)}px`;
      el.style.paddingBottom = `${below + 14}px`;
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, [open]);

  const launch = () => {
    setError(null);
    if (step !== "done") setStep("email");
    setOpen(true);
  };

  const nextFromEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("That email doesn't look right — double check it?");
      return;
    }
    setStep("state");
  };

  const nextFromState = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stateKey) {
      setError("Pick your state — it's where your signature counts.");
      return;
    }
    setStep("zip");
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (zip.trim() !== "" && !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
      setError("Zip looks off — 5 digits, or just leave it blank.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitSignup({
        email: email.trim(),
        stateKey,
        zip: zip.trim() || undefined,
        website,
      });
      if (zip.trim()) saveZip(zip.trim());
      onTotal?.(result.total);
      setStep("done");
    } catch {
      setError("Something broke on our end. Give it a minute and try again.");
    } finally {
      setBusy(false);
    }
  };

  const modal =
    open &&
    createPortal(
      <div
        ref={overlayRef}
        className="sgoverlay"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && step !== "done") setOpen(false);
        }}
      >
        <div className="sgmodal" role="dialog" aria-modal="true" aria-label="Sign to protect local AI">
          {step !== "done" && (
            <button
              className="sgclose"
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          )}

          {step === "email" && (
            <form className="signup sgbody" onSubmit={nextFromEmail}>
              <p className="idx signupidx">01 / your email</p>
              <p className="sghead">Add your name to the count.</p>
              <div className="signuprow">
                <input
                  ref={emailRef}
                  className="signupinput"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  aria-label="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="cta signupcta" type="submit">
                Next →
              </button>
              {error && <p className="signuperror">{error}</p>}
              <p className="signupnote">
                No spam, ever. Just a heads-up when your state needs you. Never sold, never
                shared —{" "}
                <Link className="actlink" to="/privacy" target="_blank">
                  how we handle your info →
                </Link>
              </p>
            </form>
          )}

          {step === "state" && (
            <form className="signup sgbody" onSubmit={nextFromState}>
              <p className="idx signupidx">02 / your state</p>
              <p className="sghead">Where does your signature count?</p>
              <div className="signuprow">
                <div className="picker signupstate">
                  <select
                    aria-label="Your state"
                    value={stateKey}
                    onChange={(e) => setStateKey(e.target.value)}
                    autoFocus
                    required
                  >
                    <option value="">Pick your state</option>
                    {STATE_OPTIONS.map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="chev">
                    <ChevIcon />
                  </span>
                </div>
              </div>
              <button className="cta signupcta" type="submit">
                Next →
              </button>
              {error && <p className="signuperror">{error}</p>}
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setStep("email")}>
                  ← back
                </button>
                Your state is where your signature counts.
              </p>
            </form>
          )}

          {step === "zip" && (
            <form className="signup sgbody" onSubmit={finish}>
              <p className="idx signupidx">03 / your zip — optional</p>
              <p className="sghead">Want us to find your exact offices?</p>
              <div className="signuprow">
                <input
                  className="signupinput"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Zip (optional)"
                  aria-label="Zip code (optional)"
                  autoFocus
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
              {/* honeypot — visually hidden, tab-skipped; bots fill it, humans never see it */}
              <input
                className="signuptrap"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                name="website"
              />
              <button className="cta signupcta" type="submit" disabled={busy}>
                {busy ? "Signing…" : zip.trim() ? "Count me in →" : "Skip — count me in →"}
              </button>
              {error && <p className="signuperror">{error}</p>}
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setStep("state")}>
                  ← back
                </button>
                Zip lets us point you at your exact state offices if you choose to call. Stays on
                your device + your signature — never shared.
              </p>
            </form>
          )}

          {step === "done" && (
            <div className="signupdone sgdone" role="status">
              <p className="signupdonehead">You're in. ✓</p>
              <p className="signupdonebody">
                Your signature just joined the count. Now the move that actually flips votes:{" "}
                <b>a two-minute call to your state office.</b> We already wrote the script — you
                just read it.
              </p>
              <Link className="cta signupdonecta" to={`/action/${slugForAbbr(stateKey)}`}>
                Make the call →
              </Link>
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setOpen(false)}>
                  maybe later — close
                </button>
              </p>
            </div>
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="signup">
      <button className="cta signupcta" type="button" onClick={launch}>
        {step === "done" ? "You're in ✓ — make the call →" : "Sign to protect local AI →"}
      </button>
      <p className="signupnote">
        Ten seconds. Email + your state, nothing else.{" "}
        <a className="actlink" href="#start">
          Just want to call? →
        </a>
      </p>
      {modal}
    </div>
  );
}
