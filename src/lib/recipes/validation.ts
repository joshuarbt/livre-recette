import type {
  CreateRecipeFormErrors,
  CreateRecipePayload,
  RecipeFormInput,
} from "@/types/recipes";

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

export function parseTitle(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseOptionalText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function parseOptionalPositiveInt(value: number | undefined): number | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }
  return value;
}

export function parseRecipeFormInput(input: RecipeFormInput): {
  valid: true;
  data: {
    title: string;
    description: string | null;
    servings: number | null;
    prepTime: number | null;
    cookTime: number | null;
    category: string | null;
  };
} | {
  valid: false;
  error: string;
} {
  const title = parseTitle(input.title);
  if (!title) {
    return { valid: false, error: "Le titre est obligatoire." };
  }

  if (input.servings !== undefined && parseOptionalPositiveInt(input.servings) === null) {
    return { valid: false, error: "Nombre de parts invalide." };
  }

  if (input.prepTime !== undefined && parseOptionalPositiveInt(input.prepTime) === null) {
    return { valid: false, error: "Temps de préparation invalide." };
  }

  if (input.cookTime !== undefined && parseOptionalPositiveInt(input.cookTime) === null) {
    return { valid: false, error: "Temps de cuisson invalide." };
  }

  return {
    valid: true,
    data: {
      title,
      description: parseOptionalText(input.description),
      servings: parseOptionalPositiveInt(input.servings),
      prepTime: parseOptionalPositiveInt(input.prepTime),
      cookTime: parseOptionalPositiveInt(input.cookTime),
      category: parseOptionalText(input.category),
    },
  };
}
