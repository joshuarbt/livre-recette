export const RECIPE_CATEGORIES = [
  { value: "entree", label: "Entrée" },
  { value: "plat", label: "Plat" },
  { value: "dessert", label: "Dessert" },
  { value: "boisson", label: "Boisson" },
  { value: "snack", label: "Snack" },
] as const;

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]["value"];

export type RecipeListItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  category: string | null;
  servings: number | null;
};

export type RecipeIngredientDetail = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

export type RecipeUtensilDetail = {
  id: string;
  name: string;
};

export type RecipeStepDetail = {
  stepNumber: number;
  instruction: string;
};

export type RecipeDetail = RecipeListItem & {
  description: string | null;
  prepTime: number | null;
  cookTime: number | null;
  createdAt: string;
  ingredients: RecipeIngredientDetail[];
  utensils: RecipeUtensilDetail[];
  steps: RecipeStepDetail[];
};

export type RecipeFormInput = {
  title: string;
  description?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  category?: string;
};

export type RecipeIngredientFormRow = {
  clientId: string;
  name: string;
  quantity: string;
  unit: string;
};

export type RecipeUtensilFormRow = {
  clientId: string;
  name: string;
};

export type RecipeStepFormRow = {
  clientId: string;
  instruction: string;
};

export type CreateRecipeFormValues = {
  title: string;
  description: string;
  category: RecipeCategory | "";
  prepTime: string;
  cookTime: string;
  servings: string;
  imageMode: "url" | "file";
  imageUrl: string;
  imageFile: File | null;
  ingredients: RecipeIngredientFormRow[];
  utensils: RecipeUtensilFormRow[];
  steps: RecipeStepFormRow[];
};

export type CreateRecipeFormErrors = {
  title?: string;
  servings?: string;
  ingredients?: string;
  ingredientRows?: Record<string, { name?: string; quantity?: string; unit?: string }>;
  utensilRows?: Record<string, { name?: string }>;
  stepRows?: Record<string, { instruction?: string }>;
  imageUrl?: string;
  form?: string;
};

export type CreateRecipePayload = {
  title: string;
  description: string | null;
  category: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number;
  imageUrl: string | null;
  ingredients: { name: string; quantity: number; unit: string }[];
  utensils: { name: string }[];
  steps: { instruction: string }[];
};

export type CreateRecipeActionResult =
  | { success: true; id: string }
  | { success: false; errors: CreateRecipeFormErrors };

export type RecipeActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export function formatRecipeServings(servings: number | null): string {
  if (servings === null || servings <= 0) {
    return "—";
  }
  return servings === 1 ? "1 part" : `${servings} parts`;
}

export function getRecipeCategoryLabel(category: string | null): string | null {
  if (!category) {
    return null;
  }
  const match = RECIPE_CATEGORIES.find((item) => item.value === category);
  return match?.label ?? category;
}

export function createEmptyIngredientRow(): RecipeIngredientFormRow {
  return { clientId: crypto.randomUUID(), name: "", quantity: "", unit: "" };
}

export function createEmptyUtensilRow(): RecipeUtensilFormRow {
  return { clientId: crypto.randomUUID(), name: "" };
}

export function createEmptyStepRow(): RecipeStepFormRow {
  return { clientId: crypto.randomUUID(), instruction: "" };
}

export function createDefaultCreateRecipeFormValues(): CreateRecipeFormValues {
  return {
    title: "",
    description: "",
    category: "",
    prepTime: "",
    cookTime: "",
    servings: "",
    imageMode: "url",
    imageUrl: "",
    imageFile: null,
    ingredients: [createEmptyIngredientRow()],
    utensils: [],
    steps: [createEmptyStepRow()],
  };
}
