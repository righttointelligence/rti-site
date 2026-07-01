import { readFile } from "node:fs/promises";
import { readDevVar } from "./lib/dev-vars.ts";

type LocalLegislator = {
  id: string;
  name: string;
  chamber: "upper" | "lower";
  district: string;
};

type StateDataset = {
  abbr: string;
  legislators: LocalLegislator[];
};

type BoundaryIndex = {
  scale: number;
  chambers: Record<"upper" | "lower", { districts: DistrictIndexEntry[] }>;
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
  district: string;
  name?: string;
};

type SampleLocation = {
  label: string;
  stateKey: string;
  latitude: number;
  longitude: number;
};

type GeoLawmaker = {
  id: string;
  name: string;
  chamber: "upper" | "lower";
  district: string;
};

const apiKey = readDevVar("OPENSTATES_API_KEY");
if (!apiKey) {
  throw new Error("Set OPENSTATES_API_KEY in the environment or .dev.vars before verifying.");
}

const samples = await readSamples();
let failures = 0;

for (const sample of samples) {
  const local = await lookupLocalLawmakers(sample);
  const remote = await fetchOpenStatesGeo(sample, apiKey);
  const missing = remote.filter(
    (remoteLegislator) =>
      !local.some(
        (localLegislator) =>
          localLegislator.chamber === remoteLegislator.chamber &&
          localLegislator.district === remoteLegislator.district &&
          localLegislator.name === remoteLegislator.name,
      ),
  );

  if (missing.length > 0) {
    failures += 1;
    console.error(`FAIL ${sample.label}: missing from local dataset`);
    for (const lawmaker of missing) {
      console.error(`  ${lawmaker.chamber} ${lawmaker.district}: ${lawmaker.name}`);
    }
    continue;
  }

  console.log(
    `PASS ${sample.label}: ${remote
      .map((lawmaker) => `${lawmaker.name} (${lawmaker.chamber} ${lawmaker.district})`)
      .join(", ")}`,
  );
}

if (failures > 0) {
  throw new Error(`${failures} Open States verification sample(s) failed.`);
}

async function readSamples(): Promise<SampleLocation[]> {
  const [stateKey, latitude, longitude] = process.argv.slice(2);
  if (stateKey && latitude && longitude) {
    return [
      {
        label: `${stateKey} ${latitude},${longitude}`,
        stateKey,
        latitude: Number(latitude),
        longitude: Number(longitude),
      },
    ];
  }

  return JSON.parse(await readFile("tools/civic-data/sample-locations.json", "utf8")) as SampleLocation[];
}

async function readLocalDataset(stateKey: string): Promise<StateDataset> {
  return JSON.parse(
    await readFile(`civic-data/openstates/legislators/current/${stateKey}.json`, "utf8"),
  ) as StateDataset;
}

async function lookupLocalLawmakers(sample: SampleLocation): Promise<LocalLegislator[]> {
  const boundaries = JSON.parse(
    await readFile(`civic-data/census/tiger2024/district-index/${sample.stateKey}.json`, "utf8"),
  ) as BoundaryIndex;
  const local = await readLocalDataset(sample.stateKey);
  const x = Math.round(sample.longitude * boundaries.scale);
  const y = Math.round(sample.latitude * boundaries.scale);
  const lawmakers: LocalLegislator[] = [];

  for (const chamber of ["upper", "lower"] as const) {
    const district = await findDistrict(boundaries.chambers[chamber].districts, x, y);
    if (!district) continue;
    lawmakers.push(
      ...local.legislators.filter(
        (candidate) => candidate.chamber === chamber && districtMatches(candidate.district, district),
      ),
    );
  }

  return lawmakers;
}

async function findDistrict(districts: DistrictIndexEntry[], x: number, y: number): Promise<DistrictMatch | null> {
  const candidates = districts.filter((district) => {
    const [minX, minY, maxX, maxY] = district.bbox;
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  });

  for (const candidate of candidates) {
    const district = JSON.parse(await readFile(candidate.assetPath.slice(1), "utf8")) as DistrictGeometry;
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

function districtMatches(legislatorDistrict: string, district: DistrictMatch): boolean {
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

async function fetchOpenStatesGeo(sample: SampleLocation, key: string): Promise<GeoLawmaker[]> {
  const url = new URL("https://v3.openstates.org/people.geo");
  url.searchParams.set("lat", String(sample.latitude));
  url.searchParams.set("lng", String(sample.longitude));
  url.searchParams.append("include", "offices");
  url.searchParams.set("apikey", key);

  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Open States lookup failed for ${sample.label}: ${response.status}`);
  }

  const body = (await response.json()) as { results?: unknown };
  return parseRemoteLawmakers(body, sample.stateKey);
}

function parseRemoteLawmakers(body: { results?: unknown }, stateKey: string): GeoLawmaker[] {
  if (!Array.isArray(body.results)) return [];

  const stateJurisdictionId = `ocd-jurisdiction/country:us/state:${stateKey.toLowerCase()}/government`;
  const lawmakers = new Map<string, GeoLawmaker>();

  for (const item of body.results) {
    if (!item || typeof item !== "object") continue;
    const result = item as { person?: unknown; current_role?: unknown; role?: unknown };
    const person = result.person && typeof result.person === "object" ? result.person : result;
    const role = result.current_role ?? result.role;
    if (!person || typeof person !== "object" || !role || typeof role !== "object") continue;

    const personRecord = person as Record<string, unknown>;
    const roleRecord = role as Record<string, unknown>;
    if (!isStateLegislativeRole(roleRecord, stateJurisdictionId, stateKey)) continue;

    const chamber = chamberValue(roleRecord);
    if (!chamber) continue;

    const id = stringValue(personRecord.id) ?? `${stringValue(personRecord.name) ?? "unknown"}-${chamber}`;
    const district = stringValue(roleRecord.district) ?? "";
    lawmakers.set(`${id}-${chamber}`, {
      id,
      name: stringValue(personRecord.name) ?? "Unknown lawmaker",
      chamber,
      district,
    });
  }

  return Array.from(lawmakers.values()).sort((a, b) =>
    a.chamber === b.chamber ? 0 : a.chamber === "upper" ? -1 : 1,
  );
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

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
