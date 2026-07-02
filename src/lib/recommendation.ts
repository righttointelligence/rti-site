import type { StateAction } from "../data/states";
import type { StateAiSnapshot } from "../data/state-ai-snapshots";
import { STATE_POLICY_LINKS } from "../data/state-policy-links";
import { STATE_OFFICIAL_LINKS } from "../data/state-official-links";

// One complete, brainless action packet derived from existing state data.
// The visitor never has to research, search, or choose a bill — the helper
// sends them to the official state lookup for the strongest simple action:
// a constituent phone call.
export type PrimaryAction = {
  headline: string;
  context: string;
  ask: string;
  script: string;
  targetLabel: string;
  targetUrl: string;
  targetNote: string;
};

type TargetKind = "legislator" | "portal";

type Target = {
  label: string;
  url: string;
  note: string;
  kind: TargetKind;
};

// Target selection: official legislator lookup first, then the state government
// portal, then governor contact. Never a bill search.
function selectTarget(state: StateAction): Target {
  const lookup = STATE_POLICY_LINKS[state.abbr]?.legislatorLookup;
  if (lookup?.url) {
    return {
      label: `${state.name} legislator lookup`,
      url: lookup.url,
      kind: "legislator",
      note: "Use the official lookup to find your state lawmakers. Enter any address details there, not on RTI.",
    };
  }

  const official = STATE_OFFICIAL_LINKS[state.abbr];
  if (official?.stateGovernmentUrl) {
    return {
      label: `${state.name} state government portal`,
      url: official.stateGovernmentUrl,
      kind: "portal",
      note: "Official state portal from the USA.gov state directory.",
    };
  }

  return {
    label: `${state.name} governor contact`,
    url: official?.governorUrl ?? "https://www.usa.gov/elected-officials",
    kind: "portal",
    note: "Official statewide executive contact route.",
  };
}

function buildHeadline(state: StateAction): string {
  return `Call your ${state.name} state lawmakers and ask them to protect lawful local AI from licensing or preclearance.`;
}

// One to two sentences of "why this state" — plain facts, no homework verbs.
function buildContext(state: StateAction, snapshot?: StateAiSnapshot): string {
  if (snapshot && snapshot.activeBills > 0) {
    return `${state.name} has live AI legislation moving right now. A real constituent call is the clearest simple signal that lawmakers should protect lawful local AI while the language is still open.`;
  }
  if (snapshot && snapshot.enactedBills > 0) {
    return `${state.name} has already enacted AI-related law. Calls now help keep lawful local AI protected as those rules get implemented and future bills get written.`;
  }
  return `${state.name} has not moved a broad AI bill yet. Early constituent calls make it easier to protect lawful local AI before a licensing framework appears.`;
}

function buildCallScript(state: StateAction): string {
  return `Hi, I live in ${state.name}. I'm calling to ask the member to protect lawful local and open-source AI.\n\nPeople should not need a license or platform approval just to run an open model on their own computer. Please support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.\n\nCan you tell me where the member stands on licensing local AI?`;
}

export function derivePrimaryAction(
  state: StateAction,
  snapshot?: StateAiSnapshot,
): PrimaryAction {
  const target = selectTarget(state);
  return {
    headline: buildHeadline(state),
    context: buildContext(state, snapshot),
    ask: state.ask.trim(),
    script: buildCallScript(state),
    targetLabel: target.label,
    targetUrl: target.url,
    targetNote: target.note,
  };
}
