import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawn } from "node:child_process";
import { STATE_ROWS } from "./lib/states.ts";

type ChamberKey = "upper" | "lower";

type BoundaryManifest = {
  generatedAt: string;
  source: string;
  states: Array<{
    abbr: string;
    name: string;
    fips: string;
    upper: { url: string };
    lower: { url: string };
  }>;
};

type DbfField = {
  name: string;
  length: number;
};

type DistrictBoundary = {
  district: string;
  geoid: string;
  name: string;
  bbox: [number, number, number, number];
  rings: number[][];
};

type ChamberDataset = {
  sourceUrl: string;
  count: number;
  districts: DistrictIndexEntry[];
};

type DistrictIndexEntry = {
  district: string;
  geoid: string;
  name: string;
  bbox: [number, number, number, number];
  assetPath: string;
};

const SCALE = 1_000_000;
const SIMPLIFY_TOLERANCE = Number.parseInt(process.env.BOUNDARY_SIMPLIFY_TOLERANCE ?? "100", 10);
const MANIFEST_PATH = "civic-data/census/tiger2024/boundary-manifest.json";
const OUT_INDEX_DIR = "civic-data/census/tiger2024/district-index";
const OUT_DISTRICT_DIR = "civic-data/census/tiger2024/districts";
const WORK_DIR = join(tmpdir(), "free-intelligence-census-tiger2024");

const requestedStates = new Set(process.argv.slice(2).map((value) => value.toUpperCase()));
const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as BoundaryManifest;
const states = manifest.states.filter((state) => requestedStates.size === 0 || requestedStates.has(state.abbr));

if (states.length === 0) {
  throw new Error(`No matching states for ${Array.from(requestedStates).join(", ")}`);
}

await mkdir(OUT_INDEX_DIR, { recursive: true });
await mkdir(OUT_DISTRICT_DIR, { recursive: true });
await mkdir(WORK_DIR, { recursive: true });

const generatedAt = new Date().toISOString();
for (const state of states) {
  const upper = await buildChamber(state, "upper", state.upper.url);
  const lower = await buildChamber(state, "lower", state.lower.url);
  const stateName = STATE_ROWS.find(([abbr]) => abbr === state.abbr)?.[1] ?? state.name;
  const dataset = {
    schemaVersion: 1,
    source: "census-tiger-line-2024-state-legislative-districts",
    generatedAt,
    scale: SCALE,
    abbr: state.abbr,
    name: stateName,
    fips: state.fips,
    chambers: { upper, lower },
  };

  await writeFile(`${OUT_INDEX_DIR}/${state.abbr}.json`, `${JSON.stringify(dataset)}\n`);
  console.log(`${state.abbr}: upper ${upper.count}, lower ${lower.count}`);
}

async function buildChamber(
  state: BoundaryManifest["states"][number],
  chamber: ChamberKey,
  sourceUrl: string,
): Promise<ChamberDataset> {
  const zipPath = join(WORK_DIR, `${state.abbr}-${chamber}.zip`);
  const extractDir = join(WORK_DIR, `${state.abbr}-${chamber}`);
  const downloaded = await downloadIfMissing(sourceUrl, zipPath);
  if (!downloaded) {
    if (chamber === "lower") return { sourceUrl, count: 0, districts: [] };
    throw new Error(`${state.abbr} ${chamber}: missing required Census boundary archive ${sourceUrl}`);
  }
  await mkdir(extractDir, { recursive: true });
  await run("unzip", ["-o", zipPath, "-d", extractDir]);

  const prefix = basename(sourceUrl, ".zip");
  const shpPath = join(extractDir, `${prefix}.shp`);
  const dbfPath = join(extractDir, `${prefix}.dbf`);
  const rows = parseDbf(await readFile(dbfPath));
  const geometries = parseShp(await readFile(shpPath));
  if (rows.length !== geometries.length) {
    throw new Error(`${state.abbr} ${chamber}: DBF rows ${rows.length} != SHP records ${geometries.length}`);
  }

  const districtField = chamber === "upper" ? "SLDUST" : "SLDLST";
  const districts = rows.map((row, index) => ({
    district: normalizeDistrict(requireField(row, districtField)),
    geoid: requireField(row, "GEOID"),
    name: requireField(row, "NAMELSAD"),
    ...geometries[index],
  }));

  const stateDistrictDir = `${OUT_DISTRICT_DIR}/${state.abbr}`;
  await mkdir(stateDistrictDir, { recursive: true });
  const index: DistrictIndexEntry[] = [];
  for (const district of districts) {
    const fileName = `${chamber}-${fileSafeDistrict(district.district)}.json`;
    const assetPath = `/civic-data/census/tiger2024/districts/${state.abbr}/${fileName}`;
    await writeFile(`${stateDistrictDir}/${fileName}`, `${JSON.stringify(district)}\n`);
    index.push({
      district: district.district,
      geoid: district.geoid,
      name: district.name,
      bbox: district.bbox,
      assetPath,
    });
  }

  return { sourceUrl, count: index.length, districts: index };
}

async function downloadIfMissing(url: string, path: string): Promise<boolean> {
  try {
    const existing = await stat(path);
    if (existing.size > 0) return true;
  } catch {
    // Download below.
  }

  const response = await fetch(url);
  if (response.status === 404) return false;
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }
  await writeFile(path, Buffer.from(await response.arrayBuffer()));
  return true;
}

