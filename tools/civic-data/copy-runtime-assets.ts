import { cp, mkdir } from "node:fs/promises";

const COPIES = [
  {
    from: "civic-data/openstates/legislators/current",
    to: "dist/civic-data/openstates/legislators/current",
  },
  {
    from: "civic-data/census/tiger2024/districts",
    to: "dist/civic-data/census/tiger2024/districts",
  },
  {
    from: "civic-data/census/tiger2024/district-index",
    to: "dist/civic-data/census/tiger2024/district-index",
  },
];

for (const copy of COPIES) {
  await mkdir(copy.to.slice(0, copy.to.lastIndexOf("/")), { recursive: true });
  await cp(copy.from, copy.to, { recursive: true, force: true });
  console.log(`copied ${copy.from} -> ${copy.to}`);
}
