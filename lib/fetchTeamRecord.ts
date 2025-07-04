import axios from 'axios';
import { fuzzyFindBestTeam } from './fuzzyMatch';
import { leagueMetaMap } from './leagues';

const API_KEY = process.env.API_SPORTS_KEY!;

export const fetchTeamRecord = async (oddsApiTeamName: string, leagueKey: string) => {
  const leagueMeta = leagueMetaMap[leagueKey];
  if (!leagueMeta) throw new Error(`Unsupported league: ${leagueKey}`);

  const { sport, leagueId, season } = leagueMeta;

  const res = await axios.get(
    `https://v1.${sport}.api-sports.io/standings`,
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

  // 🔄 Normalize response shape across sports
  const raw = res.data.response;

  // 🐛 Optional debug output to inspect API shape
  // console.log(`${leagueKey} raw response shape:`, JSON.stringify(raw, null, 2).slice(0, 500));

  let standingsArray: any[] = [];

  if (Array.isArray(raw) && Array.isArray(raw[0])) {
    standingsArray = raw[0]; // NBA-style
  } else if (Array.isArray(raw)) {
    standingsArray = raw; // MLB, NHL, etc.
  } else {
    throw new Error('Unexpected API-Sports standings format for this league');
  }

  const teamNames = standingsArray.map((entry: any) => entry.team.name);
  const matchedName = fuzzyFindBestTeam(oddsApiTeamName, teamNames);

  console.log(`Odds API team: "${oddsApiTeamName}" (League: ${leagueKey})`);
  console.log(`Matched API-Sports team: "${matchedName}"`);

  if (!matchedName) {
    console.error('Fuzzy match failed for:', oddsApiTeamName);
    throw new Error('Team not found');
  }

  const teamData = standingsArray.find(
    (entry: any) => entry.team.name === matchedName
  );

  if (leagueKey === 'NHL') {
    console.log(`Full games data for ${teamData.team.name}:`);
    console.log(JSON.stringify(teamData.games, null, 2)); // pretty-print full object
  }

  const wins =
    (teamData.games?.win?.total ?? 0) +
    (teamData.games?.win_overtime?.total ?? 0);

  const losses =
    (teamData.games?.lose?.total ?? 0) +
    (teamData.games?.lose_overtime?.total ?? 0);

  return {
    team: teamData.team.name,
    wins,
    losses,
    lastUpdated: new Date().toISOString(),
  };
};
