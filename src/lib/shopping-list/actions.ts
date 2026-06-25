"use server";

import { revalidatePath } from "next/cache";
import { generateShoppingList } from "@/lib/shopping-list/generate";
import {
  addManualItem,
  addRecipeToList,
  clearList,
  removeShoppingListItem,
} from "@/lib/shopping-list/mutations";
import { getShoppingListByWeek } from "@/lib/shopping-list/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  FetchShoppingListResult,
  GenerateShoppingListResult,
  MutateShoppingListResult,
  ShoppingListActionResult,
} from "@/types/shopping-list";
import { getWeekStart, isValidPlanDate } from "@/utils/week";

async function requireUserId(): Promise<string | ShoppingListActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  return user.id;
}

function parseWeekStart(weekStart: string): string | null {
  if (!isValidPlanDate(weekStart)) {
    return null;
  }

  return getWeekStart(weekStart);
}

export async function fetchShoppingListByWeek(
  weekStart: string,
): Promise<FetchShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parseWeekStart(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await getShoppingListByWeek(userResult, parsedWeekStart);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function generateShoppingListAction(
  weekStart: string,
): Promise<GenerateShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parseWeekStart(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await generateShoppingList(userResult, parsedWeekStart);
    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function toggleShoppingListItem(
  itemId: string,
  isChecked: boolean,
): Promise<ShoppingListActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_list_items")
    .update({ is_checked: isChecked })
    .eq("id", itemId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/courses");
  return { success: true };
}

export async function addManualItemAction(
  weekStart: string,
  name: string,
  quantity?: number,
  unit?: string,
): Promise<MutateShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parseWeekStart(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await addManualItem(userResult, parsedWeekStart, name, quantity, unit);
    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function addRecipeToListAction(
  weekStart: string,
  recipeId: string,
  servings: number,
): Promise<MutateShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parseWeekStart(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await addRecipeToList(userResult, parsedWeekStart, recipeId, servings);
    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function clearListAction(
  weekStart: string,
  onlyChecked: boolean,
): Promise<MutateShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parseWeekStart(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await clearList(userResult, parsedWeekStart, onlyChecked);
    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function removeShoppingListItemAction(
  itemId: string,
): Promise<MutateShoppingListResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  try {
    const data = await removeShoppingListItem(userResult, itemId);
    revalidatePath("/courses");
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}
