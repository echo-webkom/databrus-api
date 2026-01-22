import { getAllMatches } from "../services/matches";
import { getTable } from "../services/table";

export const routes = {
  "/": {
    GET: async () => {
      return new Response(
        JSON.stringify({
          message: "Databrus FC API",
          endpoints: {
            "/matches": "Get all matches (upcoming and previous)",
            "/table": "Get league standings table",
          },
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    },
  },
  "/matches": {
    GET: async () => {
      try {
        const matches = await getAllMatches();
        return new Response(JSON.stringify(matches, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Failed to fetch matches",
            details: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },
  },
  "/table": {
    GET: async () => {
      try {
        const table = await getTable();
        return new Response(JSON.stringify(table, null, 2), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Failed to fetch table",
            details: error instanceof Error ? error.message : String(error),
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    },
  },
};
