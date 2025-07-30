// app/fixtures/page.tsx
import { fixtures } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";
import TeamAvatar from "@/components/ui/team-avatar";

function groupFixturesByGameweek(fxs = fixtures) {
  const groups: Record<number, typeof fixtures> = {};
  for (const f of fxs) (groups[f.gameweek] ||= []).push(f);
  return Object.entries(groups)
    .map(([gw, list]) => ({
      gameweek: Number(gw),
      fixtures: [...list].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    }))
    .sort((a, b) => a.gameweek - b.gameweek);
}

function labelForGameweek(gw: number) {
  if (gw === 36) return "Gameweek 36 (QFs)";
  if (gw === 37) return "Gameweek 37 (SFs)";
  if (gw === 38) return "Gameweek 38 (Final)";
  return `Gameweek ${gw}`;
}

export default function FixturesPage() {
  const grouped = groupFixturesByGameweek();

  return (
    <div className="max-w-4xl mx-auto p-6">
       <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner's Cup
      </h1>
      <h2 className="text-xl md:text-2xl font-bold mb-6">Fixtures & Results</h2>

      {grouped.map(({ gameweek, fixtures }) => (
        <section key={gameweek} className="mb-8">
          <h2 className="text-l md:text-xl font-semibold mb-3">
            {labelForGameweek(gameweek)}
          </h2>

          {fixtures.map((fixture) => {
            const hasResult =
              fixture.homePoints != null && fixture.awayPoints != null;

            const isDraw =
              hasResult && fixture.homePoints === fixture.awayPoints;

            const homeWins =
              hasResult && fixture.homePoints! > fixture.awayPoints!;
            const awayWins =
              hasResult && fixture.awayPoints! > fixture.homePoints!;

            const strikeHome =
              hasResult && !isDraw && !homeWins; // home lost
            const strikeAway =
              hasResult && !isDraw && !awayWins; // away lost

            return (
              <Card key={fixture.id} className="mb-3">
                <CardContent className="px-2 py-4 md:px-4 md:py-6 lg:p-6">
                  <div className="grid grid-cols-5 gap-2">
                    {/* Home */}
                    <TeamAvatar
                      teamName={fixture.home}
                      nameClassName={strikeHome ? "line-through opacity-60" : undefined}
                    />

                    {/* Score / TBC */}
                    <div
                      className={[
                        "flex items-center justify-center rounded-md p-2 md:p-4",
                        hasResult
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-900 text-white",
                      ].join(" ")}
                    >
                      {hasResult ? (
                        <div className="tabular-nums">
                          <span className={homeWins ? "font-bold" : undefined}>
                            {fixture.homePoints}
                          </span>
                          <span className="px-1">-</span>
                          <span className={awayWins ? "font-bold" : undefined}>
                            {fixture.awayPoints}
                          </span>
                        </div>
                      ) : (
                        "TBC"
                      )}
                    </div>

                    {/* Away */}
                    <TeamAvatar
                      teamName={fixture.away}
                      nameClassName={strikeAway ? "line-through opacity-60" : undefined}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      ))}
    </div>
  );
}
