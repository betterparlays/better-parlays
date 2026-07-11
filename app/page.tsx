"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const PAGE_SIZE = 3;

const leagues = [
  "Select League",
  "NFL",
  "MLB",
  "NBA",
  "NHL",
  "NCAAF",
  "NCAAB",
  "NCAAWB",
  "EPL",
  "La Liga",
  "Bundesliga",
  "Serie A",
  "Ligue 1",
  "Champions League",
  "MLS",
];

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
  const [teamRecords, setTeamRecords] = useState<{
    [key: string]: { wins: number; losses: number; draws?: number };
  }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showParlayToast, setShowParlayToast] = useState(false);
  const [toastId, setToastId] = useState(0);
  const [toastMessage, setToastMessage] = useState("");
  const gamesSectionRef = useRef<HTMLDivElement | null>(null);
  const [toastVariant, setToastVariant] = useState<"add" | "delete">("add");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setSearchResult] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  type OddsSuccess = {
    event_id: string;
    success: true;
    data: any;
  };

  type OddsFailure = {
    event_id: string;
    success: false;
    error: string;
  };

  type OddsEntry = OddsSuccess | OddsFailure;

  const [searchMatch, setSearchMatch] = useState<OddsSuccess | null>(null);
  const [searchMatchType, setSearchMatchType] = useState<string | null>(null);
  const [searchMatchSource, setSearchMatchSource] = useState<
    "outcome" | "teams" | "none" | null
  >(null);
  const [searchMarketKey, setSearchMarketKey] = useState<string | null>(null);

  // Submit search
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchMatch(null);
    setSearchMatchType(null);
    setSearchMatchSource(null);
    setSearchMarketKey(null);

    const formData = new FormData(e.currentTarget);
    const query = formData.get("search")?.toString().trim() || "";
    if (!query) {
      setSearchLoading(false);
      return;
    }

    const leagueParam =
      selectedLeague && selectedLeague !== "Select League"
        ? selectedLeague
        : "NFL";

    const leagueSlug =
      mainLeagueMap[leagueParam] ?? mainLeagueMap["Select League"];

    const searchUrl = `https://api.betterparlays.com/search/${leagueParam}?query=${encodeURIComponent(
      query
    )}`;
    const eventsUrl = `https://api.betterparlays.com/${leagueSlug}/events`;

    try {
      const [searchSettled, eventsSettled] = await Promise.allSettled([
        fetch(searchUrl),
        fetch(eventsUrl),
      ]);

      if (searchSettled.status !== "fulfilled") {
        throw new Error(
          `Search request failed to fetch: ${String(searchSettled.reason)}`
        );
      }

      const searchRes = searchSettled.value;
      if (!searchRes.ok) {
        throw new Error(`Search request failed: ${searchRes.status}`);
      }

      const searchJson = await searchRes.json();
      console.log("🔍 Search API response", {
        url: searchUrl,
        leagueParam,
        leagueSlug,
        query,
        data: searchJson,
      });

      setSearchResult(searchJson);

      const marketMatch =
        searchJson?.data?.data?.market_match ?? searchJson?.data?.market_match;
      const matchType =
        searchJson?.data?.data?.match_type ?? searchJson?.data?.match_type;

      setSearchMarketKey(marketMatch || null);
      setSearchMatchType(matchType || null);

      // Events → event ids
      let eventIds: string[] = [];
      if (eventsSettled.status === "fulfilled") {
        const eventsRes = eventsSettled.value;
        if (!eventsRes.ok) {
          console.error(
            `Events request failed for ${leagueSlug}:`,
            eventsRes.status
          );
        } else {
          const eventsJson = await eventsRes.json();
          console.log("📡 Events API response", {
            url: eventsUrl,
            leagueParam,
            leagueSlug,
            query,
            data: eventsJson,
          });

          const eventsData = eventsJson?.data?.data ?? eventsJson?.data;
          const rawEventIds = eventsData?.event_id;
          if (Array.isArray(rawEventIds)) {
            eventIds = rawEventIds;
          }
        }
      } else {
        console.error("Events request failed to fetch:", eventsSettled.reason);
      }

      if (marketMatch && eventIds.length > 0) {
        const oddsPromises: Promise<OddsEntry>[] = eventIds.map((eventId) => {
          const oddsUrl = `http://localhost:8080/${leagueSlug}/${eventId}/odds?market=${encodeURIComponent(
            marketMatch
          )}`;

          return fetch(oddsUrl)
            .then(async (res) => {
              if (!res.ok) {
                throw new Error(
                  `Odds request failed (${res.status}) for event ${eventId}`
                );
              }
              const oddsJson = await res.json();
              const successEntry: OddsSuccess = {
                event_id: eventId,
                success: true,
                data: oddsJson,
              };
              return successEntry;
            })
            .catch((err) => {
              const failureEntry: OddsFailure = {
                event_id: eventId,
                success: false,
                error: String(err),
              };
              return failureEntry;
            });
        });

        const mergedOdds: OddsEntry[] = await Promise.all(oddsPromises);

        console.log("🎯 Combined Local Odds API Response:", {
          leagueSlug,
          marketMatch,
          matchType,
          totalEventsQueried: mergedOdds.length,
          odds: mergedOdds,
        });

        if (matchType) {
          const matchedEventByOutcome = mergedOdds.find(
            (entry): entry is OddsSuccess => {
              if (!entry.success) return false;
              const bookmakers = entry.data?.bookmakers ?? [];
              return bookmakers.some((bookmaker: any) =>
                (bookmaker.markets ?? []).some((market: any) =>
                  (market.key === marketMatch || !marketMatch) &&
                  (market.outcomes ?? []).some((outcome: any) => {
                    const nameMatches = outcome?.name === matchType;
                    const descriptionMatches =
                      outcome?.description === matchType;
                    return nameMatches || descriptionMatches;
                  })
                )
              );
            }
          );

          let matchedEventEntry: OddsSuccess | undefined = matchedEventByOutcome;
          let matchSource: "outcome" | "teams" | "none" = "none";

          if (matchedEventByOutcome) {
            matchSource = "outcome";
          } else {
            const matchedEventByTeams = mergedOdds.find(
              (entry): entry is OddsSuccess => {
                if (!entry.success) return false;
                const home = entry.data?.home_team;
                const away = entry.data?.away_team;
                return home === matchType || away === matchType;
              }
            );

            if (matchedEventByTeams) {
              matchedEventEntry = matchedEventByTeams;
              matchSource = "teams";
            }
          }

          if (matchedEventEntry) {
            console.log("📌 Matched Event for match_type from Search API:", {
              matchType,
              matchSource,
              event: matchedEventEntry,
            });
            setSearchMatch(matchedEventEntry);
            setSearchMatchSource(matchSource);
          } else {
            console.warn("No event found matching match_type", { matchType });
            setSearchMatch(null);
            setSearchMatchSource("none");
          }
        } else {
          console.warn("No match_type from Search API; skipping match lookup");
        }
      } else {
        console.warn("Skipping odds fetch – missing marketMatch or eventIds", {
          marketMatch,
          eventIds,
        });
      }
    } catch (err) {
      console.error(err);
      setSearchError("Search failed. Please try again.");
      setSearchMarketKey(null);
    } finally {
      setSearchLoading(false);
    }
  }

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Auto-hide toast
  useEffect(() => {
    if (!showParlayToast) return;
    const timer = setTimeout(() => setShowParlayToast(false), 3000);
    return () => clearTimeout(timer);
  }, [showParlayToast, toastId]);

  // Reset page on league change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLeague]);

  // Measure select width
  useEffect(() => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth + 32;
      setSelectWidth(width);
    }
  }, [selectedLeague]);

  // Fetch odds for upcoming games
  useEffect(() => {
    fetch(`/api/odds?sport=${mainLeagueMap[selectedLeague]}`)
      .then((res) => res.json())
      .then((data) => {
        const allGames = Array.isArray(data) ? data : [];
        console.log("📦 Raw odds data:", allGames);

        const now = Date.now();
        const futureGames = allGames.filter((game: any) => {
          const start = new Date(game.commence_time).getTime();
          return start > now;
        });

        setOdds(futureGames);
        setTeamRecords({});
        setCurrentPage(1);
      })
      .catch((err) => {
        console.error("Odds fetch error:", err);
        setOdds([]);
        setTeamRecords({});
      });
  }, [selectedLeague]);

  const itemsPerPage = PAGE_SIZE;
  const totalPages = Math.ceil(odds.length / itemsPerPage);
  const paginatedOdds = odds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Clamp page when odds length changes
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Fetch team records
  useEffect(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentGames = odds.slice(startIndex, startIndex + PAGE_SIZE);

    const uniqueTeams = new Set<string>();
    currentGames.forEach((game: any) => {
      uniqueTeams.add(game.home_team);
      uniqueTeams.add(game.away_team);
    });

    const fetchRecords = async () => {
      const newRecords: any = {};
      for (const team of uniqueTeams) {
        try {
          const res = await fetch(
            `/api/team-record?team=${encodeURIComponent(
              team
            )}&league=${selectedLeague}`
          );
          const json = await res.json();
          if (res.ok) {
            newRecords[team] = {
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
      setTeamRecords((prev) => ({ ...prev, ...newRecords }));
    };

    fetchRecords();
  }, [selectedLeague, currentPage, odds]);

  const ResponsiveTeamName = ({ name }: { name: string }) => (
    <div
      className="font-medium text-[clamp(0.75rem,3vw,1rem)] leading-snug break-words relative z-10"
      style={{
        position: "relative",
        zIndex: 10,
        wordBreak: "keep-all",
        overflowWrap: "normal",
        hyphens: "none",
        maxHeight: "calc(1.25em * 3)",
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: 3,
        overflow: "visible",
      }}
    >
      {name}
    </div>
  );

  const addToParlay = (gameId: string, outcome: any, marketType: string) => {
    setParlay((prev) => {
      const alreadyExists = prev.some(
        (pick) => pick.gameId === gameId && pick.marketType === marketType
      );
      if (alreadyExists) {
        console.warn(`You already have a ${marketType} pick for this game.`);
        return prev;
      }

      const updated = [...prev, { gameId, marketType, ...outcome }];

      if (updated.length >= 2) {
        const bookOdds: { [bookmaker: string]: number } = {};
        updated.forEach((pick) => {
          if (pick.price && pick.bookmaker) {
            if (!bookOdds[pick.bookmaker]) bookOdds[pick.bookmaker] = 1;
            bookOdds[pick.bookmaker] *= Number(pick.price);
          }
        });
        const bestBookEntry = Object.entries(bookOdds).sort(
          (a, b) => b[1] - a[1]
        )[0];
        if (bestBookEntry) setBestBook(bestBookEntry[0]);
      }

      const message =
        marketType === "moneyline"
          ? `${outcome.name} Moneyline Added`
          : marketType === "spread"
          ? `${outcome.name} ${
              outcome.point > 0 ? `+${outcome.point}` : outcome.point
            } Added`
          : marketType === "total"
          ? `${outcome.matchup} ${outcome.name} Added`
          : marketType === "player_prop"
          ? `${outcome.player} ${outcome.name} ${
              outcome.point ?? ""
            } ${outcome.stat ?? ""} Added`
          : "Pick Added to Your Parlay Builder";

      setToastVariant("add");
      setToastMessage(message);
      setToastId((id) => id + 1);
      setShowParlayToast(true);

      return updated;
    });
  };

  const removeFromParlay = (indexToRemove: number) => {
    setParlay((prev) => {
      const removedPick = prev[indexToRemove];
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
        const bestBookEntry = Object.entries(bookOdds).sort(
          (a, b) => b[1] - a[1]
        )[0];
        setBestBook(bestBookEntry?.[0] || "");
      }

      if (removedPick) {
        const deleteMessage =
          removedPick.marketType === "moneyline"
            ? `${removedPick.name} Moneyline Removed`
            : removedPick.marketType === "spread"
            ? `${removedPick.name} ${
                removedPick.point > 0
                  ? `+${removedPick.point}`
                  : removedPick.point
              } Removed`
            : removedPick.marketType === "total"
            ? `${removedPick.matchup} ${removedPick.name} Removed`
            : removedPick.marketType === "player_prop"
            ? `${removedPick.player} ${removedPick.name} ${
                removedPick.point ?? ""
              } ${removedPick.stat ?? ""} Removed`
            : "Pick Removed From Your Parlay Builder";

        setToastVariant("delete");
        setToastMessage(deleteMessage);
        setToastId((id) => id + 1);
        setShowParlayToast(true);
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
    const profit = decimalOdds - 1;
    if (oddsView === "American") {
      return profit >= 1
        ? `+${(profit * 100).toFixed(0)}`
        : `-${(100 / profit).toFixed(0)}`;
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

  const getAveragePrice = (
    marketKey: string,
    outcomeName: string,
    bookmakers: any[]
  ) => {
    const prices: number[] = [];
    bookmakers.forEach((book: any) => {
      const market = book.markets?.find((m: any) => m.key === marketKey);
      const outcome = market?.outcomes?.find(
        (o: any) => o.name === outcomeName
      );
      if (outcome && outcome.price != null) {
        prices.push(Number(outcome.price));
      }
    });
    if (prices.length === 0) return null;
    return prices.reduce((acc, val) => acc + val, 0) / prices.length;
  };

    // ---------- NEW: schema-driven market rendering helpers ----------

    type RawOutcome = {
      name?: string;
      price?: number;
      point?: number;
      description?: string;
    };
  
    type OutcomeVariant = "moneyline" | "total" | "playerProp" | "unknown";
  
    const inferOutcomeVariant = (outcomes: RawOutcome[]): OutcomeVariant => {
      const hasDescription = outcomes.some((o) => o.description != null);
      const hasPoint = outcomes.some((o) => o.point != null);
  
      if (hasDescription && hasPoint) return "playerProp";
      if (!hasDescription && hasPoint) return "total";
      if (!hasDescription && !hasPoint) return "moneyline";
      return "unknown";
    };
  
    const collectMarketOutcomes = (bookmakers: any[], marketKey: string): RawOutcome[] => {
      const all: RawOutcome[] = [];
      (bookmakers ?? []).forEach((book: any) => {
        const market = (book.markets ?? []).find((m: any) => m.key === marketKey);
        (market?.outcomes ?? []).forEach((o: any) => all.push(o));
      });
      return all;
    };
  
    const humanizeMarketKey = (marketKey: string) =>
      marketKey
        .replace(/^player_/, "player ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  
    const aggregateOutcomes = (bookmakers: any[], marketKey: string) => {
      const all = collectMarketOutcomes(bookmakers, marketKey);
      const variant = inferOutcomeVariant(all);
  
      const keyFor = (o: RawOutcome) => {
        const n = o.name ?? "";
        const p = o.point != null ? String(o.point) : "";
        const d = o.description ?? "";
        if (variant === "playerProp") return `${d}__${n}__${p}`;
        if (variant === "total") return `${n}__${p}`;
        if (variant === "moneyline") return `${n}`;
        return `${d}__${n}__${p}`;
      };
  
      const buckets = new Map<
        string,
        { sample: RawOutcome; prices: number[]; points: number[] }
      >();
  
      all.forEach((o) => {
        if (o?.price == null || o?.name == null) return;
        const k = keyFor(o);
        if (!buckets.has(k)) buckets.set(k, { sample: o, prices: [], points: [] });
        buckets.get(k)!.prices.push(Number(o.price));
        if (o.point != null) buckets.get(k)!.points.push(Number(o.point));
      });
  
      const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  
      const rows = Array.from(buckets.values()).map(({ sample, prices, points }) => ({
        name: sample.name ?? "",
        description: sample.description ?? null,
        point: points.length ? avg(points) : null,
        price: avg(prices),
      }));
  
      rows.sort((a, b) => {
        const da = a.description ?? "";
        const db = b.description ?? "";
        if (da !== db) return da.localeCompare(db);
        return a.name.localeCompare(b.name);
      });
  
      return { variant, rows };
    };
  
    const marketTypeFromVariant = (variant: OutcomeVariant) => {
      if (variant === "playerProp") return "player_prop";
      if (variant === "total") return "total";
      return "moneyline"; // your 3 schemas include h2h and totals + player props
    };
  
    // NEW: generic search match card (schema-driven)
    const renderGenericSearchMarketCard = (
      game: any,
      marketKey: string,
      matchType?: string | null,
      matchSource?: "outcome" | "teams" | "none" | null
    ) => {
      const books = game.bookmakers ?? [];
      const { variant, rows } = aggregateOutcomes(books, marketKey);
  
      // If this is a player-prop schema and the search matched a player by outcome,
      // only show that player's rows (but still inferred by structure).
      const filteredRows =
        variant === "playerProp" && matchType && matchSource === "outcome"
          ? rows.filter((r) => (r.description ?? "") === matchType)
          : rows;
  
      if (!filteredRows.length) return renderGameCard(game);
  
      const showSubject = variant === "playerProp";
      const showLine = variant === "total" || variant === "playerProp";
      const marketLabel = humanizeMarketKey(marketKey);
  
      const cols =
        showSubject && showLine ? "grid-cols-4" : showLine ? "grid-cols-3" : "grid-cols-2";
  
      return (
        <li key={game.id} className="border border-black p-4 rounded-md shadow-sm">
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
  
          <div className="mb-2 text-sm font-semibold">Market: {marketLabel}</div>
  
          <div className={`grid ${cols} gap-5 font-semibold text-xs text-gray-600 border-b border-gray-300 pb-1 mb-2`}>
            <div>{variant === "moneyline" ? "Side" : "Outcome"}</div>
            {showSubject && <div className="text-center">Player</div>}
            {showLine && <div className="text-center">Line</div>}
            <div className="text-center">Price</div>
          </div>
  
          {filteredRows.map((r, idx) => (
            <div
              key={`${r.description ?? ""}-${r.name}-${idx}`}
              className={`grid ${cols} gap-5 items-center text-sm border-t border-gray-200 py-2`}
            >
              <div>{r.name}</div>
  
              {showSubject && <div className="text-center">{r.description ?? "—"}</div>}
  
              {showLine && (
                <div className="text-center">
                  {r.point != null ? Number(r.point).toFixed(1) : "—"}
                </div>
              )}
  
              <div className="text-center">
                {r.price != null ? (
                  <button
                    onClick={() => {
                      const marketType = marketTypeFromVariant(variant);
  
                      const payload: any = {
                        name: r.name,
                        price: r.price,
                        bookmaker: game.bookmakers?.[0]?.title,
                      };
  
                      if (r.point != null) payload.point = r.point;
  
                      if (variant === "playerProp") {
                        payload.player = r.description;
                        payload.stat = marketLabel; // derived from marketKey, not hardcoded map
                      }
  
                      if (variant === "total") {
                        payload.matchup = `${game.home_team} vs ${game.away_team}`;
                      }
  
                      addToParlay(game.id, payload, marketType);
                    }}
                    className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800 text-xs"
                  >
                    {convertDecimalToAmerican(r.price)}
                  </button>
                ) : (
                  "-"
                )}
              </div>
            </div>
          ))}
        </li>
      );
    };  

  // Upcoming games card (unchanged layout)
  const renderGameCard = (game: any) => {
    const teams = [game.home_team, game.away_team];

    return (
      <li
        key={game.id}
        className="border border-black p-4 rounded-md shadow-sm"
      >
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

        <div className="grid grid-cols-4 gap-5 font-semibold text-xs text-gray-600 border-b border-gray-300 pb-1 mb-2">
          <div>Team</div>
          <div className="text-center">Moneyline</div>
          <div className="text-center">Spread</div>
          <div className="text-center">Total</div>
        </div>

        {teams.map((teamName) => {
          const isHomeTeam = teamName === game.home_team;

          const avgML = getAveragePrice(
            "h2h",
            teamName,
            game.bookmakers || []
          );
          const bestML = game.bookmakers?.[0]?.markets
            ?.find((m: any) => m.key === "h2h")
            ?.outcomes?.find((o: any) => o.name === teamName);

          const avgSpread = getAveragePrice(
            "spreads",
            teamName,
            game.bookmakers || []
          );
          const bestSpread = game.bookmakers?.[0]?.markets
            ?.find((m: any) => m.key === "spreads")
            ?.outcomes?.find((o: any) => o.name === teamName);

          const totalMarket = game.bookmakers?.[0]?.markets?.find(
            (m: any) => m.key === "totals"
          );

          return (
            <div
              key={teamName}
              className="grid grid-cols-4 gap-5 items-center text-sm border-t border-gray-200 py-2"
            >
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

              <div className="text-center">
                {avgML && bestML ? (
                  <button
                    onClick={() =>
                      addToParlay(
                        game.id,
                        {
                          ...bestML,
                          bookmaker: game.bookmakers[0]?.title,
                        },
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

              <div className="text-center">
                {avgSpread && bestSpread ? (
                  <button
                    onClick={() =>
                      addToParlay(
                        game.id,
                        {
                          ...bestSpread,
                          bookmaker: game.bookmakers?.[0]?.title,
                        },
                        "spread"
                      )
                    }
                    className="px-2 py-1 bg-black text-white rounded hover:bg-gray-800 text-xs whitespace-nowrap"
                  >
                    {bestSpread.point > 0
                      ? `+${bestSpread.point}`
                      : bestSpread.point}{" "}
                    {convertDecimalToAmerican(avgSpread)}
                  </button>
                ) : (
                  "-"
                )}
              </div>

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
                              {outcome.name === "Over" ? "O" : "U"}{" "}
                              {outcome.point}
                            </span>
                            <span>
                              {avgTotal
                                ? convertDecimalToAmerican(avgTotal)
                                : "-"}
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
  };

  // Decide which search card to render (NEW: schema-driven, no hardcoded market keys)
  const renderSearchMatchCard = () => {
    if (!searchMatch || !searchMatch.success || !searchMatch.data) return null;
    const game = searchMatch.data;

    if (!searchMarketKey) return renderGameCard(game);

    return renderGenericSearchMarketCard(
      game,
      searchMarketKey,
      searchMatchType,
      searchMatchSource
    );
  };
  

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="flex flex-col px-4 sm:px-6 md:px-8 py-6 border-b border-black">
        <div className="flex justify-between items-center">
          <div className="w-40 h-16 sm:w-48 sm:h-20">
            <svg
              viewBox="-10 0 340 100"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <text
                x="16"
                y="42"
                fontSize="50"
                fontWeight="1000"
                fill="#d1d5db"
                transform="skewX(-25)"
              >
                BETTER
              </text>
              <text
                x="31"
                y="94"
                fontSize="50"
                fontWeight="1000"
                fill="#d1d5db"
                transform="skewX(-25)"
              >
                PARLAYS
              </text>
            </svg>
          </div>

          <ul className="hidden md:flex flex-nowrap justify-end gap-x-6 text-sm font-medium text-black">
            <li>
              <Link href="/promotions" className="hover:underline">
                Promotions
              </Link>
            </li>
            <li>
              <Link href="/our-picks" className="hover:underline">
                Our Picks
              </Link>
            </li>
            <li>
              <Link href="/sign-up" className="hover:underline">
                Sign Up
              </Link>
            </li>
          </ul>

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

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-40 opacity-100 mt-4" : "max-h-0 opacity-0"
          } md:hidden`}
        >
          <ul className="flex flex-col items-center gap-y-4 text-sm font-medium text-black">
            <li>
              <Link
                href="/promotions"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline"
              >
                Promotions
              </Link>
            </li>
            <li>
              <Link
                href="/our-picks"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline"
              >
                Our Picks
              </Link>
            </li>
            <li>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="hover:underline"
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex flex-col items-center justify-start pt-10 px-6">
        {/* Search bar */}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-center border border-black rounded-full shadow-md bg-white overflow-hidden w-full">
            <span
              ref={textRef}
              className="absolute invisible whitespace-nowrap text-sm font-normal pl-3 py-3"
            >
              {selectedLeague}
            </span>

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

              <div className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 min-w-0 relative">
              <input
                type="text"
                name="search"
                placeholder="Search"
                className="w-full px-4 py-3 pr-10 bg-white text-black text-sm focus:outline-none rounded-r-full"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 flex-shrink-0 focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M16.65 10.65A6 6 0 1110.65 4a6 6 0 016 6.65z"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>

        <div className="w-full max-w-3xl mx-auto mt-4">
          {searchLoading && (
            <div className="text-xs text-gray-500">Searching…</div>
          )}
          {searchError && (
            <div className="text-xs text-red-600">{searchError}</div>
          )}
        </div>

        {/* Search results OR upcoming games */}
        <div ref={gamesSectionRef} className="w-full max-w-3xl mt-10">
          {searchMatch && searchMatch.success && searchMatch.data ? (
            <>
              <h2 className="text-lg font-bold mb-1">Search Results</h2>
              <p className="text-xs text-gray-500 mb-4">
                Showing results for{" "}
                <span className="font-semibold">
                  {searchMatchType || "your query"}
                </span>
                {searchMatchSource && searchMatchSource !== "none"
                  ? ` (matched by ${searchMatchSource})`
                  : ""}
              </p>

              <ul className="space-y-4">{renderSearchMatchCard()}</ul>

              <button
                onClick={() => {
                  setSearchMatch(null);
                  setSearchMatchType(null);
                  setSearchMatchSource(null);
                  setSearchMarketKey(null);
                }}
                className="mt-4 text-xs px-3 py-1 border border-black rounded hover:bg-gray-100"
              >
                Back to Upcoming Games
              </button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold mb-1">
                Upcoming{" "}
                {selectedLeague === "Select League" ? "" : `${selectedLeague} `}Games
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Displayed singles odds are averaged and may not reflect the most
                current odds
              </p>

              {!Array.isArray(odds) || odds.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Check back later for {selectedLeague} matchups.
                </p>
              ) : (
                <>
                  <ul className="space-y-4">
                    {paginatedOdds.map((game: any) => renderGameCard(game))}
                  </ul>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-xs">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-2 py-1 border rounded disabled:opacity-50"
                      >
                        Previous
                      </button>

                      <span>
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 border rounded disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Parlay builder */}
        <div className="w-full max-w-3xl mt-10">
          <h2 className="text-lg font-bold mb-4">Your Parlay</h2>
          {parlay.length === 0 ? (
            <p className="text-sm text-gray-500">No picks added yet</p>
          ) : (
            <>
              <ul className="space-y-2 mb-4">
                {parlay.map((pick, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border border-gray-300 px-4 py-2 rounded-md"
                  >
                    <span>
                      {pick.marketType === "moneyline" &&
                        `${pick.name} (Moneyline)`}
                      {pick.marketType === "spread" &&
                        `${pick.name} ${
                          pick.point > 0 ? `+${pick.point}` : pick.point
                        } (Spread)`}
                      {pick.marketType === "total" &&
                        `${pick.matchup} ${pick.name} ${pick.point} (Total)`}
                      {pick.marketType === "player_prop" &&
                        `${pick.player} ${pick.name} ${pick.point ?? ""} ${
                          pick.stat || ""
                        } (Player Prop)`}
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
                <label className="block text-sm font-semibold mb-1">
                  Odds Format
                </label>
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
                  <div>
                    Parlay Odds ({oddsView}): {getFormattedOdds()}
                  </div>
                  <div className="text-xs text-gray-600">
                    Best Book: {bestBook || "N/A"}
                  </div>
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

        {/* Toast */}
        {showParlayToast && (
          <div className="fixed bottom-4 inset-x-0 flex justify-center z-50 pointer-events-none">
            <div
              key={toastId}
              className={`${
                toastVariant === "delete" ? "bg-red-600" : "bg-black"
              } text-white text-sm px-4 py-2 rounded-full shadow-lg pointer-events-auto transform transition-all duration-500 ease-out opacity-100 translate-y-0 overflow-hidden whitespace-nowrap truncate`}
              style={{
                animation: "riseAndFade 3s ease-in-out forwards",
                fontSize: "clamp(0.65rem, 3vw, 0.875rem)",
                maxWidth: "90%",
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
          <aside className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-sm font-bold text-gray-500 mb-2">Disclaimer</h2>
            <p className="text-xs text-gray-600">
              Companies featured on this website may be our partners that
              compensate us if you sign up through our links. Must be 21+ and
              physically present in a legal betting state to bet. If you or
              someone you know has a gambling problem and wants help, call{" "}
              <strong>1-800-GAMBLER</strong>. Please bet responsibly.
            </p>
          </aside>

          <nav className="flex-1 flex flex-col items-center md:items-start text-xs gap-1">
            <h2 className="text-sm font-bold text-gray-500 mb-2">
              Quick Links
            </h2>
            <Link href="/promotions" className="hover:underline text-gray-700">
              Promotions
            </Link>
            <Link href="/our-picks" className="hover:underline text-gray-700">
              Our Picks
            </Link>
            <Link href="/sign-up" className="hover:underline text-gray-700">
              Sign Up
            </Link>
            <Link href="/disclaimer" className="hover:underline text-gray-700">
              Disclaimer
            </Link>
            <Link
              href="/terms-and-privacy-policy"
              className="hover:underline text-gray-700"
            >
              Terms and Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
