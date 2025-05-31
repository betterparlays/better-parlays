export interface LeagueMeta {
    sport: 'basketball' | 'american-football' | 'baseball' | 'hockey';
    leagueId: number;
    season: string;
  }
  
  export const leagueMap: Record<string, LeagueMeta> = {
    NBA:     { sport: 'basketball', leagueId: 12, season: '2023-2024' },
    NFL:     { sport: 'american-football',   leagueId: 1,  season: '2023' },
    MLB:     { sport: 'baseball',   leagueId: 1,  season: '2021' },
    NHL:     { sport: 'hockey',     leagueId: 57, season: '2022' },
    NCAAF:   { sport: 'american-football',   leagueId: 2,  season: '2023' },
    NCAAB:   { sport: 'basketball', leagueId: 116, season: '2023-2024' },
    NCAAWB:  { sport: 'basketball', leagueId: 423, season: '2024-2025' }, 
  };
  