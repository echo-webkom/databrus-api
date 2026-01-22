import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { clearTableCache, fetchAndParseTable } from "../services/tableParser";
import { mockTableHtml } from "../test/fixtures/mockTableHtml";

describe("Table Parser Service", () => {
  const mockFetch = mock();

  beforeEach(() => {
    // Clear cache before each test
    clearTableCache();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  test("should parse table entries correctly", async () => {
    mockFetch.mockResolvedValue({
      text: async () => mockTableHtml,
    });

    const entries = await fetchAndParseTable("https://example.com/table");

    expect(entries).toHaveLength(3);

    expect(entries[0]).toEqual({
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

    expect(entries[1]).toEqual({
      position: 2,
      team: "Team Beta",
      matchesPlayed: 10,
      wins: 6,
      draws: 2,
      losses: 2,
      goalsFor: 20,
      goalsAgainst: 12,
      goalDifference: 8,
      points: 20,
    });

    expect(entries[2]).toEqual({
      position: 3,
      team: "Team Gamma",
      matchesPlayed: 10,
      wins: 4,
      draws: 3,
      losses: 3,
      goalsFor: 15,
      goalsAgainst: 15,
      goalDifference: 0,
      points: 15,
    });
  });

  test("should call fetch with correct URL", async () => {
    mockFetch.mockResolvedValue({
      text: async () => mockTableHtml,
    });

    const url = "https://example.com/table";
    await fetchAndParseTable(url);

    expect(mockFetch).toHaveBeenCalledWith(url);
  });

  test("should parse goals correctly from 'X - Y' format", async () => {
    mockFetch.mockResolvedValue({
      text: async () => mockTableHtml,
    });

    const entries = await fetchAndParseTable("https://example.com/table");

    expect(entries[0]?.goalsFor).toBe(25);
    expect(entries[0]?.goalsAgainst).toBe(8);

    expect(entries[1]?.goalsFor).toBe(20);
    expect(entries[1]?.goalsAgainst).toBe(12);
  });

  test("should cache results", async () => {
    mockFetch.mockResolvedValue({
      text: async () => mockTableHtml,
    });

    const url = "https://example.com/table";

    // First call
    const entries1 = await fetchAndParseTable(url);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call should use cache
    const entries2 = await fetchAndParseTable(url);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not called again

    expect(entries2).toEqual(entries1);
  });

  describe("Edge cases", () => {
    test("should handle empty table", async () => {
      const emptyTableHtml = `
        <html>
        <body>
          <table class="text-sm text-center min-w-full border">
            <tbody></tbody>
          </table>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => emptyTableHtml,
      });

      const entries = await fetchAndParseTable("https://example.com/empty");

      expect(entries).toHaveLength(0);
    });

    test("should skip rows with insufficient columns", async () => {
      const incompleteRowHtml = `
        <html>
        <body>
          <table class="text-sm text-center min-w-full border">
            <tbody>
              <tr wire:key="grp_11">
                <td>1</td>
                <td>Team Alpha</td>
                <td>10</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => incompleteRowHtml,
      });

      const entries = await fetchAndParseTable("https://example.com/incomplete");

      expect(entries).toHaveLength(0);
    });

    test("should skip rows with invalid position", async () => {
      const invalidPositionHtml = `
        <html>
        <body>
          <table class="text-sm text-center min-w-full border">
            <tbody>
              <tr wire:key="grp_11">
                <td>invalid</td>
                <td>Team Alpha</td>
                <td>10</td>
                <td>8</td>
                <td>1</td>
                <td>1</td>
                <td>25 - 8</td>
                <td>17</td>
                <td>25</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => invalidPositionHtml,
      });

      const entries = await fetchAndParseTable("https://example.com/invalid");

      expect(entries).toHaveLength(0);
    });

    test("should handle malformed goals format gracefully", async () => {
      const malformedGoalsHtml = `
        <html>
        <body>
          <table class="text-sm text-center min-w-full border">
            <tbody>
              <tr wire:key="grp_11">
                <td>1</td>
                <td>Team Alpha</td>
                <td>10</td>
                <td>8</td>
                <td>1</td>
                <td>1</td>
                <td>malformed</td>
                <td>17</td>
                <td>25</td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      mockFetch.mockResolvedValue({
        text: async () => malformedGoalsHtml,
      });

      const entries = await fetchAndParseTable("https://example.com/malformed");

      expect(entries).toHaveLength(1);
      expect(entries[0]?.goalsFor).toBe(0);
      expect(entries[0]?.goalsAgainst).toBe(0);
    });
  });
});
