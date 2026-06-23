"use server";

import { revalidatePath } from "next/cache";
import {
  planFreezerDeductions,
  type ConsumableFreezerEntry,
} from "@/lib/freezer/consume";
import { getAllFreezerEntriesForUser } from "@/lib/freezer/queries";
import { parsePlanDate } from "@/lib/meal-plan/validation";
import { createClient } from "@/lib/supabase/server";
import type { FreezerActionResult } from "@/types/freezer";

const FREEZER_PATHS = ["/congelateur", "/planning", "/courses"] as const;

function revalidateFreezerPaths(): void {
  for (const path of FREEZER_PATHS) {
    revalidatePath(path);
  }
}

async function requireUserId(): Promise<string | FreezerActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  return user.id;
}

function parseServingsCount(value: number): number | null {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

function parseOptionalDate(value: string | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  return parsePlanDate(value);
}

async function applyFreezerDeductions(
  userId: string,
  updates: { id: string; newServingsCount: number | null }[],
): Promise<FreezerActionResult> {
  const supabase = await createClient();

  for (const update of updates) {
    if (update.newServingsCount === null) {
      const { error } = await supabase
        .from("freezer_inventory")
        .delete()
        .eq("id", update.id)
        .eq("user_id", userId);

      if (error) {
        return { success: false, error: error.message };
      }
      continue;
    }

    const { error } = await supabase
      .from("freezer_inventory")
      .update({ servings_count: update.newServingsCount })
      .eq("id", update.id)
      .eq("user_id", userId);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

async function fetchConsumableEntries(userId: string): Promise<ConsumableFreezerEntry[]> {
  const entries = await getAllFreezerEntriesForUser(userId);
  return entries.map((entry) => ({
    id: entry.id,
    recipeId: entry.recipeId,
    servingsCount: entry.servingsCount,
    frozenDate: entry.frozenDate,
    expiryDate: entry.expiryDate,
  }));
}

export async function addFreezerEntry(
  recipeId: string,
  servingsCount: number,
  expiryDate?: string,
  notes?: string,
): Promise<FreezerActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const parsedServings = parseServingsCount(servingsCount);
  if (!parsedServings) {
    return { success: false, error: "Nombre de parts invalide." };
  }

  const parsedExpiry = expiryDate ? parseOptionalDate(expiryDate) : null;
  if (expiryDate && !parsedExpiry) {
    return { success: false, error: "Date d'expiration invalide." };
  }

  const supabase = await createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .select("id")
    .eq("id", recipeId)
    .eq("user_id", userResult)
    .maybeSingle();

  if (recipeError || !recipe) {
    return { success: false, error: "Recette introuvable." };
  }

  const today = new Date();
  const frozenDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { error } = await supabase.from("freezer_inventory").insert({
    user_id: userResult,
    recipe_id: recipeId,
    servings_count: parsedServings,
    frozen_date: frozenDate,
    expiry_date: parsedExpiry,
    notes: notes?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateFreezerPaths();
  return { success: true };
}

export async function adjustFreezerServings(
  entryId: string,
  delta: number,
): Promise<FreezerActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  if (!Number.isInteger(delta) || delta === 0) {
    return { success: false, error: "Modification invalide." };
  }

  const supabase = await createClient();

  const { data: entry, error: fetchError } = await supabase
    .from("freezer_inventory")
    .select("id, servings_count")
    .eq("id", entryId)
    .eq("user_id", userResult)
    .maybeSingle();

  if (fetchError || !entry) {
    return { success: false, error: "Entrée introuvable." };
  }

  const nextCount = entry.servings_count + delta;

  if (nextCount <= 0) {
    const { error } = await supabase
      .from("freezer_inventory")
      .delete()
      .eq("id", entryId)
      .eq("user_id", userResult);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("freezer_inventory")
      .update({ servings_count: nextCount })
      .eq("id", entryId)
      .eq("user_id", userResult);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidateFreezerPaths();
  return { success: true };
}

export async function deleteFreezerEntry(entryId: string): Promise<FreezerActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("freezer_inventory")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userResult);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateFreezerPaths();
  return { success: true };
}

export async function consumeFreezerServings(
  recipeId: string,
  amount: number,
): Promise<FreezerActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const parsedAmount = parseServingsCount(amount);
  if (!parsedAmount) {
    return { success: false, error: "Nombre de parts invalide." };
  }

  try {
    const entries = await fetchConsumableEntries(userResult);
    const updates = planFreezerDeductions(entries, recipeId, parsedAmount);
    const result = await applyFreezerDeductions(userResult, updates);

    if (result.success) {
      revalidateFreezerPaths();
    }

    return result;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Stock congélateur insuffisant.";
    return { success: false, error: message };
  }
}
