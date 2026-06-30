import { STATE_OFFICIAL_LINKS } from "./state-official-links";
import { STATE_AI_SNAPSHOTS } from "./state-ai-snapshots";
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

function buildBaselineFirst(abbr: string, name: string) {
  const snapshot = STATE_AI_SNAPSHOTS[abbr];
  if (!snapshot) {
    return `${name} has a baseline OII action pack with official contact routes. The useful move is to ask state officials to protect lawful local AI before future rules are written around cloud labs and large platforms.`;
  }

  if (snapshot.activeBills >= 10) {
    return `${name} is already an active AI policy state. The snapshot below shows a real queue, not a theoretical one. Start with the official state bill search, then ask for local/open AI safe-harbor language in anything moving now.`;
  }

  if (snapshot.activeBills > 0) {
    return `${name} has a smaller but live AI bill queue. The useful move is to open the official bill search, then contact your own state legislators and ask them to protect lawful local model ownership, research, modification, and execution.`;
  }

  if (snapshot.enactedBills > 0) {
    return `${name} does not currently show active AI bills in the NCSL snapshot, but it has already enacted AI-related law in the 2025-present tracker. The useful move is implementation pressure: ask legislators, the governor, and the attorney general to keep lawful local/open AI outside licensing or preclearance rules.`;
  }

  return `${name} does not currently show active or enacted AI bills in the NCSL snapshot. That is still useful. Ask state officials to introduce an affirmative Local AI Freedom safe harbor before the first broad AI bill is written.`;
}

function buildBaselineState(abbr: string, name: string, tier: Tier): StateAction {
  return {
    name,
    abbr,
    tier,
    prio: priorityForTier(tier),
    reviewStatus: "baseline",
    first: buildBaselineFirst(abbr, name),
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

STATES.NY = {
  ...STATES.NY,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "New York has already moved frontier-model AI rules through the legislature, including the RAISE Act and a 2026 chapter amendment. The OII ask is not to erase enforcement. It is to make sure future New York AI rules do not turn ordinary local model ownership, research, open-source work, or local execution into permissioned activity.",
  ask:
    "Ask New York offices to add explicit lawful local/open AI safe-harbor language to future AI bills and implementation guidance: no license, registration, or preclearance just to download, own, run, study, modify, or share open models.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as New York continues writing AI rules.\n\nNew York can enforce against fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and catastrophic misuse without requiring ordinary people, researchers, startups, libraries, or schools to get permission just to run or study open models locally.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Find your New York senator",
      url: "https://www.nysenate.gov/find-my-senator",
      note: "Official New York Senate lookup.",
    },
    {
      label: "Find your New York assembly member",
      url: "https://nyassembly.gov/mem/search/",
      note: "Official New York Assembly member search.",
    },
    {
      label: "Search New York legislation",
      url: STATE_POLICY_LINKS.NY.billSearch.url,
      note: "Official New York Assembly legislation page.",
    },
    ...officialDirectoryContacts("NY", "New York"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("NY"),
    ...officialDirectorySources("NY", "New York"),
    {
      label: "New York S6953B RAISE Act",
      url: "https://www.nysenate.gov/legislation/bills/2025/S6953",
      note: "Official New York Senate page; signed by governor; relates to training and use of artificial intelligence frontier models.",
    },
    {
      label: "New York S8828 chapter amendment",
      url: "https://www.nysenate.gov/legislation/bills/2025/S8828",
      note: "Official New York Senate page; signed by governor; relates to transparency and safety requirements for developers of artificial intelligence models.",
    },
    {
      label: "New York Assembly member search",
      url: "https://nyassembly.gov/mem/search/",
      note: "Official Assembly lookup for district-level outreach.",
    },
  ],
};

STATES.MA = {
  ...STATES.MA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Massachusetts is a high-volume active AI bill state. The official 194th General Court bill search and event pages give residents a practical route: find the moving AI bills, then ask legislators to add local/open AI safe-harbor language before text hardens.",
  ask:
    "Ask Massachusetts legislators to protect lawful local model ownership, research, modification, self-hosting, and open-source publication in any AI, automated-decision, privacy, education, labor, consumer-protection, or public-sector AI bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Massachusetts considers AI legislation.\n\nMassachusetts can regulate harmful deployment, discrimination, fraud, cybercrime, CSAM, harassment, unlawful deepfakes, and real-world abuse without making ordinary local AI use permissioned. People should not need a license or platform approval just to download, own, run, study, modify, or share open models on their own hardware.\n\nPlease support explicit safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Find Massachusetts legislators",
      url: STATE_POLICY_LINKS.MA.legislatorLookup.url,
      note: "Official 194th General Court lookup for your senator and representative.",
    },
    {
      label: "Search Massachusetts bills",
      url: STATE_POLICY_LINKS.MA.billSearch.url,
      note: "Official bill search; search artificial intelligence, automated decision, algorithm, data center, and generative AI.",
    },
    {
      label: "Massachusetts hearings and events",
      url: STATE_POLICY_LINKS.MA.calendar?.url ?? "https://malegislature.gov/Events",
      note: "Official hearing and event route for timing public comments.",
    },
    ...officialDirectoryContacts("MA", "Massachusetts"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("MA"),
    ...officialDirectorySources("MA", "Massachusetts"),
    {
      label: "Massachusetts 194th General Court bill search",
      url: "https://malegislature.gov/Bills/Search",
      note: "Official bill-search route; OII checked the current 194th General Court search page on 2026-06-30.",
    },
    {
      label: "Massachusetts Find My Legislator",
      url: "https://malegislature.gov/Search/FindMyLegislator",
      note: "Official legislator lookup checked on 2026-06-30.",
    },
  ],
};

STATES.PA = {
  ...STATES.PA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Pennsylvania has a live AI bill queue. The official General Assembly Bills & Resolutions page supports keyword search through bill text, current-session filtering, sponsors, committees, and recent activity, so the resident move is straightforward: search the current session and ask for safe-harbor language in anything moving.",
  ask:
    "Ask Pennsylvania legislators to add lawful local/open AI safe harbors to any AI bill: no license, registration, or preclearance just to download, own, run, study, modify, or share open models on local hardware.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Pennsylvania considers AI legislation.\n\nThe state should enforce against harmful conduct, fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse. But ordinary people, researchers, schools, startups, and local businesses should not need permission just to run or study open models on their own machines.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Pennsylvania bills",
      url: "https://www.palegis.us/legislation/bills",
      note: "Official current-session bill and resolution search; use the keyword field for artificial intelligence and automated decision.",
    },
    {
      label: "Find Pennsylvania legislators",
      url: "https://www.palegis.us/find-my-legislator",
      note: "Official General Assembly legislator lookup route.",
    },
    ...officialDirectoryContacts("PA", "Pennsylvania"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("PA"),
    ...officialDirectorySources("PA", "Pennsylvania"),
    {
      label: "Pennsylvania Bills & Resolutions search",
      url: "https://www.palegis.us/legislation/bills",
      note: "Official General Assembly page; OII checked current-session keyword, sponsor, committee, and bill-number search routes on 2026-06-30.",
    },
    {
      label: "Pennsylvania Legislation home",
      url: "https://www.palegis.us/legislation",
      note: "Official General Assembly legislation page and recent bill activity source.",
    },
  ],
};

