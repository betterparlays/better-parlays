// app/api/team-record/route.ts
import { getTeamRecord } from '@/lib/getTeamRecord';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const team = searchParams.get('team');
  const league = searchParams.get('league');

  if (!team || !league) {
    return new Response(JSON.stringify({ error: 'Missing team or league' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const record = await getTeamRecord(team, league);
    return new Response(JSON.stringify(record), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
