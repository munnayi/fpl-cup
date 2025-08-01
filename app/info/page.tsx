import Image from "next/image";

export default function info() {
  return (
    <main className="p-6 pb-24 max-w-4xl mx-auto">

      <Image src="/cup.png" alt="The League" width={500} height={500} />

      <h1 className="text-2xl md:text-3xl font-bold mb-6">Introducing.. The Commissioner's Cup!</h1>

      <article className="py-4">
        <h2 className="text-xl md:text-2xl font-bold mb-3">New for the 2025/26 Season</h2>

        <p>A brand NEW 10 gameweek in season tournament!</p>
      </article>

      <article className="py-4">
        <h3 className="text-lg md:text-xl font-bold mb-3">Group Stage</h3>

        <p className="mb-3">Starting GW29; The Commissioner's Cup will see managers go head to head in a round robin format with each team playing each other once.</p>

        <p className="mb-3">The play in each fixture who scores the most points will be awarded 3 points. In the outcome of a draw, each team will receive 1 point. We'll also track goal difference in the event more than one team finish on the same points tally.</p>

      </article>

      <article className="py-4">
        <h3 className="text-lg md:text-xl font-bold mb-3">Play Offs</h3>

        <p className="mb-3">Immediately following the group stages, the "NBA styled" play offs will start in GW36 to conclude with the final in GW38.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 g-4">
          <div>
            <h4 className="text-md md:text-lg font-bold mb-3">Quarter Finals</h4>

            <ul className="mb-3">
              <li className="mb-1">Quarter Final 1: 1st Place vs 8th Place</li>
              <li className="mb-1">Quarter Final 2: 4th Place vs 5th Place</li>
              <li className="mb-1">Quarter Final 3: 3rd Place vs 6th Place</li>
              <li className="mb-1">Quarter Final 4: 2nd Place vs 7th Place</li>
            </ul>
          </div>

          <div>
            <h4 className="text-md md:text-lg font-bold mb-3">Semi Finals</h4>

            <ul className="mb-3">
              <li className="mb-1">Semi Final 1: QF1 Winner vs QF2 Winner</li>
              <li className="mb-1">Semi Final 2: QF3 Winner vs QF4 Winner</li>
            </ul>


             <h4 className="text-md md:text-lg font-bold mb-3">Final</h4>

            <ul className="mb-3">
                <li className="mb-1">Final 1: SF1 Winner vs SF2 Winner</li>
            </ul>
          </div>
        </div>

      </article>

      <article>
        <h3 className="text-lg md:text-xl font-bold mb-3">Winner Takes ALL Prize!!!*</h3>

        <p className="mb-3">The League proposes each player submits an additional £10 entry fee to build a second prize pot for the Commissioner's cup to the total of <strong>£80</strong>. With the winner of cup receiving the entire prize pot.</p>

        <p className="mb-3">Alongside the prize money, the League has also commissioned the creation of a second trophy. The Commisioner's Cup trophy which will be given to the winner of the cup to hold until the following year. Each winner will have their team name proudly displayed on a plaque adorning the trophy.</p>

        <p>Will you be the first the Commissioner's cup winner?</p>
      </article>
    </main>
  );
}
