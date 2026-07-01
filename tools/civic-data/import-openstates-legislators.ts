import { mkdir, writeFile } from "node:fs/promises";
import { parseCsv } from "./lib/csv.ts";
import { STATE_ROWS } from "./lib/states.ts";

type Legislator = {
  id: string;
  name: string;
  state: string;
  chamber: "upper" | "lower";
  district: string;
  party: string;
  email?: string;
  phone?: string;
  capitolPhone?: string;
  districtPhone?: string;
  links: string[];
  sources: string[];
};

type StateDataset = {
  abbr: string;
  name: string;
  sourceUrl: string;
  source: "openstates-current-legislator-csv";
  fetchedAt: string;
  count: number;
  upperCount: number;
  lowerCount: number;
  legislators: Legislator[];
};

const OUT_DIR = "civic-data/openstates/legislators/current";
const SOURCE_BASE = "https://data.openstates.org/people/current";

await mkdir(OUT_DIR, { recursive: true });

const fetchedAt = new Date().toISOString();
const states: StateDataset[] = [];

for (const [abbr, name] of STATE_ROWS) {
  const sourceUrl = `${SOURCE_BASE}/${abbr.toLowerCase()}.csv`;
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status} ${response.statusText}`);
  }

  const records = parseCsv(await response.text());
  const legislators = records.map((record) => normalizeLegislator(abbr, record));
  const upperCount = legislators.filter((legislator) => legislator.chamber === "upper").length;
  const lowerCount = legislators.filter((legislator) => legislator.chamber === "lower").length;
  const dataset: StateDataset = {
    abbr,
    name,
    sourceUrl,
    source: "openstates-current-legislator-csv",
    fetchedAt,
    count: legislators.length,
    upperCount,
    lowerCount,
    legislators,
  };

  states.push(dataset);
  await writeJson(`${OUT_DIR}/${abbr}.json`, dataset);
  console.log(`${abbr}: ${legislators.length} current legislators`);
}

const manifest = {
  generatedAt: fetchedAt,
  source: "Open States current legislator CSV bulk data",
  sourcePattern: `${SOURCE_BASE}/[ABBR].csv`,
  stateCount: states.length,
  totalLegislators: states.reduce((total, state) => total + state.count, 0),
  states: states.map(({ abbr, name, count, upperCount, lowerCount, sourceUrl }) => ({
    abbr,
    name,
    count,
    upperCount,
    lowerCount,
    sourceUrl,
  })),
};

await writeJson(`${OUT_DIR}/manifest.json`, manifest);

function normalizeLegislator(state: string, record: Record<string, string>): Legislator {
  const chamber = record.current_chamber === "upper" ? "upper" : "lower";
  const capitolPhone = optional(record.capitol_voice);
  const districtPhone = optional(record.district_voice);
  return {
    id: requireField(record, "id"),
    name: requireField(record, "name"),
    state,
    chamber,
    district: requireField(record, "current_district"),
    party: record.current_party,
    email: optional(record.email),
    phone: capitolPhone ?? districtPhone,
    capitolPhone,
    districtPhone,
    links: splitList(record.links),
    sources: splitList(record.sources),
  };
}

function requireField(record: Record<string, string>, key: string): string {
  const value = record[key];
  if (!value) throw new Error(`Missing required CSV field: ${key}`);
  return value;
}

function optional(value: string): string | undefined {
  return value.length > 0 ? value : undefined;
}

function splitList(value: string): string[] {
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}