STATES.NC = {
  ...STATES.NC,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "North Carolina is a live AI bill state. The official General Assembly site gives residents bill lookup, all-bill-text search, calendars, committees, and a public web-services page for bill reports. The ask should be added before active bills become final text.",
  ask:
    "Ask North Carolina legislators to preserve lawful local/open AI safe harbors in any AI, data, education, labor, public-sector, automated-decision, or consumer-protection bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as North Carolina considers AI legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports explicit safe-harbor language for lawful local and open-source AI?",
  contacts: [
    {
      label: "Find North Carolina legislators",
      url: STATE_POLICY_LINKS.NC.legislatorLookup.url,
      note: "Official NCGA lookup for district-level outreach.",
    },
    {
      label: "Search North Carolina bills",
      url: STATE_POLICY_LINKS.NC.billSearch.url,
      note: "Official bill lookup; use All Bill Text for AI-related keyword searches.",
    },
    {
      label: "North Carolina legislative calendars",
      url: "https://www.ncleg.gov/Calendars",
      note: "Official route for House, Senate, and legislative calendars.",
    },
    {
      label: "North Carolina committees",
      url: "https://www.ncleg.gov/Committees",
      note: "Official committee route for sponsor and hearing context.",
    },
    ...officialDirectoryContacts("NC", "North Carolina"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("NC"),
    ...officialDirectorySources("NC", "North Carolina"),
    {
      label: "North Carolina bill lookup",
      url: "https://www.ncleg.gov/BillLookup",
      note: "Official NCGA bill lookup checked on 2026-06-30.",
    },
    {
      label: "North Carolina web services",
      url: "https://www.ncleg.gov/About/Webservices",
      note: "Official NCGA public web-services page listing bill history, filed bills, keyword-associated bills, calendars, and bill-report endpoints.",
    },
  ],
};

STATES.MN = {
  ...STATES.MN,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Minnesota has both active AI bills and enacted AI-related law. Official Revisor records show HF1606, an AI nudification bill, approved by the governor on 2026-05-07. The OII move is to keep abuse enforcement serious while preventing broader AI rules from requiring permission for lawful local/open AI.",
  ask:
    "Ask Minnesota legislators to preserve lawful local/open AI safe harbors in any AI safety, deepfake, education, consumer-protection, public-sector, labor, privacy, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Minnesota continues working on AI legislation.\n\nMinnesota should enforce against nonconsensual intimate deepfakes, CSAM, fraud, cybercrime, harassment, discrimination, and real-world abuse. But people should not need permission just to own, run, study, modify, or share open models on local hardware.\n\nPlease support explicit safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Find Minnesota legislators",
      url: STATE_POLICY_LINKS.MN.legislatorLookup.url,
      note: "Official district finder for House and Senate contacts.",
    },
    {
      label: "Search Minnesota bills",
      url: STATE_POLICY_LINKS.MN.billSearch.url,
      note: "Official bill search and status route for House and Senate bills.",
    },
    {
      label: "Minnesota House committees",
      url: "https://www.house.mn.gov/committees",
      note: "Official House committee route for hearing context.",
    },
    {
      label: "Minnesota Senate committees",
      url: "https://www.senate.mn/committees",
      note: "Official Senate committee route for hearing context.",
    },
    ...officialDirectoryContacts("MN", "Minnesota"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("MN"),
    ...officialDirectorySources("MN", "Minnesota"),
    {
      label: "Minnesota bill search and status",
      url: "https://www.leg.mn.gov/leg/legis",
      note: "Official legislative bill search page checked on 2026-06-30.",
    },
    {
      label: "Minnesota HF1606",
      url: "https://www.revisor.mn.gov/bills/94/2025/0/HF/1606/?body=house",
      note: "Official Revisor page; nudification technology access prohibited; governor approval 2026-05-07; chapter 72.",
    },
  ],
};

STATES.OH = {
  ...STATES.OH,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Ohio is another active AI bill state. The official Ohio Legislature search page exposes the 136th General Assembly, keyword search, sponsors, committees, subjects, status reports, calendars, and district maps. The immediate move is to search the current session and ask for a local/open AI carve-out before broad rules move.",
  ask:
    "Ask Ohio legislators to add explicit safe-harbor language to any AI bill: lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication should not require licensing or preclearance.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Ohio considers AI legislation.\n\nThe state should enforce against harmful deployment, fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse. But owning, running, studying, modifying, or sharing open models on local hardware should not become a permissioned activity.\n\nPlease support clear safe-harbor language for lawful local AI and open-source AI.",
  contacts: [
    {
      label: "Search Ohio legislation",
      url: STATE_POLICY_LINKS.OH.billSearch.url,
      note: "Official Ohio Legislature search; use artificial intelligence, automated decision, algorithm, and generative AI.",
    },
    {
      label: "Find Ohio districts",
      url: STATE_POLICY_LINKS.OH.legislatorLookup.url,
      note: "Official Ohio district and member map route.",
    },
    {
      label: "Ohio legislative calendar",
      url: "https://www.legislature.ohio.gov/schedules/calendar",
      note: "Official schedule route for hearing and session timing.",
    },
    ...officialDirectoryContacts("OH", "Ohio"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("OH"),
    ...officialDirectorySources("OH", "Ohio"),
    {
      label: "Ohio legislation search",
      url: "https://www.legislature.ohio.gov/legislation/search?generalAssembly=136",
      note: "Official Ohio Legislature 136th General Assembly search checked on 2026-06-30.",
    },
    {
      label: "Ohio district maps",
      url: "https://www.legislature.ohio.gov/members/district-maps",
      note: "Official district and member lookup route checked on 2026-06-30.",
    },
  ],
};

STATES.RI = {
  ...STATES.RI,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Rhode Island has a live AI bill queue and an unusually direct policy route: the official bill status system exposes an Artificial Intelligence category and a Senate Artificial Intelligence & Emerging Tech committee. Residents should use that route before broad AI language becomes final.",
  ask:
    "Ask Rhode Island legislators to protect lawful local/open AI in any AI, emerging-tech, consumer-protection, education, labor, privacy, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Rhode Island considers AI legislation.\n\nRhode Island can enforce against fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse without requiring people to get permission just to download, own, run, study, modify, or share open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Rhode Island bill status",
      url: STATE_POLICY_LINKS.RI.billSearch.url,
      note: "Official General Assembly bill status system; use the Artificial Intelligence category and 2026 session filters.",
    },
    {
      label: "Find Rhode Island representatives",
      url: STATE_POLICY_LINKS.RI.legislatorLookup.url,
      note: "Official House directory with district sorting and contact-download route.",
    },
    {
      label: "Rhode Island Senate",
      url: "https://www.rilegislature.gov/senators/default.aspx",
      note: "Official Senate route for senator and committee context.",
    },
    ...officialDirectoryContacts("RI", "Rhode Island"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("RI"),
    ...officialDirectorySources("RI", "Rhode Island"),
    {
      label: "Rhode Island bill status system",
      url: "https://status.rilegislature.gov/",
      note: "Official 2026 bill status system checked on 2026-06-30; exposes Artificial Intelligence category and Senate Artificial Intelligence & Emerging Tech committee inventory.",
    },
    {
      label: "Rhode Island House representatives",
      url: "https://www.rilegislature.gov/representatives/default.aspx",
      note: "Official House representative directory checked on 2026-06-30.",
    },
  ],
};

