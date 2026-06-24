import { RECIPE_CATEGORIES, type RecipeCategory } from "@/types/recipes";

const CATEGORY_ALIASES: Record<string, RecipeCategory> = {
  "petit-dejeuner": "petit-dejeuner",
  "petit dejeuner": "petit-dejeuner",
  "petit-déjeuner": "petit-dejeuner",
  "petit déjeuner": "petit-dejeuner",
  breakfast: "petit-dejeuner",
  entree: "entree",
  entrée: "entree",
  appetizer: "entree",
  starter: "entree",
  plat: "plat",
  "plat principal": "plat",
  "main course": "plat",
  main: "plat",
  dessert: "dessert",
  boisson: "boisson",
  drink: "boisson",
  beverage: "boisson",
  snack: "snack",
  goûter: "snack",
  gouter: "snack",
};

function normalizeCategoryKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function mapRecipeCategory(value: unknown): RecipeCategory | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const normalized = normalizeCategoryKey(value);
  const alias = CATEGORY_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  const match = RECIPE_CATEGORIES.find(
    (category) =>
      normalizeCategoryKey(category.label) === normalized ||
      category.value === normalized,
  );

  return match?.value ?? null;
}
