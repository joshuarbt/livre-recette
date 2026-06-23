import type { FreezerEntry, FreezerInventoryData } from "@/types/freezer";
import { createClient } from "@/lib/supabase/server";
import { getExpiryStatus, isExpiringSoon } from "@/utils/expiry";

type FreezerRow = {
  id: string;
  user_id: string;
  recipe_id: string;
  servings_count: number;
  frozen_date: string;
  expiry_date: string | null;
  notes: string | null;
  recipes: { title: string } | { title: string }[] | null;
};

function getRecipeTitle(row: FreezerRow): string {
  const recipes = row.recipes;
  if (Array.isArray(recipes)) {
    return recipes[0]?.title ?? "Recette sans titre";
  }
  return recipes?.title ?? "Recette sans titre";
}

function mapFreezerRow(row: FreezerRow): FreezerEntry {
  const { status, daysUntilExpiry } = getExpiryStatus(row.expiry_date);

  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    recipeTitle: getRecipeTitle(row),
    servingsCount: row.servings_count,
    frozenDate: row.frozen_date,
    expiryDate: row.expiry_date,
    notes: row.notes,
    expiryStatus: status,
    daysUntilExpiry: daysUntilExpiry,
  };
}

function buildInventoryData(entries: FreezerEntry[]): FreezerInventoryData {
  return {
    entries,
    totalServings: entries.reduce((sum, entry) => sum + entry.servingsCount, 0),
    expiringCount: entries.filter((entry) => isExpiringSoon(entry.expiryDate)).length,
  };
}

export async function getFreezerInventory(userId: string): Promise<FreezerInventoryData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("freezer_inventory")
    .select(
      "id, user_id, recipe_id, servings_count, frozen_date, expiry_date, notes, recipes(title)",
    )
    .eq("user_id", userId)
    .order("expiry_date", { ascending: true, nullsFirst: false })
    .order("frozen_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const entries = ((data ?? []) as FreezerRow[]).map(mapFreezerRow);
  return buildInventoryData(entries);
}

export async function getFreezerStockForRecipe(
  userId: string,
  recipeId: string,
): Promise<FreezerEntry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("freezer_inventory")
    .select(
      "id, user_id, recipe_id, servings_count, frozen_date, expiry_date, notes, recipes(title)",
    )
    .eq("user_id", userId)
    .eq("recipe_id", recipeId)
    .order("expiry_date", { ascending: true, nullsFirst: false })
    .order("frozen_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as FreezerRow[]).map(mapFreezerRow);
}

export async function getAllFreezerEntriesForUser(
  userId: string,
): Promise<FreezerEntry[]> {
  const inventory = await getFreezerInventory(userId);
  return inventory.entries;
}
