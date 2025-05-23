export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") || "basketball_nba"; // default fallback
    const apiKey = process.env.ODDS_API_KEY;
    const region = "us";
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${apiKey}&regions=${region}&markets=spreads,h2h,totals`;
  
    const res = await fetch(url);
  
    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch odds" }), { status: 500 });
    }
  
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }
  