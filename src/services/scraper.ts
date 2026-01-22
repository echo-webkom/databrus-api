import { load } from "cheerio";
import type { Match, MatchType } from "../types/match";
import { InMemoryCache } from "../utils/cache";

// Cache for parsed match data (30 minutes TTL)
const matchCache = new InMemoryCache<Match[]>(30 * 60);

async function parseMatches(url: string, type: MatchType): Promise<Match[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const matches: Match[] = [];

  // Find all li elements with wire:key starting with "listkamp_"
  $("li[wire\\:key^='listkamp_']").each((_, element) => {
    const $el = $(element);

    // Extract match ID from wire:key attribute
    const wireKey = $el.attr("wire:key");
    const matchId = wireKey?.replace("listkamp_", "") || "";

    if (!matchId) return;

    // Find the x-data div that contains match information
    const $matchDiv = $el.find("[x-data]").first();
    const xDataAttr = $matchDiv.attr("x-data") || "";

    // Extract teams - they are in divs with "truncate" class
    const teamDivs = $el.find(".truncate").filter((_, el) => {
      const text = $(el).text().trim();
      // Filter out empty divs and divs containing venue/location info
      return Boolean(text && !text.includes("sportsenter") && !text.includes("–"));
    });

    if (teamDivs.length < 2) return;

    const homeTeam = $(teamDivs[0]).text().trim();
    const awayTeam = $(teamDivs[1]).text().trim();

    // Extract timestamp from x-data attribute
    const timestampMatch = xDataAttr.match(/timestamp:\s*(\d+)/);
    const timestamp = timestampMatch?.[1];

    if (!timestamp) return;

    // Convert Unix timestamp (seconds) to JavaScript Date object
    const datetime = new Date(Number.parseInt(timestamp, 10) * 1000);

    if (type === "upcoming") {
      matches.push({
        type: "upcoming",
        id: matchId,
        homeTeam,
        awayTeam,
        datetime,
        homeScore: null,
        awayScore: null,
      });
    } else {
      // For previous matches, extract scores from x-data
      const homeScoreMatch = xDataAttr.match(/homegoals:\s*'(\d+)'/);
      const awayScoreMatch = xDataAttr.match(/awaygoals:\s*'(\d+)'/);

      const homeScore = homeScoreMatch?.[1] || "0";
      const awayScore = awayScoreMatch?.[1] || "0";

      matches.push({
        type: "previous",
        id: matchId,
        homeTeam,
        awayTeam,
        datetime,
        homeScore,
        awayScore,
      });
    }
  });

  return matches;
}

export async function fetchAndParseMatches(url: string, type: MatchType): Promise<Match[]> {
  // Create a cache key from URL and type
  const cacheKey = `${url}:${type}`;

  // Check cache first
  const cached = matchCache.get(cacheKey);
  if (cached) {
    console.log(`Cache hit for ${type} matches`);
    return cached;
  }

  // Parse matches if not in cache
  console.log(`Cache miss for ${type} matches - fetching and parsing`);
  const matches = await parseMatches(url, type);

  // Store in cache
  matchCache.set(cacheKey, matches);

  return matches;
}

// For testing: clear the cache
export function clearMatchCache(): void {
  matchCache.clear();
}
