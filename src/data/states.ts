import { STATE_OFFICIAL_LINKS } from "./state-official-links";
import { STATE_POLICY_LINKS } from "./state-policy-links";

// State action data is split into two layers:
// 1. every-state baseline from the 50-state starter matrix;
// 2. deeper source-verified draft packs for states where OII has current bill/action research.
export type Priority = "high" | "medium" | "baseline";
export type Tier = "A" | "B" | "C";

export type ContactTarget = {
  label: string;
  url: string;
  note: string;
};

export type SourceLink = {
  label: string;
  url?: string;
  note: string;
};

export type StateAction = {
  name: string;
  abbr: string;
  tier: Tier;
  prio: Priority;
  reviewStatus: "source-verified draft" | "baseline";
  first: string;
  ask: string;
  script: string;
  contacts: ContactTarget[];
  sources: SourceLink[];
};

export const STATE_ROWS = [
  ["AL", "Alabama", "C"],
  ["AK", "Alaska", "C"],
  ["AZ", "Arizona", "C"],
  ["AR", "Arkansas", "C"],
  ["CA", "California", "A"],
  ["CO", "Colorado", "A"],
  ["CT", "Connecticut", "B"],
  ["DE", "Delaware", "C"],
  ["FL", "Florida", "B"],
  ["GA", "Georgia", "B"],
  ["HI", "Hawaii", "C"],
  ["ID", "Idaho", "C"],
  ["IL", "Illinois", "B"],
  ["IN", "Indiana", "C"],
  ["IA", "Iowa", "C"],
  ["KS", "Kansas", "C"],
  ["KY", "Kentucky", "C"],
  ["LA", "Louisiana", "C"],
  ["ME", "Maine", "C"],
  ["MD", "Maryland", "B"],
  ["MA", "Massachusetts", "B"],
  ["MI", "Michigan", "C"],
  ["MN", "Minnesota", "B"],
  ["MS", "Mississippi", "C"],
  ["MO", "Missouri", "C"],
  ["MT", "Montana", "C"],
  ["NE", "Nebraska", "C"],
  ["NV", "Nevada", "C"],
  ["NH", "New Hampshire", "C"],
  ["NJ", "New Jersey", "B"],
  ["NM", "New Mexico", "C"],
  ["NY", "New York", "A"],
  ["NC", "North Carolina", "B"],
  ["ND", "North Dakota", "C"],
  ["OH", "Ohio", "C"],
  ["OK", "Oklahoma", "C"],
  ["OR", "Oregon", "B"],
  ["PA", "Pennsylvania", "B"],
  ["RI", "Rhode Island", "C"],
  ["SC", "South Carolina", "C"],
  ["SD", "South Dakota", "C"],
  ["TN", "Tennessee", "B"],
  ["TX", "Texas", "A"],
  ["UT", "Utah", "A"],
  ["VT", "Vermont", "C"],
  ["VA", "Virginia", "B"],
  ["WA", "Washington", "A"],
  ["WV", "West Virginia", "C"],
  ["WI", "Wisconsin", "C"],
  ["WY", "Wyoming", "C"],
] as const satisfies readonly (readonly [string, string, Tier])[];

export const STATE_OPTIONS = STATE_ROWS.map(([abbr, name]) => [abbr, name] as const);

const FEDERAL_CONTACTS: ContactTarget[] = [
  {
    label: "Find your U.S. House representative",
    url: "https://www.house.gov/representatives/find-your-representative",
    note: "Use ZIP when you want the federal office that represents you.",
  },
  {
    label: "Contact your two U.S. senators",
    url: "https://www.senate.gov/senators/senators-contact.htm",
    note: "Senators are statewide, so state selection is enough.",
  },
];

const USA_GOV_ELECTED_OFFICIALS_URL = "https://www.usa.gov/elected-officials";
const USA_GOV_AG_DIRECTORY_URL = "https://www.usa.gov/state-attorney-general";
const NCSL_AI_LEGISLATION_URL =
  "https://www.ncsl.org/financial-services/artificial-intelligence-legislation-database";

function policyContacts(abbr: string): ContactTarget[] {
  const links = STATE_POLICY_LINKS[abbr];
  const contacts = [links.legislatorLookup, links.billSearch];
  if (links.calendar) contacts.push(links.calendar);
  return contacts;
}

function policySources(abbr: string): SourceLink[] {
  const links = STATE_POLICY_LINKS[abbr];
  const sources = [links.legislature, links.billSearch, links.legislatorLookup];
  if (links.calendar) sources.push(links.calendar);
  return sources;
}

function officialDirectoryContacts(abbr: string, name: string): ContactTarget[] {
  const links = STATE_OFFICIAL_LINKS[abbr];

  return [
    {
      label: `${name} state government portal`,
      url: links.stateGovernmentUrl,
      note: "Official state portal from the USA.gov state directory.",
    },
    {
      label: `Contact the ${name} governor`,
      url: links.governorUrl,
      note: "Use for statewide executive policy and veto/signature asks.",
    },
    {
      label: `Contact the ${name} attorney general`,
      url: links.attorneyGeneralUrl,
      note: "Use for enforcement, rulemaking, and consumer-protection asks.",
    },
  ];
}

