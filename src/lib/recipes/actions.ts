"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCreateRecipePayload, parseRecipeFormInput } from "@/lib/recipes/validation";
import { createClient } from "@/lib/supabase/server";
import type {
  CreateRecipeActionResult,
  CreateRecipePayload,
  RecipeActionResult,
  RecipeFormInput,
} from "@/types/recipes";
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

function revalidateRecipePaths(recipeId?: string): void {
  revalidatePath("/");
  if (recipeId) {
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath(`/recipes/${recipeId}/edit`);
  }
}

async function findOrCreateIngredient(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  unit: string,
): Promise<string> {
  const { data: existing, error: existingError } = await supabase
    .from("ingredients")
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
    .from("ingredients")
    .insert({ user_id: userId, name, unit })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: retry, error: retryError } = await supabase
        .from("ingredients")
        .select("id")
        .eq("user_id", userId)
        .eq("name", name)
        .single();

      if (retryError || !retry) {
        throw new Error("Impossible de créer l'ingrédient.");
      }

      return retry.id;
    }

    throw new Error(error.message);
  }

  return data.id;
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

  const supabase = await createClient();
  let recipeId: string | null = null;

  try {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert({
        user_id: userResult,
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
        errors: { form: recipeError?.message ?? "Erreur lors de la création de la recette." },
      };
    }

    recipeId = recipe.id;

    for (const ingredient of parsed.data.ingredients) {
      const ingredientId = await findOrCreateIngredient(
        supabase,
        userResult,
        ingredient.name.trim(),
        ingredient.unit.trim(),
      );

      const { error } = await supabase.from("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: ingredientId,
        quantity: ingredient.quantity,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    for (const utensil of parsed.data.utensils) {
      const utensilId = await findOrCreateUtensil(supabase, userResult, utensil.name.trim());

      const { error } = await supabase.from("recipe_utensils").insert({
        recipe_id: recipe.id,
        utensil_id: utensilId,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    for (const [index, step] of parsed.data.steps.entries()) {
      const { error } = await supabase.from("recipe_steps").insert({
        recipe_id: recipe.id,
        step_number: index + 1,
        instruction: step.instruction.trim(),
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  } catch (error) {
    if (recipeId) {
      await supabase.from("recipes").delete().eq("id", recipeId).eq("user_id", userResult);
    }

    const message = error instanceof Error ? error.message : "Erreur lors de la création.";
    return { success: false, errors: { form: message } };
  }

  revalidateRecipePaths(recipeId!);
  redirect(`/recipes/${recipeId}`);
}

export async function createRecipe(input: RecipeFormInput): Promise<RecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const parsed = parseRecipeFormInput(input);
  if (!parsed.valid) {
    return { success: false, error: parsed.error };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .insert({
      user_id: userResult,
      title: parsed.data.title,
      description: parsed.data.description,
      servings: parsed.data.servings,
      prep_time: parsed.data.prepTime,
      cook_time: parsed.data.cookTime,
      category: parsed.data.category,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Erreur lors de la création." };
  }

  revalidateRecipePaths();
  redirect(`/recipes/${data.id}`);
}

export async function updateRecipe(
  id: string,
  input: RecipeFormInput,
): Promise<RecipeActionResult> {
  const userResult = await requireUserId();
  if (typeof userResult !== "string") {
    return userResult;
  }

  const parsed = parseRecipeFormInput(input);
  if (!parsed.valid) {
    return { success: false, error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("recipes")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      servings: parsed.data.servings,
      prep_time: parsed.data.prepTime,
      cook_time: parsed.data.cookTime,
      category: parsed.data.category,
    })
    .eq("id", id)
    .eq("user_id", userResult);

  if (error) {
    return { success: false, error: error.message };
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
