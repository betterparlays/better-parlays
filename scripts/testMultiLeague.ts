import 'dotenv/config';
import { getTeamRecord } from '../lib/getTeamRecord';

console.log("Redis URL:", process.env.UPSTASH_REDIS_REST_URL);
console.log("Redis Token:", process.env.UPSTASH_REDIS_REST_TOKEN ? 'Loaded ✅' : 'Missing ❌');

type TeamRecord = {
    team: string;
    wins: number;
    losses: number;
    lastUpdated: string;
  };
  

const tests = [
  { team: 'LA Lakers', league: 'NBA' },
  { team: 'Yankees', league: 'MLB' },
  { team: 'Eagles', league: 'NFL' },
  { team: 'Maple Leafs', league: 'NHL' },
  { team: 'Michigan', league: 'NCAAF' },
  { team: 'Duke', league: 'NCAAB' },
];

(async () => {
  for (const { team, league } of tests) {
    try {
      const record = await getTeamRecord(team, league) as TeamRecord;
      console.log(`${team} (${league}) → ${record.team}: ${record.wins}-${record.losses}`);
    } catch (err: any) {
      console.error(`${team} (${league}) → ERROR:`, err.message);
    }
  }
})();
