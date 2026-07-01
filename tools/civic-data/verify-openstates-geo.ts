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
  const local = await readLocalDataset(sample.stateKey);
  const remote = await fetchOpenStatesGeo(sample, apiKey);
  const missing = remote.filter(
    (remoteLegislator) =>
      !local.legislators.some(
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
