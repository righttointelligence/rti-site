import { STATE_ROWS } from "../data/states";

// Pretty, shareable state URLs: /action/wyoming, /action/new-york.
// Routes carry the state name-slug; STATES is keyed by abbreviation, so we map both ways.

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const ABBR_BY_SLUG: Record<string, string> = Object.fromEntries(
  STATE_ROWS.map(([abbr, name]) => [slugify(name), abbr]),
);

const SLUG_BY_ABBR: Record<string, string> = Object.fromEntries(
  STATE_ROWS.map(([abbr, name]) => [abbr, slugify(name)]),
);

export function slugForAbbr(abbr: string): string {
  return SLUG_BY_ABBR[abbr] ?? abbr.toLowerCase();
}

export function abbrForSlug(slug: string): string | null {
  return ABBR_BY_SLUG[slug.toLowerCase()] ?? null;
}
