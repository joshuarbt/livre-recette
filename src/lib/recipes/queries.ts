import type { RecipeSummary } from "@/types/meal-plan";
import type {
  RecipeDetail,
  RecipeIngredientDetail,
  RecipeListItem,
  RecipeStepDetail,
  RecipeUtensilDetail,
} from "@/types/recipes";
import { createClient } from "@/lib/supabase/server";

type RecipeListRow = {
  id: string;
  title: string;
  image_url: string | null;
  category: string | null;
  servings: number | null;
};

type RecipeDetailRow = RecipeListRow & {
  description: string | null;
  prep_time: number | null;
  cook_time: number | null;
  created_at: string;
};

type RecipeIngredientRow = {
  id: string;
  quantity: number;
  ingredients: { name: string; unit: string | null } | { name: string; unit: string | null }[] | null;
};

type RecipeUtensilRow = {
  id: string;
  utensils: { name: string } | { name: string }[] | null;
};

type RecipeStepRow = {
  step_number: number;
  instruction: string;
};

function getRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
}

function mapRecipeListRow(row: RecipeListRow): RecipeListItem {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
    category: row.category,
    servings: row.servings,
  };
}

function mapIngredientRow(row: RecipeIngredientRow): RecipeIngredientDetail {
  const ingredient = getRelation(row.ingredients);
  return {
    id: row.id,
    name: ingredient?.name ?? "Ingrédient",
    quantity: row.quantity,
    unit: ingredient?.unit?.trim() || "",
  };
}

function mapUtensilRow(row: RecipeUtensilRow): RecipeUtensilDetail {
  const utensil = getRelation(row.utensils);
  return {
    id: row.id,
    name: utensil?.name ?? "Ustensile",
  };
}

function mapStepRow(row: RecipeStepRow): RecipeStepDetail {
  return {
    stepNumber: row.step_number,
    instruction: row.instruction,
  };
}

export async function getRecipes(): Promise<RecipeListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, image_url, category, servings")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as RecipeListRow[]).map(mapRecipeListRow);
}

export async function getRecipeById(id: string): Promise<RecipeDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select(
      "id, title, image_url, category, servings, description, prep_time, cook_time, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const [ingredientResult, utensilResult, stepResult] = await Promise.all([
    supabase
      .from("recipe_ingredients")
      .select("id, quantity, ingredients(name, unit)")
      .eq("recipe_id", id),
    supabase.from("recipe_utensils").select("id, utensils(name)").eq("recipe_id", id),
    supabase
      .from("recipe_steps")
      .select("step_number, instruction")
      .eq("recipe_id", id)
      .order("step_number", { ascending: true }),
  ]);

  if (ingredientResult.error) {
    throw new Error(ingredientResult.error.message);
  }

  if (utensilResult.error) {
    throw new Error(utensilResult.error.message);
  }

  if (stepResult.error) {
    throw new Error(stepResult.error.message);
  }

  const base = mapRecipeListRow(data as RecipeDetailRow);

  return {
    ...base,
    description: (data as RecipeDetailRow).description,
    prepTime: (data as RecipeDetailRow).prep_time,
    cookTime: (data as RecipeDetailRow).cook_time,
    createdAt: (data as RecipeDetailRow).created_at,
    ingredients: ((ingredientResult.data ?? []) as RecipeIngredientRow[]).map(mapIngredientRow),
    utensils: ((utensilResult.data ?? []) as RecipeUtensilRow[]).map(mapUtensilRow),
    steps: ((stepResult.data ?? []) as RecipeStepRow[]).map(mapStepRow),
  };
}

export async function getRecipeSummaries(): Promise<RecipeSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, image_url")
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as { id: string; title: string; image_url: string | null }[]).map((row) => ({
    id: row.id,
    title: row.title,
    imageUrl: row.image_url,
  }));
}
