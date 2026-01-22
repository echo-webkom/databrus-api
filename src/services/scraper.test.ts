import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { clearMatchCache, fetchAndParseMatches } from "../services/scraper";
import { mockPreviousMatchHtml, mockUpcomingMatchHtml } from "../test/fixtures/mockMatchHtml";

describe("Scraper Service", () => {
  const mockFetch = mock();

  beforeEach(() => {
    // Clear cache before each test
    clearMatchCache();
    // Mock global fetch
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  describe("fetchAndParseMatches - upcoming", () => {
    test("should parse upcoming matches correctly", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockUpcomingMatchHtml,
      });

      const matches = await fetchAndParseMatches("https://example.com/upcoming", "upcoming");

      expect(matches).toHaveLength(2);

      expect(matches[0]).toEqual({
        type: "upcoming",
        id: "12345",
        homeTeam: "Team A",
        awayTeam: "Team B",
        datetime: new Date(1769900400 * 1000),
        homeScore: null,
        awayScore: null,
      });

      expect(matches[1]).toEqual({
        type: "upcoming",
        id: "12346",
        homeTeam: "Team C",
        awayTeam: "Team D",
        datetime: new Date(1769904000 * 1000),
        homeScore: null,
        awayScore: null,
      });
    });

    test("should call fetch with correct URL", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockUpcomingMatchHtml,
      });

      const url = "https://example.com/upcoming";
      await fetchAndParseMatches(url, "upcoming");

      expect(mockFetch).toHaveBeenCalledWith(url);
    });
  });

  describe("fetchAndParseMatches - previous", () => {
    test("should parse previous matches with scores correctly", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockPreviousMatchHtml,
      });

      const matches = await fetchAndParseMatches("https://example.com/previous", "previous");

      expect(matches).toHaveLength(2);

      expect(matches[0]).toEqual({
        type: "previous",
        id: "67890",
        homeTeam: "Team X",
        awayTeam: "Team Y",
        datetime: new Date(1768000000 * 1000),
        homeScore: "3",
        awayScore: "2",
      });

      expect(matches[1]).toEqual({
        type: "previous",
        id: "67891",
        homeTeam: "Team Z",
        awayTeam: "Team W",
        datetime: new Date(1768003600 * 1000),
        homeScore: "1",
        awayScore: "1",
      });
    });
  });

  describe("Caching", () => {
    test("should cache results and not call fetch on second request", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockUpcomingMatchHtml,
      });

      const url = "https://example.com/upcoming";

      // First call
      const matches1 = await fetchAndParseMatches(url, "upcoming");
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const matches2 = await fetchAndParseMatches(url, "upcoming");
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not called again

      // Results should be identical
      expect(matches2).toEqual(matches1);
    });
  });

  describe("Edge cases", () => {
    test("should handle empty HTML", async () => {
      mockFetch.mockResolvedValue({
        text: async () => "<html><body></body></html>",
      });

      const matches = await fetchAndParseMatches("https://example.com/empty", "upcoming");

      expect(matches).toHaveLength(0);
    });

    test("should skip matches without timestamp", async () => {
      const htmlWithoutTimestamp = `
        <html>
        <body>
          <li wire:key="listkamp_99999">
            <div x-data="{}">
              <div class="truncate">Team A</div>
              <div class="truncate">Team B</div>
            </div>
          </li>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => htmlWithoutTimestamp,
      });

      const matches = await fetchAndParseMatches("https://example.com/no-timestamp", "upcoming");

      expect(matches).toHaveLength(0);
    });

    test("should skip matches without both teams", async () => {
      const htmlWithOneTeam = `
        <html>
        <body>
          <li wire:key="listkamp_88888">
            <div x-data="{ timestamp: 1769900400 }">
              <div class="truncate">Team A</div>
            </div>
          </li>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => htmlWithOneTeam,
      });

      const matches = await fetchAndParseMatches("https://example.com/one-team", "upcoming");

      expect(matches).toHaveLength(0);
    });
  });
});
