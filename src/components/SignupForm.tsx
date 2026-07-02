import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevIcon } from "./icons";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";
import { submitSignup } from "../lib/signup";

// The hero's primary action, one step at a time: a single button, then your
// email, then your state, then the bridge to the call. Each step is one ask.
type Step = "cta" | "email" | "state" | "done";

export default function SignupForm({ onTotal }: { onTotal?: (total: number) => void }) {
  const [step, setStep] = useState<Step>("cta");
  const [email, setEmail] = useState("");
  const [stateKey, setStateKey] = useState("");
  const [zip, setZip] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
  }, [step]);

  const nextFromEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("That email doesn't look right — double check it?");
      return;
    }
    setStep("state");
  };

  const finish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!stateKey) {
      setError("Pick your state — it's where your signature counts.");
      return;
    }
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
      onTotal?.(result.total);
      setStep("done");
    } catch {
      setError("Something broke on our end. Give it a minute and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (step === "cta") {
    return (
      <div className="signup">
        <button className="cta signupcta" type="button" onClick={() => setStep("email")}>
          Sign to protect local AI →
        </button>
        <p className="signupnote">
          Ten seconds. Email + your state, nothing else.{" "}
          <a className="actlink" href="#start">
            Just want to call? →
          </a>
        </p>
      </div>
    );
  }

  if (step === "email") {
    return (
      <form className="signup" onSubmit={nextFromEmail}>
        <p className="idx signupidx">01 / your email</p>
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
          <button className="cta signupnext" type="submit">
            Next →
          </button>
        </div>
        {error && <p className="signuperror">{error}</p>}
        <p className="signupnote">
          No spam, ever. Just a heads-up when your state needs you.
        </p>
      </form>
    );
  }

  if (step === "state") {
    return (
      <form className="signup" onSubmit={finish}>
        <p className="idx signupidx">02 / your state</p>
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
          <input
            className="signupinput signupzip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Zip (optional)"
            aria-label="Zip code (optional)"
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
          {busy ? "Signing…" : "Count me in →"}
        </button>
        {error && <p className="signuperror">{error}</p>}
        <p className="signupnote">
          <button type="button" className="signupback" onClick={() => setStep("email")}>
            ← back
          </button>
          Your state is where your signature counts. Zip just sharpens it — optional.
        </p>
      </form>
    );
  }

  return (
    <div className="signupdone" role="status">
      <p className="signupdonehead">You're in. ✓</p>
      <p className="signupdonebody">
        Your signature just joined the count. Now the move that actually flips votes:{" "}
        <b>a two-minute call to your state office.</b> We already wrote the script — you just read
        it.
      </p>
      <Link className="cta signupdonecta" to={`/action/${slugForAbbr(stateKey)}`}>
        Make the call →
      </Link>
    </div>
  );
}
