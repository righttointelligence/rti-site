import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevIcon } from "./icons";
import { COUNTRY_OPTIONS } from "../data/countries";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";
import { saveZip, submitSignup } from "../lib/signup";

// The signature flow, app-wide. SignupProvider owns the state machine and the
// modal (mounted once at App level), so any button on any page — hero CTA,
// endbeat CTA, the nav's Take Action — opens the same modal in place via
// useSignup().launch(). Steps: email, then place (a US/world toggle swaps the
// picker between state and country), then an optional zip for US signers,
// then the bridge to the call. After a signup the fresh total is broadcast as
// a "rti:total" window event so live counters update instantly.
type Step = "email" | "place" | "zip" | "done";

type SignupCtx = { launch: () => void; step: Step; stateKey: string };
const Ctx = createContext<SignupCtx | null>(null);

export function useSignup(): SignupCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSignup must be used inside SignupProvider");
  return ctx;
}

const broadcastTotal = (total: number) =>
  window.dispatchEvent(new CustomEvent("rti:total", { detail: total }));

export function SignupProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [stateKey, setStateKey] = useState("");
  const [countryKey, setCountryKey] = useState("");
  const [intl, setIntl] = useState(false);
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
    const page = window.location.pathname;
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
      // If the modal closed because a link navigated, the new page owns the
      // scroll position — restoring the old page's spot would drag it there.
      if (window.location.pathname === page) window.scrollTo(0, y);
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
    setStep("place");
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
      broadcastTotal(result.total);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error && err.message === "verification_failed"
          ? "Couldn't verify you're human — give it another try."
          : "Something broke on our end. Give it a minute and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  // International path: country picked, signature lands immediately — no zip
  // (zips are a US concept) and no call step (the scripts target US offices).
  const finishIntl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!countryKey) {
      setError("Pick your country — your signature counts globally.");
      return;
    }
    setBusy(true);
    try {
      const result = await submitSignup({
        email: email.trim(),
        country: countryKey,
        website,
      });
      broadcastTotal(result.total);
      setStateKey("");
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

          {step === "place" && (
            <form
              className="signup sgbody"
              onSubmit={(e) => {
                if (intl) {
                  void finishIntl(e);
                  return;
                }
                e.preventDefault();
                setError(null);
                if (!stateKey) {
                  setError("Pick your state — it's where your signature counts.");
                  return;
                }
                setStep("zip");
              }}
            >
              <p className="idx signupidx">02 / where are you?</p>
              <p className="sghead">Where does your signature count?</p>
              <div className="sgseg" role="tablist" aria-label="Where are you signing from?">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!intl}
                  className={`sgsegbtn${intl ? "" : " on"}`}
                  onClick={() => {
                    setIntl(false);
                    setError(null);
                  }}
                >
                  In the US
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={intl}
                  className={`sgsegbtn${intl ? " on" : ""}`}
                  onClick={() => {
                    setIntl(true);
                    setError(null);
                  }}
                >
                  Outside the US
                </button>
              </div>
              <div className="signuprow">
                {!intl ? (
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
                ) : (
                  <div className="picker signupstate">
                    <select
                      aria-label="Your country"
                      value={countryKey}
                      onChange={(e) => setCountryKey(e.target.value)}
                      autoFocus
                      required
                    >
                      <option value="">Pick your country</option>
                      {COUNTRY_OPTIONS.map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                    <span className="chev">
                      <ChevIcon />
                    </span>
                  </div>
                )}
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
                {busy ? "Signing…" : intl ? "Count me in →" : "Next →"}
              </button>
              {error && <p className="signuperror">{error}</p>}
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setStep("email")}>
                  ← back
                </button>
                {intl
                  ? "This fight is global — your signature joins the worldwide count."
                  : "Your state is where your signature counts."}
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
                <button type="button" className="signupback" onClick={() => setStep("place")}>
                  ← back
                </button>
                Zip lets us point you at your exact state offices if you choose to call. Stays on
                your device + your signature — never shared.
              </p>
            </form>
          )}

          {step === "done" && stateKey && (
            <div className="signupdone sgdone" role="status">
              <p className="signupdonehead">You're in. ✓</p>
              <p className="signupdonebody">
                Your signature just joined the count. Now the move that actually flips votes:{" "}
                <b>a two-minute call to your state office.</b> We already wrote the script — you
                just read it.
              </p>
              <Link
                className="cta signupdonecta"
                to={`/action/${slugForAbbr(stateKey)}`}
                onClick={() => setOpen(false)}
              >
                Make the call →
              </Link>
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setOpen(false)}>
                  maybe later — close
                </button>
              </p>
            </div>
          )}

          {step === "done" && !stateKey && (
            <div className="signupdone sgdone" role="status">
              <p className="signupdonehead">You're in. ✓</p>
              <p className="signupdonebody">
                Your signature just joined the worldwide count. The strongest thing you can do
                next: <b>send this to someone in the US</b> — their call to a state office is
                where the votes flip.
              </p>
              <Link className="cta signupdonecta" to="/stats" onClick={() => setOpen(false)}>
                Watch the count grow →
              </Link>
              <p className="signupnote">
                <button type="button" className="signupback" onClick={() => setOpen(false)}>
                  close
                </button>
              </p>
            </div>
          )}
        </div>
      </div>,
      document.body,
    );

  return (
    <Ctx.Provider value={{ launch, step, stateKey }}>
      {children}
      {modal}
    </Ctx.Provider>
  );
}

// The signature CTA block — drop it anywhere inside SignupProvider. Same
// button, same note, same shared state everywhere it appears.
export default function SignupForm() {
  const { launch, step, stateKey } = useSignup();
  return (
    <div className="signup">
      <button className="cta signupcta" type="button" onClick={launch}>
        {step !== "done"
          ? "Sign to protect local AI →"
          : stateKey
            ? "You're in ✓ — make the call →"
            : "You're in ✓ — signed worldwide"}
      </button>
      <p className="signupnote">
        Ten seconds. Email + your state, nothing else.{" "}
        <Link className="actlink" to="/#start">
          Just want to call? →
        </Link>
      </p>
    </div>
  );
}
