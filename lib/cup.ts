// lib/cup.ts
//
// Draft endpoints used:
// - Game status (current GW + finished?): https://draft.premierleague.com/api/game
// - Entry history (ALL GWs):            https://draft.premierleague.com/api/entry/:id/history
//
// Behaviour:
// ✅ Past GWs: show points from history
// ✅ Current GW: show points from history if finished, otherwise show LIVE points from history.entry.event_points
// ✅ Future GWs: show null
//
// Progression gating:
// - Group complete only when all group GWs are FINAL (or earlier) and have points
// - Knockout rounds only generated once earlier rounds are FINAL with points
//
// Knockout tie-break:
// - Higher GW points wins
// - If tied: higher group-stage GD wins
// - If still tied: home wins

import { teams, type Team } from "./teams"

const DRAFT_BASE_URL = "https://draft.premierleague.com/api"

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
  meta?: {
    currentGw: number | null
    currentEventFinished: boolean
  }
}

// -----------------------------
// Draft API types (from payload)
// -----------------------------
type EntryHistoryEvent = {
  event: number
  points: number
}

type EntryHistory = {
  history: EntryHistoryEvent[]
  entry?: {
    event_points?: number
  }
}

// -----------------------------
// API helpers + caching
// -----------------------------
async function getDraftGameStatus(): Promise<{ currentGw: number | null; currentEventFinished: boolean }> {
  const res = await fetch(`${DRAFT_BASE_URL}/game`, {
    next: { revalidate: 300 }, // refresh every 5 mins
  })

  if (!res.ok) {
    // fail-open so app still works
    return { currentGw: null, currentEventFinished: true }
  }

  const data = (await res.json()) as any
  return {
    currentGw: typeof data?.current_event === "number" ? data.current_event : null,
    currentEventFinished: Boolean(data?.current_event_finished),
  }
}

type HistoryCache = Map<number, Promise<EntryHistory | null>>