STATES.SC = {
  ...STATES.SC,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "South Carolina has a live AI bill queue and a legislature site that gives residents multiple official routes: bill-number search, legislation search by subject/history/full text, committee postings, and a legislator finder. The practical move is to search the current session and ask for a lawful local/open AI carve-out in anything moving.",
  ask:
    "Ask South Carolina legislators to add local/open AI safe-harbor language to any AI, technology, education, labor, consumer-protection, public-sector, privacy, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as South Carolina considers AI legislation.\n\nThe state should enforce against harmful conduct, fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse. But lawful possession, research, open-source publication, model modification, and local execution should not require a license or preclearance.\n\nPlease support explicit safe-harbor language for lawful local and open-source AI.",
  contacts: [
    {
      label: "Search South Carolina legislation",
      url: "https://www.scstatehouse.gov/legislation.php",
      note: "Official legislation route with subject, history, full-text, and multi-criteria search links.",
    },
    {
      label: "Find South Carolina legislators",
      url: STATE_POLICY_LINKS.SC.legislatorLookup.url,
      note: "Official address-based lookup for state legislators and members of Congress.",
    },
    {
      label: "South Carolina committee postings",
      url: "https://www.scstatehouse.gov/committee.php",
      note: "Official committee postings route for hearing and agenda context.",
    },
    ...officialDirectoryContacts("SC", "South Carolina"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("SC"),
    ...officialDirectorySources("SC", "South Carolina"),
    {
      label: "South Carolina legislation search",
      url: "https://www.scstatehouse.gov/legislation.php",
      note: "Official legislation page checked on 2026-06-30; links to subject, history, full text, and multi-criteria search.",
    },
    {
      label: "South Carolina Find Your Legislators",
      url: "https://www.scstatehouse.gov/legislatorssearch.php",
      note: "Official legislator lookup checked on 2026-06-30.",
    },
  ],
};

STATES.VT = {
  ...STATES.VT,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Vermont has active AI legislation and a legislature site with bill search, committee meetings, and a committee named Energy & Digital Infrastructure. The useful ask is narrow: keep abuse rules and deployment rules serious, but keep local/open model ownership and research outside licensing.",
  ask:
    "Ask Vermont legislators to add lawful local/open AI safe harbors to AI, digital-infrastructure, privacy, education, labor, consumer-protection, automated-decision, or public-sector technology bills.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Vermont considers AI and digital-infrastructure legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not local possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search Vermont bills",
      url: STATE_POLICY_LINKS.VT.billSearch.url,
      note: "Official 2025-2026 bill, act, and resolution search.",
    },
    {
      label: "Find Vermont legislators",
      url: STATE_POLICY_LINKS.VT.legislatorLookup.url,
      note: "Official people search for representatives and senators.",
    },
    {
      label: "Vermont committee meetings",
      url: "https://legislature.vermont.gov/committee/meetings/2026",
      note: "Official committee-meeting route for hearing timing.",
    },
    ...officialDirectoryContacts("VT", "Vermont"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("VT"),
    ...officialDirectorySources("VT", "Vermont"),
    {
      label: "Vermont bill, act, and resolution search",
      url: "https://legislature.vermont.gov/bill/search/2026",
      note: "Official 2025-2026 session search checked on 2026-06-30; includes all bills, committee movement, acts, and scheduled committee meetings.",
    },
    {
      label: "Vermont legislator search",
      url: "https://legislature.vermont.gov/people/search/2026",
      note: "Official people search checked on 2026-06-30.",
    },
  ],
};

STATES.MI = {
  ...STATES.MI,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Michigan has active AI bills and an official legislature site that exposes bills, document search, calendars, committees, committee meetings, committee bill records, legislators, and signed public acts in one place. The resident move is to search the current session and ask for a lawful local/open AI safe harbor before bills leave committee.",
  ask:
    "Ask Michigan legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI or automated-decision legislation.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Michigan considers AI legislation.\n\nMichigan can regulate harmful uses, fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse without requiring people, schools, startups, or local businesses to get permission just to run or study open models on their own machines.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Michigan bills",
      url: STATE_POLICY_LINKS.MI.billSearch.url,
      note: "Official current-session bills page with document search and bill browsing routes.",
    },
    {
      label: "Michigan legislators",
      url: "https://www.legislature.mi.gov/Legislators/",
      note: "Official legislator route for House and Senate contacts.",
    },
    {
      label: "Michigan committee meetings",
      url: "https://www.legislature.mi.gov/CommitteeMeetings/",
      note: "Official committee meeting route for hearing timing.",
    },
    ...officialDirectoryContacts("MI", "Michigan"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("MI"),
    ...officialDirectorySources("MI", "Michigan"),
    {
      label: "Michigan bills page",
      url: "https://www.legislature.mi.gov/Bills/",
      note: "Official bills page checked on 2026-06-30; exposes 2025-2026 bills, document search, calendars, committees, committee meetings, and public acts.",
    },
    {
      label: "Michigan legislative document search",
      url: "https://www.legislature.mi.gov/Search/",
      note: "Official document search route linked from the Michigan bills page.",
    },
  ],
};

