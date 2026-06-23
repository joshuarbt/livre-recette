"use server";

import { revalidatePath } from "next/cache";
import { consumeFreezerServings } from "@/lib/freezer/actions";
import { getMealPlanByWeek } from "@/lib/meal-plan/queries";
import {
  parseMealType,
  parsePlanDate,
  parseServings,
} from "@/lib/meal-plan/validation";
import { createClient } from "@/lib/supabase/server";
import type {
  FetchMealPlanResult,
  MealPlanActionResult,
  MealType,
} from "@/types/meal-plan";
import { getWeekStart, isValidPlanDate } from "@/utils/week";

async function requireUserId(): Promise<string | MealPlanActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  return user.id;
}

function assertMatchingUser(
  userId: string,
  authUserId: string,
): MealPlanActionResult | null {
  if (userId !== authUserId) {
    return { success: false, error: "Accès refusé." };
  }

  return null;
}

export async function fetchMealPlanByWeek(
  weekStart: string,
): Promise<FetchMealPlanResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsedWeekStart = parsePlanDate(weekStart);
  if (!parsedWeekStart) {
    return { success: false, error: "Semaine invalide." };
  }

  const normalizedWeekStart = getWeekStart(parsedWeekStart);
  if (!isValidPlanDate(normalizedWeekStart)) {
    return { success: false, error: "Semaine invalide." };
  }

  try {
    const data = await getMealPlanByWeek(userResult, normalizedWeekStart);
    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return { success: false, error: message };
  }
}

export async function addMealToPlanning(
  userId: string,
  recipeId: string,
  date: string,
  servingsPlanned: number,
  mealType: MealType,
  freezerServingsToUse?: number,
): Promise<MealPlanActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const accessError = assertMatchingUser(userId, userResult);
  if (accessError) {
    return accessError;
  }

  const parsedDate = parsePlanDate(date);
  const parsedMealType = parseMealType(mealType);
  const parsedServings = parseServings(servingsPlanned);

  if (!parsedDate || !parsedMealType || parsedServings === null) {
    return { success: false, error: "Données invalides." };
  }

  const supabase = await createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (recipeError || !recipe) {
    return { success: false, error: "Recette introuvable." };
  }

  if (freezerServingsToUse !== undefined && freezerServingsToUse > 0) {
    if (!Number.isInteger(freezerServingsToUse)) {
      return { success: false, error: "Nombre de parts congélateur invalide." };
    }

    if (freezerServingsToUse > parsedServings) {
      return {
        success: false,
        error: "Les parts du congélateur ne peuvent pas dépasser les parts planifiées.",
      };
    }

    const consumeResult = await consumeFreezerServings(recipeId, freezerServingsToUse);
    if (!consumeResult.success) {
      return consumeResult;
    }
  }

  const { error } = await supabase.from("meal_plan").upsert(
    {
      user_id: userId,
      recipe_id: recipeId,
      date: parsedDate,
      servings_planned: parsedServings,
      meal_type: parsedMealType,
    },
    { onConflict: "user_id,date,meal_type" },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/planning");
  revalidatePath("/congelateur");
  revalidatePath("/courses");
  return { success: true };
}

export async function removeMealFromPlanning(id: string): Promise<MealPlanActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("meal_plan").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/planning");
  return { success: true };
}

export async function updateServings(
  id: string,
  newServings: number,
): Promise<MealPlanActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const parsedServings = parseServings(newServings);
  if (parsedServings === null) {
    return { success: false, error: "Nombre de parts invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("meal_plan")
    .update({ servings_planned: parsedServings })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/planning");
  return { success: true };
}
