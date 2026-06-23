import type {
  AggregatedIngredient,
  FreezerStock,
  PlannedMeal,
  RecipeIngredientRow,
} from "@/types/shopping-list";

const MEAL_TYPE_ORDER: Record<string, number> = {
  breakfast: 0,
  lunch: 1,
  dinner: 2,
};

function sortPlannedMeals(meals: PlannedMeal[]): PlannedMeal[] {
  return [...meals].sort((left, right) => {
    if (left.date !== right.date) {
      return left.date.localeCompare(right.date);
    }

    const leftOrder = MEAL_TYPE_ORDER[left.mealType] ?? 99;
    const rightOrder = MEAL_TYPE_ORDER[right.mealType] ?? 99;
    return leftOrder - rightOrder;
  });
}

function buildFreezerPool(freezerStock: FreezerStock[]): Map<string, number> {
  const pool = new Map<string, number>();

  for (const stock of freezerStock) {
    const current = pool.get(stock.recipeId) ?? 0;
    pool.set(stock.recipeId, current + stock.servingsCount);
  }

  return pool;
}

function resolveUnit(ingredientUnit: string | null): string {
  const trimmed = ingredientUnit?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "unité";
}

export function computeEffectiveServingsByMeal(
  plannedMeals: PlannedMeal[],
  freezerStock: FreezerStock[],
): Map<string, number> {
  const freezerPool = buildFreezerPool(freezerStock);
  const effectiveByMealKey = new Map<string, number>();

  for (const meal of sortPlannedMeals(plannedMeals)) {
    const mealKey = `${meal.date}-${meal.mealType}-${meal.recipeId}`;
    const available = freezerPool.get(meal.recipeId) ?? 0;
    const deducted = Math.min(meal.servingsPlanned, available);
    const effective = meal.servingsPlanned - deducted;

    freezerPool.set(meal.recipeId, available - deducted);
    effectiveByMealKey.set(mealKey, effective);
  }

  return effectiveByMealKey;
}

export function computeShoppingListItems(
  plannedMeals: PlannedMeal[],
  freezerStock: FreezerStock[],
  recipeIngredients: RecipeIngredientRow[],
): AggregatedIngredient[] {
  const effectiveByMealKey = computeEffectiveServingsByMeal(plannedMeals, freezerStock);
  const aggregated = new Map<string, AggregatedIngredient>();

  const ingredientsByRecipe = new Map<string, RecipeIngredientRow[]>();
  for (const row of recipeIngredients) {
    const current = ingredientsByRecipe.get(row.recipeId) ?? [];
    current.push(row);
    ingredientsByRecipe.set(row.recipeId, current);
  }

  for (const meal of sortPlannedMeals(plannedMeals)) {
    const mealKey = `${meal.date}-${meal.mealType}-${meal.recipeId}`;
    const effectiveServings = effectiveByMealKey.get(mealKey) ?? meal.servingsPlanned;

    if (effectiveServings <= 0) {
      continue;
    }

    const rows = ingredientsByRecipe.get(meal.recipeId) ?? [];
    const recipeServings = rows[0]?.recipeServings ?? 1;
    const safeRecipeServings = recipeServings > 0 ? recipeServings : 1;
    const scale = effectiveServings / safeRecipeServings;

    for (const row of rows) {
      const scaledQuantity = row.quantity * scale;
      if (scaledQuantity <= 0) {
        continue;
      }

      const unit = resolveUnit(row.ingredientUnit);
      const existing = aggregated.get(row.ingredientId);

      if (existing) {
        existing.totalQuantity += scaledQuantity;
        continue;
      }

      aggregated.set(row.ingredientId, {
        ingredientId: row.ingredientId,
        ingredientName: row.ingredientName,
        totalQuantity: scaledQuantity,
        unit,
      });
    }
  }

  return Array.from(aggregated.values()).sort((left, right) =>
    left.ingredientName.localeCompare(right.ingredientName, "fr"),
  );
}
