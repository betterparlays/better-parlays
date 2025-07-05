import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { algoliasearch } from 'algoliasearch';

dotenv.config({ path: '.env.local' });

const client = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_ADMIN_KEY
);

const leagues = {
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

async function runTest() {
  const mongo = await MongoClient.connect(process.env.MONGO_URI);
  const db = mongo.db('odds_test');
  const collection = db.collection('odds');

  const allFormatted = [];

  for (const [leagueName, apiLeagueKey] of Object.entries(leagues)) {
    console.log(`🔄 Fetching odds for ${leagueName}...`);
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/${apiLeagueKey}/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=us&markets=spreads,h2h,totals`
    );

    if (!res.ok) {
      console.error(`❌ Failed to fetch ${leagueName}: ${res.status}`);
      continue;
    }

    const games = await res.json();

    const formatted = games.flatMap(game =>
      game.bookmakers.flatMap(book =>
        book.markets.flatMap(market =>
          (market.outcomes || []).map(outcome => {
            const marketScope = inferMarketScope(market.key);
            const selectionType = inferSelectionType(market.key, outcome.name);
            const label = `${outcome.name} ${formatMarketLabel(market.key)}`;

            return {
              objectID: `${game.id}-${book.title}-${market.key}-${outcome.name}`,
              eventId: game.id,
              league: leagueName,
              marketType: market.key,
              marketScope: marketScope,
              eventType: 'game',
              gameDate: new Date(game.commence_time).toISOString(),
              homeTeam: game.home_team,
              awayTeam: game.away_team,
              selectionName: outcome.name,
              selectionType: selectionType,
              label: label,
              statValue: outcome.point ?? null,
              oddsAmerican: outcome.price,
              sportsbook: book.title,
              lastUpdated: new Date().toISOString()
            };
          })
        )
      )
    );

    allFormatted.push(...formatted);
  }

  if (allFormatted.length === 0) {
    console.warn('⚠️ No odds data found. Skipping update.');
    await mongo.close();
    return;
  }

  console.log('🧹 Clearing old MongoDB odds...');
  await collection.deleteMany({});

  console.log(`💾 Inserting ${allFormatted.length} records into MongoDB...`);
  await collection.insertMany(allFormatted);

  console.log(`📤 Replacing ${allFormatted.length} records in Algolia...`);
  await client.replaceAllObjects({
    indexName: process.env.ALGOLIA_INDEX_NAME,
    objects: allFormatted,
    autoGenerateObjectIDIfNotExist: false
  });

  console.log('✅ Full load complete. Odds synced to MongoDB and Algolia.');
  await mongo.close();
}

function inferMarketScope(marketKey) {
  if (marketKey.includes('q1')) return '1st_quarter';
  if (marketKey.includes('q2')) return '2nd_quarter';
  if (marketKey.includes('q3')) return '3rd_quarter';
  if (marketKey.includes('q4')) return '4th_quarter';
  if (marketKey.includes('h1')) return '1st_half';
  if (marketKey.includes('h2')) return '2nd_half';
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
  if (marketKey === 'h2h') return 'ML';
  if (marketKey === 'spreads') return 'Spread';
  if (marketKey === 'totals') return 'Total';
  return marketKey.replace(/_/g, ' ');
}

runTest().catch(err => {
  console.error('❌ Unexpected error:', err);
});
