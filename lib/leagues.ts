export interface LeagueMeta {
    sport: 'basketball' | 'american-football' | 'baseball' | 'hockey';
    leagueId: number;
    season: string;
  }
  
  export const leagueMetaMap: Record<string, LeagueMeta> = {
    "Select League":  { sport: 'baseball',   leagueId: 1,  season: '2025' },
    NBA:     { sport: 'basketball', leagueId: 12, season: '2024-2025' },
    NFL:     { sport: 'american-football',   leagueId: 1,  season: '2023' },
    MLB:     { sport: 'baseball',   leagueId: 1,  season: '2025' },
    NHL:     { sport: 'hockey',     leagueId: 57, season: '2022' },
    NCAAF:   { sport: 'american-football',   leagueId: 2,  season: '2023' },
    NCAAB:   { sport: 'basketball', leagueId: 116, season: '2023-2024' },
    NCAAWB:  { sport: 'basketball', leagueId: 423, season: '2024-2025' }, 
  };
  