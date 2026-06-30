export type ActionKind = "call" | "email";

export type ActionLogResult = {
  rank: number;
  total: number;
  source: "api" | "local";
};

function logLocalAction(): ActionLogResult {
  const key = "oii:local-action-count";
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
