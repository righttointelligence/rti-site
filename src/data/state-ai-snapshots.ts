export type StateAiSnapshot = {
  checkedAt: string;
  sourceLabel: string;
  sourceUrl: string;
  totalBills: number;
  activeBills: number;
  enactedBills: number;
  failedBills: number;
};

const NCSL_AI_SOURCE = {
  checkedAt: "2026-06-30",
  sourceLabel: "NCSL Artificial Intelligence Legislation Database",
  sourceUrl: "https://www.ncsl.org/financial-services/artificial-intelligence-legislation-database",
};

function snapshot(
  totalBills: number,
  activeBills: number,
  enactedBills: number,
  failedBills: number,
): StateAiSnapshot {
  return {
    ...NCSL_AI_SOURCE,
    totalBills,
    activeBills,
    enactedBills,
    failedBills,
  };
}

export const STATE_AI_SNAPSHOTS: Record<string, StateAiSnapshot> = {
  AL: snapshot(33, 0, 8, 25),
  AK: snapshot(10, 4, 1, 5),
  AZ: snapshot(36, 0, 4, 32),
  AR: snapshot(16, 0, 6, 10),
  CA: snapshot(146, 108, 25, 13),
  CO: snapshot(28, 0, 10, 18),
  CT: snapshot(44, 0, 10, 34),
  DE: snapshot(13, 9, 4, 0),
  FL: snapshot(80, 10, 10, 60),
  GA: snapshot(65, 20, 19, 26),
  HI: snapshot(117, 31, 15, 71),
  ID: snapshot(16, 0, 3, 13),
  IL: snapshot(136, 126, 10, 1),
  IN: snapshot(21, 0, 9, 12),
  IA: snapshot(52, 10, 4, 39),
  KS: snapshot(17, 0, 6, 11),
  KY: snapshot(26, 0, 6, 20),
  LA: snapshot(39, 0, 17, 22),
  ME: snapshot(26, 5, 10, 11),
  MD: snapshot(100, 0, 24, 76),
  MA: snapshot(89, 89, 0, 0),
  MI: snapshot(27, 24, 3, 0),
  MN: snapshot(104, 34, 7, 63),
  MS: snapshot(38, 0, 4, 34),
  MO: snapshot(75, 6, 1, 68),
  MT: snapshot(13, 0, 11, 2),
  NE: snapshot(14, 3, 5, 6),
  NV: snapshot(19, 0, 6, 13),
  NH: snapshot(12, 4, 2, 6),
  NJ: snapshot(163, 159, 3, 1),
  NM: snapshot(25, 0, 5, 22),
  NY: snapshot(267, 254, 11, 2),
  NC: snapshot(49, 47, 2, 0),
  ND: snapshot(14, 0, 12, 2),
  OH: snapshot(32, 31, 1, 0),
  OK: snapshot(48, 19, 6, 23),
  OR: snapshot(21, 0, 6, 15),
  PA: snapshot(53, 51, 2, 0),
  RI: snapshot(46, 30, 16, 0),
  SC: snapshot(36, 30, 6, 0),
  SD: snapshot(9, 0, 3, 6),
  TN: snapshot(62, 19, 12, 31),
  TX: snapshot(86, 0, 17, 69),
  UT: snapshot(37, 0, 22, 15),
  VT: snapshot(35, 27, 8, 0),
  VA: snapshot(79, 12, 17, 50),
  WA: snapshot(54, 23, 8, 23),
  WV: snapshot(29, 0, 6, 23),
  WI: snapshot(41, 13, 1, 27),
  WY: snapshot(7, 0, 1, 6),
};
