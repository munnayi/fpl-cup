// lib/cup.ts

import { teams } from "./teams"

const BASE_URL = "https://fantasy.premierleague.com/api"

async function getManagerGwPoints(entryId: number, gw: number) {
  const res = await fetch(`${BASE_URL}/entry/${entryId}/event/${gw}/picks/`, {
    next: { revalidate: 3600 },
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.entry_history?.points ?? null
}

function roundRobin() {
  const list = [...teams]
  const rounds = []

  for (let round = 0; round < list.length - 1; round++) {
    const fixtures = []
    for (let i = 0; i < list.length / 2; i++) {
      fixtures.push({ home: list[i], away: list[list.length - 1 - i] })
    }
    list.splice(1, 0, list.pop()!)
    rounds.push(fixtures)
  }

  return rounds
}

function computeTable(fixtures: any[]) {
  const table: any = {}
  teams.forEach((t) => {
    table[t.name] = { team: t, points: 0, gd: 0 }
  })

  fixtures.forEach((f) => {
    if (f.homePoints == null || f.awayPoints == null) return

    if (f.homePoints > f.awayPoints) table[f.home].points += 3
    else if (f.homePoints < f.awayPoints) table[f.away].points += 3
    else {
      table[f.home].points += 1
      table[f.away].points += 1
    }

    const diff = f.homePoints - f.awayPoints
    table[f.home].gd += diff
    table[f.away].gd -= diff
  })

  return Object.values(table).sort(
    (a: any, b: any) => b.points - a.points || b.gd - a.gd
  )
}

function allPlayed(fixtures: any[]) {
  return fixtures.length > 0 && fixtures.every((f) => f.homePoints != null && f.awayPoints != null)
}

export async function generateFullCup() {
  // 1) GROUP
  const groupGWs = [29, 30, 31, 32, 33, 34, 35]
  const rounds = roundRobin()

  const groupFixtures: any[] = []

  // fetch group fixtures + points
  await Promise.all(
    rounds.flatMap((round, rIndex) => {
      const gw = groupGWs[rIndex]
      return round.map(async (match) => {
        const [homePoints, awayPoints] = await Promise.all([
          getManagerGwPoints(match.home.id, gw),
          getManagerGwPoints(match.away.id, gw),
        ])

        groupFixtures.push({
          stage: "Group",
          gameweek: gw,
          home: match.home.name,
          away: match.away.name,
          homePoints,
          awayPoints,
          id: `${gw}-${match.home.id}-${match.away.id}`,
        })
      })
    })
  )

  // sort group fixtures for stable rendering
  groupFixtures.sort((a, b) => a.gameweek - b.gameweek || a.home.localeCompare(b.home))

  const standings = computeTable(groupFixtures)

  const groupComplete = allPlayed(groupFixtures)

  // If group isn't complete, don't generate knockouts at all.
  if (!groupComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals: null,
      semiFinals: null,
      final: null,
    }
  }

  // 2) QUARTER FINALS (GW36) only after group complete
  const qfPairs = [
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 4],
  ]

  const quarterFinals = await Promise.all(
    qfPairs.map(async ([a, b]) => {
      const home = standings[a].team
      const away = standings[b].team

      const [homePoints, awayPoints] = await Promise.all([
        getManagerGwPoints(home.id, 36),
        getManagerGwPoints(away.id, 36),
      ])

      const hasResult = homePoints != null && awayPoints != null
      const winner =
        hasResult ? (homePoints >= awayPoints ? home : away) : null

      return {
        stage: "Quarter Final",
        gameweek: 36,
        home: home.name,
        away: away.name,
        homePoints,
        awayPoints,
        winner,
        id: `36-${home.id}-${away.id}`,
      }
    })
  )

  const qfComplete = allPlayed(quarterFinals)

  if (!qfComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals: null,
      final: null,
    }
  }

  // 3) SEMI FINALS (GW37) only after all QFs complete
  const sfPairs = [
    [quarterFinals[0].winner!, quarterFinals[1].winner!],
    [quarterFinals[2].winner!, quarterFinals[3].winner!],
  ]

  const semiFinals = await Promise.all(
    sfPairs.map(async ([homeTeam, awayTeam]) => {
      const [homePoints, awayPoints] = await Promise.all([
        getManagerGwPoints(homeTeam.id, 37),
        getManagerGwPoints(awayTeam.id, 37),
      ])

      const hasResult = homePoints != null && awayPoints != null
      const winner =
        hasResult ? (homePoints >= awayPoints ? homeTeam : awayTeam) : null

      return {
        stage: "Semi Final",
        gameweek: 37,
        home: homeTeam.name,
        away: awayTeam.name,
        homePoints,
        awayPoints,
        winner,
        id: `37-${homeTeam.id}-${awayTeam.id}`,
      }
    })
  )

  const sfComplete = allPlayed(semiFinals)

  if (!sfComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals,
      final: null,
    }
  }

  // 4) FINAL (GW38) only after both SFs complete
  const finalHome = semiFinals[0].winner!
  const finalAway = semiFinals[1].winner!

  const [homePoints, awayPoints] = await Promise.all([
    getManagerGwPoints(finalHome.id, 38),
    getManagerGwPoints(finalAway.id, 38),
  ])

  const final = {
    stage: "Final",
    gameweek: 38,
    home: finalHome.name,
    away: finalAway.name,
    homePoints,
    awayPoints,
    id: `38-${finalHome.id}-${finalAway.id}`,
  }

  return {
    groupFixtures,
    standings,
    groupComplete,
    quarterFinals,
    semiFinals,
    final,
  }
}