STATES.WA = {
  ...STATES.WA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Washington has active AI bills and a mature public participation system. The official legislature routes people from bills to meeting schedules, how to comment on a bill, how to testify at committee, district finder, and legislator directories. That makes Washington a strong action state, not just a policy-monitoring state.",
  ask:
    "Ask Washington legislators to keep lawful local/open AI outside licensing or preclearance requirements in any AI, privacy, automated-decision, public-sector, labor, education, data-center, or consumer-protection bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Washington considers AI legislation.\n\nThe state can regulate harmful deployment, fraud, cybercrime, discrimination, CSAM, harassment, unlawful deepfakes, and real-world abuse without making ordinary local AI use permissioned. People should not need state permission or platform approval just to download, own, run, study, modify, or share open models on local hardware.\n\nPlease support explicit safe-harbor language for lawful local and open-source AI.",
  contacts: [
    {
      label: "Search Washington bills",
      url: STATE_POLICY_LINKS.WA.billSearch.url,
      note: "Official bill information route; redirects into the current bills, meetings, and session hub.",
    },
    {
      label: "Find Washington districts",
      url: STATE_POLICY_LINKS.WA.legislatorLookup.url,
      note: "Official district finder for legislator contacts.",
    },
    {
      label: "Washington meeting schedules",
      url: "https://app.leg.wa.gov/committeeschedules/",
      note: "Official committee schedule route for testimony timing.",
    },
    {
      label: "How to comment on a Washington bill",
      url: "https://leg.wa.gov/bills-meetings-and-session/bills/how-to-comment-on-a-bill/",
      note: "Official participation route when a bill is active.",
    },
    ...officialDirectoryContacts("WA", "Washington"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("WA"),
    ...officialDirectorySources("WA", "Washington"),
    {
      label: "Washington bills, meetings, and session hub",
      url: "https://leg.wa.gov/bills-meetings-and-session/bills/",
      note: "Official bills hub checked on 2026-06-30; includes bills, how to track/comment on a bill, meeting schedules, and testimony routes.",
    },
    {
      label: "Washington district finder",
      url: "https://app.leg.wa.gov/districtfinder/",
      note: "Official district finder checked on 2026-06-30.",
    },
  ],
};

STATES.FL = {
  ...STATES.FL,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Florida has active AI legislation and an official Senate bill system that lets residents search bill text, bill versions, amendments, sponsors, committees, agendas, status, and governor action. The useful action is to search the current session and ask for a local/open AI safe harbor in anything moving.",
  ask:
    "Ask Florida legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, privacy, education, labor, consumer-protection, public-sector, automated-decision, or deepfake bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Florida considers AI legislation.\n\nFlorida can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring ordinary people, researchers, schools, startups, or local businesses to get permission just to run or study open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Florida bills",
      url: STATE_POLICY_LINKS.FL.billSearch.url,
      note: "Official Florida Senate bill search; search all bill versions and amendments for artificial intelligence and automated decision terms.",
    },
    {
      label: "Find Florida senators",
      url: STATE_POLICY_LINKS.FL.legislatorLookup.url,
      note: "Official Florida Senate lookup route.",
    },
    {
      label: "Florida House committee schedules",
      url: STATE_POLICY_LINKS.FL.calendar?.url ?? "https://www.myfloridahouse.gov/Sections/Committees/committeeschedules.aspx",
      note: "Official House committee schedule route for timing outreach.",
    },
    ...officialDirectoryContacts("FL", "Florida"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("FL"),
    ...officialDirectorySources("FL", "Florida"),
    {
      label: "Florida Senate bill list",
      url: "https://www.flsenate.gov/Session/Bills/2026",
      note: "Official 2026 bill list checked on 2026-06-30; includes search term, bill version, amendment, sponsor, committee, agenda, status, and governor-action filters.",
    },
    {
      label: "Florida Find Your Legislators",
      url: "https://www.flsenate.gov/Senators/Find",
      note: "Official Florida Senate legislator lookup checked on 2026-06-30.",
    },
  ],
};

STATES.NJ = {
  ...STATES.NJ,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "New Jersey has a large active AI bill queue, and the official 2026 bill search already shows bills touching AI data-center energy planning, public-sector generative AI programs, and automated-decision liability. The useful ask is to make sure those rules do not accidentally turn ordinary local model ownership or open-source research into permissioned activity.",
  ask:
    "Ask New Jersey legislators to add lawful local/open AI safe-harbor language to AI, data-center, and automated-decision bills: no license, registration, or preclearance just to download, own, run, study, modify, or share open models on local hardware.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as New Jersey considers AI bills this session.\n\nThe state can regulate harmful conduct, automated-decision abuse, and large AI infrastructure without requiring ordinary people, researchers, startups, schools, or local businesses to get permission just to run or study open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Find New Jersey legislators",
      url: STATE_POLICY_LINKS.NJ.legislatorLookup.url,
      note: "Official legislative roster for district-level outreach.",
    },
    {
      label: "Search New Jersey AI bills",
      url: "https://www.njleg.state.nj.us/bill-search",
      note: "Official 2026 bill search; search artificial intelligence, automated decision, and algorithm.",
    },
    {
      label: "New Jersey Senate committees",
      url: "https://www.njleg.state.nj.us/committees/senate-committees",
      note: "Use for committee routing when a Senate bill is assigned.",
    },
    {
      label: "New Jersey Assembly committees",
      url: "https://www.njleg.state.nj.us/committees/assembly-committees",
      note: "Use for committee routing when an Assembly bill is assigned.",
    },
    ...officialDirectoryContacts("NJ", "New Jersey"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("NJ"),
    ...officialDirectorySources("NJ", "New Jersey"),
    {
      label: "New Jersey official AI keyword search",
      url: "https://www.njleg.state.nj.us/bill-search",
      note: "Official 2026 bill search; OII checked artificial intelligence keyword results through the legislature's public search API on 2026-06-30.",
    },
    {
      label: "New Jersey A1170",
      url: "https://www.njleg.state.nj.us/bill-search/2026/A1170",
      note: "Official bill page; requires an energy usage plan for proposed AI data centers and new clean-energy sourcing.",
    },
    {
      label: "New Jersey S4279",
      url: "https://www.njleg.state.nj.us/bill-search/2026/S4279",
      note: "Official bill page; provides disparate impact based on automated decision system as a cause of action for certain consumers.",
    },
    {
      label: "New Jersey A2616",
      url: "https://www.njleg.state.nj.us/bill-search/2026/A2616",
      note: "Official bill page; requires a state generative AI program and AI education courses with county governments.",
    },
  ],
};

