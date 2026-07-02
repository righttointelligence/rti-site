export type ActionKind = "call" | "voicemail" | "email_fallback";

export type ActionLogResult = {
  rank: number;
  total: number;
  source: "api" | "local";
};

export type Lawmaker = {
  id: string;
  name: string;
  chamber: "upper" | "lower";
  chamberName: string;
  district: string;
  party?: string;
  phone?: string;
  email?: string;
  url?: string;
};

function logLocalAction(): ActionLogResult {
  const key = "rti:local-action-count";
  const next = Number.parseInt(window.localStorage.getItem(key) ?? "0", 10) + 1;
  window.localStorage.setItem(key, String(next));
  return { rank: next, total: next, source: "local" };
}

export async function logAction(stateKey: string, actionKind: ActionKind): Promise<ActionLogResult> {
  try {
    const res = await fetch("/api/actions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ stateKey, actionKind }),
    });
    if (!res.ok) throw new Error(`log failed: ${res.status}`);
    const body = (await res.json()) as { rank?: unknown; total?: unknown };
    if (typeof body.rank !== "number" || typeof body.total !== "number") {
      throw new Error("log response missing count");
    }
    return { rank: body.rank, total: body.total, source: "api" };
  } catch {
    return logLocalAction();
  }
}

export async function lookupLawmakers(
  stateKey: string,
  latitude: number,
  longitude: number,
): Promise<Lawmaker[]> {
  const res = await fetch("/api/lawmakers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ stateKey, latitude, longitude }),
  });
  const body = (await res.json().catch(() => null)) as
    | { lawmakers?: unknown; error?: unknown }
    | null;

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("worker_not_running");
    }
    const code = typeof body?.error === "string" ? body.error : "lookup_failed";
    throw new Error(code);
  }
  if (!Array.isArray(body?.lawmakers)) {
    throw new Error("lookup_failed");
  }
  return body.lawmakers.filter(isLawmaker);
}

function isLawmaker(value: unknown): value is Lawmaker {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    (record.chamber === "upper" || record.chamber === "lower") &&
    typeof record.chamberName === "string" &&
    typeof record.district === "string"
  );
}
