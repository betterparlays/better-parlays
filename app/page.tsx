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

const sportsbooks = ["Caesars Sportsbook", "Tropicana Sportsbook", "Bet Parx"];

export default function HomePage() {
  const [selectedLeague, setSelectedLeague] = useState("NBA");
  const [odds, setOdds] = useState<any[]>([]);
  const [parlay, setParlay] = useState<any[]>([]);
  const [oddsView, setOddsView] = useState("American");
  const [randomBook, setRandomBook] = useState("");
  const [teamRecords, setTeamRecords] = useState<{ [key: string]: { wins: number; losses: number } }>({});


  useEffect(() => {
    fetch(`/api/odds?sport=${leagueMap[selectedLeague]}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 Raw odds data:", data); // 👈 Log here
        setOdds(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Odds fetch error:", err);
        setOdds([]);
      });
  }, [selectedLeague]);  
  
  useEffect(() => {
    fetch(`/api/odds?sport=${leagueMap[selectedLeague]}`)
      .then((res) => res.json())
      .then(async (data) => {
        const games = Array.isArray(data) ? data.slice(0, 3) : []; // Limit to first 3 games
        setOdds(games);
  
        // 🔍 Extract only the teams from the displayed games
        const uniqueTeams = new Set<string>();
        games.forEach((game: any) => {
          uniqueTeams.add(game.home_team);
          uniqueTeams.add(game.away_team);
        });
  
        const records: any = {};
        for (const team of uniqueTeams) {
          try {
            const res = await fetch(
              `/api/team-record?team=${encodeURIComponent(team)}&league=${selectedLeague}`
            );
            const json = await res.json();
            if (res.ok) {
              records[team] = { wins: json.wins, losses: json.losses };
            } else {
              console.warn(`Failed to fetch record for ${team}:`, json.error);
            }
          } catch (err) {
            console.error(`Fetch error for ${team}:`, err);
          }
        }
  
        setTeamRecords(records);
      })
      .catch((err) => {
        console.error("Odds fetch error:", err);
        setOdds([]);
      });
  }, [selectedLeague]);  
  

  const addToParlay = (gameId: string, outcome: any) => {
    setParlay((prev) => {
      const updated = [...prev, { gameId, ...outcome }];
      if (updated.length === 2) {
        const random = sportsbooks[Math.floor(Math.random() * sportsbooks.length)];
        setRandomBook(random);
      }
      return updated;
    });
  };

  const removeFromParlay = (indexToRemove: number) => {
    setParlay((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
      if (updated.length < 2) setRandomBook("");
      return updated;
    });
  };

  const clearParlay = () => {
    setParlay([]);
    setRandomBook("");
  };

  const calculateParlayOddsDecimal = (): number => {
    if (!Array.isArray(parlay) || parlay.length === 0) return 0;
    return parlay.reduce((acc, pick) => {
      const odd = Number(pick.price);
      return isNaN(odd) || odd < 1 ? acc : acc * odd;
    }, 1);
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
      <nav className="flex justify-between items-center px-4 sm:px-6 md:px-8 py-6 border-b border-black">
        <div className="w-40 h-16 sm:w-48 sm:h-20">
          <svg viewBox="-10 0 340 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <text x="16" y="42" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
              BETTER
            </text>
            <text x="31" y="94" fontSize="50" fontWeight="1000" fill="#d1d5db" transform="skewX(-25)">
              PARLAYS
            </text>
          </svg>
        </div>
        <ul className="flex flex-nowrap justify-end gap-x-4 sm:gap-x-6 text-xs sm:text-sm font-medium text-black">
          <li className="whitespace-nowrap">
            <Link href="/promotions" className="hover:underline">Promotions</Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/our-picks" className="hover:underline">Our Picks</Link>
          </li>
          <li className="whitespace-nowrap">
            <Link href="/sign-up" className="hover:underline">Sign Up</Link>
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
          {!Array.isArray(odds) || odds.length === 0 ? (
            <p className="text-sm text-gray-500">Check back later for {selectedLeague} matchups.</p>
          ) : (
            <ul className="space-y-4">
              {odds.slice(0, 3).map((game: any) => (
                <li key={game.id} className="border border-black p-4 rounded-md shadow-sm">
                {/* Matchup Line */}
                <div className="mb-1">
                <div className="font-semibold">
                    {game.home_team} vs {game.away_team}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(game.commence_time).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                      timeZoneName: "short",
                    })}
                  </div>
                </div>
                {/* Team Records Below and Betting Outcomes*/}
                <div className="text-sm text-gray-700 space-y-1">
                  {game.bookmakers?.[0]?.markets?.[0]?.outcomes?.map((outcome: any) => (
                    <div key={outcome.name} className="flex justify-between items-center">
                      <span>
                        {outcome.name} ({teamRecords[outcome.name]?.wins ?? "-"}-{teamRecords[outcome.name]?.losses ?? "-"})
                      </span>
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
                    <span>{pick.name}</span>
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
              {parlay.length >= 2 && (
                <div className="text-sm font-semibold mb-4 space-y-2">
                  <div>Parlay Odds ({oddsView}): {getFormattedOdds()}</div>
                  <div className="text-xs text-gray-600">Best Odds: {randomBook}</div>
                  <button
                    className="mt-2 text-xs px-3 py-2 bg-black text-white rounded hover:bg-gray-800"
                    onClick={() => window.open("https://example.com", "_blank")} // replace with real link
                  >
                    Click Here to Sign Up to {randomBook}
                  </button>
                </div>
              )}
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
      <footer className="w-full border-t border-black mt-10 py-10 px-4 bg-white flex justify-center">
        <div className="w-full max-w-screen-lg flex flex-col md:flex-row gap-8">

          {/* Disclaimer Section */}
          <aside className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Disclaimer</h2>
            <p className="text-xs text-gray-600">
              Companies featured on this website may be our partners that compensate us if you sign up through our links. Must be 21+ and physically present in New Jersey to bet. If you or someone you know has a gambling problem and wants help, call <strong>1-800-GAMBLER</strong>. Please bet responsibly.
            </p>
          </aside>

          {/* Links Section */}
          <nav className="flex-1 flex flex-col items-center md:items-start text-xs gap-1">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Quick Links</h2>
            <Link href="/promotions" className="hover:underline text-gray-700">Promotions</Link>
            <Link href="/our-picks" className="hover:underline text-gray-700">Our Picks</Link>
            <Link href="/sign-up" className="hover:underline text-gray-700">Sign Up</Link>
            <Link href="/disclaimer" className="hover:underline text-gray-700">Disclaimer</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
