const testTeams2 = [
    { team: 'LA Lakers', league: 'NBA' },
    { team: 'Yankees', league: 'MLB' },
    { team: 'Eagles', league: 'NFL' },
    { team: 'Maple Leafs', league: 'NHL' },
    { team: 'Michigan', league: 'NCAAF' },
    { team: 'Duke', league: 'NCAAB' },
  ];
  
  (async () => {
    for (const { team, league } of testTeams2) {
      try {
        const res = await fetch(`http://localhost:3000/api/team-record?team=${encodeURIComponent(team)}&league=${league}`);
        const record = await res.json();
  
        if (res.ok) {
          console.log(`${team} (${league}) → ${record.team}: ${record.wins}-${record.losses}`);
        } else {
          console.error(`${team} (${league}) → API Error:`, record.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error(`${team} (${league}) → ERROR:`, err.message);
      }
    }
  })();
  