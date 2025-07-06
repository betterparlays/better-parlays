import axios from 'axios';
import { fuzzyFindBestTeam } from './fuzzyMatch';
import { leagueMetaMap } from './leagues';

const API_KEY = process.env.API_SPORTS_KEY!;

export const fetchTeamRecord = async (oddsApiTeamName: string, leagueKey: string) => {
  const leagueMeta = leagueMetaMap[leagueKey];
  if (!leagueMeta) {
    console.error(`❌ Unsupported league key: ${leagueKey}`);
    throw new Error(`Unsupported league: ${leagueKey}`);
  }

  const { sport, leagueId, season } = leagueMeta;

  // ⚡ Use v3 for football (soccer), v1 for other sports
  const apiVersion = sport === 'football' ? 'v3' : 'v1';

  let res;
  try {
    res = await axios.get(
      `https://${apiVersion}.${sport}.api-sports.io/standings`,
      {
        headers: {
          'x-apisports-key': API_KEY,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        params: {
          league: leagueId,
          season,
        },
      }
    );
  } catch (error: any) {
    console.error(`❌ API request failed for ${leagueKey}:`, error.message);
    throw new Error(`Failed to fetch standings for ${leagueKey}`);
  }

  const raw = res.data.response;

  if (!raw || raw.length === 0) {
    console.error(`❌ Empty or missing 'response' from API for league: ${leagueKey}`);
    throw new Error("No standings data returned from API");
  }

  // 🐛 Debug response preview
  console.log(`${leagueKey} raw response shape:`, JSON.stringify(raw, null, 2).slice(0, 500));

  let standingsArray: any[] = [];

  if (sport === 'football') {
    standingsArray = raw[0]?.league?.standings?.[0] ?? [];
  } else if (Array.isArray(raw) && Array.isArray(raw[0])) {
    standingsArray = raw[0]; // NBA-style
  } else if (Array.isArray(raw)) {
    standingsArray = raw; // MLB, NHL, etc.
  } else {
    throw new Error('Unexpected API-Sports standings format for this league');
  }
  
  if (!standingsArray.length) {
    console.error(`❌ No standings data extracted for league: ${leagueKey}`);
    throw new Error("Empty standings array");
  }

  const teamNames = standingsArray.map((entry: any) => entry.team.name);
  console.log("📋 Available API-Sports team names:", teamNames);
  console.log(`🔍 Attempting to match odds API team: "${oddsApiTeamName}"`);

  const matchedName = fuzzyFindBestTeam(oddsApiTeamName, teamNames);

  console.log(`🎯 Matched API-Sports team: "${matchedName}"`);

  if (!matchedName) {
    console.error('❌ Fuzzy match failed for:', oddsApiTeamName);
    throw new Error('Team not matched');
  }

  const teamData = standingsArray.find(
    (entry: any) => entry.team.name === matchedName
  );

  if (!teamData) {
    console.error(`❌ No matching team data found for "${matchedName}"`);
    console.log("📋 Double-check these available team names:", teamNames);
    throw new Error(`Matched team "${matchedName}" not found in standings`);
  }

  // 🧾 Optional full debug output for key leagues
  if (['NHL', 'EPL'].includes(leagueKey)) {
    console.log(`📊 Full data for ${teamData.team.name}:`);
    console.log(JSON.stringify(teamData, null, 2));
  }

  const wins =
    (teamData.games?.win?.total ?? 0) +
    (teamData.games?.win_overtime?.total ?? 0) +
    (teamData.all?.win ?? 0); // Football uses 'all.win'

  const losses =
    (teamData.games?.lose?.total ?? 0) +
    (teamData.games?.lose_overtime?.total ?? 0) +
    (teamData.all?.lose ?? 0); // Football uses 'all.lose'

  const draws = teamData.all?.draw ?? 0;

  return {
    team: teamData.team.name,
    wins,
    losses,
    draws,
    lastUpdated: new Date().toISOString(),
  };
};
