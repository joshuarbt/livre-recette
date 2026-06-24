export type ShoppingListItem = {
  id: string;
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  unit: string;
  isChecked: boolean;
};

export type ShoppingListData = {
  id: string;
  userId: string;
  weekStartDate: string;
  isChecked: boolean;
  items: ShoppingListItem[];
};

export type ShoppingListActionResult =
  | { success: true }
  | { success: false; error: string };

export type GenerateShoppingListResult =
  | { success: true; data: ShoppingListData }
  | { success: false; error: string };

export type PlannedMeal = {
  recipeId: string;
  servingsPlanned: number;
  date: string;
  mealType: string;
};

export type FreezerStock = {
  recipeId: string;
  servingsCount: number;
};

export type RecipeIngredientRow = {
  recipeId: string;
  recipeServings: number | null;
  ingredientId: string;
  ingredientName: string;
  ingredientUnit: string | null;
  quantity: number;
};

export type AggregatedIngredient = {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number | null;
  unit: string;
  hasQuantity: boolean;
};

export type FetchShoppingListResult =
  | { success: true; data: ShoppingListData | null }
  | { success: false; error: string };

export function computeShoppingProgress(items: ShoppingListItem[]): {
  checkedCount: number;
  totalCount: number;
} {
  return {
    checkedCount: items.filter((item) => item.isChecked).length,
    totalCount: items.length,
  };
}

export function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}