async function fetchEntryHistory(entryId: number, cache: HistoryCache): Promise<EntryHistory | null> {
  const existing = cache.get(entryId)
  if (existing) return existing

  const p = (async () => {
    const res = await fetch(`${DRAFT_BASE_URL}/entry/${entryId}/history`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return (await res.json()) as EntryHistory
  })()

  cache.set(entryId, p)
  return p
}

function pointsFromHistoryForGw(history: EntryHistory | null, gw: number): number | null {
  if (!history || !Array.isArray(history.history)) return null
  const row = history.history.find((r) => r.event === gw)
  return typeof row?.points === "number" ? row.points : null
}

/**
 * Pick Draft points for an entry & GW:
 * - past: history.history[event].points
 * - current:
 *    - finished: history.history[event].points
 *    - live: history.entry.event_points
 * - future: null
 * - unknown currentGw: try history.history
 */
async function getManagerGwPoints(
  entryId: number,
  gw: number,
  status: { currentGw: number | null; currentEventFinished: boolean },
  historyCache: HistoryCache
): Promise<number | null> {
  // 1️⃣ Past gameweeks → use history
  if (status.currentGw != null && gw < status.currentGw) {
    const hist = await fetchEntryHistory(entryId, historyCache)
    return pointsFromHistoryForGw(hist, gw)
  }

  // 2️⃣ Current gameweek → use live event_points
  if (status.currentGw != null && gw === status.currentGw) {
    const hist = await fetchEntryHistory(entryId, historyCache)
    return typeof hist?.entry?.event_points === "number"
      ? hist.entry.event_points
      : null
  }

  // 3️⃣ Future gameweeks
  return null
}
/**
 * Should we even attempt to fetch a score for GW?
 * - If currentGw unknown: yes
 * - If gw <= currentGw: yes
 * - If future: no
 */
function shouldFetchScoresForGw(
  gw: number,
  status: { currentGw: number | null; currentEventFinished: boolean }
) {
  if (status.currentGw == null) return true
  return gw <= status.currentGw
}

/**
 * Is a GW "final" (safe to decide winners / progress bracket)?
 * - Past weeks are final
 * - Current week is final only when current_event_finished=true
 * - Future is not final
 * - Unknown currentGw => treat as final (fail-open)
 */
function isGwFinal(
  gw: number,
  status: { currentGw: number | null; currentEventFinished: boolean }
) {
  if (status.currentGw == null) return true
  if (gw < status.currentGw) return true
  if (gw > status.currentGw) return false
  return status.currentEventFinished
}

// -----------------------------
// Cup logic
// -----------------------------
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

function allPlayedFinal(
  fixtures: Array<{ gameweek: number; homePoints: number | null; awayPoints: number | null }>,
  status: { currentGw: number | null; currentEventFinished: boolean }
) {
  return (
    fixtures.length > 0 &&
    fixtures.every((f) => isGwFinal(f.gameweek, status) && f.homePoints != null && f.awayPoints != null)
  )
}

// GD lookup from group standings (used as knockout tie-break)
function makeGdLookup(standings: StandingRow[]) {
  const map = new Map<string, number>()
  for (const row of standings) map.set(row.team.name, row.gd)
  return map
}

// Knockout winner rule:
// - higher GW points wins
// - if tied: higher group-stage GD wins
// - if still tied: home team wins
function pickWinnerByPointsThenGd(
  homeTeam: Team,
  awayTeam: Team,
  homePoints: number | null,
  awayPoints: number | null,
  gdByTeamName: Map<string, number>
): Team | null {
  if (homePoints == null || awayPoints == null) return null

  if (homePoints > awayPoints) return homeTeam
  if (awayPoints > homePoints) return awayTeam

  const homeGd = gdByTeamName.get(homeTeam.name) ?? 0
  const awayGd = gdByTeamName.get(awayTeam.name) ?? 0

  if (homeGd > awayGd) return homeTeam
  if (awayGd > homeGd) return awayTeam

  return homeTeam
}

export async function generateFullCup(): Promise<CupData> {
  const status = await getDraftGameStatus()
  const historyCache: HistoryCache = new Map()

  // 1) GROUP
  const groupGWs = [29,30,31,32,33,34,35] as const

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
        let homePoints: number | null = null
        let awayPoints: number | null = null

        if (shouldFetchScoresForGw(gw, status)) {
          ;[homePoints, awayPoints] = await Promise.all([
            getManagerGwPoints(match.home.id, gw, status, historyCache),
            getManagerGwPoints(match.away.id, gw, status, historyCache),
          ])
        }

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
  const groupComplete = allPlayedFinal(groupFixtures, status)

  const gdByTeamName = makeGdLookup(standings)

  if (!groupComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals: null,
      semiFinals: null,
      final: null,
      meta: { currentGw: status.currentGw, currentEventFinished: status.currentEventFinished },
    }
  }

  if (standings.length < 8) {
    throw new Error(`Standings length ${standings.length} is invalid; expected 8.`)
  }

  // 2) QUARTER FINALS (GW36)
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

      let homePoints: number | null = null
      let awayPoints: number | null = null

      if (shouldFetchScoresForGw(36, status)) {
        ;[homePoints, awayPoints] = await Promise.all([
          getManagerGwPoints(homeTeam.id, 36, status, historyCache),
          getManagerGwPoints(awayTeam.id, 36, status, historyCache),
        ])
      }

      const winner = isGwFinal(36, status)
        ? pickWinnerByPointsThenGd(homeTeam, awayTeam, homePoints, awayPoints, gdByTeamName)
        : null

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

  const qfComplete = allPlayedFinal(quarterFinals, status)

  if (!qfComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals: null,
      final: null,
      meta: { currentGw: status.currentGw, currentEventFinished: status.currentEventFinished },
    }
  }

  for (const qf of quarterFinals) {
    if (!qf.winner) throw new Error("Quarter final marked complete but winner is null.")
  }

  // 3) SEMI FINALS (GW37)
  const sfPairs: Array<[Team, Team]> = [
    [quarterFinals[0]!.winner!, quarterFinals[1]!.winner!],
    [quarterFinals[2]!.winner!, quarterFinals[3]!.winner!],
  ]

  const semiFinals: KnockoutFixture[] = await Promise.all(
    sfPairs.map(async ([homeTeam, awayTeam]) => {
      let homePoints: number | null = null
      let awayPoints: number | null = null

      if (shouldFetchScoresForGw(37, status)) {
        ;[homePoints, awayPoints] = await Promise.all([
          getManagerGwPoints(homeTeam.id, 37, status, historyCache),
          getManagerGwPoints(awayTeam.id, 37, status, historyCache),
        ])
      }

      const winner = isGwFinal(37, status)
        ? pickWinnerByPointsThenGd(homeTeam, awayTeam, homePoints, awayPoints, gdByTeamName)
        : null

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

  const sfComplete = allPlayedFinal(semiFinals, status)

  if (!sfComplete) {
    return {
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals,
      final: null,
      meta: { currentGw: status.currentGw, currentEventFinished: status.currentEventFinished },
    }
  }

  for (const sf of semiFinals) {
    if (!sf.winner) throw new Error("Semi final marked complete but winner is null.")
  }

  // 4) FINAL (GW38)
  const finalHome = semiFinals[0]!.winner!
  const finalAway = semiFinals[1]!.winner!

  let homePoints: number | null = null
  let awayPoints: number | null = null

  if (shouldFetchScoresForGw(38, status)) {
    ;[homePoints, awayPoints] = await Promise.all([
      getManagerGwPoints(finalHome.id, 38, status, historyCache),
      getManagerGwPoints(finalAway.id, 38, status, historyCache),
    ])
  }

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
    meta: { currentGw: status.currentGw, currentEventFinished: status.currentEventFinished },
  }
}