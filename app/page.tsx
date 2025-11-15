"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";


const PAGE_SIZE = 3;


const leagues = ["Select League", "NFL", "MLB", "NBA", "NHL", "NCAAF", "NCAAB", "NCAAWB", "EPL", "La Liga", "Bundesliga", "Serie A", "Ligue 1", "Champions League", "MLS"];
const mainLeagueMap: { [key: string]: string } = {
  "Select League": "americanfootball_nfl",
  NFL: "americanfootball_nfl",
  MLB: "baseball_mlb",
  NBA: "basketball_nba",
  NHL: "icehockey_nhl",
  NCAAF: "americanfootball_ncaaf",
  NCAAB: "basketball_ncaab",
  NCAAWB: "basketball_ncaaw",
  EPL: "soccer_epl",
  "La Liga": "soccer_spain_la_liga",
  Bundesliga: "soccer_germany_bundesliga",
  "Serie A": "soccer_italy_serie_a",
  "Ligue 1": "soccer_france_ligue_one",
  "Champions League": "soccer_uefa_champs_league",
  MLS: "soccer_usa_mls",
};


const isSoccerLeague = (league: string): boolean => {
  const soccerLeagues = [
    "EPL",
    "La Liga",
    "Bundesliga",
    "Serie A",
    "Ligue 1",
    "Champions League",
    "MLS",
  ];
  return soccerLeagues.includes(league);
};


