export interface LeagueMeta {
    sport: 'basketball' | 'american-football' | 'baseball' | 'hockey'| 'football';
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
    EPL: { sport: 'football', leagueId: 39, season: '2025' },
    "La Liga": { sport: 'football', leagueId: 140, season: '2025' },
    Bundesliga: { sport: 'football', leagueId: 78, season: '2025' },
    "Serie A": { sport: 'football', leagueId: 135, season: '2025' },
    "Ligue 1": { sport: 'football', leagueId: 61, season: '2025' },
    "Champions League": { sport: 'football', leagueId: 2, season: '2025' },
    MLS: { sport: 'football', leagueId: 253, season: '2025' }, 
  };
  