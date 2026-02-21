// app/finals/page.tsx

import { generateFullCup } from "@/lib/cup";
import { generateMockCup } from "@/lib/cup-preview";
import MirroredCupBracket from "@/components/ui/cup-bracket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";

type Match = {
  id: string;
  stage: "Quarter Final" | "Semi Final" | "Final";
  gameweek: number;
  home: string;
  away: string;
  homePoints: number | null;
  awayPoints: number | null;
};

function normalizeQuarterFinals(qfs: any[] | null | undefined): Match[] {
  if (!qfs) return [];
  return qfs.map((m) => ({
    id: String(m.id),
    stage: "Quarter Final",
    gameweek: Number(m.gameweek),
    home: String(m.home),
    away: String(m.away),
    homePoints: m.homePoints ?? null,
    awayPoints: m.awayPoints ?? null,
  }));
}

function normalizeSemiFinals(sfs: any[] | null | undefined): Match[] {
  if (!sfs) return [];
  return sfs.map((m) => ({
    id: String(m.id),
    stage: "Semi Final",
    gameweek: Number(m.gameweek),
    home: String(m.home),
    away: String(m.away),
    homePoints: m.homePoints ?? null,
    awayPoints: m.awayPoints ?? null,
  }));
}

function normalizeFinal(final: any | null | undefined): Match | null {
  if (!final) return null;
  return {
    id: String(final.id),
    stage: "Final",
    gameweek: Number(final.gameweek),
    home: String(final.home),
    away: String(final.away),
    homePoints: final.homePoints ?? null,
    awayPoints: final.awayPoints ?? null,
  };
}

export default async function FinalsPage() {
  const preview = process.env.FPL_CUP_PREVIEW === "true";

  const cup = preview ? generateMockCup() : await generateFullCup();

  // If you still want to protect access, keep this.
  // If nav already hides it, you can remove this block.
  if (!cup.groupComplete) {
    return (
      <div className="mx-auto p-6 pb-24 max-w-6xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          <FontAwesomeIcon icon={faFutbol} className="mr-2 text-yellow-500" />
          The Commissioner's Cup
        </h1>

        <h2 className="text-xl md:text-2xl font-bold mb-4">Knockout Round</h2>

        <p className="text-sm text-muted-foreground">
          Knockout Round will be revealed after all Group Stage fixtures are completed.
        </p>
      </div>
    );
  }

  const quarterFinals = normalizeQuarterFinals(cup.quarterFinals);
  const semiFinals = normalizeSemiFinals(cup.semiFinals);
  const final = normalizeFinal(cup.final);

  // Only render when we have the expected data
  const canRenderBracket =
    quarterFinals.length === 4 && semiFinals.length === 2 && final != null;

  return (
    <div className="mx-auto p-6 pb-24 max-w-6xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-yellow-500" />
        The Commissioner&apos;s Cup
      </h1>

      <h2 className="text-xl md:text-2xl font-bold mb-6">Knockout Round</h2>

      {!canRenderBracket ? (
        <p className="text-sm text-muted-foreground">
          Knockout fixtures aren&apos;t available yet.
        </p>
      ) : (
        <MirroredCupBracket
          quarterFinals={quarterFinals}
          semiFinals={semiFinals}
          final={final}
        />
      )}
    </div>
  );
}