export type CivicDataFreshness = {
  generatedAt: string;
  source: string;
  stateCount: number;
  totalLegislators: number;
};

type CivicDataManifest = {
  generatedAt?: unknown;
  source?: unknown;
  stateCount?: unknown;
  totalLegislators?: unknown;
};

const MANIFEST_URL = "/civic-data/openstates/legislators/current/manifest.json";

export async function fetchCivicDataFreshness(): Promise<CivicDataFreshness | null> {
  const response = await fetch(MANIFEST_URL);
  if (!response.ok) return null;

  const manifest = (await response.json().catch(() => null)) as CivicDataManifest | null;
  if (!isCivicDataManifest(manifest)) return null;

  return {
    generatedAt: manifest.generatedAt,
    source: manifest.source,
    stateCount: manifest.stateCount,
    totalLegislators: manifest.totalLegislators,
  };
}

export function formatCivicDataFreshness(freshness: CivicDataFreshness): string {
  const date = new Date(freshness.generatedAt);
  if (Number.isNaN(date.getTime())) return "Civic data last updated: source manifest unavailable";

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

  return `Civic data last updated ${formattedDate} from ${freshness.source}: ${freshness.totalLegislators.toLocaleString()} lawmakers across ${freshness.stateCount} states.`;
}

function isCivicDataManifest(value: CivicDataManifest | null): value is CivicDataFreshness {
  return (
    Boolean(value) &&
    typeof value?.generatedAt === "string" &&
    typeof value.source === "string" &&
    typeof value.stateCount === "number" &&
    typeof value.totalLegislators === "number"
  );
}
