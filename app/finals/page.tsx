// app/bracket/page.tsx

import { generateFullCup } from "@/lib/cup";
import { generateMockCup } from "@/lib/cup-preview";
import MirroredCupBracket from "@/components/ui/cup-bracket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFutbol } from "@fortawesome/free-solid-svg-icons";

export default async function BracketPage() {
    const preview = process.env.FPL_CUP_PREVIEW === "true"
  
    const cup = preview
      ? generateMockCup()   // no await needed (sync mock)
      : await generateFullCup()

  return (
    <div className="mx-auto p-6 pb-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        <FontAwesomeIcon icon={faFutbol} className="mr-2 text-green-600" />
        The Commissioner's Cup
      </h1>

      <h2 className="text-xl md:text-2xl font-bold mb-6">Knockout Bracket</h2>

      {!cup.groupComplete && (
        <p className="text-sm text-muted-foreground">
          Bracket will be revealed after all Group Stage fixtures are completed.
        </p>
      )}

      {cup.quarterFinals && cup.semiFinals && cup.final && (
        <MirroredCupBracket
          quarterFinals={cup.quarterFinals}
          semiFinals={cup.semiFinals}
          final={cup.final}
        />
      )}
    </div>
  );
}