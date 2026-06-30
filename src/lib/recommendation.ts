import type { StateAction } from "../data/states";
import type { StateAiSnapshot } from "../data/state-ai-snapshots";
import { STATE_POLICY_LINKS } from "../data/state-policy-links";
import { STATE_OFFICIAL_LINKS } from "../data/state-official-links";

// One complete, brainless action packet derived from existing state data.
// The visitor never has to research, search, or choose a bill — the helper
// picks the first useful official destination and a ready-to-send message.
export type PrimaryAction = {
  headline: string;
  context: string;
  ask: string;
  script: string;
  targetLabel: string;
  targetUrl: string;
  targetNote: string;
};

type TargetKind = "ag" | "legislator" | "portal";

type Target = {
  label: string;
  url: string;
  note: string;
  kind: TargetKind;
};

// Time-sensitive official portals that beat the default legislator lookup.
const SPECIAL_TARGETS: Record<string, Target> = {
  CO: {
    label: "Colorado Attorney General comment form",
    url: "https://coag.gov/ai/automated-decision-making-technology-act-and-chatbot-safety-act-form/",
    kind: "ag",
    note: "Official Colorado Attorney General pre-rulemaking comment form for the ADMT and Chatbot Safety Acts.",
  },
  TX: {
    label: "Texas legislator lookup",
    url: "https://wrm.capitol.texas.gov/home",
    kind: "legislator",
    note: "Official Texas Legislature who-represents-me lookup.",
  },
  CA: {
    label: "California legislator lookup",
    url: "https://findyourrep.legislature.ca.gov/",
    kind: "legislator",
    note: "Official California Legislature legislator lookup.",
  },
};

// Target selection: special portal first, then official legislator lookup,
// then the state government portal, then governor contact. Never a bill search.
function selectTarget(state: StateAction): Target {
  const special = SPECIAL_TARGETS[state.abbr];
  if (special) return special;

  const lookup = STATE_POLICY_LINKS[state.abbr]?.legislatorLookup;
  if (lookup?.url) {
    return {
      label: `${state.name} legislator lookup`,
      url: lookup.url,
      kind: "legislator",
      note: lookup.note,
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

function buildHeadline(state: StateAction, target: Target): string {
  if (target.kind === "ag") {
    return `Send one message to the ${state.name} Attorney General asking them to keep lawful local AI out of licensing or preclearance rules.`;
  }
  return `Send one message to your ${state.name} lawmakers asking them to protect lawful local AI from licensing or preclearance.`;
}

// One to two sentences of "why this state" — plain facts, no homework verbs.
function buildContext(state: StateAction, snapshot?: StateAiSnapshot): string {
  if (snapshot && snapshot.activeBills > 0) {
    return `${state.name} has live AI legislation moving right now, so adding a lawful-local-AI safe harbor while the language is still open is the useful move.`;
  }
  if (snapshot && snapshot.enactedBills > 0) {
    return `${state.name} has already enacted AI-related law, so the useful move is keeping lawful local AI protected as those rules get implemented.`;
  }
  return `${state.name} has not moved a broad AI bill yet, which makes an early ask to protect lawful local AI especially useful.`;
}

// Reuse the state's vetted message body but drop the constituent-detail opener
// so the default copy needs no name, city, or ZIP.
function simplifyScript(state: StateAction): string {
  const paragraphs = state.script.split("\n\n");
  const body = paragraphs.slice(1).join("\n\n").trim();
  const opener = `Hi, I live in ${state.name}.`;
  const composed = body ? `${opener}\n\n${body}` : opener;
  return composed.replace(/\s*\[(?:NAME|CITY|ZIP)\]/g, "");
}

export function derivePrimaryAction(
  state: StateAction,
  snapshot?: StateAiSnapshot,
): PrimaryAction {
  const target = selectTarget(state);
  return {
    headline: buildHeadline(state, target),
    context: buildContext(state, snapshot),
    ask: state.ask.trim(),
    script: simplifyScript(state),
    targetLabel: target.label,
    targetUrl: target.url,
    targetNote: target.note,
  };
}
