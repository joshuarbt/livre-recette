import { aggregateRecipeIngredients, normalizeUnit } from "@/lib/shopping-list/compute";
import { getShoppingListByWeek } from "@/lib/shopping-list/queries";
import { findOrCreateIngredient } from "@/lib/ingredients/find-or-create";
import { createClient } from "@/lib/supabase/server";
import type { AggregatedIngredient, RecipeIngredientRow, ShoppingListData } from "@/types/shopping-list";

type ExistingItemRow = {
  id: string;
  ingredient_id: string;
  total_quantity: number;
  unit: string;
  is_checked: boolean;
  is_manual: boolean;
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

function resolveUnit(unit: string | null | undefined): string {
  const trimmed = unit?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "unité";
}

async function ensureShoppingListForWeek(
  userId: string,
  weekStart: string,
): Promise<string> {
  const supabase = await createClient();

  const { data: existingList, error: existingListError } = await supabase
    .from("shopping_list")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (existingListError) {
    throw new Error(existingListError.message);
  }

  if (existingList?.id) {
    return existingList.id;
  }

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

  return insertedList.id;
}

async function getExistingItems(
  shoppingListId: string,
): Promise<ExistingItemRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_id, total_quantity, unit, is_checked, is_manual")
    .eq("shopping_list_id", shoppingListId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ExistingItemRow[];
}

function findExistingItem(
  items: ExistingItemRow[],
  ingredientId: string,
  unit: string,
): ExistingItemRow | undefined {
  const normalizedUnit = normalizeUnit(unit);
  return items.find(
    (item) =>
      item.ingredient_id === ingredientId && normalizeUnit(item.unit) === normalizedUnit,
  );
}

async function mergeAggregatedItems(
  shoppingListId: string,
  aggregatedItems: AggregatedIngredient[],
  options: { isManual: boolean },
): Promise<void> {
  if (aggregatedItems.length === 0) {
    return;
  }

  const supabase = await createClient();
  const existingItems = await getExistingItems(shoppingListId);

  for (const item of aggregatedItems) {
    const existing = findExistingItem(existingItems, item.ingredientId, item.unit);
    const quantityToAdd = item.hasQuantity && item.totalQuantity !== null ? item.totalQuantity : 0;

    if (existing) {
      const { error } = await supabase
        .from("shopping_list_items")
        .update({
          total_quantity: Number(existing.total_quantity) + quantityToAdd,
          is_manual: options.isManual ? true : existing.is_manual,
        })
        .eq("id", existing.id);

      if (error) {
        throw new Error(error.message);
      }

      existing.total_quantity = Number(existing.total_quantity) + quantityToAdd;
      if (options.isManual) {
        existing.is_manual = true;
      }
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: shoppingListId,
        ingredient_id: item.ingredientId,
        total_quantity: quantityToAdd,
        unit: item.unit,
        is_checked: false,
        is_manual: options.isManual,
      })
      .select("id, ingredient_id, total_quantity, unit, is_checked, is_manual")
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? "Impossible d'ajouter l'article.");
    }

    existingItems.push(inserted as ExistingItemRow);
  }
}

export async function addManualItem(
  userId: string,
  weekStart: string,
  name: string,
  quantity?: number,
  unit?: string,
): Promise<ShoppingListData> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Le nom de l'article est requis.");
  }

  const resolvedUnit = resolveUnit(unit);
  const supabase = await createClient();
  const ingredientId = await findOrCreateIngredient(supabase, userId, trimmedName, resolvedUnit);
  const shoppingListId = await ensureShoppingListForWeek(userId, weekStart);
  const existingItems = await getExistingItems(shoppingListId);
  const existing = findExistingItem(existingItems, ingredientId, resolvedUnit);
  const quantityToAdd =
    quantity !== undefined && Number.isFinite(quantity) && quantity > 0 ? quantity : 0;

  if (existing) {
    const { error } = await supabase
      .from("shopping_list_items")
      .update({
        total_quantity: Number(existing.total_quantity) + quantityToAdd,
        is_manual: true,
      })
      .eq("id", existing.id);

    if (error) {
      throw new Error(error.message);
    }
  } else {
    const { error } = await supabase.from("shopping_list_items").insert({
      shopping_list_id: shoppingListId,
      ingredient_id: ingredientId,
      total_quantity: quantityToAdd,
      unit: resolvedUnit,
      is_checked: false,
      is_manual: true,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  const result = await getShoppingListByWeek(userId, weekStart);
  if (!result) {
    throw new Error("La liste de courses n'a pas pu être chargée.");
  }

  return result;
}

async function fetchRecipeIngredients(recipeId: string): Promise<RecipeIngredientRow[]> {
  const supabase = await createClient();

  const { data: ingredientRows, error } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id, quantity, ingredient_id, ingredients(name, unit), recipes(servings)")
    .eq("recipe_id", recipeId);

  if (error) {
    throw new Error(error.message);
  }

  return ((ingredientRows ?? []) as RecipeIngredientDbRow[]).map((row) => {
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

export async function addRecipeToList(
  userId: string,
  weekStart: string,
  recipeId: string,
  servings: number,
): Promise<ShoppingListData> {
  if (!Number.isInteger(servings) || servings <= 0) {
    throw new Error("Nombre de parts invalide.");
  }

  const recipeIngredients = await fetchRecipeIngredients(recipeId);
  if (recipeIngredients.length === 0) {
    throw new Error("Cette recette n'a pas d'ingrédients.");
  }

  const aggregatedItems = aggregateRecipeIngredients(recipeIngredients, servings);
  const shoppingListId = await ensureShoppingListForWeek(userId, weekStart);
  await mergeAggregatedItems(shoppingListId, aggregatedItems, { isManual: false });

  const result = await getShoppingListByWeek(userId, weekStart);
  if (!result) {
    throw new Error("La liste de courses n'a pas pu être chargée.");
  }

  return result;
}

export async function clearList(
  userId: string,
  weekStart: string,
  onlyChecked: boolean,
): Promise<ShoppingListData | null> {
  const supabase = await createClient();

  const { data: listRow, error: listError } = await supabase
    .from("shopping_list")
    .select("id")
    .eq("user_id", userId)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (listError) {
    throw new Error(listError.message);
  }

  if (!listRow) {
    return null;
  }

  let deleteQuery = supabase
    .from("shopping_list_items")
    .delete()
    .eq("shopping_list_id", listRow.id);

  if (onlyChecked) {
    deleteQuery = deleteQuery.eq("is_checked", true);
  }

  const { error: deleteError } = await deleteQuery;

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return getShoppingListByWeek(userId, weekStart);
}

export async function removeShoppingListItem(
  userId: string,
  itemId: string,
): Promise<ShoppingListData | null> {
  const supabase = await createClient();

  const { data: itemRow, error: itemError } = await supabase
    .from("shopping_list_items")
    .select("id, shopping_list_id")
    .eq("id", itemId)
    .maybeSingle();

  if (itemError) {
    throw new Error(itemError.message);
  }

  if (!itemRow) {
    throw new Error("Article introuvable.");
  }

  const { data: listRow, error: listError } = await supabase
    .from("shopping_list")
    .select("user_id, week_start_date")
    .eq("id", itemRow.shopping_list_id)
    .maybeSingle();

  if (listError) {
    throw new Error(listError.message);
  }

  if (!listRow || listRow.user_id !== userId) {
    throw new Error("Article introuvable.");
  }

  const { error: deleteError } = await supabase
    .from("shopping_list_items")
    .delete()
    .eq("id", itemId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return getShoppingListByWeek(userId, listRow.week_start_date);
}
