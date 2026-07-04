import puppeteer from "@cloudflare/puppeteer";
import { COUNTRY_CODES } from "./src/data/countries";

type Env = {
  ACTIONS_DB: D1Database;
  ASSETS: { fetch(request: Request): Promise<Response> };
  // Cloudflare Browser Rendering binding — renders the live-count OG card.
  BROWSER: { fetch(request: Request): Promise<Response> };
  ACTION_COUNT_OFFSET?: string;
  // Optional Turnstile secret (wrangler secret put TURNSTILE_SECRET).
  // When present, /api/signups requires a valid Turnstile token.
  TURNSTILE_SECRET?: string;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
};

type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  first<T = unknown>(): Promise<T | null>;
  all<T = unknown>(): Promise<{ results?: T[] }>;
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
  let body: { stateKey?: unknown; actionKind?: unknown; turnstileToken?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  const stateKey = typeof body.stateKey === "string" ? body.stateKey : "";
  const actionKind = typeof body.actionKind === "string" ? body.actionKind : "";
  if (!VALID_STATES.has(stateKey) || !VALID_ACTIONS.has(actionKind)) {
    return json({ error: "invalid_action" }, { status: 400 });
  }

  // Same wall as signatures: a logged call only counts with a valid Turnstile
  // token — a raw script can't inflate the calls number either.
  if (env.TURNSTILE_SECRET) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const ip = clientIp(request);
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
      return json({ error: "verification_failed" }, { status: 403 });
    }
  }

  await env.ACTIONS_DB.batch([
    env.ACTIONS_DB.prepare(
      "INSERT INTO actions (state_key, action_kind, created_at) VALUES (?, ?, datetime('now'))",
    ).bind(stateKey, actionKind),
    bumpStmt(env).bind("actions", 1),
    bumpStmt(env).bind(`actions:${stateKey}`, 1),
  ]);

  const total = await countTotal(env);
  return json({ ok: true, rank: total, total });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP_RE = /^\d{5}(-\d{4})?$/;

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.set("secret", secret);
  form.set("response", token);
  if (ip) form.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return body?.success === true;
}

// ---------------------------------------------------------------------------
// O(1) counters. COUNT(*) scans the whole table in SQLite, which multiplied by
// live-counter polling burned millions of rows_read per day. Counts are
// maintained in the counters table at write time and read back in 1-2 rows.
// ---------------------------------------------------------------------------
function bumpStmt(env: Env) {
  return env.ACTIONS_DB.prepare(
    "INSERT INTO counters (key, n) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET n = n + ?2",
  );
}

async function readCounters(env: Env, keys: string[]): Promise<Map<string, number>> {
  const marks = keys.map(() => "?").join(",");
  const rows = await env.ACTIONS_DB.prepare(
    `SELECT key, n FROM counters WHERE key IN (${marks})`,
  )
    .bind(...keys)
    .all<{ key: string; n: number }>();
  return new Map((rows.results ?? []).map((r) => [r.key, r.n]));
}

async function countTotal(env: Env): Promise<number> {
  const c = await readCounters(env, ["signups", "actions"]);
  const offset = Number.parseInt(env.ACTION_COUNT_OFFSET ?? "0", 10) || 0;
  return offset + (c.get("signups") ?? 0) + (c.get("actions") ?? 0);
}

// Tiny per-isolate memory cache for the hot GET endpoints: a warm isolate
// serves every poller in its colo from memory and touches D1 once per TTL.
const memCache = new Map<string, { until: number; body: string }>();
async function cachedJson(
  key: string,
  ttlMs: number,
  make: () => Promise<Record<string, unknown>>,
  maxAge: number,
): Promise<Response> {
  const now = Date.now();
  const hit = memCache.get(key);
  const body = hit && hit.until > now ? hit.body : JSON.stringify(await make());
  if (!hit || hit.until <= now) memCache.set(key, { until: now + ttlMs, body });
  return new Response(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": `public, max-age=${maxAge}`,
    },
  });
}

