import stringSimilarity from 'string-similarity';

export const fuzzyFindBestTeam = (
  oddsApiTeam: string,
  allApiSportsTeams: string[]
): string | null => {
  const { bestMatch } = stringSimilarity.findBestMatch(oddsApiTeam, allApiSportsTeams);

  // Log a warning if the confidence is low
  if (bestMatch.rating < 0.5) {
    console.warn(
      `⚠️ Low confidence match: "${oddsApiTeam}" → "${bestMatch.target}" (score: ${bestMatch.rating.toFixed(2)})`
    );
  }

  // Still accept matches as low as 0.3
  return bestMatch.rating >= 0.3 ? bestMatch.target : null;
};

