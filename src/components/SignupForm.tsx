import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevIcon } from "./icons";
import { STATE_OPTIONS } from "../data/states";
import { slugForAbbr } from "../lib/stateSlug";
import { submitSignup } from "../lib/signup";

// The hero's primary action: join the movement with email + state (+ optional
// zip). On success it becomes the bridge to the harder, higher-impact action —
// calling your state office — routed to the caller's own state page.
export default function SignupForm({ onTotal }: { onTotal?: (total: number) => void }) {
  const [email, setEmail] = useState("");
  const [stateKey, setStateKey] = useState("");
  const [zip, setZip] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Enter a real email address.");
      return;
    }
    if (!stateKey) {
      setError("Choose your state so your signup counts where you live.");
      return;
    }
    if (zip.trim() !== "" && !/^\d{5}(-\d{4})?$/.test(zip.trim())) {
      setError("Zip looks off — 5 digits, or leave it blank.");
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
      setDone(true);
    } catch {
      setError("Something broke on our end. Try again in a minute.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="signupdone" role="status">
        <p className="signupdonehead">You're in. ✓</p>
        <p className="signupdonebody">
          Signatures show interest. <b>Calls change votes.</b> Your state office is a two-minute
          call with a ready script.
        </p>
        <Link className="cta signupdonecta" to={`/action/${slugForAbbr(stateKey)}`}>
          Make the call →
        </Link>
      </div>
    );
  }

  return (
    <form className="signup" onSubmit={submit}>
      <div className="signuprow">
        <input
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
        <div className="picker signupstate">
          <select
            aria-label="Your state"
            value={stateKey}
            onChange={(e) => setStateKey(e.target.value)}
            required
          >
            <option value="">Your state</option>
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
        {busy ? "Signing…" : "Sign to protect local AI →"}
      </button>
      {error && <p className="signuperror">{error}</p>}
      <p className="signupnote">
        Email + state only. No name, no address, no spam — action alerts for your state, nothing
        else.{" "}
        <a className="actlink" href="#start">
          Just want to call? →
        </a>
      </p>
    </form>
  );
}
