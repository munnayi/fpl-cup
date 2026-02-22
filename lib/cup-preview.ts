// lib/cup-preview.ts
//
// Preview generator that can simulate Draft /game states so you can test:
//
// 1) Past GW (scores show)
// 2) Current GW LIVE (scores hidden for that GW)
// 3) Future GW (scores hidden)
//
// How to use (examples):
//   FPL_CUP_PREVIEW=true
//   FPL_CUP_PREVIEW_STATE=LIVE_GROUP     // GW31 live -> GW31 hidden
//   FPL_CUP_PREVIEW_STATE=LIVE_QF        // GW36 live -> QFs hidden
//   FPL_CUP_PREVIEW_STATE=LIVE_SF        // GW37 live -> SFs hidden
//   FPL_CUP_PREVIEW_STATE=LIVE_FINAL     // GW38 live -> Final hidden
//   FPL_CUP_PREVIEW_STATE=FINISHED_38    // GW38 finished -> everything shows + champion possible
//
// You can also override the "current GW" explicitly:
//   FPL_CUP_PREVIEW_CURRENT_GW=33
//
// And whether it's finished:
//   FPL_CUP_PREVIEW_FINISHED=false

import { teams, type Team } from "./teams"

type GroupFixture = {
  id: string
  stage: "Group"
  gameweek: number
  home: string
  away: string
  homePoints: number | null
  awayPoints: number | null
}

type StandingRow = {
  team: Team
  points: number
  gd: number
}

