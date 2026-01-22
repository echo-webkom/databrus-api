import { HISTORIKK_URL, KOMMENDE_URL } from "../config/urls";
import type { Match } from "../types/match";
import { fetchAndParseMatches } from "./scraper";

export async function getUpcomingMatches(): Promise<Match[]> {
  return fetchAndParseMatches(KOMMENDE_URL, "upcoming");
}

export async function getPreviousMatches(): Promise<Match[]> {
  return fetchAndParseMatches(HISTORIKK_URL, "previous");
}

export async function getAllMatches(): Promise<Match[]> {
  const [upcomingMatches, previousMatches] = await Promise.all([
    getUpcomingMatches(),
    getPreviousMatches(),
  ]);

  return [...upcomingMatches, ...previousMatches];
}