STATES.IL = {
  ...STATES.IL,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Illinois is one of the highest-volume active AI bill states. Official 104th General Assembly records show a frontier AI safety bill sent to the governor, plus active work around AI systems in health insurance and AI companion products. The OII move is to keep enforcement real while making lawful local/open AI explicitly out of scope.",
  ask:
    "Ask Illinois offices to preserve clear safe harbors for lawful local model ownership, research, modification, self-hosting, and open-source publication in any frontier-model, health-insurance AI, companion AI, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Illinois moves AI legislation.\n\nIllinois can enforce against harmful deployment, fraud, discrimination, unsafe consumer products, and large frontier-model risks without making ordinary local AI use permissioned. Please keep any AI law focused on harmful conduct and covered commercial deployment, not possession, research, model modification, open-source publication, or local execution.\n\nCan you tell me whether the office supports explicit safe-harbor language for lawful local and open-source AI?",
  contacts: [
    {
      label: "Find Illinois districts",
      url: STATE_POLICY_LINKS.IL.legislatorLookup.url,
      note: "Official Illinois State Board of Elections district lookup.",
    },
    {
      label: "Search Illinois legislation",
      url: "https://www.ilga.gov/Search?base=Legis",
      note: "Official ILGA search; use artificial intelligence, generative artificial intelligence, automated decision, SB315, SB316, HB35, or HB220.",
    },
    {
      label: "Illinois Senate committees",
      url: "https://www.ilga.gov/Senate/Committees",
      note: "Use for committee routing when a Senate AI bill is assigned.",
    },
    {
      label: "Illinois House committees",
      url: "https://www.ilga.gov/House/Committees",
      note: "Use for committee routing when a House AI bill is assigned.",
    },
    ...officialDirectoryContacts("IL", "Illinois"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("IL"),
    ...officialDirectorySources("IL", "Illinois"),
    {
      label: "Illinois current General Assembly API",
      url: "https://www.ilga.gov/API/Legislation/GetCurrentGeneralAssembly",
      note: "Official ILGA API; OII checked the current 104th General Assembly on 2026-06-30.",
    },
    {
      label: "Illinois SB315",
      url: "https://www.ilga.gov/Legislation/BillStatus?DocNum=315&GAID=18&DocTypeID=SB&LegId=157797&SessionID=114",
      note: "Official bill status; Artificial Intelligence Safety Measures Act language and last action sent to governor on 2026-06-26.",
    },
    {
      label: "Illinois SB316",
      url: "https://www.ilga.gov/Legislation/BillStatus?DocNum=316&GAID=18&DocTypeID=SB&LegId=157798&SessionID=114",
      note: "Official bill status; Artificial Intelligence Companion Model Safety Act language in Senate floor amendment.",
    },
    {
      label: "Illinois HB35",
      url: "https://www.ilga.gov/Legislation/BillStatus?DocNum=35&GAID=18&DocTypeID=HB&LegId=155693&SessionID=114",
      note: "Official bill status; Artificial Intelligence Systems Use in Health Insurance Act language.",
    },
    {
      label: "Illinois official AI search",
      url: "https://www.ilga.gov/Search?base=Legis&q=artificial%20intelligence",
      note: "Official ILGA search route; OII checked current-session artificial intelligence results on 2026-06-30.",
    },
  ],
};

STATES.GA = {
  ...STATES.GA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Georgia has a meaningful active AI bill queue and clear official routes for action. Start with the General Assembly legislation search, then ask your own legislators to keep lawful local and open-source AI outside licensing or preclearance rules.",
  ask:
    "Ask Georgia legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, data-center, education, consumer-protection, public-sector, labor, privacy, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Georgia considers AI legislation.\n\nGeorgia can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring people, researchers, schools, startups, or local businesses to get permission just to run or study open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Georgia legislation",
      url: STATE_POLICY_LINKS.GA.billSearch.url,
      note: "Official Georgia legislation route; use artificial intelligence, automated decision, algorithm, generative AI, and data center searches.",
    },
    {
      label: "Find Georgia legislators",
      url: STATE_POLICY_LINKS.GA.legislatorLookup.url,
      note: "Official Georgia General Assembly lookup for district-level outreach.",
    },
    {
      label: "Georgia legislative schedule",
      url: STATE_POLICY_LINKS.GA.calendar?.url ?? "https://www.legis.ga.gov/schedule/all",
      note: "Official schedule route for hearing and session timing.",
    },
    ...officialDirectoryContacts("GA", "Georgia"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("GA"),
    ...officialDirectorySources("GA", "Georgia"),
    {
      label: "Georgia legislation search",
      url: "https://www.legis.ga.gov/legislation/all",
      note: "Official Georgia General Assembly legislation route checked on 2026-06-30; page is client-rendered but resolves as the official legislation search surface.",
    },
    {
      label: "Georgia find your legislator",
      url: "https://www.legis.ga.gov/members/find-your-legislator",
      note: "Official Georgia General Assembly district lookup route checked on 2026-06-30.",
    },
    {
      label: "Georgia legislative schedule",
      url: "https://www.legis.ga.gov/schedule/all",
      note: "Official Georgia General Assembly schedule route checked on 2026-06-30.",
    },
  ],
};

STATES.OK = {
  ...STATES.OK,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Oklahoma has a live AI bill queue and an official legislature site with bill search, text search, legislator lookup, committee notices, calendars, and member directories. The useful move is to search the current measures and ask for a lawful local/open AI carve-out before broad language moves.",
  ask:
    "Ask Oklahoma legislators to add local/open AI safe-harbor language to any AI, technology, education, labor, consumer-protection, public-sector, privacy, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Oklahoma considers AI legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not local possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search Oklahoma legislation",
      url: STATE_POLICY_LINKS.OK.billSearch.url,
      note: "Official Oklahoma advanced legislative search route for current bills and measures.",
    },
    {
      label: "Find Oklahoma legislators",
      url: STATE_POLICY_LINKS.OK.legislatorLookup.url,
      note: "Official address-based lookup for Oklahoma elected officials and state legislators.",
    },
    {
      label: "Oklahoma Legislature home",
      url: STATE_POLICY_LINKS.OK.legislature.url,
      note: "Official route for committees, meeting notices, calendars, Senate and House directories, and bill tracking.",
    },
    ...officialDirectoryContacts("OK", "Oklahoma"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("OK"),
    ...officialDirectorySources("OK", "Oklahoma"),
    {
      label: "Oklahoma Find My Legislators",
      url: "https://www.oklegislature.gov/FindMyLegislature.aspx",
      note: "Official Oklahoma page checked on 2026-06-30; exposes Find My Legislator, basic and advanced bill search, text of measures, committees, meeting notices, calendars, and member directories.",
    },
    {
      label: "Oklahoma advanced bill search",
      url: "http://www.oklegislature.gov/advancedsearchform.aspx",
      note: "Official advanced legislative search route linked from the Oklahoma Legislature page.",
    },
  ],
};

STATES.TN = {
  ...STATES.TN,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Tennessee has active AI legislation in the NCSL snapshot and an official General Assembly site that exposes bill search, bill browsing, legislator lookup, schedules, calendars, committees, and member directories. The action is to make the local/open AI safe harbor part of the next session conversation.",
  ask:
    "Ask Tennessee legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, privacy, education, public-sector, labor, consumer-protection, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Tennessee works on AI policy.\n\nTennessee can regulate harmful uses, fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring ordinary people, researchers, schools, startups, or local businesses to get permission just to run or study open models on their own machines.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Tennessee bills",
      url: STATE_POLICY_LINKS.TN.billSearch.url,
      note: "Official Tennessee bill information system.",
    },
    {
      label: "Find Tennessee legislators",
      url: STATE_POLICY_LINKS.TN.legislatorLookup.url,
      note: "Official Tennessee General Assembly legislator lookup.",
    },
    {
      label: "Tennessee schedules, calendars, and committees",
      url: STATE_POLICY_LINKS.TN.legislature.url,
      note: "Official General Assembly homepage with schedules, calendars, committees, and member-directory routes.",
    },
    ...officialDirectoryContacts("TN", "Tennessee"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("TN"),
    ...officialDirectorySources("TN", "Tennessee"),
    {
      label: "Tennessee General Assembly home",
      url: "https://www.capitol.tn.gov/",
      note: "Official page checked on 2026-06-30; exposes bill search, bill browsing, Find My Legislator, schedules, calendars, committees, video, and directories. It also notes the 115th General Assembly convenes on 2027-01-12.",
    },
    {
      label: "Tennessee bill information system",
      url: "https://wapp.capitol.tn.gov/apps/BillInfo/",
      note: "Official bill-search route linked from the Tennessee General Assembly homepage.",
    },
  ],
};