function baselineContacts(abbr: string, name: string): ContactTarget[] {
  return [
    ...policyContacts(abbr),
    ...officialDirectoryContacts(abbr, name),
    {
      label: "Find your state legislators and local officials",
      url: USA_GOV_ELECTED_OFFICIALS_URL,
      note: "Official federal lookup for state legislators, local offices, and exact district routing.",
    },
    {
      label: "Check current AI bills",
      url: NCSL_AI_LEGISLATION_URL,
      note: "NCSL tracker for current state AI legislation.",
    },
    ...FEDERAL_CONTACTS,
  ];
}

function officialDirectorySources(abbr: string, name: string): SourceLink[] {
  const links = STATE_OFFICIAL_LINKS[abbr];

  return [
    {
      label: `USA.gov ${name} state page`,
      url: links.usaGovStatePage,
      note: "Official GSA directory source for this state's portal and governor contact link.",
    },
    {
      label: "USA.gov state attorneys general directory",
      url: USA_GOV_AG_DIRECTORY_URL,
      note: "Official GSA directory source for state attorney general links.",
    },
    {
      label: "USA.gov elected officials lookup",
      url: USA_GOV_ELECTED_OFFICIALS_URL,
      note: "Official federal lookup for state, local, and federal elected officials.",
    },
    {
      label: "U.S. House representative lookup",
      url: "https://www.house.gov/representatives/find-your-representative",
      note: "Official federal House lookup.",
    },
    {
      label: "U.S. Senate contact directory",
      url: "https://www.senate.gov/senators/senators-contact.htm",
      note: "Official senator contacts by state.",
    },
    {
      label: "NCSL AI legislation database",
      url: NCSL_AI_LEGISLATION_URL,
      note: "State AI legislation monitoring source.",
    },
  ];
}

function baselineSources(abbr: string, name: string): SourceLink[] {
  return [
    {
      label: "OII 50-state starter matrix",
      note: "Local source file: projects/local-ai-freedom/source-material/starter-kit/data/state_matrix.csv",
    },
    {
      label: "OII starter action list",
      note: "Local source file: projects/local-ai-freedom/source-material/starter-kit/data/actions.csv",
    },
    ...policySources(abbr),
    ...officialDirectorySources(abbr, name),
  ];
}

function priorityForTier(tier: Tier): Priority {
  if (tier === "A") return "high";
  if (tier === "B") return "medium";
  return "baseline";
}

function buildBaselineState(abbr: string, name: string, tier: Tier): StateAction {
  return {
    name,
    abbr,
    tier,
    prio: priorityForTier(tier),
    reviewStatus: "baseline",
    first: `${name} does not have a source-reviewed OII action pack yet. That still leaves one useful move: ask state officials to protect lawful local AI before future rules are written around cloud labs and large platforms.`,
    ask:
      "Ask your state legislators to introduce or support a Local AI Freedom Act: no license, registration, or preclearance just to download, own, run, study, modify, or share open AI models. Keep enforcement focused on harmful conduct.",
    script: `Hi, my name is [NAME], and I live in [CITY], ${abbr}.\n\nI'm asking your office to protect lawful local AI in ${name}.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please support a Local AI Freedom Act that protects ordinary local use while preserving enforcement against fraud, cybercrime, CSAM, harassment, nonconsensual intimate deepfakes, discrimination, and sabotage.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?`,
    contacts: baselineContacts(abbr, name),
    sources: baselineSources(abbr, name),
  };
}

export const STATES: Record<string, StateAction> = Object.fromEntries(
  STATE_ROWS.map(([abbr, name, tier]) => [abbr, buildBaselineState(abbr, name, tier)]),
) as Record<string, StateAction>;

STATES.CA = {
  ...STATES.CA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "California is one of the places where AI rules become national defaults. The immediate ask is to protect lawful local AI before transparency or safety rules are written only around cloud labs and large platforms.",
  ask:
    "Ask California offices to add clear safe harbors for open-source hosting, model-weight sharing, research, local inference, and downstream modification. Keep enforcement focused on harmful conduct.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local AI as California considers new AI rules.\n\nPeople should not need state permission or platform approval just to run an open model on their own computer. Please keep the law focused on harmful uses, not possession, research, open-source hosting, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Find your California legislator",
      url: "https://findyourrep.legislature.ca.gov/",
      note: "Official California legislature lookup.",
    },
    ...officialDirectoryContacts("CA", "California"),
    {
      label: "Assembly events and hearings",
      url: "https://www.assembly.ca.gov/schedules-publications/todays-events",
      note: "Use to check committee timing before sending public comments.",
    },
    {
      label: "Search California bills",
      url: STATE_POLICY_LINKS.CA.billSearch.url,
      note: "Official bill search for checking current AI legislation.",
    },
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("CA"),
    ...officialDirectorySources("CA", "California"),
    {
      label: "California SB 53 status",
      url: "https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260SB53",
      note: "California frontier AI transparency law status.",
    },
    {
      label: "California SB 1000 status",
      url: "https://leginfo.legislature.ca.gov/faces/billStatusClient.xhtml?bill_id=202520260SB1000",
      note: "Active AI transparency bill to monitor for open/local AI safe harbors.",
    },
    {
      label: "California AB 412 text",
      url: "https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202520260AB412",
      note: "Training-data disclosure bill to monitor for research/open-model burden.",
    },
  ],
};

