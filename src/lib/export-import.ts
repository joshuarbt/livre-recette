import type { CreateRecipePayload, RecipeDetail } from "@/types/recipes";
import { getRecipeCategoryLabel } from "@/types/recipes";

export const RECIPE_EXPORT_VERSION = "1.0";
export const RECIPE_IMPORT_INVALID_MESSAGE = "Ce fichier n'est pas une recette valide";

export type RecipeExportJson = {
  export_version: string;
  exported_at: string;
  recipe: {
    title: string;
    description: string;
    category: string;
    prep_time: number;
    cook_time: number;
    servings: number;
    image_url: string;
    steps: { step_number: number; instruction: string }[];
    ingredients: { name: string; quantity: number; unit: string }[];
    utensils: string[];
  };
};

export type RecipeImportPreview = {
  title: string;
  categoryLabel: string;
  ingredientCount: number;
  stepCount: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseOptionalPositiveInt(value: unknown): number | null {
  if (!isNumber(value) || value <= 0 || !Number.isInteger(value)) {
    return null;
  }
  return value;
}

export function parseRecipeImportJson(
  data: unknown,
): { valid: true; data: RecipeExportJson } | { valid: false } {
  if (!isRecord(data)) {
    return { valid: false };
  }

  if (!isString(data.export_version) || !data.export_version.trim()) {
    return { valid: false };
  }

  if (!isRecord(data.recipe)) {
    return { valid: false };
  }

  const recipe = data.recipe;

  if (!isString(recipe.title) || !recipe.title.trim()) {
    return { valid: false };
  }

  if (!Array.isArray(recipe.ingredients)) {
    return { valid: false };
  }

  if (!Array.isArray(recipe.steps)) {
    return { valid: false };
  }

  const utensils = Array.isArray(recipe.utensils) ? recipe.utensils : [];

  for (const ingredient of recipe.ingredients) {
    if (!isRecord(ingredient)) {
      return { valid: false };
    }
    if (!isString(ingredient.name) || !isNumber(ingredient.quantity) || !isString(ingredient.unit)) {
      return { valid: false };
    }
  }

  for (const step of recipe.steps) {
    if (!isRecord(step)) {
      return { valid: false };
    }
    if (!isNumber(step.step_number) || !isString(step.instruction)) {
      return { valid: false };
    }
  }

  for (const utensil of utensils) {
    if (!isString(utensil)) {
      return { valid: false };
    }
  }

  return {
    valid: true,
    data: {
      export_version: data.export_version,
      exported_at: isString(data.exported_at) ? data.exported_at : "",
      recipe: {
        title: recipe.title,
        description: isString(recipe.description) ? recipe.description : "",
        category: isString(recipe.category) ? recipe.category : "",
        prep_time: isNumber(recipe.prep_time) ? recipe.prep_time : 0,
        cook_time: isNumber(recipe.cook_time) ? recipe.cook_time : 0,
        servings: isNumber(recipe.servings) ? recipe.servings : 0,
        image_url: isString(recipe.image_url) ? recipe.image_url : "",
        ingredients: recipe.ingredients.map((ingredient) => ({
          name: (ingredient as Record<string, unknown>).name as string,
          quantity: (ingredient as Record<string, unknown>).quantity as number,
          unit: (ingredient as Record<string, unknown>).unit as string,
        })),
        utensils: utensils as string[],
        steps: recipe.steps.map((step) => ({
          step_number: (step as Record<string, unknown>).step_number as number,
          instruction: (step as Record<string, unknown>).instruction as string,
        })),
      },
    },
  };
}

export function recipeExportJsonToCreateRecipePayload(data: RecipeExportJson): CreateRecipePayload {
  const servings = parseOptionalPositiveInt(data.recipe.servings);
  if (servings === null) {
    throw new Error("Nombre de parts invalide.");
  }

  const ingredients = data.recipe.ingredients
    .map((ingredient) => ({
      name: ingredient.name.trim(),
      quantity: ingredient.quantity,
      unit: ingredient.unit.trim(),
    }))
    .filter((ingredient) => ingredient.name && ingredient.unit && ingredient.quantity > 0);

  const utensils = data.recipe.utensils
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

  const steps = [...data.recipe.steps]
    .sort((a, b) => a.step_number - b.step_number)
    .map((step) => ({ instruction: step.instruction.trim() }))
    .filter((step) => step.instruction);

  return {
    title: data.recipe.title.trim(),
    description: data.recipe.description.trim() || null,
    category: data.recipe.category.trim() || null,
    prepTime: parseOptionalPositiveInt(data.recipe.prep_time),
    cookTime: parseOptionalPositiveInt(data.recipe.cook_time),
    servings,
    imageUrl: data.recipe.image_url.trim() || null,
    ingredients,
    utensils,
    steps,
  };
}

export function getRecipeImportPreview(data: RecipeExportJson): RecipeImportPreview {
  const validIngredients = data.recipe.ingredients.filter(
    (ingredient) =>
      ingredient.name.trim() && ingredient.unit.trim() && ingredient.quantity > 0,
  );
  const validSteps = data.recipe.steps.filter((step) => step.instruction.trim());

  return {
    title: data.recipe.title.trim(),
    categoryLabel: getRecipeCategoryLabel(data.recipe.category.trim() || null) ?? "—",
    ingredientCount: validIngredients.length,
    stepCount: validSteps.length,
  };
}

export function exportRecipe(recipe: RecipeDetail): RecipeExportJson {
  const sortedSteps = [...recipe.steps].sort((a, b) => a.stepNumber - b.stepNumber);

  return {
    export_version: RECIPE_EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    recipe: {
      title: recipe.title,
      description: recipe.description ?? "",
      category: recipe.category ?? "",
      prep_time: recipe.prepTime ?? 0,
      cook_time: recipe.cookTime ?? 0,
      servings: recipe.servings ?? 0,
      image_url: recipe.imageUrl ?? "",
      steps: sortedSteps.map((step) => ({
        step_number: step.stepNumber,
        instruction: step.instruction,
      })),
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.name,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
      utensils: recipe.utensils.map((utensil) => utensil.name),
    },
  };
}

export function recipeExportFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return `${slug || "recette"}.json`;
}

export function downloadRecipeExport(recipe: RecipeDetail): void {
  const data = exportRecipe(recipe);
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = recipeExportFilename(recipe.title);
  anchor.click();
  URL.revokeObjectURL(url);
}
