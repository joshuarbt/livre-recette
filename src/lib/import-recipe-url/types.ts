import type { CreateRecipeFormValues } from "@/types/recipes";

export type ImportedIngredient = {
  name: string;
  quantity: number;
  unit: string;
};

export type ImportedRecipeData = {
  title: string;
  description: string | null;
  category: string | null;
  prepTime: number | null;
  cookTime: number | null;
  servings: number | null;
  imageUrl: string | null;
  ingredients: ImportedIngredient[];
  steps: string[];
};

export type SerializableFormValues = Omit<CreateRecipeFormValues, "imageFile"> & {
  imageFile: null;
};

export type ImportRecipeUrlSuccess = {
  success: true;
  partial: boolean;
  data: SerializableFormValues;
};

export type ImportRecipeUrlError = {
  success: false;
  error: string;
};

export type ImportRecipeUrlResponse = ImportRecipeUrlSuccess | ImportRecipeUrlError;

export const IMPORT_RECIPE_URL_ERRORS = {
  invalidUrl: "URL non valide",
  siteUnreachable: "Impossible d'accéder à ce site",
  notFound:
    "Aucune recette trouvée sur cette page. Essayez de copier l'URL de la page de la recette directement.",
} as const;

export const RECIPE_URL_IMPORT_STORAGE_KEY = "recipe-url-import";

export type RecipeUrlImportSession = {
  values: SerializableFormValues;
  partial: boolean;
};