STATES.VA = {
  ...STATES.VA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Virginia has a live AI bill queue and a strong public participation surface. The General Assembly site routes residents to Track Legislation, Who's My Legislator, meeting calendars, committees, and public-comment information, so Virginia can support a real state-specific action pack now.",
  ask:
    "Ask Virginia legislators to keep lawful local/open AI outside licensing or preclearance requirements in any AI, privacy, automated-decision, public-sector, education, labor, consumer-protection, cyber, or data-infrastructure bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Virginia considers AI legislation.\n\nThe state should enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse. But lawful possession, research, open-source publication, model modification, and local execution should not require a license or preclearance.\n\nPlease support explicit safe-harbor language for lawful local and open-source AI.",
  contacts: [
    {
      label: "Track Virginia legislation",
      url: STATE_POLICY_LINKS.VA.billSearch.url,
      note: "Official Virginia legislative information system route for legislation tracking.",
    },
    {
      label: "Find Virginia legislators",
      url: STATE_POLICY_LINKS.VA.legislatorLookup.url,
      note: "Official Who's My Legislator lookup for House and Senate contacts.",
    },
    {
      label: "Virginia public participation routes",
      url: "https://vga.virginia.gov",
      note: "Official General Assembly portal with meeting calendars, committees, participation, and public-comment navigation.",
    },
    ...officialDirectoryContacts("VA", "Virginia"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("VA"),
    ...officialDirectorySources("VA", "Virginia"),
    {
      label: "Virginia General Assembly portal",
      url: "https://vga.virginia.gov",
      note: "Official portal checked on 2026-06-30; exposes Who's My Legislator, Track Legislation, members and committees, meeting calendars and schedules, participation and public comment, and live-stream archives.",
    },
    {
      label: "Virginia Who's My Legislator",
      url: "https://whosmy.virginiageneralassembly.gov/",
      note: "Official lookup checked on 2026-06-30; lets users enter an address or map location and identify Virginia House and Senate representatives.",
    },
  ],
};

STATES.IA = {
  ...STATES.IA,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Iowa has a live AI bill queue and an official legislature site that makes bill tracking unusually concrete: bill books, histories, daily legislation, subject indexes, amendments, fiscal notes, committees, and a find-your-legislator tool. Residents can act without waiting for OII to name every bill.",
  ask:
    "Ask Iowa legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, technology, education, labor, public-sector, consumer-protection, privacy, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Iowa considers AI legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search Iowa legislation",
      url: STATE_POLICY_LINKS.IA.billSearch.url,
      note: "Official Iowa bill tracking route with bill books, histories, daily legislation, subject indexes, and quick search.",
    },
    {
      label: "Find Iowa legislators",
      url: STATE_POLICY_LINKS.IA.legislatorLookup.url,
      note: "Official Iowa lookup by address, city, name, ZIP code, county, school district, or interactive map.",
    },
    {
      label: "Iowa committees and schedules",
      url: STATE_POLICY_LINKS.IA.calendar?.url ?? "https://www.legis.iowa.gov/committees",
      note: "Official committee and schedule route for hearing context.",
    },
    ...officialDirectoryContacts("IA", "Iowa"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("IA"),
    ...officialDirectorySources("IA", "Iowa"),
    {
      label: "Iowa bill tracking tools",
      url: "https://www.legis.iowa.gov/legislation",
      note: "Official page checked on 2026-06-30; exposes BillBook, bill histories, subject index, amendments, daily legislation, fiscal notes, sponsor information, and quick bill search.",
    },
    {
      label: "Iowa Find Your Legislator",
      url: "https://www.legis.iowa.gov/legislators/find",
      note: "Official lookup checked on 2026-06-30; supports address, city, name, ZIP code, county, school district, and interactive map lookup.",
    },
    {
      label: "Iowa committees",
      url: "https://www.legis.iowa.gov/committees",
      note: "Official committee route checked on 2026-06-30.",
    },
  ],
};

STATES.DE = {
  ...STATES.DE,
  prio: "medium",
  reviewStatus: "source-verified draft",
  first:
    "Delaware has a live AI bill queue and a compact legislature site with all legislation, recent legislation, committee meetings, public participation resources, and a find-your-legislator tool. The ask should stay narrow: protect lawful local/open AI while preserving serious enforcement against abuse.",
  ask:
    "Ask Delaware legislators to add lawful local/open AI safe-harbor language to any AI, technology, privacy, education, labor, consumer-protection, public-sector, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Delaware considers AI legislation.\n\nDelaware can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring people to get permission just to download, own, run, study, modify, or share open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Delaware legislation",
      url: STATE_POLICY_LINKS.DE.billSearch.url,
      note: "Official Delaware all-legislation route with current General Assembly filters.",
    },
    {
      label: "Find Delaware legislators",
      url: STATE_POLICY_LINKS.DE.legislatorLookup.url,
      note: "Official Delaware address-based legislator lookup.",
    },
    {
      label: "Delaware committee meetings",
      url: STATE_POLICY_LINKS.DE.calendar?.url ?? "https://legis.delaware.gov/CommitteeMeetings",
      note: "Official committee meeting and hearing schedule route.",
    },
    {
      label: "Delaware public participation resources",
      url: "https://legis.delaware.gov/FindMyLegislator",
      note: "Official General Assembly navigation includes public participation in the legislative process and Legislative Hall contact routes.",
    },
    ...officialDirectoryContacts("DE", "Delaware"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("DE"),
    ...officialDirectorySources("DE", "Delaware"),
    {
      label: "Delaware all legislation",
      url: "https://legis.delaware.gov/Legislation",
      note: "Official General Assembly route checked on 2026-06-30; redirects to All Legislation and exposes legislation filters, recent legislation, committees, events, and process resources.",
    },
    {
      label: "Delaware Find My Legislator",
      url: "https://legis.delaware.gov/FindMyLegislator",
      note: "Official lookup checked on 2026-06-30; exposes address lookup, district information, state legislators, federal legislators, and Legislative Hall contact information.",
    },
    {
      label: "Delaware committee meetings",
      url: "https://legis.delaware.gov/CommitteeMeetings",
      note: "Official committee meeting and hearing schedule route checked on 2026-06-30.",
    },
  ],
};

STATES.MO = {
  ...STATES.MO,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Missouri has a live AI bill queue and a practical official route: House legislation reports, Senate bill tracking, a ZIP-based legislator lookup, and hearing schedules. The useful move is to search what is moving, then ask for a lawful local/open AI safe harbor before broad technology language hardens.",
  ask:
    "Ask Missouri legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, technology, education, labor, consumer-protection, public-sector, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Missouri considers AI legislation.\n\nMissouri can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring people, researchers, schools, startups, or local businesses to get permission just to run or study open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Missouri legislation",
      url: STATE_POLICY_LINKS.MO.billSearch.url,
      note: "Official Missouri House legislative report and bill-search route.",
    },
    {
      label: "Find Missouri legislators",
      url: STATE_POLICY_LINKS.MO.legislatorLookup.url,
      note: "Official Missouri Senate ZIP-based lookup for state legislators.",
    },
    {
      label: "Missouri House hearings",
      url: STATE_POLICY_LINKS.MO.calendar?.url ?? "https://house.mo.gov/AllHearings.aspx",
      note: "Official House committee hearing route with witness-testimony links.",
    },
    {
      label: "Missouri Senate hearings",
      url: "https://www.senate.mo.gov/HearingsSchedule/hrings.htm",
      note: "Official Senate hearing schedule route.",
    },
    ...officialDirectoryContacts("MO", "Missouri"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("MO"),
    ...officialDirectorySources("MO", "Missouri"),
    {
      label: "Missouri House home",
      url: "https://house.mo.gov/",
      note: "Official page checked on 2026-06-30; it links to members, committees, hearings, legislation, bill search, and Senate resources.",
    },
    {
      label: "Missouri Senate home",
      url: "https://www.senate.mo.gov/SenateHome",
      note: "Official page checked on 2026-06-30; it exposes legislator lookup, bill search, committees, hearings, and bill reporting routes.",
    },
    {
      label: "Missouri Senate legislator lookup",
      url: "https://www.senate.mo.gov/BillTracking/LegislatorLookup/",
      note: "Official ZIP-based legislator lookup checked on 2026-06-30.",
    },
    {
      label: "Missouri House hearings",
      url: "https://house.mo.gov/AllHearings.aspx",
      note: "Official hearing and online witness-testimony route checked on 2026-06-30.",
    },
  ],
};

