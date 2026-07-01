type Env = {
  ACTIONS_DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  ACTION_COUNT_OFFSET?: string;
  OPENSTATES_API_KEY?: string;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = unknown>(): Promise<T | null>;
};

const VALID_STATES = new Set([
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
]);
const VALID_ACTIONS = new Set(["call", "voicemail", "email_fallback"]);

type Lawmaker = {
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

async function handleLawmakerLookup(request: Request, env: Env): Promise<Response> {
  if (!env.OPENSTATES_API_KEY) {
    return json({ error: "lookup_not_configured" }, { status: 503 });
  }

  let body: { stateKey?: unknown; latitude?: unknown; longitude?: unknown };
  try {
    body = (await request.json()) as {
      stateKey?: unknown;
      latitude?: unknown;
      longitude?: unknown;
    };
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  const stateKey = typeof body.stateKey === "string" ? body.stateKey : "";
  const latitude = typeof body.latitude === "number" ? body.latitude : Number.NaN;
  const longitude = typeof body.longitude === "number" ? body.longitude : Number.NaN;
  if (!VALID_STATES.has(stateKey) || !validCoordinate(latitude, -90, 90) || !validCoordinate(longitude, -180, 180)) {
    return json({ error: "invalid_location" }, { status: 400 });
  }

  const apiUrl = new URL("https://v3.openstates.org/people.geo");
  apiUrl.searchParams.set("lat", String(latitude));
  apiUrl.searchParams.set("lng", String(longitude));
  apiUrl.searchParams.append("include", "offices");
  apiUrl.searchParams.set("apikey", env.OPENSTATES_API_KEY);

  const response = await fetch(apiUrl, {
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    return json({ error: "lookup_failed" }, { status: 502 });
  }

  const data = (await response.json()) as { results?: unknown };
  const lawmakers = parseOpenStatesLawmakers(data, stateKey);
  if (lawmakers.length === 0) {
    return json({ error: "no_state_lawmakers_found" }, { status: 404 });
  }

  return json({ ok: true, lawmakers });
}

function validCoordinate(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function parseOpenStatesLawmakers(data: { results?: unknown }, stateKey: string): Lawmaker[] {
  if (!Array.isArray(data.results)) return [];

  const stateJurisdictionId = `ocd-jurisdiction/country:us/state:${stateKey.toLowerCase()}/government`;
  const lawmakers = new Map<string, Lawmaker>();
  for (const item of data.results) {
    if (!item || typeof item !== "object") continue;
    const result = item as { person?: unknown; current_role?: unknown; role?: unknown };
    const person = result.person && typeof result.person === "object" ? result.person : result;
    const role =
      result.current_role ??
      result.role ??
      (person && typeof person === "object"
        ? (person as Record<string, unknown>).current_role
        : undefined);
    if (!person || typeof person !== "object" || !role || typeof role !== "object") continue;

    const personRecord = person as Record<string, unknown>;
    const roleRecord = role as Record<string, unknown>;
    if (!isStateLegislativeRole(roleRecord, stateJurisdictionId, stateKey)) continue;

    const chamber = chamberValue(roleRecord);
    if (!chamber) continue;

    const id = stringValue(personRecord.id) ?? `${stringValue(personRecord.name) ?? "unknown"}-${chamber}`;
    if (lawmakers.has(`${id}-${chamber}`)) continue;

    const contactDetails = Array.isArray(personRecord.contact_details)
      ? personRecord.contact_details
      : Array.isArray(personRecord.contactDetails)
        ? personRecord.contactDetails
        : [];
    const offices = Array.isArray(personRecord.offices) ? personRecord.offices : [];
    const links = Array.isArray(personRecord.links) ? personRecord.links : [];

    lawmakers.set(`${id}-${chamber}`, {
      id,
      name: stringValue(personRecord.name) ?? "Unknown lawmaker",
      chamber,
      chamberName: chamberNameValue(roleRecord, chamber),
      district: stringValue(roleRecord.district) ?? stringValue(roleRecord.title) ?? "",
      party: stringValue(personRecord.party),
      phone: officePhoneValue(offices) ?? contactValue(contactDetails, "voice"),
      email: contactValue(contactDetails, "email"),
      url: stringValue(personRecord.openstates_url) ?? linkValue(links),
    });
  }

  return Array.from(lawmakers.values()).sort((a, b) => chamberRank(a) - chamberRank(b));
}

function isStateLegislativeRole(
  roleRecord: Record<string, unknown>,
  stateJurisdictionId: string,
  stateKey: string,
): boolean {
  const jurisdictionId = stringValue(roleRecord.jurisdiction_id);
  if (jurisdictionId) return jurisdictionId === stateJurisdictionId;

  const divisionId = stringValue(roleRecord.division_id) ?? stringValue(roleRecord.id);
  const statePrefix = `/state:${stateKey.toLowerCase()}/`;
  return Boolean(
    divisionId?.includes(statePrefix) &&
      (divisionId.includes("/sldu:") || divisionId.includes("/sldl:")),
  );
}

function chamberRank(lawmaker: Lawmaker): number {
  return lawmaker.chamber === "upper" ? 0 : 1;
}

function chamberValue(roleRecord: Record<string, unknown>): "upper" | "lower" | null {
  const classification = stringValue(roleRecord.org_classification) ?? stringValue(roleRecord.chamber);
  if (classification === "upper" || classification === "lower") return classification;
  const title = stringValue(roleRecord.title)?.toLowerCase() ?? "";
  if (title.includes("senator") || title.includes("senate")) return "upper";
  if (title.includes("representative") || title.includes("assembly") || title.includes("house")) {
    return "lower";
  }
  return null;
}

function chamberNameValue(roleRecord: Record<string, unknown>, chamber: "upper" | "lower"): string {
  const title = stringValue(roleRecord.title)?.toLowerCase() ?? "";
  if (chamber === "upper") return "State Senate";
  if (title.includes("assembly")) return "State Assembly";
  if (title.includes("delegate")) return "State House of Delegates";
  return "State House";
}

function contactValue(items: unknown[], type: string): string | undefined {
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (stringValue(record.type) === type) return stringValue(record.value);
  }
  return undefined;
}

function officePhoneValue(items: unknown[]): string | undefined {
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const value = stringValue(record.voice) ?? stringValue(record.phone);
    if (value) return value;
  }
  return undefined;
}

function linkValue(items: unknown[]): string | undefined {
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const value = stringValue((item as Record<string, unknown>).url);
    if (value) return value;
  }
  return undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
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
    if (url.pathname === "/api/lawmakers" && request.method === "POST") {
      return handleLawmakerLookup(request, env);
    }
    if (url.pathname === "/api/lawmakers" && request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    return env.ASSETS.fetch(request);
  },
};
