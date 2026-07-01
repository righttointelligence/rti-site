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

## Boundary Dataset

`census/tiger2024/` is generated from U.S. Census TIGER/Line 2024 State Legislative District
shapefiles. Generate the source manifest with:

```bash
bun run data:boundaries:manifest
```

Generate deployable lookup geometry with:

```bash
bun run data:boundaries
```

The generator writes two runtime layers:

- `census/tiger2024/district-index/` - one small index per state with district bounding boxes.
- `census/tiger2024/districts/` - one simplified geometry file per district.

Nebraska is encoded as a unicameral state: upper/single-chamber districts exist, lower districts are
empty.

Do not use Open States boundary JSON for point-in-polygon lookup; their own docs mark those shapes
as simplified for display. The runtime lookup uses Census boundaries and Open States current
legislator bulk CSVs that are already stored in this repo.

## Runtime Assets

The Worker reads civic data from static assets under `dist/civic-data/`. Production builds copy the
owned datasets into `dist` automatically:

```bash
bun run build
```

## Verification

After generating the legislator and boundary datasets, compare known coordinates against Open States
`/people.geo`:

```bash
bun run data:verify:openstates
```

The verifier reads `OPENSTATES_API_KEY` from the shell or `.dev.vars`, calls Open States for sample
coordinates, filters to state legislators, and confirms the owned coordinate-to-boundary-to-legislator
path returns the same chamber/district/name.
