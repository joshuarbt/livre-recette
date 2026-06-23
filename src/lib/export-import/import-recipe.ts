"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  RECIPE_IMPORT_INVALID_MESSAGE,
  parseRecipeImportJson,
  recipeExportJsonToCreateRecipePayload,
} from "@/lib/export-import";
import { createRecipeFromPayload, getAuthenticatedUserId } from "@/lib/recipes/actions";

export type ImportRecipeResult = { success: true } | { success: false; error: string };

function revalidateRecipePaths(recipeId: string): void {
  revalidatePath("/");
  revalidatePath(`/recipes/${recipeId}`);
  revalidatePath(`/recipes/${recipeId}/edit`);
}

export async function importRecipe(
  jsonData: unknown,
  userId: string,
): Promise<ImportRecipeResult> {
  const sessionUserId = await getAuthenticatedUserId();
  if (!sessionUserId || sessionUserId !== userId) {
    return { success: false, error: "Vous devez être connecté." };
  }

  const parsed = parseRecipeImportJson(jsonData);
  if (!parsed.valid) {
    return { success: false, error: RECIPE_IMPORT_INVALID_MESSAGE };
  }

  let payload;
  try {
    payload = recipeExportJsonToCreateRecipePayload(parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : RECIPE_IMPORT_INVALID_MESSAGE;
    return { success: false, error: message };
  }

  const result = await createRecipeFromPayload(userId, payload);
  if (!result.success) {
    return { success: false, error: result.error };
  }

  revalidateRecipePaths(result.id);
  redirect(`/recipes/${result.id}?imported=1`);
}
