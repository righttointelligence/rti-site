// Signup + live count client. Mirrors the local-fallback pattern in actions.ts
// so Vite-only dev (no worker) still exercises the UX.

export type SignupResult = {
  total: number;
  source: "api" | "local";
};

const LOCAL_KEY = "rti:local-signup-count";
const SIGNED_KEY = "rti:signed";
const ZIP_KEY = "rti:zip";

// The zip someone volunteered at signup, remembered on-device only, so the
// call page can find their exact offices without asking for location.
export function savedZip(): string | null {
  try {
    const zip = window.localStorage.getItem(ZIP_KEY);
    return zip && /^\d{5}$/.test(zip) ? zip : null;
  } catch {
    return null;
  }
}

export function saveZip(zip: string): void {
  try {
    window.localStorage.setItem(ZIP_KEY, zip.slice(0, 5));
  } catch {
    /* private mode — the call page just falls back to location */
  }
}

// Remembered per-browser so we only ask people to sign once, wherever they
// entered the funnel (hero stepper or action page).
export function hasSigned(): boolean {
  try {
    return window.localStorage.getItem(SIGNED_KEY) === "1";
  } catch {
    return false;
  }
}

function markSigned(): void {
  try {
    window.localStorage.setItem(SIGNED_KEY, "1");
  } catch {
    /* private mode — the worst case is we ask again */
  }
}

function localSignup(): SignupResult {
  const next = Number.parseInt(window.localStorage.getItem(LOCAL_KEY) ?? "0", 10) + 1;
  window.localStorage.setItem(LOCAL_KEY, String(next));
  return { total: next, source: "local" };
}

export async function submitSignup(input: {
  email: string;
  stateKey?: string; // US path
  country?: string; // international path (ISO alpha-2)
  zip?: string;
  website?: string; // honeypot passthrough
}): Promise<SignupResult> {
  try {
    const res = await fetch("/api/signups", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => null)) as
      | { ok?: unknown; total?: unknown; error?: unknown }
      | null;
    if (!res.ok) {
      if (res.status === 404) return localSignup(); // Vite-only dev
      throw new Error(typeof body?.error === "string" ? body.error : "signup_failed");
    }
    if (typeof body?.total !== "number") throw new Error("signup_failed");
    markSigned();
    return { total: body.total, source: "api" };
  } catch (error) {
    if (error instanceof TypeError) return localSignup(); // network-less dev
    throw error;
  }
}

export async function fetchCount(): Promise<number | null> {
  try {
    const res = await fetch("/api/count");
    if (!res.ok) return null;
    const body = (await res.json().catch(() => null)) as { total?: unknown } | null;
    return typeof body?.total === "number" ? body.total : null;
  } catch {
    return null;
  }
}
