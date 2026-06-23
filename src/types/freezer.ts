export type ExpiryStatus = "expired" | "warning" | "ok" | "none";

export type FreezerEntry = {
  id: string;
  userId: string;
  recipeId: string;
  recipeTitle: string;
  servingsCount: number;
  frozenDate: string;
  expiryDate: string | null;
  notes: string | null;
  expiryStatus: ExpiryStatus;
  daysUntilExpiry: number | null;
};

export type FreezerInventoryData = {
  entries: FreezerEntry[];
  totalServings: number;
  expiringCount: number;
};

export type FreezerActionResult =
  | { success: true }
  | { success: false; error: string };

export function getTotalFreezerServingsForRecipe(
  entries: FreezerEntry[],
  recipeId: string,
): number {
  return entries
    .filter((entry) => entry.recipeId === recipeId)
    .reduce((sum, entry) => sum + entry.servingsCount, 0);
}
