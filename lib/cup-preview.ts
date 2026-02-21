import { teams } from "./teams";

function roundRobin(names: string[]) {
  const list = [...names];
  const rounds: { home: string; away: string }[][] = [];
  const totalRounds = list.length - 1;
  const half = list.length / 2;

  for (let round = 0; round < totalRounds; round++) {
    const fixtures: { home: string; away: string }[] = [];

    for (let i = 0; i < half; i++) {
      fixtures.push({
        home: list[i],
        away: list[list.length - 1 - i],
      });
    }

    rounds.push(fixtures);

    // rotate all but the first item
    list.splice(1, 0, list.pop()!);
  }

  return rounds;
}

export function generateMockCup() {
  const teamNames = teams.map((t) => t.name);

  // ✅ build group fixtures across GW29–35
  const rounds = roundRobin(teamNames);
  const groupFixtures = rounds.flatMap((round, rIdx) => {
    const gw = 29 + rIdx;

    return round.map((m, idx) => {
      // deterministic "random-ish" points
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

  // Example: fixed standings order = teams array order (your existing behaviour)
  const standings = teams.map((t, i) => ({
    team: t,
    points: 20 - i,
    gd: 10 - i,
  }));

  const quarterFinals = [
    {
      id: "qf1",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[0].team.name,
      away: standings[7].team.name,
      homePoints: 62,
      awayPoints: 51,
    },
    {
      id: "qf2",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[1].team.name,
      away: standings[6].team.name,
      homePoints: 58,
      awayPoints: 58,
    },
    {
      id: "qf3",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[2].team.name,
      away: standings[5].team.name,
      homePoints: 49,
      awayPoints: 60,
    },
    {
      id: "qf4",
      stage: "Quarter Final",
      gameweek: 36,
      home: standings[3].team.name,
      away: standings[4].team.name,
      homePoints: 70,
      awayPoints: 64,
    },
  ];

  const semiFinals = [
    {
      id: "sf1",
      stage: "Semi Final",
      gameweek: 37,
      home: quarterFinals[0].home,
      away: quarterFinals[1].home,
      homePoints: 61,
      awayPoints: 55,
    },
    {
      id: "sf2",
      stage: "Semi Final",
      gameweek: 37,
      home: quarterFinals[2].away,
      away: quarterFinals[3].home,
      homePoints: 59,
      awayPoints: 63,
    },
  ];

  const final = {
    id: "f1",
    stage: "Final",
    gameweek: 38,
    home: semiFinals[0].home,
    away: semiFinals[1].away,
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