export default function HomePage() {
  const [selectedLeague, setSelectedLeague] = useState("Select League");
  const [selectWidth, setSelectWidth] = useState<number>(0);
  const textRef = useRef<HTMLSpanElement>(null);
  const [odds, setOdds] = useState<any[]>([]);
  const [parlay, setParlay] = useState<any[]>([]);
  const [oddsView, setOddsView] = useState("American");
  const [bestBook, setBestBook] = useState("");
  const [teamRecords, setTeamRecords] = useState<{ [key: string]: { wins: number; losses: number; draws?: number } }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showParlayToast, setShowParlayToast] = useState(false);
  const [toastId, setToastId] = useState(0);
  const [toastMessage, setToastMessage] = useState("");


  useEffect(() => {
    if (!showParlayToast) return;
  
    const timer = setTimeout(() => {
      setShowParlayToast(false);
    }, 3000);
  
    return () => clearTimeout(timer);
  }, [showParlayToast, toastId]);
  

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLeague, odds]);

  const totalPages =
    Array.isArray(odds) && odds.length > 0
      ? Math.ceil(odds.length / PAGE_SIZE)
      : 1;
  
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedOdds = Array.isArray(odds)
    ? odds.slice(startIndex, startIndex + PAGE_SIZE)
    : [];
  
  const ResponsiveTeamName = ({ name }: { name: string }) => {
    return (
      <div
        className="font-medium text-[clamp(0.75rem,3vw,1rem)] leading-snug break-words relative z-10"
        style={{
          position: "relative",             // Needed for z-index to work
          zIndex: 10,                       // Ensures it's layered on top
          wordBreak: "keep-all",
          overflowWrap: "normal",
          hyphens: "none",
          maxHeight: "calc(1.25em * 3)",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "visible",             // Allows spillover
        }}
      >
        {name}
      </div>
    );
  };
  
  
  
  
  
  
  
  
  
  
  
  

  useEffect(() => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth + 32; // add padding buffer
      setSelectWidth(width);
    }
  }, [selectedLeague]);

  useEffect(() => {
    fetch(`/api/odds?sport=${mainLeagueMap[selectedLeague]}`)
      .then((res) => res.json())
      .then(async (data) => {
        const allGames = Array.isArray(data) ? data : [];
        console.log("📦 Raw odds data:", allGames);
        
        // 🔹 Store ALL games for pagination
        setOdds(allGames);
  
        // 🔹 But only use first 3 (or paginated ones) for team records, to reduce API calls
        const gamesForRecords = allGames.slice(0, 3);
  
        const uniqueTeams = new Set<string>();
        gamesForRecords.forEach((game: any) => {
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
              records[team] = {
                wins: json.wins,
                losses: json.losses,
                draws: json.draws,
              };
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
  

  const addToParlay = (gameId: string, outcome: any, marketType: string) => {
    setParlay((prev) => {
      const alreadyExists = prev.some(
        (pick) => pick.gameId === gameId && pick.marketType === marketType
      );
      if (alreadyExists) {
        console.warn(`You already have a ${marketType} pick for this game.`);
        return prev;
      }
  
      const updated = [
        ...prev,
        { gameId, marketType, ...outcome },
      ];
  
      // 👇 Calculate best book once we have at least two legs
      if (updated.length >= 2) {
        const bookOdds: { [bookmaker: string]: number } = {};
  
        updated.forEach((pick) => {
          if (pick.price && pick.bookmaker) {
            if (!bookOdds[pick.bookmaker]) bookOdds[pick.bookmaker] = 1;
            bookOdds[pick.bookmaker] *= Number(pick.price);
          }
        });
  
        const bestBook = Object.entries(bookOdds).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (bestBook) {
          setBestBook(bestBook);
        }
      }

      // Build toast message based on market type
      const message =
      marketType === "moneyline"
        ? `${outcome.name} Moneyline Added`
        : marketType === "spread"
        ? `${outcome.name} ${outcome.point} Added`
        : marketType === "total"
        ? `${outcome.matchup} ${outcome.name} Added`
        : "Pick Added to Your Parlay Builder";

      
      setToastMessage(message);
      setToastId((id) => id + 1);
      setShowParlayToast(true);

  
      return updated;
    });
  };
  
  

  const removeFromParlay = (indexToRemove: number) => {
    setParlay((prev) => {
      const updated = prev.filter((_, index) => index !== indexToRemove);
  
      if (updated.length < 2) {
        setBestBook("");
      } else {
        const bookOdds: { [bookmaker: string]: number } = {};
  
        updated.forEach((pick) => {
          if (pick.price && pick.bookmaker) {
            if (!bookOdds[pick.bookmaker]) bookOdds[pick.bookmaker] = 1;
            bookOdds[pick.bookmaker] *= Number(pick.price);
          }
        });
  
        const newBestBook = Object.entries(bookOdds).sort((a, b) => b[1] - a[1])[0]?.[0];
        setBestBook(newBestBook || "");
      }
  
      return updated;
    });
  };
  

  const clearParlay = () => {
    setParlay([]);
    setBestBook("");
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

  const convertDecimalToAmerican = (decimal: number): string => {
    if (decimal === 0 || isNaN(decimal)) return "-";
    const profit = decimal - 1;
    return profit >= 1
      ? `+${(profit * 100).toFixed(0)}`
      : `-${(100 / profit).toFixed(0)}`;
  };
  

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getAveragePrice = (marketKey: string, teamName: string, bookmakers: any[]) => {
    const prices: number[] = [];
  
    bookmakers.forEach((book: any) => {
      const market = book.markets?.find((m: any) => m.key === marketKey);
      const outcome = market?.outcomes?.find((o: any) => o.name === teamName);
      if (outcome && outcome.price) {
        prices.push(Number(outcome.price));
      }
    });
  
    if (prices.length === 0) return null;
  
    const average = prices.reduce((acc, val) => acc + val, 0) / prices.length;
    return average;
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="flex flex-col px-4 sm:px-6 md:px-8 py-6 border-b border-black">
        <div className="flex justify-between items-center">
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

          {/* Desktop Links */}
          <ul className="hidden md:flex flex-nowrap justify-end gap-x-6 text-sm font-medium text-black">
            <li>
              <Link href="/promotions" className="hover:underline">Promotions</Link>
            </li>
            <li>
              <Link href="/our-picks" className="hover:underline">Our Picks</Link>
            </li>
            <li>
              <Link href="/sign-up" className="hover:underline">Sign Up</Link>
            </li>
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-black focus:outline-none"
          >
            {isMobileMenuOpen ? (
              <X size={24} strokeWidth={1.5} />
            ) : (
              <Menu size={24} strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
          } md:hidden`}
        >
          <ul className="flex flex-col items-center gap-y-4 text-sm font-medium text-black">
            <li>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Promotions
              </Link>
            </li>
            <li>
              <Link href="/our-picks" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Our Picks
              </Link>
            </li>
            <li>
              <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="hover:underline">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-start pt-10 px-6">
        {/* Search + League Bar */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-center border border-black rounded-full shadow-md bg-white overflow-hidden w-full">
            {/* Hidden span for measuring select width */}
            <span
              ref={textRef}
              className="absolute invisible whitespace-nowrap text-sm font-normal pl-3 py-3"
            >
              {selectedLeague}
            </span>

            {/* Custom select wrapper with dropdown icon */}
            <div className="relative flex-shrink-0">
              <select
                className="appearance-none pl-3 pr-6 py-3 bg-white text-black text-sm rounded-l-full focus:outline-none border-r border-black"
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                style={{ width: selectWidth }}
              >
                {leagues.map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </select>

              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-black">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <input
              type="text"
              placeholder="Search"
              className="min-w-0 flex-grow px-4 py-3 bg-white text-black text-sm focus:outline-none rounded-r-full"
            />

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M16.65 10.65A6 6 0 1110.65 4a6 6 0 016 6.65z" />
              </svg>
            </div>
          </div>
        </div>






        {/* Upcoming Games Section */}
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-bold mb-1">
            Upcoming {selectedLeague === "Select League" ? "" : `${selectedLeague} `}Games
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Displayed singles odds are averaged and may not reflect the most current odds
          </p>

          {!Array.isArray(odds) || odds.length === 0 ? (
            <p className="text-sm text-gray-500">
              Check back later for {selectedLeague} matchups.
            </p>
          ) : (
            <>
              <ul className="space-y-4">
                {paginatedOdds.map((game: any) => {
                  const teams = [game.home_team, game.away_team];

                  return (
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

                      {/* Team Odds Row */}
                      <div className="grid grid-cols-4 gap-5 font-semibold text-xs text-gray-600 border-b border-gray-300 pb-1 mb-2">
                        <div>Team</div>
                        <div className="text-center">Moneyline</div>
                        <div className="text-center">Spread</div>
                        <div className="text-center">Total</div>
                      </div>

                      {teams.map((teamName) => {
                        const isHomeTeam = teamName === game.home_team;

                        const avgML = getAveragePrice("h2h", teamName, game.bookmakers || []);
                        const bestML = game.bookmakers?.[0]?.markets
                          ?.find((m: any) => m.key === "h2h")
                          ?.outcomes?.find((o: any) => o.name === teamName);

                        const avgSpread = getAveragePrice("spreads", teamName, game.bookmakers || []);
                        const bestSpread = game.bookmakers?.[0]?.markets
                          ?.find((m: any) => m.key === "spreads")
                          ?.outcomes?.find((o: any) => o.name === teamName);

                        const totalMarket = game.bookmakers?.[0]?.markets
                          ?.find((m: any) => m.key === "totals");

                        return (
                          <div
                            key={teamName}
                            className="grid grid-cols-4 gap-5 items-center text-sm border-t border-gray-200 py-2"
                          >
                            {/* Team Name + Record */}
                            <div>
                              <ResponsiveTeamName name={teamName} />
                              <div className="text-xs text-gray-500">
                                {teamRecords[teamName]
                                  ? isSoccerLeague(selectedLeague) &&
                                    teamRecords[teamName].draws !== undefined
                                    ? `(${teamRecords[teamName].wins}-${teamRecords[teamName].draws}-${teamRecords[teamName].losses})`
                                    : `(${teamRecords[teamName].wins}-${teamRecords[teamName].losses})`
                                  : ""}
                              </div>
                            </div>

                            {/* Moneyline */}
                            <div className="text-center">
                              {avgML && bestML ? (
                                <button
                                  onClick={() =>
                                    addToParlay(
                                      game.id,
                                      { ...bestML, bookmaker: game.bookmakers[0]?.title },
                                      "moneyline"
                                    )
                                  }
                                  className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800 text-xs"
                                >
                                  {convertDecimalToAmerican(avgML)}
                                </button>
                              ) : (
                                "-"
                              )}
                            </div>

                            {/* Spread */}
                            <div className="text-center">
                              {avgSpread && bestSpread ? (
                                <button
                                  onClick={() =>
                                    addToParlay(
                                      game.id,
                                      { ...bestSpread, bookmaker: game.bookmakers?.[0]?.title },
                                      "spread"
                                    )
                                  }
                                  className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800 text-xs whitespace-nowrap"
                                >
                                  {bestSpread.point > 0 ? `+${bestSpread.point}` : bestSpread.point}{" "}
                                  {convertDecimalToAmerican(avgSpread)}
                                </button>
                              ) : (
                                "-"
                              )}
                            </div>

                            {/* Total */}
                            <div className="text-center">
                              {totalMarket?.outcomes?.some((o: any) =>
                                isHomeTeam ? o.name === "Over" : o.name === "Under"
                              ) ? (
                                totalMarket.outcomes
                                  .filter((o: any) =>
                                    isHomeTeam ? o.name === "Over" : o.name === "Under"
                                  )
                                  .map((outcome: any) => {
                                    const avgTotal = getAveragePrice(
                                      "totals",
                                      outcome.name,
                                      game.bookmakers || []
                                    );
                                    return (
                                      <button
                                        key={outcome.name}
                                        onClick={() =>
                                          addToParlay(
                                            game.id,
                                            {
                                              ...outcome,
                                              matchup: `${game.home_team} vs ${game.away_team}`,
                                              bookmaker: game.bookmakers?.[0]?.title,
                                            },
                                            "total"
                                          )
                                        }
                                        className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800 text-xs"
                                      >
                                        <div className="flex flex-col sm:flex-row items-center justify-center leading-tight gap-x-1">
                                          <span>
                                            {outcome.name === "Over" ? "O" : "U"} {outcome.point}
                                          </span>
                                          <span>
                                            {avgTotal ? convertDecimalToAmerican(avgTotal) : "-"}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })
                              ) : (
                                <span>-</span>
                              )}
                            </div>

                            <div></div>
                          </div>
                        );
                      })}
                    </li>
                  );
                })}
              </ul>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 text-xs">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>







        {/* Parlay Builder Section */}
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-bold mb-4">Your Parlay</h2>
          {parlay.length === 0 ? (
            <p className="text-sm text-gray-500">No picks added yet</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {parlay.map((pick, index) => (
                  <li key={index} className="flex justify-between items-center border border-gray-300 px-4 py-2 rounded-md">
                    <span>
                      {pick.marketType === "moneyline" && `${pick.name} (Moneyline)`}
                      {pick.marketType === "spread" && `${pick.name} ${pick.point > 0 ? `+${pick.point}` : pick.point} (Spread)`}
                      {pick.marketType === "total" && `${pick.matchup} ${pick.name} ${pick.point} (Total)`}
                    </span>
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
                  <div className="text-xs text-gray-600">
                    Best Book: {bestBook || "N/A"}
                  </div>
                  <button
                    className="mt-2 text-xs px-3 py-2 bg-black text-white rounded hover:bg-gray-800"
                    onClick={() => window.open("https://example.com", "_blank")} // replace with real link
                  >
                    Click Here to Sign Up to {bestBook}
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

        {/*Parlay Pick Toast Notification*/}
        {showParlayToast && (
          <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div
              key={toastId}
              className="bg-black text-white px-4 py-2 rounded-full shadow-lg pointer-events-auto transform transition-all duration-500 ease-out overflow-hidden whitespace-nowrap"
              style={{
                animation: "riseAndFade 3s ease-in-out forwards",
                fontSize: "clamp(0.65rem, 3vw, 0.875rem)", // auto-shrink
                maxWidth: "90%", // avoid overflow on very long messages
                textAlign: "center",
              }}
            >
              {toastMessage}
            </div>
          </div>
        )}




      </main>
      <footer className="w-full border-t border-black mt-10 py-10 px-4 bg-white flex justify-center">
        <div className="w-full max-w-screen-lg flex flex-col md:flex-row gap-8">

          {/* Disclaimer Section */}
          <aside className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Disclaimer</h2>
            <p className="text-xs text-gray-600">
              Companies featured on this website may be our partners that compensate us if you sign up through our links. Must be 21+ and physically present in a legal betting state to bet. If you or someone you know has a gambling problem and wants help, call <strong>1-800-GAMBLER</strong>. Please bet responsibly.
            </p>
          </aside>

          {/* Links Section */}
          <nav className="flex-1 flex flex-col items-center md:items-start text-xs gap-1">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Quick Links</h2>
            <Link href="/promotions" className="hover:underline text-gray-700">Promotions</Link>
            <Link href="/our-picks" className="hover:underline text-gray-700">Our Picks</Link>
            <Link href="/sign-up" className="hover:underline text-gray-700">Sign Up</Link>
            <Link href="/disclaimer" className="hover:underline text-gray-700">Disclaimer</Link>
            <Link href="/terms-and-privacy-policy" className="hover:underline text-gray-700">Terms and Privacy Policy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