STATES.ME = {
  ...STATES.ME,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Maine has active AI legislation in the NCSL snapshot and a useful official search surface. The State of Maine Legislature bill-status page supports LD search, advanced search by sponsor, subject, committee assignment, amendments, roll calls, chaptered law, and bill text.",
  ask:
    "Ask Maine legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, privacy, education, labor, public-sector, consumer-protection, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Maine considers AI legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search Maine legislation",
      url: STATE_POLICY_LINKS.ME.billSearch.url,
      note: "Official bill-status search with advanced search by subject, sponsor, committee, roll calls, and law status.",
    },
    {
      label: "Find Maine legislators by town",
      url: STATE_POLICY_LINKS.ME.legislatorLookup.url,
      note: "Official House town-by-town legislator route.",
    },
    {
      label: "Maine legislative calendar",
      url: STATE_POLICY_LINKS.ME.calendar?.url ?? "https://legislature.maine.gov/Calendar/",
      note: "Official calendar route for hearing and session timing.",
    },
    ...officialDirectoryContacts("ME", "Maine"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("ME"),
    ...officialDirectorySources("ME", "Maine"),
    {
      label: "Maine bill-status search",
      url: "https://legislature.maine.gov/LawMakerWeb/search.asp",
      note: "Official search page checked on 2026-06-30; exposes LD search, advanced search, sponsor, subject, committee assignment, amendments, roll calls, enacted/engrossed, chaptered law, and bill text search.",
    },
    {
      label: "Maine representatives by town",
      url: "https://legislature.maine.gov/house/house/MemberProfiles/ListAlphaTown",
      note: "Official House page checked on 2026-06-30; lists representatives by town and links member, schedule, committee, and testifying resources.",
    },
  ],
};

STATES.AK = {
  ...STATES.AK,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Alaska has a smaller but live AI bill queue and a legislature site that explicitly routes residents to track bills, locate and contact legislators, committee information, public opinion messages, floor calendars, meetings, and bill tracking.",
  ask:
    "Ask Alaska legislators to protect lawful local/open AI in any AI, technology, education, labor, consumer-protection, public-sector, cyber, data-infrastructure, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Alaska considers AI legislation.\n\nAlaska can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without making ordinary local AI use permissioned. People should not need state permission just to own, run, study, modify, or share open models on local hardware.\n\nPlease support clear safe-harbor language for lawful local and open-source AI.",
  contacts: [
    {
      label: "Track Alaska bills",
      url: STATE_POLICY_LINKS.AK.billSearch.url,
      note: "Official Alaska bills and laws route with introduced bills, actions, committee status, passed legislation, and bill tracking tools.",
    },
    {
      label: "Locate and contact Alaska legislators",
      url: STATE_POLICY_LINKS.AK.legislatorLookup.url,
      note: "Official Alaska legislative portal route for current House and Senate members.",
    },
    {
      label: "Alaska committee list",
      url: STATE_POLICY_LINKS.AK.calendar?.url ?? "https://www.akleg.gov/basis/Committee/List",
      note: "Official committee route for hearing and committee context.",
    },
    ...officialDirectoryContacts("AK", "Alaska"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("AK"),
    ...officialDirectorySources("AK", "Alaska"),
    {
      label: "Alaska bills and laws",
      url: "https://www.akleg.gov/basis/Home/BillsandLaws",
      note: "Official page checked on 2026-06-30; exposes bills, actions by date, bills in committee, passed legislation, bill tracking, committees, meetings, floor calendars, public opinion messages, and legislator contact routes.",
    },
  ],
};

STATES.NH = {
  ...STATES.NH,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "New Hampshire has active AI-related bills and a very direct General Court home page. Residents can use quick bill search, current bill search, advanced bill search, bill text search, legislator search, House and Senate meeting schedules, and online testimony routes from one official page.",
  ask:
    "Ask New Hampshire legislators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, technology, education, labor, consumer-protection, public-sector, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as New Hampshire considers AI legislation.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful conduct and covered deployment, not local possession, research, open-source work, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search New Hampshire bills",
      url: STATE_POLICY_LINKS.NH.billSearch.url,
      note: "Official bill status route; the General Court home also exposes quick, current, advanced, and text search.",
    },
    {
      label: "Find New Hampshire representatives",
      url: STATE_POLICY_LINKS.NH.legislatorLookup.url,
      note: "Official House member lookup; the General Court home also links Senate contact routes.",
    },
    {
      label: "New Hampshire General Court action hub",
      url: "https://gc.nh.gov/",
      note: "Official hub for bill search, meeting schedules, House/Senate contacts, calendars, and testimony routes.",
    },
    ...officialDirectoryContacts("NH", "New Hampshire"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("NH"),
    ...officialDirectorySources("NH", "New Hampshire"),
    {
      label: "New Hampshire General Court home",
      url: "https://gc.nh.gov/",
      note: "Official page checked on 2026-06-30; exposes House/Senate rosters, bill search, current bill search, advanced bill search, text search, meeting schedules, and online testimony links.",
    },
  ],
};

STATES.NE = {
  ...STATES.NE,
  prio: "high",
  reviewStatus: "source-verified draft",
  first:
    "Nebraska has a small active AI bill queue and a clean official Unicameral search route. Residents can search bills by keyword, number, date, introducer, and committee, then contact their senator through the official address lookup.",
  ask:
    "Ask Nebraska senators to protect lawful local model ownership, research, modification, self-hosting, local execution, and open-source publication in any AI, technology, education, consumer-protection, public-sector, cyber, or automated-decision bill.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Nebraska considers AI legislation.\n\nNebraska can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring people to get permission just to download, own, run, study, modify, or share open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Nebraska bills",
      url: STATE_POLICY_LINKS.NE.billSearch.url,
      note: "Official bill and resolution search with keyword, number, introducer, and committee routes.",
    },
    {
      label: "Find your Nebraska senator",
      url: STATE_POLICY_LINKS.NE.legislatorLookup.url,
      note: "Official address-based senator and district finder.",
    },
    {
      label: "Nebraska hearing schedules",
      url: "https://nebraskalegislature.gov/calendar/hearings.php",
      note: "Official hearing schedule route linked from the Unicameral site.",
    },
    ...officialDirectoryContacts("NE", "Nebraska"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("NE"),
    ...officialDirectorySources("NE", "Nebraska"),
    {
      label: "Nebraska bill search",
      url: "https://nebraskalegislature.gov/bills/",
      note: "Official site checked on 2026-06-30; exposes advanced keyword search, bill-number search, date-of-introduction search, introducer search, committee search, hearings, agenda, and public input routes.",
    },
    {
      label: "Nebraska Find Your Senator",
      url: "https://nebraskalegislature.gov/senators/senator_find.php",
      note: "Official address-based senator finder checked on 2026-06-30.",
    },
  ],
};

