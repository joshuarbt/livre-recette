export type MealType = "breakfast" | "lunch" | "dinner";

export const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner"];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Matin",
  lunch: "Midi",
  dinner: "Soir",
};

export type MealPlanEntry = {
  id: string;
  userId: string;
  date: string;
  recipeId: string;
  recipeTitle: string;
  servingsPlanned: number;
  mealType: MealType;
};

export type MealPlanWeekData = {
  weekStart: string;
  entries: MealPlanEntry[];
};

export type RecipeSummary = {
  id: string;
  title: string;
  imageUrl: string | null;
};

export type MealPlanActionResult =
  | { success: true }
  | { success: false; error: string };

export type FetchMealPlanResult =
  | { success: true; data: MealPlanWeekData }
  | { success: false; error: string };

export function mealPlanSlotKey(date: string, mealType: MealType): string {
  return `${date}-${mealType}`;
}

export function formatServingsLabel(count: number): string {
  return count === 1 ? "1 part" : `${count} parts`;
}
