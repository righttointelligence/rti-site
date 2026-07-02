import { useState } from "react";
import { hasSigned, submitSignup } from "../lib/signup";

// Catches people who came straight to the call page (state picker, shared
// link) and skipped the hero signup. State is already known, so it's one
// field: email in, signature counted. Hidden forever once this browser signed.
export default function ActionSignup({ stateKey, stateName }: { stateKey: string; stateName: string }) {
  const [hidden] = useState(() => hasSigned());
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (hidden) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("That email doesn't look right — double check it?");
      return;
    }
    setBusy(true);
    try {
      await submitSignup({ email: email.trim(), stateKey, website });
      setDone(true);
    } catch {
      setError("Something broke on our end. Give it a minute and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="actsignup" role="status">
        <p className="actk">signature counted ✓</p>
        <p className="actnote">
          You're on the {stateName} count now. Every name makes the next meeting with a lawmaker
          heavier.
        </p>
      </div>
    );
  }

  return (
    <form className="actsignup" onSubmit={submit}>
      <p className="actk">haven't signed yet?</p>
      <p className="actsignuplede">
        Calls move votes, signatures prove numbers. Drop your email and you're counted with{" "}
        {stateName} — takes five seconds.
      </p>
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
        <button className="cta signupnext" type="submit" disabled={busy}>
          {busy ? "Signing…" : "Count me in →"}
        </button>
      </div>
      {/* honeypot — visually hidden; bots fill it, humans never see it */}
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
      {error && <p className="signuperror">{error}</p>}
      <p className="actnote">No spam, ever. Just a heads-up when {stateName} needs you.</p>
    </form>
  );
}
