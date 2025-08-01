import { fixtures, teams } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";

type TableRowType = {
  team: string;
  points: number;
  goalDifference: number;
};

function computeTable() {
  const table: Record<string, TableRowType> = {};
  const teamNames = new Set(teams.map((t) => t.name));

  // init rows
  teams.forEach((t) => {
    table[t.name] = { team: t.name, points: 0, goalDifference: 0 };
  });

  // only group stage, only completed matches, only real teams
  const groupResults = fixtures.filter(
    (f) =>
      f.gameweek >= 29 &&
      f.gameweek <= 35 &&
      f.homePoints != null &&
      f.awayPoints != null &&
      teamNames.has(f.home) &&
      teamNames.has(f.away)
  );

  groupResults.forEach(({ home, away, homePoints, awayPoints }) => {
    // points
    if (homePoints! > awayPoints!) {
      table[home].points += 3;
    } else if (homePoints! < awayPoints!) {
      table[away].points += 3;
    } else {
      table[home].points += 1;
      table[away].points += 1;
    }

    // goal difference (sum of per-fixture point differences)
    const diff = (homePoints! - awayPoints!);
    table[home].goalDifference += diff;
    table[away].goalDifference -= diff;
  });

  // sort by points, then GD
  return Object.values(table).sort((a, b) => {
    if (b.points === a.points) return b.goalDifference - a.goalDifference;
    return b.points - a.points;
  });
}

export default function TablePage() {
  const leagueTable = computeTable();

  return (
    <div className="max-w-4xl mx-auto p-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner's Cup
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
          {leagueTable.map((row, index) => (
            <TableRow key={row.team}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.team}</TableCell>
              <TableCell>{row.points}</TableCell>
              <TableCell>{row.goalDifference}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
