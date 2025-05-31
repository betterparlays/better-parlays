const testTeams = [
    'LA Lakers',
    'Golden State',
    'Boston',
    'Cleveland',
    'NY Knicks',
    'OKC Thunder',
    'Philly 76ers',
    'Miami',
  ];
  
  (async () => {
    for (const team of testTeams) {
      try {
        const res = await fetch(`http://localhost:3000/api/team-record?team=${encodeURIComponent(team)}`);
        const record = await res.json();
  
        if (res.ok) {
          console.log(`${team} → ${record.team}: ${record.wins}-${record.losses}`);
        } else {
          console.error(`${team} → API Error:`, record.error || 'Unknown error');
        }
      } catch (err: any) {
        console.error(`${team} → ERROR:`, err.message);
      }
    }
  })();
  