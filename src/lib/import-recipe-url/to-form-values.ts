import type { ImportedRecipeData, SerializableFormValues } from "@/lib/import-recipe-url/types";
import {
  createEmptyIngredientRow,
  createEmptyStepRow,
  type RecipeCategory,
} from "@/types/recipes";

export function importedRecipeToFormValues(data: ImportedRecipeData): SerializableFormValues {
  const ingredients =
    data.ingredients.length > 0
      ? data.ingredients.map((ingredient) => ({
          clientId: crypto.randomUUID(),
          name: ingredient.name,
          quantity: String(ingredient.quantity),
          unit: ingredient.unit,
        }))
      : [createEmptyIngredientRow()];

  const steps =
    data.steps.length > 0
      ? data.steps.map((instruction) => ({
          clientId: crypto.randomUUID(),
          instruction,
        }))
      : [createEmptyStepRow()];

  return {
    title: data.title,
    description: data.description ?? "",
    category: (data.category ?? "") as RecipeCategory | "",
    prepTime: data.prepTime ? String(data.prepTime) : "",
    cookTime: data.cookTime ? String(data.cookTime) : "",
    servings: data.servings ? String(data.servings) : "",
    imageMode: "url",
    imageUrl: data.imageUrl ?? "",
    imageFile: null,
    imageCleared: false,
    ingredients,
    utensils: [],
    steps,
  };
}
