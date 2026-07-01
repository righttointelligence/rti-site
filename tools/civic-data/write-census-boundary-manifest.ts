import { mkdir, writeFile } from "node:fs/promises";
import { STATE_ROWS } from "./lib/states.ts";

const OUT_DIR = "civic-data/census/tiger2024";
const TIGER_BASE = "https://www2.census.gov/geo/tiger/TIGER2024";

await mkdir(OUT_DIR, { recursive: true });

const generatedAt = new Date().toISOString();
const states = STATE_ROWS.map(([abbr, name, fips]) => ({
  abbr,
  name,
  fips,
  upper: {
    chamber: "upper",
    censusLayer: "SLDU",
    url: `${TIGER_BASE}/SLDU/tl_2024_${fips}_sldu.zip`,
  },
  lower: {
    chamber: "lower",
    censusLayer: "SLDL",
    url: `${TIGER_BASE}/SLDL/tl_2024_${fips}_sldl.zip`,
  },
}));

await writeFile(
  `${OUT_DIR}/boundary-manifest.json`,
  `${JSON.stringify(
    {
      generatedAt,
      source: "U.S. Census TIGER/Line 2024 State Legislative District shapefiles",
      sourceBase: TIGER_BASE,
      note: "These ZIP files contain official TIGER/Line shapefiles suitable for point-in-polygon processing. Open States boundary JSON is display-simplified and should not be used for PIP.",
      stateCount: states.length,
      states,
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${OUT_DIR}/boundary-manifest.json for ${states.length} states.`);
