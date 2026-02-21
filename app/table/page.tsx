// app/table/page.tsx

import { generateFullCup } from "@/lib/cup"
import { generateMockCup } from "@/lib/cup-preview"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFutbol } from "@fortawesome/free-solid-svg-icons"

function getChampionName(finalMatch: any): string | null {
  if (!finalMatch) return null
  const { home, away, homePoints, awayPoints } = finalMatch
  if (homePoints == null || awayPoints == null) return null

  // tie-break rule: home advances/wins
  return homePoints >= awayPoints ? home : away
}

export default async function TablePage() {
  const preview = process.env.FPL_CUP_PREVIEW === "true"

  const cup = preview
    ? generateMockCup()
    : await generateFullCup()

  const standings = cup.standings
  const championName = getChampionName(cup.final)

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner&apos;s Cup
      </h1>

      <h2 className="text-xl md:text-2xl font-bold mb-6">
        League Table
      </h2>

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
          {standings.map((row: any, index: number) => {
            const teamName =
              typeof row.team === "string" ? row.team : row.team.name

            const isChampion =
              championName != null && teamName === championName

            return (
              <TableRow key={teamName}>
                <TableCell>{index + 1}</TableCell>
                <TableCell className="flex items-center gap-2">
                  <span>{teamName}</span>

                  {isChampion && (
                    <Badge className="ml-1 bg-yellow-500 text-gray-900 font-bold">
                      (C)
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{row.points}</TableCell>
                <TableCell>{row.gd ?? row.goalDifference}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      {/* Optional: subtle note if final not played yet */}
      {!championName && (
        <p className="text-sm text-muted-foreground mt-4">
          Champion will be crowned after the GW38 final is completed.
        </p>
      )}
    </div>
  )
}