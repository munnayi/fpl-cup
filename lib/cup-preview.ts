import { teams } from "./teams";

type Team = (typeof teams)[number];

type GroupFixture = {
  id: string;
  stage: "Group";
  gameweek: number;
  home: string;
  away: string;
  homePoints: number;
  awayPoints: number;
};

type StandingRow = {
  team: Team;
  points: number;
  gd: number;
};

type KnockoutFixture = {
  id: string;
  stage: "Quarter Final" | "Semi Final";
  gameweek: number;
  home: string;
  away: string;
  homePoints: number;
  awayPoints: number;
};

type FinalFixture = {
  id: string;
  stage: "Final";
  gameweek: number;
  home: string;
  away: string;
  homePoints: number;
  awayPoints: number;
};

function roundRobin(names: string[]) {
  const list = [...names];
  const rounds: { home: string; away: string }[][] = [];
  const totalRounds = list.length - 1;
  const half = list.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const fixtures: { home: string; away: string }[] = [];

    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[list.length - 1 - i];

      if (!home || !away) continue; // strict safety

      fixtures.push({ home, away });
    }

    rounds.push(fixtures);

    const last = list.pop();
    if (last) {
      list.splice(1, 0, last);
    }
  }

  return rounds;
}

export function generateMockCup() {
  const teamNames = teams.map((t) => t.name);

  // ========== GROUP ==========
  const rounds = roundRobin(teamNames);

  const groupFixtures: GroupFixture[] = rounds.flatMap((round, rIdx) => {
    const gw = 29 + rIdx;

    return round.map((m, idx) => {
      const homePoints = 45 + ((m.home.length * 3 + gw + idx) % 30);
      const awayPoints = 45 + ((m.away.length * 5 + gw + idx) % 30);

      return {
        id: `group-${gw}-${idx}`,
        stage: "Group",
        gameweek: gw,
        home: m.home,
        away: m.away,
        homePoints,
        awayPoints,
      };
    });
  });

  // ========== STANDINGS ==========
  const standings: StandingRow[] = teams.map((t, i) => ({
    team: t,
    points: 20 - i,
    gd: 10 - i,
  }));

  // We know we have 8 teams, but strict mode requires guards
  if (standings.length < 8) {
    throw new Error("Mock standings require exactly 8 teams.");
  }

  // ========== QUARTER FINALS ==========
  const quarterFinals: KnockoutFixture[] = [
    {
      id: "qf1",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[0]!.team.name,
      away: standings[7]!.team.name,
      homePoints: 62,
      awayPoints: 51,
    },
    {
      id: "qf2",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[1]!.team.name,
      away: standings[6]!.team.name,
      homePoints: 58,
      awayPoints: 58,
    },
    {
      id: "qf3",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[2]!.team.name,
      away: standings[5]!.team.name,
      homePoints: 49,
      awayPoints: 60,
    },
    {
      id: "qf4",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[3]!.team.name,
      away: standings[4]!.team.name,
      homePoints: 70,
      awayPoints: 64,
    },
  ];

  // ========== SEMI FINALS ==========
  const semiFinals: KnockoutFixture[] = [
    {
      id: "sf1",
      stage: "Semi Final",
      gameweek: 37,
      home: quarterFinals[0]!.home,
      away: quarterFinals[1]!.home,
      homePoints: 61,
      awayPoints: 55,
    },
    {
      id: "sf2",
      stage: "Semi Final",
      gameweek: 37,
      home: quarterFinals[2]!.away,
      away: quarterFinals[3]!.home,
      homePoints: 59,
      awayPoints: 63,
    },
  ];

  // ========== FINAL ==========
  const final: FinalFixture = {
    id: "f1",
    stage: "Final",
    gameweek: 38,
    home: semiFinals[0]!.home,
    away: semiFinals[1]!.away,
    homePoints: 63,
    awayPoints: 57,
  };

  return {
    groupFixtures,
    standings,
    groupComplete: true,
    quarterFinals,
    semiFinals,
    final,
  };
}