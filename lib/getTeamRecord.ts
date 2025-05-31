import { redis } from './redis';
import { fetchTeamRecord } from './fetchTeamRecord';

function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export const getTeamRecord = async (teamName: string, leagueKey: string) => {
  const key = `teamRecord:${leagueKey.toLowerCase()}:${teamName.toLowerCase().replace(/\s+/g, '_')}`;

  const cached = await redis.get(key);

  if (cached && isToday((cached as any).lastUpdated)) {
    return cached;
  }

  const fresh = await fetchTeamRecord(teamName, leagueKey);
  await redis.set(key, fresh);
  return fresh;
};