type KnockoutFixture = {
  id: string
  stage: "Quarter Final" | "Semi Final"
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

type PreviewState =
  | "FINISHED_38"
  | "LIVE_GROUP"
  | "LIVE_QF"
  | "LIVE_SF"
  | "LIVE_FINAL"
  | "FUTURE_QF" // group complete but current GW is 35 finished (so no QFs yet)
  | "FUTURE_SF" // QFs complete but current GW is 36 finished (so no SFs yet)
  | "FUTURE_FINAL" // SFs complete but current GW is 37 finished (so no final yet)

type PreviewMeta = {
  currentGw: number | null
  currentEventFinished: boolean
  state: PreviewState
}

// -------- Round robin (strict-safe) --------
function roundRobin(names: string[]) {
  const list = [...names]
  const rounds: { home: string; away: string }[][] = []
  const totalRounds = list.length - 1
  const half = list.length / 2

  for (let round = 0; round < totalRounds; round++) {
    const fixtures: { home: string; away: string }[] = []

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

// ✅ GD lookup from standings
function makeGdLookup(standings: StandingRow[]) {
  const map = new Map<string, number>()
  for (const row of standings) map.set(row.team.name, row.gd)
  return map
}

// ✅ Winner rule: points -> GD -> home
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

// Same rules as prod cup.ts
function shouldShowScoresForGw(gw: number, status: { currentGw: number | null; currentEventFinished: boolean }) {
  if (status.currentGw == null) return true
  if (gw < status.currentGw) return true
  if (gw > status.currentGw) return false
  return status.currentEventFinished
}

// -------- Preview state parsing --------
function parsePreviewMeta(): PreviewMeta {
  const state = (process.env.FPL_CUP_PREVIEW_STATE ?? "FINISHED_38") as PreviewState

  // Optional explicit overrides
  const envGw = process.env.FPL_CUP_PREVIEW_CURRENT_GW
  const envFinished = process.env.FPL_CUP_PREVIEW_FINISHED

  if (envGw != null || envFinished != null) {
    const currentGw = envGw != null ? Number(envGw) : null
    const currentEventFinished =
      envFinished != null ? envFinished === "true" : true

    return {
      state,
      currentGw: Number.isFinite(currentGw as number) ? (currentGw as number) : null,
      currentEventFinished,
    }
  }

  // Sensible presets
  switch (state) {
    case "LIVE_GROUP":
      return { state, currentGw: 31, currentEventFinished: false }
    case "LIVE_QF":
      return { state, currentGw: 36, currentEventFinished: false }
    case "LIVE_SF":
      return { state, currentGw: 37, currentEventFinished: false }
    case "LIVE_FINAL":
      return { state, currentGw: 38, currentEventFinished: false }

    case "FUTURE_QF":
      return { state, currentGw: 35, currentEventFinished: true }
    case "FUTURE_SF":
      return { state, currentGw: 36, currentEventFinished: true }
    case "FUTURE_FINAL":
      return { state, currentGw: 37, currentEventFinished: true }

    case "FINISHED_38":
    default:
      return { state: "FINISHED_38", currentGw: 38, currentEventFinished: true }
  }
}

export function generateMockCup() {
  const meta = parsePreviewMeta()
  const status = { currentGw: meta.currentGw, currentEventFinished: meta.currentEventFinished }

  const teamNames = teams.map((t) => t.name)

  // ========== GROUP ==========
  const rounds = roundRobin(teamNames)

  const groupFixtures: GroupFixture[] = rounds.flatMap((round, rIdx) => {
    const gw = 29 + rIdx

    return round.map((m, idx) => {
      // deterministic points
      const rawHome = 45 + ((m.home.length * 3 + gw + idx) % 30)
      const rawAway = 45 + ((m.away.length * 5 + gw + idx) % 30)

      const show = shouldShowScoresForGw(gw, status)

      return {
        id: `group-${gw}-${idx}`,
        stage: "Group",
        gameweek: gw,
        home: m.home,
        away: m.away,
        homePoints: show ? rawHome : null,
        awayPoints: show ? rawAway : null,
      }
    })
  })

  // ========== STANDINGS ==========
  // Keep your “fixed order” behaviour, but note:
  // If you want standings to reflect hidden scores, you'd need to recompute.
  const standings: StandingRow[] = teams.map((t, i) => ({
    team: t,
    points: 20 - i,
    gd: 10 - i,
  }))

  if (standings.length < 8) {
    throw new Error("Mock standings require exactly 8 teams.")
  }

  const gdByTeamName = makeGdLookup(standings)

  const groupComplete = groupFixtures.every((f) => f.homePoints != null && f.awayPoints != null)

  // If group isn't complete, don't reveal knockouts (matches prod behaviour)
  if (!groupComplete) {
    return {
      meta,
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals: null,
      semiFinals: null,
      final: null,
    }
  }

  // Seeds (safe)
  const s1 = standings[0]!.team
  const s2 = standings[1]!.team
  const s3 = standings[2]!.team
  const s4 = standings[3]!.team
  const s5 = standings[4]!.team
  const s6 = standings[5]!.team
  const s7 = standings[6]!.team
  const s8 = standings[7]!.team

  // ========== QUARTER FINALS (GW36) ==========
  const qfRaw = [
    { id: "qf1", homeTeam: s1, awayTeam: s8, homePoints: 62, awayPoints: 51 },
    { id: "qf2", homeTeam: s2, awayTeam: s7, homePoints: 58, awayPoints: 58 }, // tie -> GD tiebreak
    { id: "qf3", homeTeam: s3, awayTeam: s6, homePoints: 49, awayPoints: 60 },
    { id: "qf4", homeTeam: s4, awayTeam: s5, homePoints: 70, awayPoints: 64 },
  ] as const

  const showQF = shouldShowScoresForGw(36, status)

  const quarterFinals: KnockoutFixture[] = qfRaw.map((m) => {
    const homePoints = showQF ? m.homePoints : null
    const awayPoints = showQF ? m.awayPoints : null

    const winner = pickWinnerByPointsThenGd(m.homeTeam, m.awayTeam, homePoints, awayPoints, gdByTeamName)

    return {
      id: m.id,
      stage: "Quarter Final",
      gameweek: 36,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      homePoints,
      awayPoints,
      winner,
    }
  })

  const qfComplete = quarterFinals.every((f) => f.homePoints != null && f.awayPoints != null)
  if (!qfComplete) {
    return {
      meta,
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals: null,
      final: null,
    }
  }

  // ========== SEMI FINALS (GW37) ==========
  const sfHome1 = quarterFinals[0]!.winner
  const sfAway1 = quarterFinals[1]!.winner
  const sfHome2 = quarterFinals[2]!.winner
  const sfAway2 = quarterFinals[3]!.winner

  if (!sfHome1 || !sfAway1 || !sfHome2 || !sfAway2) {
    throw new Error("Preview: QFs complete but winners missing.")
  }

  const sfRaw = [
    { id: "sf1", homeTeam: sfHome1, awayTeam: sfAway1, homePoints: 61, awayPoints: 55 },
    { id: "sf2", homeTeam: sfHome2, awayTeam: sfAway2, homePoints: 59, awayPoints: 63 },
  ] as const

  const showSF = shouldShowScoresForGw(37, status)

  const semiFinals: KnockoutFixture[] = sfRaw.map((m) => {
    const homePoints = showSF ? m.homePoints : null
    const awayPoints = showSF ? m.awayPoints : null

    const winner = pickWinnerByPointsThenGd(m.homeTeam, m.awayTeam, homePoints, awayPoints, gdByTeamName)

    return {
      id: m.id,
      stage: "Semi Final",
      gameweek: 37,
      home: m.homeTeam.name,
      away: m.awayTeam.name,
      homePoints,
      awayPoints,
      winner,
    }
  })

  const sfComplete = semiFinals.every((f) => f.homePoints != null && f.awayPoints != null)
  if (!sfComplete) {
    return {
      meta,
      groupFixtures,
      standings,
      groupComplete,
      quarterFinals,
      semiFinals,
      final: null,
    }
  }

  // ========== FINAL (GW38) ==========
  const finalHome = semiFinals[0]!.winner
  const finalAway = semiFinals[1]!.winner

  if (!finalHome || !finalAway) {
    throw new Error("Preview: SFs complete but winners missing.")
  }

  const showFinal = shouldShowScoresForGw(38, status)

  const final: FinalFixture = {
    id: "f1",
    stage: "Final",
    gameweek: 38,
    home: finalHome.name,
    away: finalAway.name,
    homePoints: showFinal ? 63 : null,
    awayPoints: showFinal ? 57 : null,
  }

  return {
    meta,
    groupFixtures,
    standings,
    groupComplete,
    quarterFinals,
    semiFinals,
    final,
  }
}