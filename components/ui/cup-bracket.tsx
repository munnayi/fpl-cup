"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TeamAvatar from "@/components/ui/team-avatar";

type Match = {
  id: string;
  stage: "Quarter Final" | "Semi Final" | "Final";
  gameweek: number;
  home: string;
  away: string;
  homePoints: number | null;
  awayPoints: number | null;
};

function winnerSide(match: Match): "home" | "away" | null {
  if (match.homePoints == null || match.awayPoints == null) return null;
  if (match.homePoints === match.awayPoints) return "home"; // tie-break rule
  return match.homePoints > match.awayPoints ? "home" : "away";
}

function championFromFinal(final: Match): string | null {
  if (final.homePoints == null || final.awayPoints == null) return null;
  return final.homePoints >= final.awayPoints ? final.home : final.away;
}

function MatchCard({
  match,
  align = "left",
  championName,
}: {
  match: Match;
  align?: "left" | "right";
  championName?: string | null;
}) {
  const winner = winnerSide(match);
  const hasResult = match.homePoints != null && match.awayPoints != null;

  // Swap order for right side
  const leftName = align === "left" ? match.home : match.away;
  const rightName = align === "left" ? match.away : match.home;

  const leftPts = align === "left" ? match.homePoints : match.awayPoints;
  const rightPts = align === "left" ? match.awayPoints : match.homePoints;

  // Determine winner for visual side
  const leftIsWinner =
    (align === "left" && winner === "home") ||
    (align === "right" && winner === "away");

  const rightIsWinner =
    (align === "left" && winner === "away") ||
    (align === "right" && winner === "home");

  const leftIsLoser = hasResult && !leftIsWinner;
  const rightIsLoser = hasResult && !rightIsWinner;

  const showChampionLeft =
    match.stage === "Final" &&
    hasResult &&
    championName != null &&
    leftName === championName;

  const showChampionRight =
    match.stage === "Final" &&
    hasResult &&
    championName != null &&
    rightName === championName;

  return (
    <Card className="w-full relative">
      <CardHeader className="py-3">
        <CardTitle className="text-sm">GW{match.gameweek}</CardTitle>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TeamAvatar
                teamName={leftName}
                nameClassName={
                  leftIsLoser
                    ? "line-through opacity-60"
                    : leftIsWinner
                    ? "font-semibold"
                    : "opacity-70"
                }
              />
              {showChampionLeft && (
                <Badge className="shrink-0 bg-yellow-500 text-gray-900 font-bold">
                  (C)
                </Badge>
              )}
            </div>

            <div className={`tabular-nums text-sm ${leftIsWinner ? "font-bold" : ""}`}>
              {hasResult ? leftPts : "—"}
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <TeamAvatar
                teamName={rightName}
                nameClassName={
                  rightIsLoser
                    ? "line-through opacity-60"
                    : rightIsWinner
                    ? "font-semibold"
                    : "opacity-70"
                }
              />
              {showChampionRight && (
                <Badge className="shrink-0 bg-yellow-500 text-gray-900 font-bold">
                  (C)
                </Badge>
              )}
            </div>

            <div className={`tabular-nums text-sm ${rightIsWinner ? "font-bold" : ""}`}>
              {hasResult ? rightPts : "—"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MirroredCupBracket({
  quarterFinals,
  semiFinals,
  final,
}: {
  quarterFinals: Match[];
  semiFinals: Match[];
  final: Match;
}) {
  const championName = championFromFinal(final);

  // ✅ Safe destructuring (fixes Match | undefined errors)
  const [qf0, qf1, qf2, qf3] = quarterFinals;
  const [sf0, sf1] = semiFinals;

  // If the bracket isn't fully present, don't render the desktop grid
  const canRenderDesktop = Boolean(qf0 && qf1 && qf2 && qf3 && sf0 && sf1 && final);

  return (
    <div className="w-full overflow-x-auto">
      {/* Desktop mirrored layout */}
      <div className="hidden lg:block">
        {!canRenderDesktop ? (
          <p className="text-sm text-muted-foreground">
            Bracket is not available yet.
          </p>
        ) : (
          <div className="relative min-w-[1100px]">
            <div className="grid grid-cols-5 gap-10 items-center relative z-10">
              {/* LEFT OUTER: QFs */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold">QFs</h3>
                <MatchCard match={qf0!} align="left" />
                <MatchCard match={qf1!} align="left" />
              </div>

              {/* LEFT INNER: SF0 */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold">SFs</h3>
                <div className="mt-16">
                  <MatchCard match={sf0!} align="left" />
                </div>
              </div>

              {/* CENTER: FINAL */}
              <div className="flex flex-col gap-6 items-center">
                <h3 className="text-lg font-semibold">Final</h3>
                <MatchCard match={final} align="left" championName={championName} />
              </div>

              {/* RIGHT INNER: SF1 */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-semibold text-right">SFs</h3>
                <div className="mt-16 flex justify-end">
                  <MatchCard match={sf1!} align="right" />
                </div>
              </div>

              {/* RIGHT OUTER: QFs */}
              <div className="flex flex-col gap-6 items-end">
                <h3 className="text-lg font-semibold">QFs</h3>
                <MatchCard match={qf2!} align="right" />
                <MatchCard match={qf3!} align="right" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile fallback */}
      <div className="lg:hidden space-y-8">
        <section>
          <h3 className="text-lg font-semibold mb-3">Quarter Finals</h3>
          <div className="space-y-3">
            {quarterFinals.map((m) => (
              <MatchCard key={m.id} match={m} align="left" />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Semi Finals</h3>
          <div className="space-y-3">
            {semiFinals.map((m) => (
              <MatchCard key={m.id} match={m} align="left" />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">Final</h3>
          <MatchCard match={final} align="left" championName={championName} />
        </section>
      </div>
    </div>
  );
}