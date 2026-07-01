# OII Civic Lookup Data

This directory is the start of the owned lookup dataset for exact state lawmaker routing.

The goal is to stop spending a live Open States API request for every visitor. Open States remains
the upstream source and verification oracle, but OII should own the runtime data it serves.

## Current Dataset

`openstates/legislators/current/` is generated from Open States nightly current-legislator CSVs:

```bash
bun run data:legislators
```

Source pattern:

```text
https://data.openstates.org/people/current/[ABBR].csv
```

The generated JSON contains current state lawmakers, chambers, districts, phone numbers, emails,
links, and source URLs for all 50 states.

## Verification

After generating the legislator dataset, compare known coordinates against Open States `/people.geo`:

```bash
bun run data:verify:openstates
```

The verifier reads `OPENSTATES_API_KEY` from the shell or `.dev.vars`, calls Open States for sample
coordinates, filters to state legislators, and confirms the returned chamber/district/name exists in
the local bulk dataset.

## Next Dataset Layer

Legislators alone are not enough for offline lookup. To fully replace runtime `/people.geo`, OII
also needs state legislative district geography:

1. Download state legislative district upper/lower boundaries.
2. Normalize polygons into compact per-state files.
3. Add a point-in-polygon lookup that maps lat/lng to `upper` and `lower` district IDs.
4. Join those districts to the local legislator JSON.
5. Keep Open States `/people.geo` as the nightly/random-sample verifier.

The authoritative source for point-in-polygon work should be U.S. Census TIGER/Line 2024 State
Legislative District shapefiles. Generate the source manifest with:

```bash
bun run data:boundaries:manifest
```

This writes `civic-data/census/tiger2024/boundary-manifest.json`, covering upper and lower chamber
ZIP URLs for all 50 states. Do not use Open States boundary JSON for point-in-polygon lookup; their
own docs mark those shapes as simplified for display.
