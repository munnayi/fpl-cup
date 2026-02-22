// app/table/page.tsx

import { generateFullCup } from "@/lib/cup"
import { generateMockCup } from "@/lib/cup-preview"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import TeamAvatar from "@/components/ui/team-avatar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFutbol } from "@fortawesome/free-solid-svg-icons"

type AnyFixture = {
  id: string
  stage: string
  gameweek: number
  home: string
  away: string
  homePoints: number | null
  awayPoints: number | null
}

function collectAllFixtures(cup: any): AnyFixture[] {
  const all: AnyFixture[] = []

  if (Array.isArray(cup.groupFixtures)) all.push(...cup.groupFixtures)
  if (Array.isArray(cup.quarterFinals)) all.push(...cup.quarterFinals)
  if (Array.isArray(cup.semiFinals)) all.push(...cup.semiFinals)
  if (cup.final) all.push(cup.final)

  return all
}

function renderCurrentGwMatch(fixture: AnyFixture) {
  const hasResult = fixture.homePoints != null && fixture.awayPoints != null

  const homeWins = hasResult && fixture.homePoints! > fixture.awayPoints!
  const awayWins = hasResult && fixture.awayPoints! > fixture.homePoints!
  const isDraw = hasResult && fixture.homePoints === fixture.awayPoints

  const strikeHome = hasResult && !isDraw && !homeWins
  const strikeAway = hasResult && !isDraw && !awayWins

  return (
    <Card key={fixture.id} className="mb-3">
      <CardContent className="sm:py-6 py-3">
        {/* Desktop/tablet: TEAM | SCORE | TEAM */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <TeamAvatar
              teamName={fixture.home}
              nameClassName={
                strikeHome
                  ? "line-through opacity-60"
                  : homeWins
                  ? "font-semibold"
                  : "opacity-70"
              }
            />
          </div>

          <div className="shrink-0 rounded-md border px-4 py-2">
            {hasResult ? (
              <div className="tabular-nums text-sm">
                <span className={homeWins ? "font-bold" : undefined}>
                  {fixture.homePoints}
                </span>
                <span className="px-1">-</span>
                <span className={awayWins ? "font-bold" : undefined}>
                  {fixture.awayPoints}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">—</span>
            )}
          </div>

          <div className="flex-1 min-w-0 flex justify-end">
            <TeamAvatar
              teamName={fixture.away}
              nameClassName={
                strikeAway
                  ? "line-through opacity-60"
                  : awayWins
                  ? "font-semibold"
                  : "opacity-70"
              }
            />
          </div>
        </div>

        {/* Mobile: stacked */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between gap-3">
            <TeamAvatar
              teamName={fixture.home}
              nameClassName={
                strikeHome
                  ? "line-through opacity-60"
                  : homeWins
                  ? "font-semibold"
                  : "opacity-70"
              }
            />
            <div className={`tabular-nums text-sm ${homeWins ? "font-bold" : ""}`}>
              {hasResult ? fixture.homePoints : "—"}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <TeamAvatar
              teamName={fixture.away}
              nameClassName={
                strikeAway
                  ? "line-through opacity-60"
                  : awayWins
                  ? "font-semibold"
                  : "opacity-70"
              }
            />
            <div className={`tabular-nums text-sm ${awayWins ? "font-bold" : ""}`}>
              {hasResult ? fixture.awayPoints : "—"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function TablePage() {
  const preview = process.env.FPL_CUP_PREVIEW === "true"
  const cup = preview ? generateMockCup() : await generateFullCup()

  const standings = cup.standings
  const currentGw: number | null = cup.meta?.currentGw ?? null
  const currentEventFinished: boolean = cup.meta?.currentEventFinished ?? true

  const allFixtures = collectAllFixtures(cup)
  const currentGwFixtures =
    currentGw == null ? [] : allFixtures.filter((f) => f.gameweek === currentGw)

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner&apos;s Cup
      </h1>

      <h2 className="text-xl md:text-2xl font-bold mb-6">League Table</h2>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>GD</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {standings.map((row: any, index: number) => (
            <TableRow key={row.team.name}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.team.name}</TableCell>
              <TableCell>{row.points}</TableCell>
              <TableCell>{row.gd}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Current GW Fixtures */}
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-4">
          {currentGw != null && !currentEventFinished && (
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          )}
          <h3 className="text-lg font-semibold">
            {currentGw != null ? `GW${currentGw} Fixtures` : "Current GW Fixtures"}
            {currentGw != null && !currentEventFinished ? " — LIVE" : ""}
          </h3>
        </div>

        {currentGw == null ? (
          <p className="text-sm text-muted-foreground">Current gameweek unavailable.</p>
        ) : currentGwFixtures.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No cup fixtures scheduled for GW{currentGw}.
          </p>
        ) : (
          <div>
            {currentGwFixtures.map(renderCurrentGwMatch)}
          </div>
        )}
      </div>
    </div>
  )
}