import { computeShoppingListItems } from "@/lib/shopping-list/compute";
import { getShoppingListByWeek } from "@/lib/shopping-list/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  FreezerStock,
  PlannedMeal,
  RecipeIngredientRow,
  ShoppingListData,
} from "@/types/shopping-list";
import { getWeekEnd } from "@/utils/week";

type MealPlanRow = {
  recipe_id: string;
  servings_planned: number;
  date: string;
  meal_type: string;
};

type FreezerRow = {
  recipe_id: string;
  servings_count: number;
};

type RecipeIngredientDbRow = {
  recipe_id: string;
  quantity: number;
  ingredient_id: string;
  ingredients: { name: string; unit: string | null } | { name: string; unit: string | null }[] | null;
  recipes: { servings: number | null } | { servings: number | null }[] | null;
};

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

export async function generateShoppingList(
  userId: string,
  weekStart: string,
): Promise<ShoppingListData> {
  const weekEnd = getWeekEnd(weekStart);
  const supabase = await createClient();

  const { data: mealPlanRows, error: mealPlanError } = await supabase
    .from("meal_plan")
    .select("recipe_id, servings_planned, date, meal_type")
    .eq("user_id", userId)
    .gte("date", weekStart)
    .lte("date", weekEnd)
    .order("date", { ascending: true })
    .order("meal_type", { ascending: true });

  if (mealPlanError) {
    throw new Error(mealPlanError.message);
  }

  const plannedMeals: PlannedMeal[] = ((mealPlanRows ?? []) as MealPlanRow[]).map((row) => ({
    recipeId: row.recipe_id,
    servingsPlanned: row.servings_planned,
    date: row.date,
    mealType: row.meal_type,
  }));

  const recipeIds = [...new Set(plannedMeals.map((meal) => meal.recipeId))];

  const { data: freezerRows, error: freezerError } = await supabase
    .from("freezer_inventory")
    .select("recipe_id, servings_count")
    .eq("user_id", userId);

  if (freezerError) {
    throw new Error(freezerError.message);
  }

  const freezerStock: FreezerStock[] = ((freezerRows ?? []) as FreezerRow[]).map((row) => ({
    recipeId: row.recipe_id,
    servingsCount: row.servings_count,
  }));

  let recipeIngredients: RecipeIngredientRow[] = [];

  if (recipeIds.length > 0) {
    const { data: ingredientRows, error: ingredientError } = await supabase
      .from("recipe_ingredients")
      .select(
        "recipe_id, quantity, ingredient_id, ingredients(name, unit), recipes(servings)",
      )
      .in("recipe_id", recipeIds);

    if (ingredientError) {
      throw new Error(ingredientError.message);
    }

    recipeIngredients = ((ingredientRows ?? []) as RecipeIngredientDbRow[]).map((row) => {
      const ingredient = getRelation(row.ingredients);
      const recipe = getRelation(row.recipes);

      return {
        recipeId: row.recipe_id,
        recipeServings: recipe?.servings ?? null,
        ingredientId: row.ingredient_id,
        ingredientName: ingredient?.name ?? "Ingrédient",
        ingredientUnit: ingredient?.unit ?? null,
        quantity: Number(row.quantity),
      };
    });
  }

  const aggregatedItems = computeShoppingListItems(
    plannedMeals,
    freezerStock,
    recipeIngredients,
  );

  const { data: existingList, error: existingListError } = await supabase
    .from("shopping_list")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (existingListError) {
    throw new Error(existingListError.message);
  }

  let shoppingListId = existingList?.id as string | undefined;

  if (shoppingListId) {
    const { error: updateError } = await supabase
      .from("shopping_list")
      .update({ is_checked: false })
      .eq("id", shoppingListId);

    if (updateError) {
      throw new Error(updateError.message);
    }
  } else {
    const { data: insertedList, error: insertError } = await supabase
      .from("shopping_list")
      .insert({
        user_id: userId,
        week_start_date: weekStart,
        is_checked: false,
      })
      .select("id")
      .single();

    if (insertError || !insertedList) {
      throw new Error(insertError?.message ?? "Impossible de créer la liste de courses.");
    }

    shoppingListId = insertedList.id;
  }

  const { data: existingItems, error: existingItemsError } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_id, is_checked")
    .eq("shopping_list_id", shoppingListId);

  if (existingItemsError) {
    throw new Error(existingItemsError.message);
  }

  const checkedByIngredient = new Map<string, boolean>();
  for (const item of existingItems ?? []) {
    checkedByIngredient.set(item.ingredient_id, item.is_checked);
  }

  const nextIngredientIds = new Set(aggregatedItems.map((item) => item.ingredientId));

  const staleItemIds = (existingItems ?? [])
    .filter((item) => !nextIngredientIds.has(item.ingredient_id))
    .map((item) => item.id);

  if (staleItemIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("shopping_list_items")
      .delete()
      .in("id", staleItemIds);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  if (aggregatedItems.length > 0) {
    const { error: upsertError } = await supabase.from("shopping_list_items").upsert(
      aggregatedItems.map((item) => ({
        shopping_list_id: shoppingListId,
        ingredient_id: item.ingredientId,
        total_quantity: item.totalQuantity,
        unit: item.unit,
        is_checked: checkedByIngredient.get(item.ingredientId) ?? false,
      })),
      { onConflict: "shopping_list_id,ingredient_id" },
    );

    if (upsertError) {
      throw new Error(upsertError.message);
    }
  }

  const result = await getShoppingListByWeek(userId, weekStart);
  if (!result) {
    throw new Error("La liste de courses n'a pas pu être chargée après génération.");
  }

  return result;
}