async function handleSignup(request: Request, env: Env): Promise<Response> {
  let body: {
    email?: unknown;
    stateKey?: unknown;
    country?: unknown; // ISO alpha-2 for signers outside the US
    zip?: unknown;
    website?: unknown; // honeypot — humans never see this field
    turnstileToken?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: bots autofill hidden fields; drop silently with a fake success.
  if (typeof body.website === "string" && body.website.length > 0) {
    return json({ ok: true, total: await countTotal(env) });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const countryRaw = typeof body.country === "string" ? body.country.toUpperCase() : "";
  // A signer is either US (real state, optional zip) or international
  // (state_key 'INTL' + ISO country, no zip). Both count the same.
  const country = countryRaw && COUNTRY_CODES.has(countryRaw) ? countryRaw : null;
  const stateKey = country ? "INTL" : typeof body.stateKey === "string" ? body.stateKey : "";
  if (
    !EMAIL_RE.test(email) ||
    email.length > 254 ||
    (!country && !VALID_STATES.has(stateKey)) ||
    (countryRaw !== "" && !country)
  ) {
    return json({ error: "invalid_signup" }, { status: 400 });
  }
  const zipRaw = country ? "" : typeof body.zip === "string" ? body.zip.trim() : "";
  const zip = zipRaw === "" ? null : ZIP_RE.test(zipRaw) ? zipRaw : undefined;
  if (zip === undefined) {
    return json({ error: "invalid_zip" }, { status: 400 });
  }

  if (env.TURNSTILE_SECRET) {
    const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
    const ip = clientIp(request);
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET, token, ip))) {
      return json({ error: "verification_failed" }, { status: 403 });
    }
  }

  // One indexed row read tells us whether this is a fresh signature (bump the
  // counters) or a re-sign (keep totals honest — dedupe means no double count,
  // and a place change moves the signature between state/country counters).
  const existing = await env.ACTIONS_DB.prepare(
    "SELECT state_key, country FROM signups WHERE email = ?",
  )
    .bind(email)
    .first<{ state_key: string; country: string | null }>();

  const verifyToken = crypto.randomUUID();
  const upsert = env.ACTIONS_DB.prepare(
    `INSERT INTO signups (email, state_key, country, zip, verify_token, created_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))
     ON CONFLICT(email) DO UPDATE SET state_key = excluded.state_key,
       country = excluded.country,
       zip = COALESCE(excluded.zip, signups.zip)`,
  ).bind(email, stateKey, country, zip, verifyToken);

  // Per-place counter key: 'signups:CA' for US, 'country:FR' for international.
  const placeKey = country ? `country:${country}` : `signups:${stateKey}`;
  const priorKey = existing
    ? existing.country
      ? `country:${existing.country}`
      : `signups:${existing.state_key}`
    : null;

  const stmts = [upsert];
  if (!priorKey) {
    stmts.push(bumpStmt(env).bind("signups", 1), bumpStmt(env).bind(placeKey, 1));
  } else if (priorKey !== placeKey) {
    stmts.push(bumpStmt(env).bind(priorKey, -1), bumpStmt(env).bind(placeKey, 1));
  }
  await env.ACTIONS_DB.batch(stmts);

  return json({ ok: true, total: await countTotal(env) });
}

// Aggregate counts per state — what goes in front of a lawmaker:
// "this many of your constituents signed, this many picked up the phone."
// Aggregates only; no email or zip ever leaves the database.
async function handleStats(env: Env): Promise<Response> {
  // ≤ ~102 counter rows instead of scanning both full tables; memory-cached
  // 30s per isolate on top of that.
  return cachedJson(
    "stats",
    30_000,
    async () => {
      const rows = await env.ACTIONS_DB.prepare(
        "SELECT key, n FROM counters WHERE key LIKE 'signups:%' OR key LIKE 'actions:%' OR key LIKE 'country:%'",
      ).all<{ key: string; n: number }>();
      const states: Record<string, { signups: number; calls: number }> = {};
      const countries: Record<string, { signups: number }> = {};
      let totalSignups = 0;
      let totalCalls = 0;
      for (const row of rows.results ?? []) {
        const [kind, place] = row.key.split(":");
        if (kind === "country") {
          if (row.n > 0) countries[place] = { signups: row.n };
          totalSignups += row.n;
          continue;
        }
        if (place === "INTL") {
          // international bucket totals live under country:* — skip the alias
          continue;
        }
        const s = (states[place] ??= { signups: 0, calls: 0 });
        if (kind === "signups") {
          s.signups = row.n;
          totalSignups += row.n;
        } else {
          s.calls = row.n;
          totalCalls += row.n;
        }
      }
      return {
        ok: true,
        totals: { signups: totalSignups, calls: totalCalls },
        states,
        countries,
      };
    },
    30,
  );
}

