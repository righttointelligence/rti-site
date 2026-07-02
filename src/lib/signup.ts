// Signup + live count client. Mirrors the local-fallback pattern in actions.ts
// so Vite-only dev (no worker) still exercises the UX.

export type SignupResult = {
  total: number;
  source: "api" | "local";
};

const LOCAL_KEY = "rti:local-signup-count";

function localSignup(): SignupResult {
  const next = Number.parseInt(window.localStorage.getItem(LOCAL_KEY) ?? "0", 10) + 1;
  window.localStorage.setItem(LOCAL_KEY, String(next));
  return { total: next, source: "local" };
}

export async function submitSignup(input: {
  email: string;
  stateKey: string;
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
