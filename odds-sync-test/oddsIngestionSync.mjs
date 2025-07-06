import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';
import { algoliasearch } from 'algoliasearch';
import { writeFile } from 'fs/promises';

dotenv.config({ path: '.env.local' });

const API_KEY = process.env.ODDS_API_KEY;
const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

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
    baseball_mlb_world_series_winner: ['outrights'],
    // Add more mappings per league key as needed
  };

const baseLeagueMap = {
  MLB: 'baseball_mlb',
  MLB_WS_CHAMP: 'baseball_mlb_world_series_winner'
};

function inferMarketScope(marketKey) {
    // Baseball-specific markets
    if (/_1st_1_innings/.test(marketKey)) return '1st_inning';
    if (/_1st_3_innings/.test(marketKey)) return '1st_3_innings';
    if (/_1st_5_innings/.test(marketKey)) return '1st_5_innings';
    if (/_1st_7_innings/.test(marketKey)) return '1st_7_innings';
  
    // Standard game segments (for sports like NBA, NFL, NHL)
    if (marketKey.includes('q1')) return '1st_quarter';
    if (marketKey.includes('q2')) return '2nd_quarter';
    if (marketKey.includes('q3')) return '3rd_quarter';
    if (marketKey.includes('q4')) return '4th_quarter';
  
    if (/\bh1\b/.test(marketKey)) return '1st_half';  // stricter match
    if (/\bh2\b/.test(marketKey)) return '2nd_half';
  
    if (marketKey.includes('p1')) return '1st_period';
    if (marketKey.includes('p2')) return '2nd_period';
    if (marketKey.includes('p3')) return '3rd_period';
  
    if (marketKey.includes('alternate')) return 'alternate';
  
    return 'full_game';
  }
  

function inferSelectionType(marketKey, name) {
  const lowered = name.toLowerCase();
  if (lowered.includes('over')) return 'over';
  if (lowered.includes('under')) return 'under';
  if (lowered === 'yes' || lowered === 'no') return lowered;
  if (marketKey.startsWith('h2h') && lowered === 'draw') return 'draw';
  if (marketKey.startsWith('h2h')) return 'moneyline';
  return 'unknown';
}

function formatMarketLabel(marketKey) {
    // Replace specific market prefixes
    const replacements = {
      h2h: 'Moneyline',
      spreads: 'Spread',
      totals: 'Total',
      alternate_spreads: 'Alternate Spread',
      alternate_totals: 'Alternate Total',
      team_totals: 'Team Total',
      alternate_team_totals: 'Alternate Team Total',
      btts: 'BTTS',
      draw_no_bet: 'Draw No Bet'
    };
  
    for (const key in replacements) {
      if (marketKey.startsWith(key)) {
        // Replace only the matched key at the start
        const suffix = marketKey.slice(key.length); // e.g., "_1st_3_innings"
        return `${replacements[key]}${suffix.replace(/_/g, ' ')}`.trim();
      }
    }
  
    return marketKey.replace(/_/g, ' ');
}
  

async function fetchRelevantLeagues() {
  const res = await fetch(`https://api.the-odds-api.com/v4/sports/?apiKey=${API_KEY}`);
  const allLeagues = await res.json();

  const selected = [];
  const baseKeys = Object.values(baseLeagueMap);

  for (const league of allLeagues) {
    if (baseKeys.some(base => league.key.startsWith(base))) {
      const isOutright = league.key.includes('winner') || league.title.toLowerCase().includes('winner');
      selected.push({ title: league.title, key: league.key, group: league.group, isOutright });
    }
  }
  return selected;
}

