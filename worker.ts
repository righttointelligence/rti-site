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

type Chamber = "upper" | "lower";

type BoundaryIndex = {
  scale: number;
  chambers: Record<Chamber, { districts: DistrictIndexEntry[] }>;
};

type DistrictIndexEntry = {
  district: string;
  name?: string;
  bbox: [number, number, number, number];
  assetPath: string;
};

type DistrictGeometry = {
  district: string;
  name?: string;
  bbox: [number, number, number, number];
  rings: number[][];
};

type DistrictMatch = {
  chamber: Chamber;
  district: string;
  name?: string;
};

type LegislatorDataset = {
  legislators: Array<{
    id: string;
    name: string;
    chamber: Chamber;
    district: string;
    party?: string;
    email?: string;
    phone?: string;
    links?: string[];
  }>;
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

  let lawmakers: Lawmaker[];
  try {
    lawmakers = await lookupOwnedLawmakers(request, env, stateKey, latitude, longitude);
  } catch {
    return json({ error: "local_lookup_failed" }, { status: 502 });
  }
  if (lawmakers.length === 0) {
    return json({ error: "no_state_lawmakers_found" }, { status: 404 });
  }

  return json({ ok: true, source: "owned-census-openstates-bulk", lawmakers });
}

function validCoordinate(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

async function lookupOwnedLawmakers(
  request: Request,
  env: Env,
  stateKey: string,
  latitude: number,
  longitude: number,
): Promise<Lawmaker[]> {
  const boundaries = await readAssetJson<BoundaryIndex>(
    request,
    env,
    `/civic-data/census/tiger2024/district-index/${stateKey}.json`,
  );
  const legislators = await readAssetJson<LegislatorDataset>(
    request,
    env,
    `/civic-data/openstates/legislators/current/${stateKey}.json`,
  );
  const x = Math.round(longitude * boundaries.scale);
  const y = Math.round(latitude * boundaries.scale);

  const districts = (
    await Promise.all(
      (["upper", "lower"] as const).map(async (chamber) => ({
        chamber,
        district: await findDistrict(request, env, boundaries.chambers[chamber]?.districts ?? [], x, y),
      })),
    )
  )
    .filter((match): match is { chamber: Chamber; district: Omit<DistrictMatch, "chamber"> } =>
      Boolean(match.district),
    )
    .map(({ chamber, district }) => ({ chamber, ...district }));

  const lawmakers: Lawmaker[] = [];
  for (const district of districts) {
    const matches = legislators.legislators.filter(
      (candidate) => candidate.chamber === district.chamber && districtMatches(candidate.district, district),
    );
    for (const legislator of matches) {
      lawmakers.push({
        id: legislator.id,
        name: legislator.name,
        chamber: district.chamber,
        chamberName: chamberNameFor(stateKey, district.chamber),
        district: legislator.district,
        party: legislator.party,
        phone: legislator.phone,
        email: legislator.email,
        url: legislator.links?.[0],
      });
    }
  }

  return lawmakers.sort((a, b) => chamberRank(a) - chamberRank(b));
}

async function readAssetJson<T>(request: Request, env: Env, path: string): Promise<T> {
  const url = new URL(path, request.url);
  const response = await env.ASSETS.fetch(new Request(url, { headers: { accept: "application/json" } }));
  if (!response.ok) throw new Error(`asset_lookup_failed:${path}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new Error(`asset_not_json:${path}`);
  return (await response.json()) as T;
}

async function findDistrict(
  request: Request,
  env: Env,
  districts: DistrictIndexEntry[],
  x: number,
  y: number,
): Promise<Omit<DistrictMatch, "chamber"> | null> {
  const candidates = districts.filter((district) => {
    const [minX, minY, maxX, maxY] = district.bbox;
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  });

  for (const candidate of candidates) {
    const district = await readAssetJson<DistrictGeometry>(request, env, candidate.assetPath);
    const [minX, minY, maxX, maxY] = district.bbox;
    if (x < minX || x > maxX || y < minY || y > maxY) continue;
    if (pointInDistrict(district, x, y)) {
      return {
        district: district.district,
        name: district.name ?? candidate.name,
      };
    }
  }
  return null;
}

function pointInDistrict(district: DistrictGeometry, x: number, y: number): boolean {
  let inside = false;
  for (const ring of district.rings) {
    if (pointInRing(ring, x, y)) inside = !inside;
  }
  return inside;
}

function pointInRing(ring: number[], x: number, y: number): boolean {
  let inside = false;
  for (let index = 0, previous = ring.length - 2; index < ring.length; previous = index, index += 2) {
    const xi = ring[index];
    const yi = ring[index + 1];
    const xj = ring[previous];
    const yj = ring[previous + 1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function normalizeDistrict(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^0+(?=[A-Z])/, "")
    .replace(/\b0+(\d+)\b/g, "$1")
    .replace(/^0+(?=\d$)/, "") || "0";
}

function districtMatches(legislatorDistrict: string, district: Omit<DistrictMatch, "chamber">): boolean {
  const targetKeys = districtKeys(district.district, district.name);
  return legislatorDistrictKeys(legislatorDistrict).some((key) => targetKeys.has(key));
}

function districtKeys(...values: Array<string | undefined>): Set<string> {
  const keys = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    for (const alias of districtAliases(value)) keys.add(canonicalDistrictKey(alias));
  }
  return keys;
}

function legislatorDistrictKeys(value: string): string[] {
  const normalized = normalizeDistrict(value);
  const keys = [canonicalDistrictKey(normalized)];
  const subdistrict = normalized.match(/^(\d+)[A-Z]$/);
  if (subdistrict) keys.push(canonicalDistrictKey(subdistrict[1]));
  return keys;
}

function districtAliases(value: string): string[] {
  const normalized = normalizeDistrict(value);
  const aliases = [normalized];
  aliases.push(
    normalized
      .replace(/^STATE SENATE DISTRICT\s+/, "")
      .replace(/^STATE HOUSE DISTRICT\s+/, "")
      .replace(/^ASSEMBLY DISTRICT\s+/, "")
      .replace(/^DELEGATE DISTRICT\s+/, "")
      .replace(/^STATE LEGISLATIVE SUBDISTRICT\s+/, "")
      .replace(/^STATE LEGISLATIVE DISTRICT\s+/, "")
      .replace(/\s+SENATORIAL DISTRICT$/, "")
      .replace(/\s+STATE HOUSE DISTRICT$/, "")
      .replace(/\s+DISTRICT$/, ""),
  );
  return aliases;
}

function canonicalDistrictKey(value: string): string {
  return normalizeOrdinals(normalizeDistrict(value)).replace(/\bAND\b/g, "").replace(/[^A-Z0-9]/g, "");
}

function normalizeOrdinals(value: string): string {
  return value
    .replace(/\bFIRST\b/g, "1")
    .replace(/\bSECOND\b/g, "2")
    .replace(/\bTHIRD\b/g, "3")
    .replace(/\bFOURTH\b/g, "4")
    .replace(/\bFIFTH\b/g, "5")
    .replace(/\bSIXTH\b/g, "6")
    .replace(/\bSEVENTH\b/g, "7")
    .replace(/\bEIGHTH\b/g, "8")
    .replace(/\bNINTH\b/g, "9")
    .replace(/\bTENTH\b/g, "10")
    .replace(/\bELEVENTH\b/g, "11")
    .replace(/\bTWELFTH\b/g, "12")
    .replace(/\bTHIRTEENTH\b/g, "13")
    .replace(/\bFOURTEENTH\b/g, "14")
    .replace(/\bFIFTEENTH\b/g, "15")
    .replace(/\bSIXTEENTH\b/g, "16")
    .replace(/\bSEVENTEENTH\b/g, "17")
    .replace(/\bEIGHTEENTH\b/g, "18")
    .replace(/\bNINETEENTH\b/g, "19")
    .replace(/\bTWENTIETH\b/g, "20")
    .replace(/\b(\d+)(ST|ND|RD|TH)\b/g, "$1");
}

function chamberNameFor(stateKey: string, chamber: Chamber): string {
  if (stateKey === "NE") return "Nebraska Legislature";
  if (chamber === "upper") return "State Senate";
  if (["CA", "NV", "NJ", "NY", "WI"].includes(stateKey)) return "State Assembly";
  if (["MD", "VA", "WV"].includes(stateKey)) return "State House of Delegates";
  return "State House";
}

function chamberRank(lawmaker: Lawmaker): number {
  return lawmaker.chamber === "upper" ? 0 : 1;
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
