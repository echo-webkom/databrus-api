import { TABLE_URL } from "../config/urls";
import type { TableEntry } from "../types/table";
import { fetchAndParseTable } from "./tableParser";

export async function getTable(): Promise<TableEntry[]> {
  return fetchAndParseTable(TABLE_URL);
}
