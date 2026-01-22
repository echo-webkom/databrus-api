import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { routes } from "../routes/index";
import { clearMatchCache } from "../services/scraper";
import { clearTableCache } from "../services/tableParser";
import { mockPreviousMatchHtml, mockUpcomingMatchHtml } from "../test/fixtures/mockMatchHtml";
import { mockTableHtml } from "../test/fixtures/mockTableHtml";

describe("API Routes", () => {
  const mockFetch = mock();

  beforeEach(() => {
    // Clear caches before each test
    clearMatchCache();
    clearTableCache();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  describe("GET /", () => {
    test("should return API information", async () => {
      const response = await routes["/"].GET();
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(data.message).toBe("Databrus FC API");
      expect(data.endpoints).toHaveProperty("/matches");
      expect(data.endpoints).toHaveProperty("/table");
    });
  });

  describe("GET /matches", () => {
    test("should return all matches (upcoming and previous)", async () => {
      mockFetch
        .mockResolvedValueOnce({
          text: async () => mockUpcomingMatchHtml,
        })
        .mockResolvedValueOnce({
          text: async () => mockPreviousMatchHtml,
        });

      const response = await routes["/matches"].GET();
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Check for upcoming matches
      const upcomingMatches = data.filter((m: any) => m.type === "upcoming");
      expect(upcomingMatches.length).toBe(2);
      expect(upcomingMatches[0]).toMatchObject({
        type: "upcoming",
        id: "12345",
        homeTeam: "Team A",
        awayTeam: "Team B",
        homeScore: null,
        awayScore: null,
      });

      // Check for previous matches
      const previousMatches = data.filter((m: any) => m.type === "previous");
      expect(previousMatches.length).toBe(2);
      expect(previousMatches[0]).toMatchObject({
        type: "previous",
        id: "67890",
        homeTeam: "Team X",
        awayTeam: "Team Y",
        homeScore: "3",
        awayScore: "2",
      });
    });

    test("should include datetime field in ISO format", async () => {
      mockFetch
        .mockResolvedValueOnce({
          text: async () => mockUpcomingMatchHtml,
        })
        .mockResolvedValueOnce({
          text: async () => mockPreviousMatchHtml,
        });

      const response = await routes["/matches"].GET();
      const data = (await response.json()) as any;

      expect(data[0]?.datetime).toBeDefined();
      expect(typeof data[0]?.datetime).toBe("string");
      expect(data[0]?.datetime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("should return 500 on error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const response = await routes["/matches"].GET();
      const data = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch matches");
      expect(data.details).toBeDefined();
    });
  });

  describe("GET /table", () => {
    test("should return league standings table", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockTableHtml,
      });

      const response = await routes["/table"].GET();
      const data = (await response.json()) as any;

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);

      expect(data[0]).toMatchObject({
        position: 1,
        team: "Team Alpha",
        matchesPlayed: 10,
        wins: 8,
        draws: 1,
        losses: 1,
        goalsFor: 25,
        goalsAgainst: 8,
        goalDifference: 17,
        points: 25,
      });
    });

    test("should return properly structured table entries", async () => {
      mockFetch.mockResolvedValue({
        text: async () => mockTableHtml,
      });

      const response = await routes["/table"].GET();
      const data = (await response.json()) as any;

      for (const entry of data) {
        expect(entry).toHaveProperty("position");
        expect(entry).toHaveProperty("team");
        expect(entry).toHaveProperty("matchesPlayed");
        expect(entry).toHaveProperty("wins");
        expect(entry).toHaveProperty("draws");
        expect(entry).toHaveProperty("losses");
        expect(entry).toHaveProperty("goalsFor");
        expect(entry).toHaveProperty("goalsAgainst");
        expect(entry).toHaveProperty("goalDifference");
        expect(entry).toHaveProperty("points");
      }
    });

    test("should return 500 on error", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));

      const response = await routes["/table"].GET();
      const data = (await response.json()) as any;

      expect(response.status).toBe(500);
      expect(data.error).toBe("Failed to fetch table");
      expect(data.details).toBeDefined();
    });
  });
});
