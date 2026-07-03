// Invisible Turnstile token acquisition. Loads Cloudflare's script on first
// use, renders an invisible widget off-screen, resolves with a one-time token
// for the worker to verify (TURNSTILE_SECRET side). With no site key set the
// whole thing is a no-op — the worker only enforces when its secret exists,
// so the two sides can ship independently.
//
// SITE KEY IS PUBLIC by design (it's in every page's HTML on any Turnstile
// site). The secret lives only in the worker.
const SITE_KEY: string =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ??
  "0x4AAAAAADvCriR3naE2Rbak"; // rti signup widget — public by design

type TurnstileApi = {
  render(
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "error-callback"?: () => void;
      "expired-callback"?: () => void;
    },
  ): string;
  remove(id: string): void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile_script_failed"));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * Get a fresh Turnstile token, or undefined when Turnstile is not configured
 * or unavailable (offline dev, blocked script). The worker decides whether a
 * missing token is fatal.
 */
export async function getTurnstileToken(): Promise<string | undefined> {
  if (!SITE_KEY) return undefined;
  try {
    await loadScript();
    const turnstile = window.turnstile;
    if (!turnstile) return undefined;
    return await new Promise<string | undefined>((resolve) => {
      const host = document.createElement("div");
      host.style.position = "fixed";
      host.style.left = "-9999px";
      host.style.bottom = "0";
      document.body.appendChild(host);
      let widgetId: string | null = null;
      let settled = false;
      const finish = (token: string | undefined) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        try {
          if (widgetId !== null) turnstile.remove(widgetId);
        } catch {
          /* already gone */
        }
        host.remove();
        resolve(token);
      };
      // Invisible mode solves in ~1s; 12s guards a hung challenge without
      // stranding the signer.
      const timer = window.setTimeout(() => finish(undefined), 12_000);
      try {
        widgetId = turnstile.render(host, {
          sitekey: SITE_KEY,
          callback: (token) => finish(token),
          "error-callback": () => finish(undefined),
        });
      } catch {
        finish(undefined);
      }
    });
  } catch {
    return undefined;
  }
}