STATES.CO = {
  ...STATES.CO,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Colorado is updating its AI rules now. The ask is simple: protect lawful local AI before the rules are written only around cloud labs and large platforms.",
  ask:
    "Ask the Colorado Attorney General to keep ADMT and chatbot rules focused on covered deployments and harmful conduct, not lawful local model possession, research, open-source publication, or local execution.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local AI as Colorado updates its AI rules.\n\nPeople should not need state permission or platform approval just to run an open model on their own computer. Please keep the law focused on harmful uses, not possession, research, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Colorado AG pre-rulemaking comment form",
      url: "https://coag.gov/ai/automated-decision-making-technology-act-and-chatbot-safety-act-form/",
      note: "Immediate OII action window for ADMT and Chatbot Safety Acts.",
    },
    {
      label: "Find your Colorado legislator",
      url: "https://leg.colorado.gov/find-my-legislator",
      note: "Official Colorado legislature lookup.",
    },
    ...officialDirectoryContacts("CO", "Colorado"),
    {
      label: "Colorado committees",
      url: "https://leg.colorado.gov/content/committees",
      note: "Use to find committee pages and hearing context.",
    },
    {
      label: "Search Colorado bills",
      url: STATE_POLICY_LINKS.CO.billSearch.url,
      note: "Official bill search for checking current AI legislation.",
    },
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("CO"),
    ...officialDirectorySources("CO", "Colorado"),
    {
      label: "Colorado AG ADMT and Chatbot Safety comment form",
      url: "https://coag.gov/ai/automated-decision-making-technology-act-and-chatbot-safety-act-form/",
      note: "Official Attorney General pre-rulemaking portal.",
    },
    {
      label: "Colorado SB26-189",
      url: "https://leg.colorado.gov/bills/sb26-189",
      note: "Automated Decision-Making Technology law source.",
    },
    {
      label: "Colorado HB26-1263",
      url: "https://leg.colorado.gov/bills/HB26-1263",
      note: "Conversational AI service operator requirements source.",
    },
  ],
};

STATES.TX = {
  ...STATES.TX,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Texas can turn its energy and compute advantage into an AI infrastructure advantage. The ask is to make Texas the place where people and companies can lawfully own, run, and improve their own models.",
  ask:
    "Ask Texas offices to build a 2027 Local AI Freedom safe harbor: protect lawful local inference, model ownership, research, self-hosted AI, model modification, and open-weight publication.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nTexas already has a major energy and compute advantage. Please protect the right for people and companies here to own, run, and improve AI models on their own hardware.\n\nThe law should go after harmful use, not private, lawful use. Texas should be the best state to build self-hosted and local AI infrastructure.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local AI?",
  contacts: [
    {
      label: "Find your Texas legislator",
      url: "https://wrm.capitol.texas.gov/home",
      note: "Official Texas legislature lookup.",
    },
    {
      label: "Texas hearing calendar",
      url: "https://capitol.texas.gov/Committees/MeetingsByCmte.aspx",
      note: "Use for committee timing and public testimony opportunities.",
    },
    {
      label: "Texas DIR AI and Innovation",
      url: "https://dir.texas.gov/ai-and-innovation",
      note: "Agency implementation page for Texas AI policy.",
    },
    {
      label: "PUCT Office of Public Engagement",
      url: "https://www.puc.texas.gov/agency/about/ope/",
      note: "Relevant for the Texas data-center and large-load compute angle.",
    },
    {
      label: "Search Texas bills",
      url: STATE_POLICY_LINKS.TX.billSearch.url,
      note: "Official bill lookup for checking current Texas AI legislation.",
    },
    ...officialDirectoryContacts("TX", "Texas"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("TX"),
    ...officialDirectorySources("TX", "Texas"),
    {
      label: "Texas HB 149 enrolled text",
      url: "https://capitol.texas.gov/tlodocs/89R/billtext/html/HB00149F.htm",
      note: "Texas Responsible Artificial Intelligence Governance Act.",
    },
    {
      label: "Texas HB 149 history",
      url: "https://capitol.texas.gov/BillLookup/History.aspx?LegSess=89R&Bill=HB149",
      note: "Official bill history and actions.",
    },
    {
      label: "Texas DIR AI and Innovation",
      url: "https://dir.texas.gov/ai-and-innovation",
      note: "State AI implementation and innovation source.",
    },
    {
      label: "PUCT public engagement",
      url: "https://www.puc.texas.gov/agency/about/ope/",
      note: "Official path for public engagement on utility and large-load issues.",
    },
  ],
};
