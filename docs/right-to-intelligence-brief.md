# Right to Intelligence Brief

Date: 2026-07-01

## One-Sentence Summary

Right to Intelligence exists to protect the lawful right to download, own, run, study, modify, publish, and locally execute open-weight AI models without a government license or platform permission.

## Core Message

Local AI is the next personal computer.

Not a chatbot account. Not a rented API. Not a tool that only works if a frontier lab, cloud provider, or government-approved platform lets it stay online.

The line we are protecting is simple:

People should not need a license, preclearance, or platform approval just to run an open AI model on their own hardware.

The law should target harmful conduct, not possession or local execution of a general-purpose tool.

## The Ask

We want lawmakers to add clear safe-harbor language for lawful local and open-weight AI.

That means protecting ordinary people, researchers, startups, educators, builders, and companies who want to:

- download open-weight models
- own model weights
- run models locally on personal hardware or private infrastructure
- study and inspect models
- modify and fine-tune models
- publish lawful open models
- host open-source AI tools
- run local inference without a license

The ask is not "no AI rules."

The ask is:

Protect lawful use. Enforce real harm.

Fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes, discrimination, sabotage, and real-world abuse should remain illegal and be enforced seriously.

The red line is requiring permission merely to own, run, research, modify, publish, or locally execute an open-weight model.

## Why This Matters

If local AI becomes licensed infrastructure, intelligence becomes rented infrastructure.

That would push power toward a small number of frontier labs, cloud providers, and government-approved entities. Everyone else would be downstream: asking permission, accepting platform limits, paying rent, and hoping access is not revoked.

Open-weight and local AI keep intelligence inspectable, repairable, portable, private, and owned by the people using it.

This is the same kind of line society already understands with personal computers:

People should be responsible for what they do with a tool. They should not need a license merely to own or run the tool.

## What The Website Does

The website is intentionally simple.

The visitor flow is:

1. See the message: "Protect your right to run local AI."
2. Choose a state.
3. Get one concrete action.
4. Use browser location only if they want exact state lawmakers.
5. Call the offices shown.
6. Read a short call script.
7. Mark whether they called, left voicemail, or used email fallback.

No policy homework. No "go search bills." No "read this legislation first." No account. No personal information collection.

The goal is to turn support into a two-minute constituent action.

## Site Copy Direction

The voice should feel like a concise founder email:

- context first
- practical problem second
- concrete ask third
- calm confidence
- no slogans
- no fake urgency
- no partisan framing
- no civic-tech jargon

Good language:

> New state laws could put local AI behind a license, turning open models into something you need permission to use. Take a 2-minute action to protect your rights.

Good script language:

> Hi, I live in your district. I'm calling as a constituent to ask the member to protect lawful local and open-source AI.
>
> People should not need a license or platform approval just to run an open model on their own computer. Please support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.
>
> Can you tell me where the member stands on licensing local AI?

## What We Track

We track self-reported actions.

When a visitor clicks one of the "mark it done" buttons, the browser sends:

```json
{
  "stateKey": "CA",
  "actionKind": "call"
}
```

Valid action kinds are:

- `call`
- `voicemail`
- `email_fallback`

The Cloudflare Worker writes one row to Cloudflare D1:

```txt
state_key | action_kind    | created_at
CA        | call           | timestamp
TX        | voicemail      | timestamp
CO        | email_fallback | timestamp
```

This should be described publicly as:

> Actions reported by visitors.

Do not call these "verified calls." They are honest self-reports.

## What We Do Not Track

The default action path does not store:

- name
- email
- ZIP
- address
- phone number
- browser location
- IP address
- user agent

Browser location is used only after the visitor clicks "Use my location." It is sent once to the Worker to find public state lawmakers and is not written to D1.

This privacy posture is intentional. Stronger verification would require more friction or personal data. For the first version, simple self-reported action is the right tradeoff.

## Storage And Infrastructure

The app is a React/Vite frontend deployed through Cloudflare Workers static assets.

Cloudflare D1 is the durable storage place for action logs.

The D1 database is:

```txt
free_intelligence_actions
```

The Worker binding is:

```txt
ACTIONS_DB
```

The table is:

```sql
CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_key TEXT NOT NULL,
  action_kind TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

For totals later:

```bash
bunx wrangler d1 execute free_intelligence_actions --remote \
  --command "SELECT state_key, action_kind, COUNT(*) AS count FROM actions GROUP BY state_key, action_kind"
