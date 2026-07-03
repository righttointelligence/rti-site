# ZCTA centroids — provenance

- Source: US Census Bureau, 2024 Gazetteer Files (ZIP Code Tabulation Areas)
- URL: https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip
- License: public domain (US federal government work)
- Retrieved: 2026-07-03
- Transform: tools/civic-data/gen-zip-centroids.ts — GEOID + INTPTLAT/INTPTLONG
  only, rounded to 4 decimals. 33791 zips.
- Consumed by: the call page's zip -> exact-district lookup (src/pages/Action.tsx),
  fetched from our own origin on demand. Replaces the former zippopotam.us call.
