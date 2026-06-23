import type { CreateRecipeFormErrors, CreateRecipeFormValues, CreateRecipePayload } from "@/types/recipes";

function parsePositiveInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parsePositiveNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

export function validateCreateRecipeForm(
  values: CreateRecipeFormValues,
): { valid: true; data: CreateRecipePayload } | { valid: false; errors: CreateRecipeFormErrors } {
  const errors: CreateRecipeFormErrors = {};
  const ingredientRows: NonNullable<CreateRecipeFormErrors["ingredientRows"]> = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = "Le titre est obligatoire.";
  }

  const servings = parsePositiveInt(values.servings);
  if (servings === null) {
    errors.servings = "Indiquez un nombre de parts valide (entier > 0).";
  }

  const prepTime = values.prepTime.trim() ? parsePositiveInt(values.prepTime) : null;
  if (values.prepTime.trim() && prepTime === null) {
    errors.form = "Temps de préparation invalide.";
  }

  const cookTime = values.cookTime.trim() ? parsePositiveInt(values.cookTime) : null;
  if (values.cookTime.trim() && cookTime === null) {
    errors.form = "Temps de cuisson invalide.";
  }

  if (values.imageMode === "url" && values.imageUrl.trim()) {
    try {
      new URL(values.imageUrl.trim());
    } catch {
      errors.imageUrl = "URL de photo invalide.";
    }
  }

  const validIngredients: CreateRecipePayload["ingredients"] = [];

  for (const row of values.ingredients) {
    const name = row.name.trim();
    const quantity = parsePositiveNumber(row.quantity);
    const unit = row.unit.trim();
    const rowErrors: { name?: string; quantity?: string; unit?: string } = {};

    if (!name) {
      rowErrors.name = "Nom requis.";
    }
    if (quantity === null) {
      rowErrors.quantity = "Quantité invalide.";
    }
    if (!unit) {
      rowErrors.unit = "Unité requise.";
    }

    if (Object.keys(rowErrors).length > 0) {
      ingredientRows[row.clientId] = rowErrors;
      continue;
    }

    if (name && quantity !== null && unit) {
      validIngredients.push({ name, quantity, unit });
    }
  }

  if (validIngredients.length === 0) {
    errors.ingredients = "Ajoutez au moins un ingrédient complet.";
  }

  if (Object.keys(ingredientRows).length > 0) {
    errors.ingredientRows = ingredientRows;
  }

  const utensils: CreateRecipePayload["utensils"] = [];
  const utensilRows: NonNullable<CreateRecipeFormErrors["utensilRows"]> = {};

  for (const row of values.utensils) {
    const name = row.name.trim();
    if (!name) {
      utensilRows[row.clientId] = { name: "Nom requis si la ligne est ajoutée." };
      continue;
    }
    utensils.push({ name });
  }

  if (Object.keys(utensilRows).length > 0) {
    errors.utensilRows = utensilRows;
  }

  const steps: CreateRecipePayload["steps"] = [];
  const stepRows: NonNullable<CreateRecipeFormErrors["stepRows"]> = {};

  for (const row of values.steps) {
    const instruction = row.instruction.trim();
    if (!instruction) {
      stepRows[row.clientId] = { instruction: "Instruction requise si l'étape est ajoutée." };
      continue;
    }
    steps.push({ instruction });
  }

  if (Object.keys(stepRows).length > 0) {
    errors.stepRows = stepRows;
  }

  const hasErrors =
    errors.title ||
    errors.servings ||
    errors.ingredients ||
    errors.imageUrl ||
    errors.form ||
    (errors.ingredientRows && Object.keys(errors.ingredientRows).length > 0) ||
    (errors.utensilRows && Object.keys(errors.utensilRows).length > 0) ||
    (errors.stepRows && Object.keys(errors.stepRows).length > 0);

  if (hasErrors || servings === null) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      title,
      description: values.description.trim() || null,
      category: values.category || null,
      prepTime,
      cookTime,
      servings,
      imageUrl: values.imageMode === "url" ? values.imageUrl.trim() || null : null,
      ingredients: validIngredients,
      utensils,
      steps,
    },
  };
}
