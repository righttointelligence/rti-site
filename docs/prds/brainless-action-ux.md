# Brainless Action UX RFC

Date: 2026-06-30
Status: implementation contract

## Non-Negotiable User Requirements

1. A visitor should not be asked to research bills, search legislation, read policy pages, or decide which moving bill matters before taking action.
2. Selecting a state must produce one complete action packet:
   - one recommended action
   - one exact ask
   - one copyable message
   - one official contact destination
   - one confirmation/logging loop
3. The site must keep source credibility, but source detail belongs below the action as secondary trust/proof, not as the primary task.
4. The site must not collect personal information for the default action path. No name, email, ZIP, address, IP, or user agent storage.
5. Keep the current black-and-white terminal style and the existing homepage direction.
6. Keep the implementation small. Do not add a new backend, account system, volunteer workflow, or heavy policy database.

## Product Decision

The current card exposes OII's research workflow as the citizen workflow. That is the wrong layer.

The citizen workflow should be:

1. Choose state.
2. Copy one message.
3. Open one official contact page.
4. Send the message.
5. Mark the action done.

Research context still matters, but it should answer "why this action?" after the user already has the action. It should not become the action.

## User Flow

### Homepage

Keep the current hero and state picker. Tighten the promise around one action:

> Choose your state. Copy the message. Send it to the right office. Done.

### State Action Card

The visible card should render these sections in this order:

1. `do this now`
   - A single human sentence, for example:
     `Send one message to your state lawmakers asking them to protect lawful local AI from licensing or preclearance.`
2. `why this state`
   - One to two sentences of context based on the state snapshot.
   - No instructions to search, read, or inspect bills.
3. `the ask`
   - Use the state's existing ask, lightly normalized.
4. `1 / copy this message`
   - Existing copy button and script.
5. `2 / open the official contact page`
   - One prominent outbound link.
   - Prefer official state legislator lookup or the highest-confidence official action portal.
   - The button text should be action-oriented, for example `Open official contact page`.
6. `3 / mark it done`
   - One button: `I sent it`.

### Secondary Trust Layer

Below the action, add collapsed details:

- `why this recommendation`
- `sources and official links`

This section can show the NCSL snapshot, source URLs, and extra contacts. It should be collapsed by default so the action remains simple. Avoid source labels in the primary flow that say `Search bills` or `Check current AI bills`.

## Data / Helper Model

Add a small helper that derives a primary action from the existing state data.

Inputs:
- `StateAction`
- optional `StateAiSnapshot`

Output:
- `headline`
- `context`
- `targetLabel`
- `targetUrl`
- `targetNote`
- `ask`
- `script`

The default copied script should not require name, city, or ZIP placeholders. Use a simplified opener such as:

> Hi, I live in California.

If the official destination asks for constituent details, that happens on the official site. OII should say plainly that it does not collect or see that information.

Target selection:

1. If a state has a special time-sensitive official portal, use it:
   - Colorado: Colorado AG pre-rulemaking comment form.
   - Texas: Texas legislator lookup.
   - California: California legislator lookup.
2. Otherwise prefer an official state legislator lookup/contact route.
3. If no clear legislator lookup exists, use the official state government portal or governor contact route.
4. Never make bill search the primary target.

## Copy Rules

Use concise founder-email voice:

- context first
- practical problem second
- concrete ask third
- calm confidence
- no slogans
- no fake urgency
- no partisan framing
- no civic-tech jargon

Banned public-action phrasing in the visible primary flow:

- `search bills`
- `bill search`
- `read everything`
- `read bills`
- `look at the active AI bills`
- `check current AI bills`
- `open the official bill search`
- `before contacting officials`

Preferred phrasing:

- `No policy homework required.`
- `We picked the first useful action for you.`
- `Send this message to the official state contact page.`
- `Sources are below if you want the receipts.`

## Acceptance Proof

The run is complete when:

1. The selected-state card no longer displays instructions to search/read/check bills in the primary flow.
2. California, Colorado, Texas, and one low-activity state each show one official primary contact destination.
3. The copy button still copies the right state script.
4. The single confirmation button still logs locally in development.
5. Source/provenance links still exist, but are secondary/collapsed.
6. `bun run build` passes.
7. Browser smoke checks show the homepage and selected-state action card without layout breakage.

## Deferred

Do not solve these in this pass:

- exact ZIP-to-legislator routing
- real D1 deployment configuration
- public action dashboard
- volunteer intake
- office response tracking
- bill freshness automation
- custom state captain CMS
