export type ConsumableFreezerEntry = {
  id: string;
  recipeId: string;
  servingsCount: number;
  frozenDate: string;
  expiryDate: string | null;
};

export type FreezerDeductionUpdate = {
  id: string;
  newServingsCount: number | null;
};

function compareFifo(
  left: ConsumableFreezerEntry,
  right: ConsumableFreezerEntry,
): number {
  if (left.expiryDate && right.expiryDate) {
    const byExpiry = left.expiryDate.localeCompare(right.expiryDate);
    if (byExpiry !== 0) {
      return byExpiry;
    }
  } else if (left.expiryDate && !right.expiryDate) {
    return -1;
  } else if (!left.expiryDate && right.expiryDate) {
    return 1;
  }

  return left.frozenDate.localeCompare(right.frozenDate);
}

export function planFreezerDeductions(
  entries: ConsumableFreezerEntry[],
  recipeId: string,
  amount: number,
): FreezerDeductionUpdate[] {
  if (amount <= 0) {
    return [];
  }

  const recipeEntries = entries
    .filter((entry) => entry.recipeId === recipeId && entry.servingsCount > 0)
    .sort(compareFifo);

  let remaining = amount;
  const updates: FreezerDeductionUpdate[] = [];

  for (const entry of recipeEntries) {
    if (remaining <= 0) {
      break;
    }

    const deducted = Math.min(entry.servingsCount, remaining);
    const nextCount = entry.servingsCount - deducted;
    remaining -= deducted;

    updates.push({
      id: entry.id,
      newServingsCount: nextCount > 0 ? nextCount : null,
    });
  }

  if (remaining > 0) {
    throw new Error("Stock congélateur insuffisant.");
  }

  return updates;
}

export function getAvailableServings(
  entries: ConsumableFreezerEntry[],
  recipeId: string,
): number {
  return entries
    .filter((entry) => entry.recipeId === recipeId)
    .reduce((sum, entry) => sum + entry.servingsCount, 0);
}
