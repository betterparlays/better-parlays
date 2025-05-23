"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const leagues = ["NFL", "MLB", "NBA", "NHL", "NCAAF", "NCAAB", "NCAAWB"];
const leagueMap: { [key: string]: string } = {
  NFL: "americanfootball_nfl",
  MLB: "baseball_mlb",
  NBA: "basketball_nba",
  NHL: "icehockey_nhl",
  NCAAF: "americanfootball_ncaaf",
  NCAAB: "basketball_ncaab",
  NCAAWB: "basketball_ncaaw",
};

export default function HomePage() {
  const [selectedLeague, setSelectedLeague] = useState("NBA");
  const [odds, setOdds] = useState([]);
  const [parlay, setParlay] = useState<any[]>([]);
  const [oddsView, setOddsView] = useState("American");

  useEffect(() => {
    fetch(`/api/odds?sport=${leagueMap[selectedLeague]}`)
      .then((res) => res.json())
      .then((data) => setOdds(data))
      .catch((err) => console.error("Odds fetch error:", err));
  }, [selectedLeague]);

  const addToParlay = (gameId: string, outcome: any) => {
    setParlay((prev) => [...prev, { gameId, ...outcome }]);
  };

  const removeFromParlay = (indexToRemove: number) => {
    setParlay((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const clearParlay = () => {
    setParlay([]);
  };

  const calculateParlayOddsDecimal = (): number => {
    if (!Array.isArray(parlay) || parlay.length === 0) return 0;
    return parlay.reduce((acc, pick) => {
      const odd = Number(pick.price);
      return isNaN(odd) || odd < 1 ? acc : acc * odd;
    }, 1);
  };

  const decimalToAmerican = (decimal: number): string => {
    if (decimal >= 2.0) return `+${Math.floor((decimal - 1) * 100)}`;
    if (decimal > 1.0) return `-${Math.floor(100 / (decimal - 1))}`;
    return "N/A";
  };

  const getFormattedOdds = (): string => {
    const decimalOdds = calculateParlayOddsDecimal();
    if (decimalOdds === 0) return "0.00";
    if (oddsView === "Decimal") return decimalOdds.toFixed(2);
    if (oddsView === "American") {
      const profit = decimalOdds - 1;
      return profit >= 1 ? `+${(profit * 100).toFixed(0)}` : `-${(100 / profit).toFixed(0)}`;
    }
    return decimalOdds.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-black">
        <div className="w-48 h-20">
          <svg viewBox="-10 0 340 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <text x="16" y="42" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
              BETTER
            </text>
            <text x="31" y="94" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
              PARLAYS
            </text>
          </svg>
        </div>
        <ul className="flex flex-wrap justify-end gap-x-6 text-sm md:text-sm text-xs font-medium text-black">
          <li>
            <Link href="/promotions" className="hover:underline whitespace-nowrap">Promotions</Link>
          </li>
          <li>
            <Link href="/our-picks" className="hover:underline whitespace-nowrap">Our Picks</Link>
          </li>
          <li>
            <Link href="/sign-up" className="hover:underline whitespace-nowrap">Sign Up</Link>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-start pt-10 px-6">
        {/* Search + League Bar */}
        <div className="w-full max-w-3xl">
          <div className="relative flex items-center border border-black rounded-full shadow-md bg-white">
            <select
              className="pl-4 pr-2 py-3 bg-white text-black text-sm rounded-l-full focus:outline-none border-r border-black"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              {leagues.map((league) => (
                <option key={league} value={league}>{league}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search"
              className="flex-grow px-4 py-3 bg-white text-black text-sm focus:outline-none rounded-r-full"
            />

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 10.65A6 6 0 1110.65 4a6 6 0 016 6.65z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Upcoming Games Section */}
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-bold mb-4">Upcoming Games</h2>
          {odds.length === 0 ? (
            <p className="text-sm text-gray-500">Loading games...</p>
          ) : (
            <ul className="space-y-4">
              {odds.slice(0, 3).map((game: any) => (
                <li key={game.id} className="border border-black p-4 rounded-md shadow-sm">
                  <div className="font-semibold mb-1">{game.home_team} vs {game.away_team}</div>
                  <div className="text-sm text-gray-700 space-y-1">
                    {game.bookmakers?.[0]?.markets?.[0]?.outcomes?.map((outcome: any) => (
                      <div key={outcome.name} className="flex justify-between items-center">
                        <span>{outcome.name}: <span className="font-medium">{decimalToAmerican(outcome.price)}</span></span>
                        <button
                          className="text-xs px-2 py-1 bg-black text-white rounded hover:bg-gray-800"
                          onClick={() => addToParlay(game.id, outcome)}
                        >
                          Add to Parlay
                        </button>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Parlay Builder Section */}
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-bold mb-4">Your Parlay</h2>
          {parlay.length === 0 ? (
            <p className="text-sm text-gray-500">No picks added yet.</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {parlay.map((pick, index) => (
                  <li key={index} className="flex justify-between items-center border border-gray-300 px-4 py-2 rounded-md">
                    <span>{pick.name} @ {decimalToAmerican(pick.price)}</span>
                    <button
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => removeFromParlay(index)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-1">Odds Format</label>
                <select
                  value={oddsView}
                  onChange={(e) => setOddsView(e.target.value)}
                  className="text-sm px-2 py-1 border border-black rounded"
                >
                  <option value="Decimal">Decimal</option>
                  <option value="American">American</option>
                </select>
              </div>
              <div className="text-sm font-semibold mb-4">
                Parlay Odds ({oddsView}): {getFormattedOdds()}
              </div>
              <button
                className="text-xs px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300"
                onClick={clearParlay}
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
