import { createClient } from "@/lib/supabase/client";
import {
  compareSearchRelevance,
  escapeIlikePattern,
  matchesSearch,
  normalizeForSearch,
} from "@/utils/string-search";

export type IngredientSuggestion = {
  id: string;
  name: string;
  unit: string | null;
};

type IngredientRow = {
  id: string;
  name: string;
  unit: string | null;
};

const MAX_RESULTS = 6;
const PRIMARY_LIMIT = 20;
const FALLBACK_LIMIT = 100;

function mergeById(
  primary: IngredientRow[],
  secondary: IngredientRow[],
): IngredientRow[] {
  const byId = new Map<string, IngredientRow>();

  for (const row of [...primary, ...secondary]) {
    byId.set(row.id, row);
  }

  return Array.from(byId.values());
}

function rankSuggestions(
  rows: IngredientRow[],
  searchTerm: string,
): IngredientSuggestion[] {
  return rows
    .filter((row) => matchesSearch(row.name, searchTerm))
    .sort((left, right) => {
      const relevanceDiff =
        compareSearchRelevance(left.name, searchTerm) -
        compareSearchRelevance(right.name, searchTerm);

      if (relevanceDiff !== 0) {
        return relevanceDiff;
      }

      return left.name.localeCompare(right.name, "fr");
    })
    .slice(0, MAX_RESULTS)
    .map((row) => ({
      id: row.id,
      name: row.name,
      unit: row.unit,
    }));
}

async function fetchIngredientsByIlike(
  pattern: string,
  limit: number,
): Promise<IngredientRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, unit")
    .ilike("name", `%${escapeIlikePattern(pattern)}%`)
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []) as IngredientRow[];
}

async function fetchIngredientCatalog(limit: number): Promise<IngredientRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("id, name, unit")
    .order("name", { ascending: true })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []) as IngredientRow[];
}

export async function searchIngredients(
  searchTerm: string,
): Promise<IngredientSuggestion[]> {
  const trimmed = searchTerm.trim();

  if (trimmed.length < 1) {
    return [];
  }

  const primaryResults = await fetchIngredientsByIlike(trimmed, PRIMARY_LIMIT);
  let ranked = rankSuggestions(primaryResults, trimmed);

  if (ranked.length < MAX_RESULTS) {
    const normalizedTerm = normalizeForSearch(trimmed);
    const fallbackPattern =
      normalizedTerm.length >= 2 ? normalizedTerm.slice(0, 2) : normalizedTerm;

    const [accentFallbackResults, catalogResults] = await Promise.all([
      fallbackPattern !== trimmed
        ? fetchIngredientsByIlike(fallbackPattern, PRIMARY_LIMIT)
        : Promise.resolve([]),
      fetchIngredientCatalog(FALLBACK_LIMIT),
    ]);

    const merged = mergeById(primaryResults, [
      ...accentFallbackResults,
      ...catalogResults,
    ]);

    ranked = rankSuggestions(merged, trimmed);
  }

  return ranked;
}
