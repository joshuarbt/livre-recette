import type { CreateRecipeFormErrors, CreateRecipePayload } from "@/types/recipes";

export function parseCreateRecipePayload(
  payload: CreateRecipePayload,
): { valid: true; data: CreateRecipePayload } | { valid: false; errors: CreateRecipeFormErrors } {
  const errors: CreateRecipeFormErrors = {};

  if (!payload.title.trim()) {
    errors.title = "Le titre est obligatoire.";
  }

  if (!Number.isInteger(payload.servings) || payload.servings <= 0) {
    errors.servings = "Indiquez un nombre de parts valide (entier > 0).";
  }

  if (payload.ingredients.length === 0) {
    errors.ingredients = "Ajoutez au moins un ingrédient complet.";
  }

  for (const ingredient of payload.ingredients) {
    if (!ingredient.name.trim() || !ingredient.unit.trim() || ingredient.quantity <= 0) {
      errors.ingredients = "Un ou plusieurs ingrédients sont invalides.";
      break;
    }
  }

  if (payload.imageUrl) {
    try {
      new URL(payload.imageUrl);
    } catch {
      errors.imageUrl = "URL de photo invalide.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: payload };
}
