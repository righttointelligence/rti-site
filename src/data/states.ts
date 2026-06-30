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
    first:
      "California is one of the places where AI rules become national defaults. The ask is narrow: protect lawful local AI before transparency or safety rules are written only around cloud labs and large platforms.",
    ask:
      "Make clear that people can download, own, run, study, modify, and share open AI models on their own hardware without a license or preclearance. Keep enforcement focused on harmful conduct.",
    script:
      "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local AI as California considers new AI rules.\n\nPeople should not need state permission or platform approval just to run an open model on their own computer. Please keep the law focused on harmful uses, not possession, research, open-source hosting, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  },
  CO: {
    name: "Colorado",
    prio: "medium",
    first:
      "Colorado is updating its AI rules now. The ask is simple: protect lawful local AI before the rules are written only around cloud labs and large platforms.",
    ask:
      "Make clear that people can download, own, run, study, modify, and share open AI models on their own hardware without a license or preclearance. Keep enforcement focused on harmful conduct.",
    script:
      "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local AI as Colorado updates its AI rules.\n\nPeople should not need state permission or platform approval just to run an open model on their own computer. Please keep the law focused on harmful uses, not possession, research, or local execution.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local and open-source AI?",
  },
  TX: {
    name: "Texas",
    prio: "high",
    first:
      "Texas can turn its energy and compute advantage into an AI infrastructure advantage. The ask is to make Texas the place where people and companies can lawfully own, run, and improve their own models.",
    ask:
      "Protect the right to own and run AI models privately. Keep licenses and preclearance away from lawful local inference, research, and self-hosted model use.",
    script:
      "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nTexas already has a major energy and compute advantage. Please protect the right for people and companies here to own, run, and improve AI models on their own hardware.\n\nThe law should go after harmful use, not private, lawful use. Texas should be the best state to build self-hosted and local AI infrastructure.\n\nCan you tell me whether the office supports a clear safe harbor for lawful local AI?",
  },
  OTHER: {
    name: "Your state",
    prio: "unknown",
    first:
      "Your state may not have a verified OII action page yet. You can still make the core ask now and help us decide where to prioritize the next research pass.",
    ask:
      "Protect the right to download, own, run, study, modify, and share open AI models. Keep enforcement focused on harmful conduct, not lawful possession or local execution.",
    script:
      "Hi, my name is [NAME], and I live in [CITY], ZIP [ZIP].\n\nI'm asking your office to protect lawful local AI.\n\nPeople should not need state permission or platform approval just to download, own, run, study, modify, or share open AI models on their own hardware. Please keep enforcement focused on harmful uses, not possession, research, or local execution.",
  },
};
