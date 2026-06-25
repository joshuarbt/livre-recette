import type { ShoppingListData, ShoppingListItem } from "@/types/shopping-list";
import { createClient } from "@/lib/supabase/server";

type ShoppingListRow = {
  id: string;
  user_id: string;
  week_start_date: string;
  is_checked: boolean;
};

type ShoppingListItemRow = {
  id: string;
  ingredient_id: string;
  total_quantity: number;
  unit: string;
  is_checked: boolean;
  is_manual: boolean;
  ingredients: { name: string } | { name: string }[] | null;
};

function getIngredientName(row: ShoppingListItemRow): string {
  const ingredients = row.ingredients;
  if (Array.isArray(ingredients)) {
    return ingredients[0]?.name ?? "Ingrédient";
  }
  return ingredients?.name ?? "Ingrédient";
}

function mapShoppingListItems(rows: ShoppingListItemRow[]): ShoppingListItem[] {
  return rows
    .map((row) => ({
      id: row.id,
      ingredientId: row.ingredient_id,
      ingredientName: getIngredientName(row),
      totalQuantity: Number(row.total_quantity),
      unit: row.unit,
      isChecked: row.is_checked,
      isManual: row.is_manual,
    }))
    .sort((left, right) => left.ingredientName.localeCompare(right.ingredientName, "fr"));
}

export async function getShoppingListByWeek(
  userId: string,
  weekStart: string,
): Promise<ShoppingListData | null> {
  const supabase = await createClient();

  const { data: listRow, error: listError } = await supabase
    .from("shopping_list")
    .select("id, user_id, week_start_date, is_checked")
    .eq("user_id", userId)
    .eq("week_start_date", weekStart)
    .maybeSingle();

  if (listError) {
    throw new Error(listError.message);
  }

  if (!listRow) {
    return null;
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from("shopping_list_items")
    .select("id, ingredient_id, total_quantity, unit, is_checked, is_manual, ingredients(name)")
    .eq("shopping_list_id", listRow.id)
    .order("ingredient_id", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  const list = listRow as ShoppingListRow;

  return {
    id: list.id,
    userId: list.user_id,
    weekStartDate: list.week_start_date,
    isChecked: list.is_checked,
    items: mapShoppingListItems((itemRows ?? []) as ShoppingListItemRow[]),
  };
}