function parseDbf(buffer: Buffer): Array<Record<string, string>> {
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields: DbfField[] = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    if (buffer[offset] === 0x0d) break;
    const name = buffer
      .subarray(offset, offset + 11)
      .toString("ascii")
      .replace(/\0.*$/, "")
      .trim();
    fields.push({ name, length: buffer[offset + 16] });
  }

  const rows: Array<Record<string, string>> = [];
  for (let rowIndex = 0; rowIndex < recordCount; rowIndex += 1) {
    const deletedFlagOffset = headerLength + rowIndex * recordLength;
    if (buffer[deletedFlagOffset] === 0x2a) continue;
    let offset = deletedFlagOffset + 1;
    const row: Record<string, string> = {};
    for (const field of fields) {
      row[field.name] = buffer.subarray(offset, offset + field.length).toString("utf8").trim();
      offset += field.length;
    }
    rows.push(row);
  }
  return rows;
}

function parseShp(buffer: Buffer): Array<{ bbox: [number, number, number, number]; rings: number[][] }> {
  const records: Array<{ bbox: [number, number, number, number]; rings: number[][] }> = [];
  let offset = 100;
  while (offset < buffer.length) {
    const contentLength = buffer.readInt32BE(offset + 4) * 2;
    const contentOffset = offset + 8;
    const shapeType = buffer.readInt32LE(contentOffset);
    if (shapeType === 0) {
      offset = contentOffset + contentLength;
      continue;
    }
    if (shapeType !== 5) {
      throw new Error(`Unsupported Census shapefile shape type: ${shapeType}`);
    }

    const minX = toScaled(buffer.readDoubleLE(contentOffset + 4));
    const minY = toScaled(buffer.readDoubleLE(contentOffset + 12));
    const maxX = toScaled(buffer.readDoubleLE(contentOffset + 20));
    const maxY = toScaled(buffer.readDoubleLE(contentOffset + 28));
    const partCount = buffer.readInt32LE(contentOffset + 36);
    const pointCount = buffer.readInt32LE(contentOffset + 40);
    const partsOffset = contentOffset + 44;
    const pointsOffset = partsOffset + partCount * 4;
    const partStarts: number[] = [];
    for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
      partStarts.push(buffer.readInt32LE(partsOffset + partIndex * 4));
    }

    const rings: number[][] = [];
    for (let partIndex = 0; partIndex < partCount; partIndex += 1) {
      const start = partStarts[partIndex];
      const end = partStarts[partIndex + 1] ?? pointCount;
      const ring: number[] = [];
      for (let pointIndex = start; pointIndex < end; pointIndex += 1) {
        const pointOffset = pointsOffset + pointIndex * 16;
        ring.push(toScaled(buffer.readDoubleLE(pointOffset)), toScaled(buffer.readDoubleLE(pointOffset + 8)));
      }
      removeDuplicateClosingPoint(ring);
      const simplified = simplifyRing(ring, SIMPLIFY_TOLERANCE);
      if (simplified.length >= 6) rings.push(simplified);
    }

    records.push({ bbox: [minX, minY, maxX, maxY], rings });
    offset = contentOffset + contentLength;
  }
  return records;
}

function removeDuplicateClosingPoint(ring: number[]): void {
  if (ring.length < 4) return;
  const firstX = ring[0];
  const firstY = ring[1];
  const lastX = ring[ring.length - 2];
  const lastY = ring[ring.length - 1];
  if (firstX === lastX && firstY === lastY) {
    ring.splice(ring.length - 2, 2);
  }
}

function simplifyRing(ring: number[], tolerance: number): number[] {
  if (tolerance <= 0 || ring.length <= 12) return ring;

  const closed = [...ring, ring[0], ring[1]];
  const pointCount = closed.length / 2;
  const keep = new Array<boolean>(pointCount).fill(false);
  keep[0] = true;
  keep[pointCount - 1] = true;
  const toleranceSquared = tolerance * tolerance;
  const stack: Array<[number, number]> = [[0, pointCount - 1]];

  while (stack.length > 0) {
    const [start, end] = stack.pop() ?? [0, 0];
    let maxDistance = 0;
    let maxIndex = -1;
    for (let index = start + 1; index < end; index += 1) {
      const distance = perpendicularDistanceSquared(closed, index, start, end);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = index;
      }
    }
    if (maxIndex > -1 && maxDistance > toleranceSquared) {
      keep[maxIndex] = true;
      stack.push([start, maxIndex], [maxIndex, end]);
    }
  }

  const simplified: number[] = [];
  for (let index = 0; index < pointCount - 1; index += 1) {
    if (!keep[index]) continue;
    simplified.push(closed[index * 2], closed[index * 2 + 1]);
  }
  return simplified.length >= 6 ? simplified : ring;
}

function perpendicularDistanceSquared(points: number[], pointIndex: number, startIndex: number, endIndex: number): number {
  const px = points[pointIndex * 2];
  const py = points[pointIndex * 2 + 1];
  const sx = points[startIndex * 2];
  const sy = points[startIndex * 2 + 1];
  const ex = points[endIndex * 2];
  const ey = points[endIndex * 2 + 1];
  const dx = ex - sx;
  const dy = ey - sy;
  if (dx === 0 && dy === 0) return squaredDistance(px, py, sx, sy);
  const ratio = Math.max(0, Math.min(1, ((px - sx) * dx + (py - sy) * dy) / (dx * dx + dy * dy)));
  return squaredDistance(px, py, sx + ratio * dx, sy + ratio * dy);
}

function squaredDistance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

function normalizeDistrict(value: string): string {
  if (!/^\d+$/.test(value)) return value;
  return value.replace(/^0+/, "") || "0";
}

function fileSafeDistrict(value: string): string {
  return value.replace(/[^A-Za-z0-9_-]/g, "_");
}

function requireField(row: Record<string, string>, field: string): string {
  const value = row[field];
  if (!value) throw new Error(`Missing required DBF field: ${field}`);
  return value;
}

function toScaled(value: number): number {
  return Math.round(value * SCALE);
}

async function run(command: string, args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: "ignore" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? "unknown status"}`));
    });
  });
}