```

## Exact Lawmaker Lookup

The site does not depend on the live Open States API for visitor lookup.

Runtime lookup uses owned static assets:

- Census TIGER/Line 2024 state legislative district geometry
- Open States current-legislator bulk CSV data imported into local JSON

The Worker takes a state and coordinate, resolves the coordinate against owned Census district geometry, joins the district to local lawmaker JSON, and returns public lawmaker names and phone numbers.

Open States remains useful as:

- an upstream bulk data source
- a dev-time verifier through `/people.geo`

Open States is not a runtime API dependency for public visitors.

## Current Civic Data Status

The owned dataset currently contains:

- 50 states
- 7,359 lawmakers
- 7,300 geographic lawmakers mapped cleanly to owned Census district geometry
- 2 Maine tribal seats that are non-geographic point-lookup exceptions
- 57 New Hampshire lower-house floterial district representatives that require an NH-specific mapping layer for perfect coverage

Launch recommendation:

Ship as-is. New Hampshire is a known partial-result edge, not a launch blocker. NH visitors still get their state senator and normal House results, plus the official lookup fallback remains visible.

## What "Prevent Licensing" Means

We are not arguing that AI abuse should be legal.

We are arguing that lawful open-weight model ownership and local execution should not require a license.

The distinction matters:

Bad framing:

> Do not regulate AI.

Correct framing:

> Keep enforcement focused on harmful conduct. Do not require permission to own or run an open model locally.

Bad framing:

> AI should be unrestricted.

Correct framing:

> Fraud, abuse, and real-world harms should be illegal. Lawful possession, research, modification, publication, and local execution should be protected.

## Target Legal/Policy Shape

Ideal policy language should create a safe harbor along these lines:

> Nothing in this act shall be construed to require a license, registration, preclearance, or platform approval for a person or organization to lawfully download, possess, run, study, modify, publish, share, or locally execute open-weight artificial intelligence models, provided that enforcement remains available for unlawful uses or harmful conduct.

This is not final legal language. It is the policy direction.

## Political Strategy

The movement should stay nonpartisan.

Different states care about different arguments:

- civil liberties: people should own and inspect their tools
- startups: licensing favors incumbents and slows small companies
- education: students and researchers need local tools
- privacy: local AI can keep sensitive data off cloud platforms
- resilience: local tools keep working even when platforms change access
- state economy: compute, AI infrastructure, and local inference can become economic development
- safety: open inspection helps defenders understand, harden, and audit systems

Texas-specific economic argument:

Texas is already positioned as a major large-load compute and energy state. If companies want to run private inference, local infrastructure, or their own model workloads, Texas benefits from being a place where lawful local AI is welcome. Licensing local/open AI would make that harder and push activity elsewhere.

## What Counts As A Good User Action

Best first action:

Call state lawmakers.

Why calls:

- offices track constituent calls
- calls are harder to ignore than social posts
- voicemail still counts
- a small number of real constituents can matter at the state level

The site should make calls easiest. Email is a fallback, not the primary strategy.

## Credibility Rules

Do not fake momentum.

Do not show fake action counts.

Do not imply self-reported actions are verified calls.

Do not hide uncertainty.

Every claim should have a source, retrieval date, or visible review status where possible.

Preferred language:

> source-verified draft

> Civic data last updated Jun 30, 2026 from Open States current legislator CSV bulk data: 7,359 lawmakers across 50 states.

## Current Site State

The current site has:

- simple black-and-white terminal-inspired design
- homepage headline: "Protect your right to run local AI."
- state picker
- per-state action page
- exact office lookup using browser location
- official lookup fallback
- short call script
- "I called," "I left a voicemail," and "I used email" tracking buttons
- Cloudflare D1 action logging
- public civic-data freshness line
- volunteer contact CTA: `volunteer@righttointelligence.org`

## Immediate Next Work

Next pass should focus on mobile optimization.

Important mobile goals:

- no horizontal overflow
- buttons fit cleanly
- call cards are easy to tap
- script text remains readable
- nav/header does not crowd the viewport
- state action flow feels fast and obvious on a phone
- "call" buttons should use `tel:` links where a phone number exists

Do not expand scope into accounts, dashboards, volunteer CRM, or heavy policy tooling until the first public launch proves people are using the action flow.

## Short Copy/Paste Version

Right to Intelligence protects the lawful right to run local and open-weight AI. The core ask is simple: people should not need a license, preclearance, or platform approval just to download, own, run, study, modify, publish, or locally execute an open AI model on their own hardware. Laws should target harmful conduct such as fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes, discrimination, and sabotage, not possession or local execution of a general-purpose tool.

The website turns that message into a two-minute constituent action. A visitor chooses their state, optionally uses browser location to find exact state lawmakers, reads a short call script, taps to call, and marks whether they called, left voicemail, or used email fallback. The site stores only self-reported action rows in Cloudflare D1: state, action type, and timestamp. It does not store names, emails, ZIPs, addresses, location, IP, or user agent.

Exact lawmaker lookup runs from owned static data, not live Open States API calls. The Worker resolves coordinates against Census TIGER/Line 2024 district geometry and joins the district to locally imported Open States bulk legislator data. Open States remains the upstream data source and verification tool, but not a runtime dependency for visitors.

The tone is calm and practical: protect lawful use, enforce real harm. No partisan framing, no fake urgency, no fake counts, no policy homework for visitors. The first product goal is to make calling state lawmakers brainless enough that people actually do it.
