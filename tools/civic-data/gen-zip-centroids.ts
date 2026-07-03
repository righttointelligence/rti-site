// One-shot generator: US Census Bureau 2024 ZCTA Gazetteer -> compact
// zip -> [lat, lng] centroid table served from our own origin. This replaces
// the zippopotam.us runtime dependency — the browser never leaves our domain.
//
// Source (public domain, US Census Bureau):
//   https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip
// Run: bun tools/civic-data/gen-zip-centroids.ts /path/to/2024_Gaz_zcta_national.txt
import { mkdir } from "node:fs/promises";

const src = process.argv[2];
if (!src) {
  console.error("usage: bun tools/civic-data/gen-zip-centroids.ts <gazetteer.txt>");
  process.exit(1);
}

const text = await Bun.file(src).text();
const lines = text.split("\n");
const out: Record<string, [number, number]> = {};
for (const line of lines.slice(1)) {
  const cols = line.split("\t");
  if (cols.length < 7) continue;
  const zip = cols[0].trim();
  const lat = Number.parseFloat(cols[5]);
  const lng = Number.parseFloat(cols[6]);
  if (!/^\d{5}$/.test(zip) || Number.isNaN(lat) || Number.isNaN(lng)) continue;
  // 4 decimals ≈ 11m precision — far tighter than a zip centroid needs.
  out[zip] = [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
}

await mkdir("civic-data/census/gazetteer2024", { recursive: true });
await Bun.write("civic-data/census/gazetteer2024/zip-centroids.json", JSON.stringify(out));
await Bun.write(
  "civic-data/census/gazetteer2024/SOURCE.md",
  `# ZCTA centroids — provenance

- Source: US Census Bureau, 2024 Gazetteer Files (ZIP Code Tabulation Areas)
- URL: https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip
- License: public domain (US federal government work)
- Retrieved: 2026-07-03
- Transform: tools/civic-data/gen-zip-centroids.ts — GEOID + INTPTLAT/INTPTLONG
  only, rounded to 4 decimals. ${Object.keys(out).length} zips.
- Consumed by: the call page's zip -> exact-district lookup (src/pages/Action.tsx),
  fetched from our own origin on demand. Replaces the former zippopotam.us call.
`,
);
console.log(`wrote ${Object.keys(out).length} zip centroids`);
