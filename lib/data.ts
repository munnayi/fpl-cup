// lib/data.ts

export type Team = {
  name: string;
  logo: string; // path under /public (e.g. /logos/team.svg or .png)
};

export type Fixture = {
  id: number;
  gameweek: number;
  date: string; // ISO date for the GW (placeholder weekly cadence)
  home: string;
  away: string;
  homePoints: number | null;
  awayPoints: number | null;
};

export const teams: Team[] = [
  { name: "Paizão Wade FC",       logo: "/logos/paizao-wade-fc.svg" },
  { name: "Mun United",           logo: "/logos/mun-united.png" },
  { name: "Mun City",             logo: "/logos/mun-city.svg" },
  { name: "Burgenius FC",         logo: "/logos/burgenius-fc.svg" },
  { name: "KEFM FC",              logo: "/logos/kefm-fc.svg" },
  { name: "Howells Hounds FC",    logo: "/logos/howells-hounds.png" },
  { name: "Voodoo Papa FC",       logo: "/logos/voodoo-papa.svg" },
  { name: "Masterchefs HR Team",   logo: "/logos/masterchefs.png" },
];

// Helper map (for reference when reading fixtures)
const T = {
  A: "Paizão Wade FC",
  B: "Mun United",
  C: "Mun City",
  D: "Burgenius FC",
  E: "KEFM FC",
  F: "Howells Hounds FC",
  G: "Voodoo Papa FC",
  H: "Masterchefs HR Team",
} as const;

export const fixtures: Fixture[] = [
  // ========== GROUP STAGE (GW29–GW35) ==========
  // Round 1 — GW29 — 2025-03-01
  { id: 1,  gameweek: 29, date: "2025-03-01", home: T.A, away: T.H, homePoints: null, awayPoints: null },
  { id: 2,  gameweek: 29, date: "2025-03-01", home: T.B, away: T.G, homePoints: null, awayPoints: null },
  { id: 3,  gameweek: 29, date: "2025-03-01", home: T.C, away: T.F, homePoints: null, awayPoints: null },
  { id: 4,  gameweek: 29, date: "2025-03-01", home: T.D, away: T.E, homePoints: null, awayPoints: null },

  // Round 2 — GW30 — 2025-03-08
  { id: 5,  gameweek: 30, date: "2025-03-08", home: T.A, away: T.G, homePoints: null, awayPoints: null },
  { id: 6,  gameweek: 30, date: "2025-03-08", home: T.H, away: T.F, homePoints: null, awayPoints: null },
  { id: 7,  gameweek: 30, date: "2025-03-08", home: T.B, away: T.E, homePoints: null, awayPoints: null },
  { id: 8,  gameweek: 30, date: "2025-03-08", home: T.C, away: T.D, homePoints: null, awayPoints: null },

  // Round 3 — GW31 — 2025-03-15
  { id: 9,  gameweek: 31, date: "2025-03-15", home: T.A, away: T.F, homePoints: null, awayPoints: null },
  { id:10,  gameweek: 31, date: "2025-03-15", home: T.G, away: T.E, homePoints: null, awayPoints: null },
  { id:11,  gameweek: 31, date: "2025-03-15", home: T.H, away: T.D, homePoints: null, awayPoints: null },
  { id:12,  gameweek: 31, date: "2025-03-15", home: T.B, away: T.C, homePoints: null, awayPoints: null },

  // Round 4 — GW32 — 2025-03-22
  { id:13,  gameweek: 32, date: "2025-03-22", home: T.A, away: T.E, homePoints: null, awayPoints: null },
  { id:14,  gameweek: 32, date: "2025-03-22", home: T.F, away: T.D, homePoints: null, awayPoints: null },
  { id:15,  gameweek: 32, date: "2025-03-22", home: T.G, away: T.C, homePoints: null, awayPoints: null },
  { id:16,  gameweek: 32, date: "2025-03-22", home: T.H, away: T.B, homePoints: null, awayPoints: null },

  // Round 5 — GW33 — 2025-03-29
  { id:17,  gameweek: 33, date: "2025-03-29", home: T.A, away: T.D, homePoints: null, awayPoints: null },
  { id:18,  gameweek: 33, date: "2025-03-29", home: T.E, away: T.C, homePoints: null, awayPoints: null },
  { id:19,  gameweek: 33, date: "2025-03-29", home: T.F, away: T.B, homePoints: null, awayPoints: null },
  { id:20,  gameweek: 33, date: "2025-03-29", home: T.G, away: T.H, homePoints: null, awayPoints: null },

  // Round 6 — GW34 — 2025-04-05
  { id:21,  gameweek: 34, date: "2025-04-05", home: T.A, away: T.C, homePoints: null, awayPoints: null },
  { id:22,  gameweek: 34, date: "2025-04-05", home: T.D, away: T.B, homePoints: null, awayPoints: null },
  { id:23,  gameweek: 34, date: "2025-04-05", home: T.E, away: T.H, homePoints: null, awayPoints: null },
  { id:24,  gameweek: 34, date: "2025-04-05", home: T.F, away: T.G, homePoints: null, awayPoints: null },

  // Round 7 — GW35 — 2025-04-12
  { id:25,  gameweek: 35, date: "2025-04-12", home: T.A, away: T.B, homePoints: null, awayPoints: null },
  { id:26,  gameweek: 35, date: "2025-04-12", home: T.C, away: T.H, homePoints: null, awayPoints: null },
  { id:27,  gameweek: 35, date: "2025-04-12", home: T.D, away: T.G, homePoints: null, awayPoints: null },
  { id:28,  gameweek: 35, date: "2025-04-12", home: T.E, away: T.F, homePoints: null, awayPoints: null },

  // ========== PLAYOFFS ==========
  // Quarter-finals — GW36 — 2025-04-19
  { id:29,  gameweek: 36, date: "2025-04-19", home: "1st Place",      away: "8th Place",      homePoints: null, awayPoints: null },
  { id:30,  gameweek: 36, date: "2025-04-19", home: "4th Place",      away: "5th Place",      homePoints: null, awayPoints: null },
  { id:31,  gameweek: 36, date: "2025-04-19", home: "3rd Place",      away: "6th Place",      homePoints: null, awayPoints: null },
  { id:32,  gameweek: 36, date: "2025-04-19", home: "2nd Place",      away: "7th Place",      homePoints: null, awayPoints: null },

  // Semi-finals — GW37 — 2025-04-26
  { id:33,  gameweek: 37, date: "2025-04-26", home: "QF1 Winner", away: "QF2 Winner", homePoints: null, awayPoints: null },
  { id:34,  gameweek: 37, date: "2025-04-26", home: "QF3 Winner", away: "QF4 Winner", homePoints: null, awayPoints: null },

  // Final — GW38 — 2025-05-03
  { id:35,  gameweek: 38, date: "2025-05-03", home: "SF1 Winner", away: "SF2 Winner", homePoints: null, awayPoints: null },
];
