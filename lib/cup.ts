// lib/cup.ts

import { teams, type Team } from "./teams"

const BASE_URL = "https://fantasy.premierleague.com/api"

type GroupFixture = {
  id: string
  stage: "Group"
  gameweek: number
  home: string
  away: string
  homePoints: number | null
  awayPoints: number | null
}

type KnockoutStage = "Quarter Final" | "Semi Final"

type KnockoutFixture = {
  id: string
  stage: KnockoutStage
  gameweek: number
  home: string
  away: string
  homePoints: number | null
  awayPoints: number | null
  winner: Team | null
}

type FinalFixture = {
  id: string
  stage: "Final"
  gameweek: number
  home: string
  away: string
  homePoints: number | null
  awayPoints: number | null
}

export type StandingRow = {
  team: Team
  points: number
  gd: number
}

export type CupData = {
  groupFixtures: GroupFixture[]
  standings: StandingRow[]
  groupComplete: boolean
  quarterFinals: KnockoutFixture[] | null
  semiFinals: KnockoutFixture[] | null
  final: FinalFixture | null
}

async function getManagerGwPoints(entryId: number, gw: number): Promise<number | null> {
  const res = await fetch(`${BASE_URL}/entry/${entryId}/event/${gw}/picks/`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null

  const data = (await res.json()) as any
  return data?.entry_history?.points ?? null
}

function roundRobin(): { home: Team; away: Team }[][] {
  const list = [...teams]
  const rounds: { home: Team; away: Team }[][] = []

  const totalRounds = list.length - 1
  const half = list.length / 2

  for (let round = 0; round < totalRounds; round++) {
    const fixtures: { home: Team; away: Team }[] = []

    for (let i = 0; i < half; i++) {
      const home = list[i]
      const away = list[list.length - 1 - i]
      if (!home || !away) continue
      fixtures.push({ home, away })
    }

    rounds.push(fixtures)

    const last = list.pop()
    if (last) list.splice(1, 0, last)
  }

  return rounds
}

function computeTable(fixtures: GroupFixture[]): StandingRow[] {
  const table: Record<string, StandingRow> = {}

  for (const t of teams) {
    table[t.name] = { team: t, points: 0, gd: 0 }
  }

  for (const f of fixtures) {
    if (f.homePoints == null || f.awayPoints == null) continue

    const homeRow = table[f.home]
    const awayRow = table[f.away]
    if (!homeRow || !awayRow) continue

    if (f.homePoints > f.awayPoints) homeRow.points += 3
    else if (f.homePoints < f.awayPoints) awayRow.points += 3
    else {
      homeRow.points += 1
      awayRow.points += 1
    }

    const diff = f.homePoints - f.awayPoints
    homeRow.gd += diff
    awayRow.gd -= diff
  }

  return Object.values(table).sort((a, b) => b.points - a.points || b.gd - a.gd)
}

function allPlayed(fixtures: Array<{ homePoints: number | null; awayPoints: number | null }>) {
  return fixtures.length > 0 && fixtures.every((f) => f.homePoints != null && f.awayPoints != null)
}

export async function generateFullCup(): Promise<CupData> {
  const groupGWs = [29, 30, 31, 32, 33, 34, 35] as const
  const rounds = roundRobin()

  if (rounds.length !== groupGWs.length) {
    throw new Error(`Round robin produced ${rounds.length} rounds, expected ${groupGWs.length}.`)
  }

  const groupFixtures: GroupFixture[] = []

  await Promise.all(
    rounds.flatMap((round, rIndex) => {
      const gw = groupGWs[rIndex]
      if (gw == null) throw new Error(`Missing GW for round index ${rIndex}`)

      return round.map(async (match, idx) => {
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
          id: `${gw}-${match.home.id}-${match.away.id}-${idx}`,
        })
      })
    })
  )

  groupFixtures.sort((a, b) => a.gameweek - b.gameweek || a.home.localeCompare(b.home))

  const standings = computeTable(groupFixtures)
  const groupComplete = allPlayed(groupFixtures)

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

  if (standings.length < 8) {
    throw new Error(`Standings length ${standings.length} is invalid; expected 8.`)
  }

  const qfPairs: Array<[number, number]> = [
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 4],
  ]

  const quarterFinals: KnockoutFixture[] = await Promise.all(
    qfPairs.map(async ([a, b]) => {
      const homeSeed = standings[a]
      const awaySeed = standings[b]
      if (!homeSeed || !awaySeed) throw new Error(`Missing standings seed for QF pair [${a}, ${b}]`)

      const homeTeam = homeSeed.team
      const awayTeam = awaySeed.team

      const [homePoints, awayPoints] = await Promise.all([
        getManagerGwPoints(homeTeam.id, 36),
        getManagerGwPoints(awayTeam.id, 36),
      ])

      const hasResult = homePoints != null && awayPoints != null
      const winner = hasResult ? (homePoints >= awayPoints ? homeTeam : awayTeam) : null

      return {
        stage: "Quarter Final",
        gameweek: 36,
        home: homeTeam.name,
        away: awayTeam.name,
        homePoints,
        awayPoints,
        winner,
        id: `36-${homeTeam.id}-${awayTeam.id}`,
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

  if (quarterFinals.length !== 4) {
    throw new Error(`Quarter finals length ${quarterFinals.length} invalid; expected 4.`)
  }
  for (const qf of quarterFinals) {
    if (!qf.winner) throw new Error("Quarter final marked complete but winner is null.")
  }

  const sfPairs: Array<[Team, Team]> = [
    [quarterFinals[0]!.winner!, quarterFinals[1]!.winner!],
    [quarterFinals[2]!.winner!, quarterFinals[3]!.winner!],
  ]

  const semiFinals: KnockoutFixture[] = await Promise.all(
    sfPairs.map(async ([homeTeam, awayTeam]) => {
      const [homePoints, awayPoints] = await Promise.all([
        getManagerGwPoints(homeTeam.id, 37),
        getManagerGwPoints(awayTeam.id, 37),
      ])

      const hasResult = homePoints != null && awayPoints != null
      const winner = hasResult ? (homePoints >= awayPoints ? homeTeam : awayTeam) : null

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

  if (semiFinals.length !== 2) {
    throw new Error(`Semi finals length ${semiFinals.length} invalid; expected 2.`)
  }
  for (const sf of semiFinals) {
    if (!sf.winner) throw new Error("Semi final marked complete but winner is null.")
  }

  const finalHome = semiFinals[0]!.winner!
  const finalAway = semiFinals[1]!.winner!

  const [homePoints, awayPoints] = await Promise.all([
    getManagerGwPoints(finalHome.id, 38),
    getManagerGwPoints(finalAway.id, 38),
  ])

  const final: FinalFixture = {
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