async function handleCount(env: Env): Promise<Response> {
  // The homepage polls this every 10s per viewer. Memory cache means a warm
  // isolate answers everyone in its colo with a 2-row D1 read per 8s.
  return cachedJson("count", 8_000, async () => ({ ok: true, total: await countTotal(env) }), 8);
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

// ---------------------------------------------------------------------------
// Dynamic OG share image. The card leads with the live counter (the number IS
// the marketing), "Protect your right to run local AI." as the second line.
// An hourly cron re-renders it via Cloudflare Browser Rendering and stores the
// PNG as a single row in D1; /og.png serves that row and lazily re-renders in
// the background whenever it's older than an hour. Platforms cache OG images
// per share, so every NEW share scrapes a fresh count; old embeds keep theirs.
// If nothing has been rendered yet (or rendering breaks), /og.png falls back
// to the static card in assets — a share never gets a broken preview.

const OG_TTL_MS = 60 * 60 * 1000;
// Assets for the OG card render come from the workers.dev origin directly —
// immune to anything happening on the custom domain (proxy, interstitials).
const SITE_ORIGIN = "https://rti-site.righttointelligence.workers.dev";

// Visitor IP: when traffic arrives via the Vercel DNS bridge, cf-connecting-ip
// is Vercel's egress IP; the real client is the first x-forwarded-for hop.
// Only used as an optional Turnstile hint — spoofing it gains nothing.
function clientIp(request: Request): string | null {
  const xff = request.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || request.headers.get("cf-connecting-ip");
}

function ogCardHtml(count: number): string {
  const n = count.toLocaleString("en-US");
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: "JetBrains Mono"; font-style: normal; font-weight: 400 700;
    src: url("${SITE_ORIGIN}/fonts/jetbrains-mono.woff2") format("woff2");
  }
  @font-face {
    font-family: "Space Mono"; font-style: normal; font-weight: 700;
    src: url("${SITE_ORIGIN}/fonts/space-mono-700.woff2") format("woff2");
  }
  * { margin: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; background: #fcfcfb; color: #0b0b0b;
    font-family: "JetBrains Mono", monospace; padding: 56px 64px;
    display: flex; flex-direction: column; justify-content: space-between;
    overflow: hidden;
  }
  .brand { display: flex; align-items: center; gap: 14px; font-size: 22px; font-weight: 700; }
  .brand img { height: 44px; width: auto; }
  .count {
    font-family: "Space Mono", "JetBrains Mono", monospace; font-weight: 700;
    font-size: 168px; line-height: 1; letter-spacing: -4px;
  }
  .countsub { margin-top: 10px; font-size: 30px; color: #45453f; display: flex; align-items: center; gap: 14px; }
  .dot { width: 14px; height: 14px; border-radius: 50%; background: #16a34a; }
  .divider { width: 64px; height: 6px; background: #16a34a; margin: 34px 0 22px; }
  .tagline { font-size: 40px; font-weight: 700; line-height: 1.25; }
  .foot { display: flex; align-items: baseline; gap: 22px; font-size: 21px; }
  .foot .url { color: #16a34a; font-weight: 700; }
  .foot .sub { color: #7a7a74; }
</style></head><body>
  <div class="brand"><img src="${SITE_ORIGIN}/rti-logo.png" alt=""><span>Right to Intelligence</span></div>
  <div>
    <div class="count">${n}</div>
    <div class="countsub"><span class="dot"></span><span>people have taken action</span></div>
    <div class="divider"></div>
    <div class="tagline">Protect your right to run local&nbsp;AI.</div>
  </div>
  <div class="foot"><span class="url">righttointelligence.org</span><span class="sub">sign in ten seconds — call in two minutes</span></div>
</body></html>`;
}

async function renderOgImage(env: Env): Promise<void> {
  // Stampede guard: at most one render kicked off per isolate per 2 minutes.
  const now = Date.now();
  const guard = memCache.get("og-render-lock");
  if (guard && guard.until > now) return;
  memCache.set("og-render-lock", { until: now + 120_000, body: "" });

  const count = await countTotal(env);
  const browser = await puppeteer.launch(env.BROWSER as never);
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
    await page.setContent(ogCardHtml(count), { waitUntil: "networkidle0" });
    const png = await page.screenshot({ type: "png" });
    const bytes = png instanceof Uint8Array ? png : new Uint8Array(png as ArrayBuffer);
    // Self-provisioning: the cache table creates itself on first render, so no
    // manual remote migration is needed (root's D1 access stays locked down).
    await env.ACTIONS_DB.prepare(
      "CREATE TABLE IF NOT EXISTS og_cache (key TEXT PRIMARY KEY, bytes BLOB NOT NULL, updated_at INTEGER NOT NULL)",
    ).run();
    await env.ACTIONS_DB.prepare(
      "INSERT INTO og_cache (key, bytes, updated_at) VALUES ('og', ?1, ?2) " +
        "ON CONFLICT(key) DO UPDATE SET bytes = ?1, updated_at = ?2",
    )
      .bind(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), now)
      .run();
  } finally {
    await browser.close();
  }
}

async function handleOgImage(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  let row: { bytes: ArrayBuffer; updated_at: number } | null = null;
  try {
    row = await env.ACTIONS_DB.prepare("SELECT bytes, updated_at FROM og_cache WHERE key = 'og'")
      .first<{ bytes: ArrayBuffer; updated_at: number }>();
  } catch {
    row = null; // table missing or read failure — fall back to the static card
  }
  const stale = !row || Date.now() - row.updated_at > OG_TTL_MS;
  if (stale) ctx.waitUntil(renderOgImage(env).catch(() => {}));
  if (row) {
    // D1 returns BLOBs as ArrayBuffer in production and as a plain number
    // array in some local/dev paths — normalize to bytes either way.
    const raw = row.bytes as ArrayBuffer | Uint8Array | number[];
    const body =
      raw instanceof Uint8Array
        ? raw
        : Array.isArray(raw)
          ? Uint8Array.from(raw)
          : new Uint8Array(raw);
    return new Response(body, {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=1800",
      },
    });
  }
  // Nothing rendered yet: serve the static fallback card from assets.
  const url = new URL(request.url);
  url.pathname = "/og-fallback.png";
  return env.ASSETS.fetch(new Request(url.toString(), request));
}

type ExecutionContext = { waitUntil(promise: Promise<unknown>): void };

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/og.png" && request.method === "GET") {
      return handleOgImage(request, env, ctx);
    }
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
    if (url.pathname === "/api/signups" && request.method === "POST") {
      return handleSignup(request, env);
    }
    if (url.pathname === "/api/signups" && request.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }
    if (url.pathname === "/api/count" && request.method === "GET") {
      return handleCount(env);
    }
    if (url.pathname === "/api/stats" && request.method === "GET") {
      return handleStats(env);
    }
    return withSecurityHeaders(await env.ASSETS.fetch(request));
  },

  // Hourly re-render of the OG share card with the live count.
  async scheduled(_controller: unknown, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(renderOgImage(env));
  },
};

// Standard security armor on every API response (pages get the same set from
// public/_headers). The CSP names every origin the site may talk to — the
// whole third-party story is Cloudflare Turnstile; everything else self-hosted.
function withSecurityHeaders(response: Response): Response {
  const r = new Response(response.body, response);
  r.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  r.headers.set("x-frame-options", "DENY");
  r.headers.set("x-content-type-options", "nosniff");
  r.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  r.headers.set("permissions-policy", "camera=(), microphone=(), payment=(), usb=()");
  r.headers.set(
    "content-security-policy",
    [
      "default-src 'self'",
      "script-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'", // inline = React style attrs (map shading)
      "img-src 'self' data:",
      "font-src 'self'",
      "connect-src 'self' https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  return r;
}