STATES.CT = {
  ...STATES.CT,
  prio: "medium",
  reviewStatus: "source-verified draft",
  first:
    "Connecticut does not show active AI bills in the current NCSL snapshot, but it has enacted AI-related law. That makes the action more about implementation and future bills: use the General Assembly bill-info routes and ask officials to keep lawful local/open AI outside licensing or preclearance rules.",
  ask:
    "Ask Connecticut legislators and executive offices to preserve lawful local/open AI safe harbors in future AI bills and implementation guidance: no license, registration, or preclearance just to download, own, run, study, modify, or share open models.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Connecticut implements and updates AI policy.\n\nThe state can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without making ordinary local AI use permissioned. Please keep local possession, research, open-source work, model modification, and local execution outside licensing or preclearance requirements.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  contacts: [
    {
      label: "Search Connecticut bills",
      url: STATE_POLICY_LINKS.CT.billSearch.url,
      note: "Official bill-status search route; the General Assembly site also exposes advanced and basic bill/document search.",
    },
    {
      label: "Find Connecticut legislators",
      url: STATE_POLICY_LINKS.CT.legislatorLookup.url,
      note: "Official Connecticut legislator lookup.",
    },
    {
      label: "Connecticut legislative calendar",
      url: STATE_POLICY_LINKS.CT.calendar?.url ?? "https://www.cga.ct.gov/asp/menu/CGACalendar.asp",
      note: "Official calendar route for session and hearing timing.",
    },
    ...officialDirectoryContacts("CT", "Connecticut"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("CT"),
    ...officialDirectorySources("CT", "Connecticut"),
    {
      label: "Connecticut General Assembly",
      url: "https://www.cga.ct.gov/",
      note: "Official page checked on 2026-06-30; exposes Bill Information Search, Quick Bill Search, Bills by Subject, Bill Tracking, advanced bill/document search, basic search, calendars, committees, and legislative offices.",
    },
    {
      label: "Connecticut legislator lookup",
      url: "https://www.cga.ct.gov/asp/menu/cgafindleg.asp",
      note: "Official lookup and legislative navigation route checked on 2026-06-30.",
    },
  ],
};

STATES.MD = {
  ...STATES.MD,
  prio: "medium",
  reviewStatus: "source-verified draft",
  first:
    "Maryland does not show active AI bills in the current NCSL snapshot, but it has one of the larger enacted-law counts. The practical ask is implementation pressure: keep lawful local/open AI outside licensing traps while using the official General Assembly routes to monitor the next session.",
  ask:
    "Ask Maryland legislators, the governor, and the attorney general to preserve lawful local/open AI safe harbors in implementation and future bills: no license, registration, or preclearance just to download, own, run, study, modify, or share open models.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Maryland implements and updates AI policy.\n\nMaryland can enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse without requiring ordinary people, researchers, schools, startups, or local businesses to get permission just to run or study open models on their own hardware.\n\nPlease support clear safe-harbor language for lawful local AI ownership, research, model modification, open-source publication, and local execution.",
  contacts: [
    {
      label: "Search Maryland legislation",
      url: STATE_POLICY_LINKS.MD.billSearch.url,
      note: "Official General Assembly legislation chart and search route.",
    },
    {
      label: "Find Maryland representatives",
      url: STATE_POLICY_LINKS.MD.legislatorLookup.url,
      note: "Official address and ZIP lookup for state legislators and federal representatives.",
    },
    {
      label: "Maryland committee meetings",
      url: STATE_POLICY_LINKS.MD.calendar?.url ?? "https://mgaleg.maryland.gov/mgawebsite/Committees/Meetings",
      note: "Official committee meeting route for hearing and witness timing.",
    },
    ...officialDirectoryContacts("MD", "Maryland"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("MD"),
    ...officialDirectorySources("MD", "Maryland"),
    {
      label: "Maryland legislation charts",
      url: "https://mgaleg.maryland.gov/mgawebsite/Legislation/Charts",
      note: "Official page checked on 2026-06-30; exposes legislation charts, Senate and House bills, enacted bills, floor actions, searches, committee meetings, witness signup, and tracking routes.",
    },
    {
      label: "Maryland Find My Representatives",
      url: "https://mgaleg.maryland.gov/mgawebsite/Members/District",
      note: "Official page checked on 2026-06-30; supports address and ZIP lookup and lists governor, attorney general, congressional, and state legislative contacts.",
    },
  ],
};

STATES.OR = {
  ...STATES.OR,
  prio: "medium",
  reviewStatus: "source-verified draft",
  first:
    "Oregon does not show active AI bills in the current NCSL snapshot, and the Legislature's public site says the 2026 regular session has adjourned. The useful move is to prepare the ask now: protect lawful local/open AI in the next bill cycle and keep implementation focused on harmful conduct.",
  ask:
    "Ask Oregon legislators to preserve lawful local/open AI safe harbors in future AI, privacy, public-sector, labor, education, consumer-protection, data-center, cyber, or automated-decision bills.",
  script:
    "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local and open-source AI as Oregon prepares future AI legislation.\n\nThe state should enforce against fraud, cybercrime, CSAM, harassment, unlawful deepfakes, discrimination, and real-world abuse. But lawful possession, research, open-source publication, model modification, and local execution should not require a license or preclearance.\n\nPlease support explicit safe-harbor language for lawful local and open-source AI.",
  contacts: [
    {
      label: "Search Oregon bills",
      url: STATE_POLICY_LINKS.OR.billSearch.url,
      note: "Official Oregon Legislative Information System bill list.",
    },
    {
      label: "Find Oregon legislators",
      url: STATE_POLICY_LINKS.OR.legislatorLookup.url,
      note: "Official legislature route for finding legislators by address.",
    },
    {
      label: "Oregon participation and testimony routes",
      url: "https://www.oregonlegislature.gov/",
      note: "Official homepage route for session information, how to participate, committee agendas, testimony, and bill search.",
    },
    ...officialDirectoryContacts("OR", "Oregon"),
    ...FEDERAL_CONTACTS,
  ],
  sources: [
    ...policySources("OR"),
    ...officialDirectorySources("OR", "Oregon"),
    {
      label: "Oregon Legislative Information System measures list",
      url: "https://olis.oregonlegislature.gov/liz/2025R1/Measures/list/",
      note: "Official OLIS measures list checked on 2026-06-30; exposes Senate and House bill ranges for the regular session.",
    },
    {
      label: "Oregon Legislature home",
      url: "https://www.oregonlegislature.gov/",
      note: "Official page checked on 2026-06-30; exposes 2026 session information, how to participate, Find Your Legislator, Senate and House bills, committee agendas, register or submit testimony, and search bills across sessions.",
    },
  ],
};
