import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { writeFile } from 'fs/promises';


dotenv.config({ path: '.env.local' });

const API_KEY = process.env.ODDS_API_KEY;

// 🎯 Define which markets you want to request for each league
const marketMap = {
  baseball_mlb: ['h2h',
  'spreads',
  'totals',
  'alternate_spreads',
  'alternate_totals',
  'btts',
  'draw_no_bet',
  'h2h_3_way',
  'team_totals',
  'alternate_team_totals',
  'h2h_1st_1_innings',
  'h2h_1st_3_innings',
  'h2h_1st_5_innings',
  'h2h_1st_7_innings',
  'h2h_3_way_1st_1_innings',
  'h2h_3_way_1st_3_innings',
  'h2h_3_way_1st_5_innings',
  'h2h_3_way_1st_7_innings',
  'spreads_1st_1_innings',
  'spreads_1st_3_innings',
  'spreads_1st_5_innings',
  'spreads_1st_7_innings',
  'alternate_spreads_1st_1_innings',
  'alternate_spreads_1st_3_innings',
  'alternate_spreads_1st_5_innings',
  'alternate_spreads_1st_7_innings',
  'totals_1st_1_innings',
  'totals_1st_3_innings',
  'totals_1st_5_innings',
  'totals_1st_7_innings',
  'alternate_totals_1st_1_innings',
  'alternate_totals_1st_3_innings',
  'alternate_totals_1st_5_innings',
  'alternate_totals_1st_7_innings',
  'batter_home_runs',
  'batter_first_home_run',
  'batter_hits',
  'batter_total_bases',
  'batter_rbis',
  'batter_runs_scored',
  'batter_hits_runs_rbis',
  'batter_singles',
  'batter_doubles',
  'batter_triples',
  'batter_walks',
  'batter_strikeouts',
  'batter_stolen_bases',
  'pitcher_strikeouts',
  'pitcher_record_a_win',
  'pitcher_hits_allowed',
  'pitcher_walks',
  'pitcher_earned_runs',
  'pitcher_outs',
  'batter_total_bases_alternate',
  'batter_home_runs_alternate',
  'batter_hits_alternate',
  'batter_rbis_alternate',
  'batter_walks_alternate',
  'pitcher_hits_allowed_alternate',
  'pitcher_walks_alternate',
  'pitcher_strikeouts_alternate'],
};

// ✅ Your leagues of interest
const baseLeagueMap = {
  NFL: 'americanfootball_nfl',
  MLB: 'baseball_mlb',
  NBA: 'basketball_nba',
  NHL: 'icehockey_nhl',
  NCAAF: 'americanfootball_ncaaf',
  NCAAB: 'basketball_ncaab',
  NCAAWB: 'basketball_ncaaw',
  EPL: 'soccer_epl',
  'La Liga': 'soccer_spain_la_liga',
  Bundesliga: 'soccer_germany_bundesliga',
  'Serie A': 'soccer_italy_serie_a',
  'Ligue 1': 'soccer_france_ligue_one',
  'Champions League': 'soccer_uefa_champs_league',
  MLS: 'soccer_usa_mls'
};

async function fetchRelevantLeagues() {
  console.log('🌐 Fetching all leagues from The Odds API...');
  const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`);
  const allLeagues = await res.json();

  const selected = [];
  const baseKeys = Object.values(baseLeagueMap);

  for (const league of allLeagues) {
    if (baseKeys.some(base => league.key.startsWith(base))) {
      const isOutright = league.key.includes('winner') || league.title.toLowerCase().includes('winner');
      selected.push({
        title: league.title,
        key: league.key,
        group: league.group,
        isOutright
      });
    }
  }

  return selected;
}

async function fetchEventsForLeagues(leagues) {
  const allEvents = [];

  for (const league of leagues) {
    if (league.isOutright) continue;

    const url = `https://api.the-odds-api.com/v4/sports/${league.key}/events/?apiKey=${API_KEY}`;
    const res = await fetch(url);
    const events = await res.json();

    events.forEach(event => {
      allEvents.push({
        eventId: event.id,
        leagueKey: league.key,
        leagueTitle: league.title,
        commence_time: event.commence_time,
        home_team: event.home_team,
        away_team: event.away_team
      });
    });
  }

  return allEvents;
}

async function fetchOdds(leagues, events) {
  const allOdds = [];

  for (const league of leagues) {
    if (league.isOutright) {
      // Outright odds: no eventId needed
      const url = `https://api.the-odds-api.com/v4/sports/${league.key}/odds/?apiKey=${API_KEY}&regions=us`;
      const res = await fetch(url);
      const data = await res.json();
      allOdds.push(...data.map(d => ({ ...d, league: league.title, marketType: 'outright' })));
    } else {
      const leagueEvents = events.filter(e => e.leagueKey === league.key);
      const marketsForLeague = marketMap[league.key] || ['h2h'];

      for (const event of leagueEvents) {
        const url = `https://api.the-odds-api.com/v4/sports/${league.key}/events/${event.eventId}/odds?apiKey=${API_KEY}&regions=us&markets=${marketsForLeague.join(',')}`;
        console.log(`🎯 Fetching odds for ${event.home_team} vs ${event.away_team} (${event.eventId}) - markets: ${marketsForLeague.join(', ')}`);

        try {
          const res = await fetch(url);
          const data = await res.json();
          allOdds.push({ ...data, league: league.title, eventId: event.eventId });
        } catch (err) {
          console.error(`❌ Error fetching odds for ${event.eventId}: ${err.message}`);
        }
      }
    }
  }

  return allOdds;
}

async function main() {
    const leagues = await fetchRelevantLeagues();
    const events = await fetchEventsForLeagues(leagues);
    const odds = await fetchOdds(leagues, events);
  
    console.log(`✅ Collected ${odds.length} odds records.`);
  
    try {
      await writeFile('./market-odds.json', JSON.stringify(odds, null, 2));
      console.log('💾 market-odds.json has been saved.');
    } catch (err) {
      console.error('❌ Failed to write market-odds.json:', err.message);
    }
}
  

main();
