-- International signatures. Signers outside the US pick a country instead of a
-- state: state_key becomes 'INTL' and country holds the ISO 3166-1 alpha-2
-- code. US rows keep country NULL. Same privacy posture: email + place + time.
ALTER TABLE signups ADD COLUMN country TEXT;
