// Per-state action scripts. Numbers + scripts are placeholders pending verification.
export type StateAction = {
  name: string;
  prio: "high" | "medium" | "unknown";
  first: string;
  ask: string;
  script: string;
};

export const STATES: Record<string, StateAction> = {
  CA: {
    name: "California",
    prio: "high",
    first: "Call your State Assembly office. It takes two minutes.",
    ask: "Protect the right to run open AI models at home. Go after misuse, not the software.",
    script:
      "Hi, my name is [NAME] and I live in [CITY], ZIP [ZIP]. I'm a constituent.\n\nI'm asking the member to protect my right to download, run, and change open AI models on my own computer. Punish people who cause real harm — don't make everyone get a license to use a tool.\n\nWhere does the member stand on licensing local AI?",
  },
  CO: {
    name: "Colorado",
    prio: "medium",
    first: "Email your state legislator before the next hearing.",
    ask: "Keep home and open-source AI out of any license requirement. Keep enforcement on real harm.",
    script:
      "Hello, my name is [NAME], a constituent in [CITY], ZIP [ZIP].\n\nAs Colorado updates its AI law, please protect the right to run and change open models at home. Target misuse — not owning or running the software.",
  },
  TX: {
    name: "Texas",
    prio: "high",
    first: "Call your Texas House member. Tie local AI to Texas jobs and energy.",
    ask: "Protect the right to own and run AI models privately. No license for models you already have.",
    script:
      "Hi, my name is [NAME] from [CITY], ZIP [ZIP]. I'm a constituent.\n\nTexas leads on energy and compute. Protecting the right to run AI models at home turns that into jobs and infrastructure. Please go after harmful use, not private, lawful use.",
  },
  OTHER: {
    name: "Your state",
    prio: "unknown",
    first: "Contact your state legislator with the script below, then log it so we can prioritize your state.",
    ask: "Protect the right to download, own, run, change, and share open AI models. Punish misuse, not tools.",
    script:
      "Hi, my name is [NAME] and I live in [CITY], ZIP [ZIP]. I'm a constituent.\n\nPlease protect the right to download, run, and change open AI models on personal computers, and keep enforcement focused on people who cause real harm.",
  },
};
