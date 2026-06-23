import type { MealPlanEntry, MealPlanWeekData } from "@/types/meal-plan";
import { getWeekEnd } from "@/utils/week";
import { createClient } from "@/lib/supabase/server";

type MealPlanRow = {
  id: string;
  user_id: string;
  date: string;
  recipe_id: string;
  servings_planned: number;
  meal_type: MealPlanEntry["mealType"];
  recipes: { title: string } | { title: string }[] | null;
};

function getRecipeTitle(row: MealPlanRow): string {
  const recipes = row.recipes;
  if (Array.isArray(recipes)) {
    return recipes[0]?.title ?? "Recette sans titre";
  }
  return recipes?.title ?? "Recette sans titre";
}

export async function getMealPlanByWeek(
  userId: string,
  weekStart: string,
): Promise<MealPlanWeekData> {
  const weekEnd = getWeekEnd(weekStart);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("meal_plan")
    .select("id, user_id, date, recipe_id, servings_planned, meal_type, recipes(title)")
    .eq("user_id", userId)
    .gte("date", weekStart)
    .lte("date", weekEnd)
    .order("date", { ascending: true })
    .order("meal_type", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const entries: MealPlanEntry[] = (data as MealPlanRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    date: row.date,
    recipeId: row.recipe_id,
    recipeTitle: getRecipeTitle(row),
    servingsPlanned: row.servings_planned,
    mealType: row.meal_type,
  }));

  return { weekStart, entries };
}
