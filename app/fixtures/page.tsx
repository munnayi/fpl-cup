// app/fixtures/page.tsx

import { generateFullCup } from "@/lib/cup"
import { generateMockCup } from "@/lib/cup-preview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFutbol } from "@fortawesome/free-solid-svg-icons"
import TeamAvatar from "@/components/ui/team-avatar"

function groupFixturesByGameweek(fxs: any[]) {
  const groups: Record<number, any[]> = {}
  for (const f of fxs) (groups[f.gameweek] ||= []).push(f)

  return Object.entries(groups)
    .map(([gw, list]) => ({
      gameweek: Number(gw),
      fixtures: [...list].sort((a, b) => {
        const aKey = `${a.home}-${a.away}`
        const bKey = `${b.home}-${b.away}`
        return aKey.localeCompare(bKey)
      }),
    }))
    .sort((a, b) => a.gameweek - b.gameweek)
}

function labelForGameweek(gw: number) {
  if (gw === 36) return "Gameweek 36 (QFs)"
  if (gw === 37) return "Gameweek 37 (SFs)"
  if (gw === 38) return "Gameweek 38 (Final)"
  return `Gameweek ${gw}`
}

function renderMatch(fixture: any) {
  const hasResult = fixture.homePoints != null && fixture.awayPoints != null

  const homeWins = hasResult && fixture.homePoints > fixture.awayPoints
  const awayWins = hasResult && fixture.awayPoints > fixture.homePoints
  const isDraw = hasResult && fixture.homePoints === fixture.awayPoints

  const strikeHome = hasResult && !isDraw && !homeWins
  const strikeAway = hasResult && !isDraw && !awayWins

  return (
    <Card
      key={fixture.id ?? `${fixture.stage}-${fixture.home}-${fixture.away}`}
      className="mb-3"
    >

      <CardContent className="sm:py-6 py-3">
        {/* Desktop/tablet: TEAM | SCORE | TEAM (clean + compact) */}
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
              <span className="text-sm text-muted-foreground">TBC</span>
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

        {/* Mobile: stacked rows like bracket cards */}
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

export default async function FixturesPage() {
  const preview = process.env.FPL_CUP_PREVIEW === "true"
  const cup = preview ? generateMockCup() : await generateFullCup()

  const grouped = groupFixturesByGameweek(cup.groupFixtures)

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner&apos;s Cup
      </h1>

      <h2 className="text-xl md:text-2xl font-bold mb-6">Fixtures & Results</h2>

      {/* GROUP STAGE */}
      {grouped.map(({ gameweek, fixtures }) => (
        <section key={gameweek} className="mb-8">
          <h3 className="text-l md:text-xl font-semibold mb-3">
            {labelForGameweek(gameweek)}
          </h3>
          {fixtures.map(renderMatch)}
        </section>
      ))}

      {/* QUARTER FINALS */}
      {cup.quarterFinals && (
        <section className="mb-8">
          <h3 className="text-l md:text-xl font-semibold mb-3">
            Quarter Finals (GW36)
          </h3>
          {cup.quarterFinals.map(renderMatch)}
        </section>
      )}

      {/* SEMI FINALS */}
      {cup.semiFinals && (
        <section className="mb-8">
          <h3 className="text-l md:text-xl font-semibold mb-3">
            Semi Finals (GW37)
          </h3>
          {cup.semiFinals.map(renderMatch)}
        </section>
      )}

      {/* FINAL */}
      {cup.final && (
        <section className="mb-8">
          <h3 className="text-l md:text-xl font-semibold mb-3">Final (GW38)</h3>
          {renderMatch(cup.final)}
        </section>
      )}
    </div>
  )
}