import { load } from "cheerio";
import type { TableEntry } from "../types/table";
import { InMemoryCache } from "../utils/cache";

// Cache for parsed table data (30 minutes TTL)
const tableCache = new InMemoryCache<TableEntry[]>(30 * 60);

async function parseTable(url: string): Promise<TableEntry[]> {
  const response = await fetch(url);
  const html = await response.text();
  const $ = load(html);

  const entries: TableEntry[] = [];

  // Find the table and its tbody rows
  $("table.text-sm tbody tr").each((_, element) => {
    const $row = $(element);
    const cells = $row.find("td");

    if (cells.length < 9) return; // Skip rows without all columns

    // Extract data from each cell
    const position = Number.parseInt($(cells[0]).text().trim(), 10);
    const team = $(cells[1]).text().trim();
    const matchesPlayed = Number.parseInt($(cells[2]).text().trim(), 10);
    const wins = Number.parseInt($(cells[3]).text().trim(), 10);
    const draws = Number.parseInt($(cells[4]).text().trim(), 10);
    const losses = Number.parseInt($(cells[5]).text().trim(), 10);

    // Parse goals (format: "29 - 5")
    const goalsText = $(cells[6]).text().trim();
    const goalsParts = goalsText.split("-").map((s) => s.trim());
    const goalsFor = Number.parseInt(goalsParts[0] || "0", 10) || 0;
    const goalsAgainst = Number.parseInt(goalsParts[1] || "0", 10) || 0;

    const goalDifference = Number.parseInt($(cells[7]).text().trim(), 10);
    const points = Number.parseInt($(cells[8]).text().trim(), 10);

    // Validate that we have valid data
    if (Number.isNaN(position) || !team) return;

    entries.push({
      position,
      team,
      matchesPlayed,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      goalDifference,
      points,
    });
  });

  return entries;
}

export async function fetchAndParseTable(url: string): Promise<TableEntry[]> {
  // Check cache first
  const cached = tableCache.get(url);
  if (cached) {
    console.log("Cache hit for table");
    return cached;
  }

  // Parse table if not in cache
  console.log("Cache miss for table - fetching and parsing");
  const entries = await parseTable(url);

  // Store in cache
  tableCache.set(url, entries);

  return entries;
}

// For testing: clear the cache
export function clearTableCache(): void {
  tableCache.clear();
}
