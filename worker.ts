type Env = {
  ACTIONS_DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ACTION_COUNT_OFFSET?: string;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = unknown>(): Promise<T | null>;
};

const VALID_STATES = new Set(["CA", "CO", "TX", "OTHER"]);
const VALID_ACTIONS = new Set(["call", "email"]);

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init?.headers,
    },
  });
}

async function handleActionLog(request: Request, env: Env): Promise<Response> {
  let body: { stateKey?: unknown; actionKind?: unknown };
  try {
    body = (await request.json()) as { stateKey?: unknown; actionKind?: unknown };
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  const stateKey = typeof body.stateKey === "string" ? body.stateKey : "";
  const actionKind = typeof body.actionKind === "string" ? body.actionKind : "";
  if (!VALID_STATES.has(stateKey) || !VALID_ACTIONS.has(actionKind)) {
    return json({ error: "invalid_action" }, { status: 400 });
  }

  await env.ACTIONS_DB.prepare(
    "INSERT INTO actions (state_key, action_kind, created_at) VALUES (?, ?, datetime('now'))",
  )
    .bind(stateKey, actionKind)
    .run();

  const row = await env.ACTIONS_DB.prepare("SELECT COUNT(*) AS count FROM actions").first<{
    count: number;
  }>();
  const offset = Number.parseInt(env.ACTION_COUNT_OFFSET ?? "0", 10) || 0;
  const total = offset + (row?.count ?? 0);
  return json({ ok: true, rank: total, total });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/actions" && request.method === "POST") {
      return handleActionLog(request, env);
    }
    if (url.pathname === "/api/actions" && request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    return env.ASSETS.fetch(request);
  },
};
