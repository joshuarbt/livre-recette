"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCreateRecipePayload } from "@/lib/recipes/validation";
import {
  getRecipeImagePathFromUrl,
  RECIPE_IMAGES_BUCKET,
} from "@/lib/storage/recipe-images";
import { findOrCreateIngredient } from "@/lib/ingredients/find-or-create";
import { createClient } from "@/lib/supabase/server";
import type { CreateRecipeActionResult, CreateRecipePayload, RecipeActionResult } from "@/types/recipes";
import type { SupabaseClient } from "@supabase/supabase-js";

async function requireUserId(): Promise<string | RecipeActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté." };
  }

  return user.id;
}

export async function getAuthenticatedUserId(): Promise<string | null> {
  const result = await requireUserId();
  return typeof result === "string" ? result : null;
}

function revalidateRecipePaths(recipeId?: string): void {
  revalidatePath("/");
  if (recipeId) {
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath(`/recipes/${recipeId}/edit`);
  }
}

async function findOrCreateUtensil(
  supabase: SupabaseClient,
  userId: string,
  name: string,
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("utensils")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("utensils")
    .insert({ user_id: userId, name })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry, error: retryError } = await supabase
        .from("utensils")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .single();

      if (retryError || !retry) {
        throw new Error("Impossible de créer l'ustensile.");
      }

      return retry.id;
    }

    throw new Error(error.message);
  }

  return data.id;
}

async function insertRecipeChildren(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
  data: CreateRecipePayload,
): Promise<void> {
  for (const ingredient of data.ingredients) {
    const ingredientId = await findOrCreateIngredient(
      supabase,
      userId,
      ingredient.name.trim(),
      ingredient.unit.trim(),
    );

    const { error } = await supabase.from("recipe_ingredients").insert({
      recipe_id: recipeId,
      ingredient_id: ingredientId,
      quantity: ingredient.quantity,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const utensil of data.utensils) {
    const utensilId = await findOrCreateUtensil(supabase, userId, utensil.name.trim());

    const { error } = await supabase.from("recipe_utensils").insert({
      recipe_id: recipeId,
      utensil_id: utensilId,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const [index, step] of data.steps.entries()) {
    const { error } = await supabase.from("recipe_steps").insert({
      recipe_id: recipeId,
      step_number: index + 1,
      instruction: step.instruction.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function createRecipeFromPayload(
  userId: string,
  payload: CreateRecipePayload,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  const parsed = parseCreateRecipePayload(payload);
  if (!parsed.valid) {
    const error =
      parsed.errors.form ??
      parsed.errors.title ??
      parsed.errors.servings ??
      parsed.errors.ingredients ??
      parsed.errors.imageUrl ??
      "Données de recette invalides.";
    return { success: false, error };
  }

  const supabase = await createClient();
  let recipeId: string | null = null;

  try {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: userId,
        title: parsed.data.title,
        description: parsed.data.description,
        servings: parsed.data.servings,
        prep_time: parsed.data.prepTime,
        cook_time: parsed.data.cookTime,
        category: parsed.data.category,
        image_url: parsed.data.imageUrl,
      })
      .select("id")
      .single();

    if (recipeError || !recipe) {
      return {
        success: false,
        error: recipeError?.message ?? "Erreur lors de la création de la recette.",
      };
    }

    recipeId = recipe.id;
    await insertRecipeChildren(supabase, userId, recipe.id, parsed.data);
  } catch (error) {
    if (recipeId) {
      await supabase.from("recipes").delete().eq("id", recipeId).eq("user_id", userId);
    }

    const message = error instanceof Error ? error.message : "Erreur lors de la création.";
    return { success: false, error: message };
  }

  return { success: true, id: recipeId! };
}

export async function createRecipeFull(
  payload: CreateRecipePayload,
): Promise<CreateRecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    const message = userResult.success === false ? userResult.error : "Vous devez être connecté.";
    return { success: false, errors: { form: message } };
  }

  const parsed = parseCreateRecipePayload(payload);
  if (!parsed.valid) {
    return { success: false, errors: parsed.errors };
  }

  const result = await createRecipeFromPayload(userResult, parsed.data);
  if (!result.success) {
    return { success: false, errors: { form: result.error } };
  }

  revalidateRecipePaths(result.id);
  redirect(`/recipes/${result.id}`);
}

export async function updateRecipeFull(
  id: string,
  payload: CreateRecipePayload,
): Promise<CreateRecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    const message = userResult.success === false ? userResult.error : "Vous devez être connecté.";
    return { success: false, errors: { form: message } };
  }

  const parsed = parseCreateRecipePayload(payload);
  if (!parsed.valid) {
    return { success: false, errors: parsed.errors };
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from("recipes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      servings: parsed.data.servings,
      prep_time: parsed.data.prepTime,
      cook_time: parsed.data.cookTime,
      category: parsed.data.category,
      image_url: parsed.data.imageUrl,
    })
    .eq("id", id)
    .eq("user_id", userResult);

  if (updateError) {
    return {
      success: false,
      errors: { form: updateError.message ?? "Erreur lors de la mise à jour de la recette." },
    };
  }

  try {
    const { error: deleteIngredientsError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", id);

    if (deleteIngredientsError) {
      throw new Error(deleteIngredientsError.message);
    }

    const { error: deleteUtensilsError } = await supabase
      .from("recipe_utensils")
      .delete()
      .eq("recipe_id", id);

    if (deleteUtensilsError) {
      throw new Error(deleteUtensilsError.message);
    }

    const { error: deleteStepsError } = await supabase
      .from("recipe_steps")
      .delete()
      .eq("recipe_id", id);

    if (deleteStepsError) {
      throw new Error(deleteStepsError.message);
    }

    await insertRecipeChildren(supabase, userResult, id, parsed.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour.";
    return { success: false, errors: { form: message } };
  }

  revalidateRecipePaths(id);
  redirect(`/recipes/${id}`);
}

export async function deleteRecipe(id: string): Promise<RecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const supabase = await createClient();
  const { error } = await supabase.from("recipes").delete().eq("id", id).eq("user_id", userResult);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidateRecipePaths();
  redirect("/");
}

export async function clearRecipeImage(recipeId: string): Promise<RecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const supabase = await createClient();

  const { data: recipe, error: fetchError } = await supabase
    .from("recipes")
    .select("image_url")
    .eq("id", recipeId)
    .eq("user_id", userResult)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!recipe) {
    return { success: false, error: "Recette introuvable." };
  }

  const currentImageUrl = recipe.image_url as string | null;

  if (currentImageUrl) {
    const path = getRecipeImagePathFromUrl(currentImageUrl);
    if (path) {
      const { error: storageError } = await supabase.storage
        .from(RECIPE_IMAGES_BUCKET)
        .remove([path]);

      if (storageError) {
        return { success: false, error: storageError.message };
      }
    }
  }

  const { error: updateError } = await supabase
    .from("recipes")
    .update({ image_url: null })
    .eq("id", recipeId)
    .eq("user_id", userResult);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidateRecipePaths(recipeId);
  return { success: true };
}