async function fetchEventsForLeagues(leagues) {
  const allEvents = [];

  for (const league of leagues) {
    console.log(`📘 Fetching odds for league: ${league.title} (${league.key})`);
    if (league.isOutright) continue;

    const res = await fetch(`https://api.the-odds-api.com/v4/sports/${league.key}/events/?apiKey=${API_KEY}`);
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
        const url = `https://api.the-odds-api.com/v4/sports/${league.key}/odds/?apiKey=${API_KEY}&regions=us`;
        const res = await fetch(url);
        const data = await res.json();
      
        const formattedOutrights = data.flatMap(game =>
          game.bookmakers.flatMap(book =>
            book.markets.flatMap(market =>
              (market.outcomes || []).map(outcome => {
                return {
                  objectID: `${game.id}-${book.title}-${market.key}-${outcome.name}`,
                  eventId: game.id,
                  league: league.title,
                  marketType: market.key,
                  marketScope: 'outright',
                  eventType: 'outright',
                  gameDate: new Date(game.commence_time).toISOString(),
                  homeTeam: null,
                  awayTeam: null,
                  selectionName: outcome.name,
                  selectionType: 'outright',
                  label: `${outcome.name} - World Series Winner`,
                  statValue: null,
                  oddsAmerican: outcome.price,
                  sportsbook: book.title,
                  lastUpdated: new Date().toISOString(),
                  playerName: null,
                  isOutright: true
                };
              })
            )
          )
        );
      
        console.log(`🏆 Processed ${formattedOutrights.length} outright odds for ${league.title}`);
        allOdds.push(...formattedOutrights);
      } else {
      const leagueEvents = events.filter(e => e.leagueKey === league.key);
      const marketsForLeague = marketMap[league.key] || ['h2h'];

      for (const event of leagueEvents) {
        console.log(`   ⚾ Event: ${event.eventId} (${event.home_team} vs ${event.away_team})`);
        const url = `https://api.the-odds-api.com/v4/sports/${league.key}/events/${event.eventId}/odds?apiKey=${API_KEY}&regions=us&markets=${marketsForLeague.join(',')}`;

        try {
          const res = await fetch(url);
          const game = await res.json();
          game.bookmakers?.forEach(book => {
            console.log(`     🏛️ ${book.title} - ${book.markets.length} markets`);
            book.markets.forEach(market => {
              if (!market.outcomes || market.outcomes.length === 0) {
                console.warn(`     ⚠️ No outcomes for market: ${market.key}`);
              }
            });
          });
          

          const formatted = game.bookmakers?.flatMap(book =>
            book.markets.flatMap(market => {
              // 👇 Extend this list as you add more leagues with player props
              const isPlayerProp = /player|batter|pitcher|strikeouts|yards|touchdowns|goals|assists|rebounds|points/i.test(market.key);
              const marketLabel = formatMarketLabel(market.key);
              const matchupPrefix = `${game.home_team} vs. ${game.away_team}`;
              const isTotalMarket = market.key.startsWith('totals') || market.key.startsWith('alternate_totals');

              
              return (market.outcomes || []).map(outcome => {
                const outcomeKey = outcome.description || outcome.name;
                return {
                  objectID: `${game.id}-${book.title}-${market.key}-${outcomeKey}`,
                  eventId: game.id,
                  league: league.title,
                  marketType: market.key,
                  marketScope: inferMarketScope(market.key),
                  eventType: 'game',
                  gameDate: new Date(game.commence_time).toISOString(),
                  homeTeam: game.home_team,
                  awayTeam: game.away_team,
                  selectionName: outcomeKey,
                  selectionType: inferSelectionType(market.key, outcome.name),
                  label: isTotalMarket
                    ? `${matchupPrefix} - ${outcomeKey} ${marketLabel}`
                    : `${outcomeKey} ${marketLabel}`,
                  statValue: outcome.point ?? null,
                  oddsAmerican: outcome.price,
                  sportsbook: book.title,
                  lastUpdated: new Date().toISOString(),
                  playerName: isPlayerProp ? outcomeKey : null
                };
              });
            })
          ) || [];
          
          

          allOdds.push(...formatted);
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
    console.log(`📚 Total leagues: ${leagues.length}`);
    const events = await fetchEventsForLeagues(leagues);
    console.log(`🎯 Total events fetched: ${events.length}`);
    const odds = await fetchOdds(leagues, events);
    console.log(`🛠️ Total odds generated: ${odds.length}`);
  
    if (odds.length === 0) {
      console.warn('⚠️ No odds data found. Skipping DB and Algolia update.');
      return;
    }
  
    const mongo = await MongoClient.connect(process.env.MONGO_URI);
    const db = mongo.db('odds_test');
    const collection = db.collection('odds');
  
    console.log('🧹 Clearing old MongoDB odds...');
    await collection.deleteMany({});
  
    console.log(`💾 Inserting ${odds.length} records into MongoDB...`);
    await collection.insertMany(odds);
  
    // --- NEW: Algolia size filter ---
    const MAX_ALGOLIA_RECORD_SIZE = 10000;
    const oversizedRecords = [];
    const safeRecords = odds.filter(record => {
      const size = Buffer.byteLength(JSON.stringify(record), 'utf8');
      if (size > MAX_ALGOLIA_RECORD_SIZE) {
        oversizedRecords.push({ objectID: record.objectID, size });
        return false;
      }
      return true;
    });
  
    if (oversizedRecords.length > 0) {
      console.warn(`⚠️ Skipped ${oversizedRecords.length} oversized records. Writing to oversized.json`);
      await writeFile('oversized.json', JSON.stringify(oversizedRecords, null, 2));
    }
  
    console.log(`📤 Replacing ${safeRecords.length} records in Algolia...`);
    await client.replaceAllObjects({
      indexName: process.env.ALGOLIA_INDEX_NAME,
      objects: safeRecords,
      autoGenerateObjectIDIfNotExist: false
    });
  
    await writeFile('./market-odds.json', JSON.stringify(odds, null, 2));
    console.log('✅ Odds sync complete. Data written to MongoDB, Algolia, and market-odds.json.');
  
    await mongo.close();
}
  

main().catch(err => {
  console.error('❌ Unexpected error:', err);
});
