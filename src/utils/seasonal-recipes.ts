import { getLegumesDuMois } from "@/data/legumes-saison";
import { normalizeForSearch } from "@/utils/string-search";

const PARENTHETICAL_SUFFIX_REGEX = /\s*\([^)]*\)\s*$/;

export type SeasonalRecipeCandidate = {
  id: string;
  ingredientNames: string[];
};

export function normalizeLegumeName(name: string): string {
  const withoutParenthetical = name.replace(PARENTHETICAL_SUFFIX_REGEX, "").trim();
  return normalizeForSearch(withoutParenthetical);
}

function ingredientMatchesLegume(ingredient: string, legume: string): boolean {
  const normalizedIngredient = normalizeForSearch(ingredient);
  const normalizedLegume = normalizeLegumeName(legume);

  if (!normalizedIngredient || !normalizedLegume) {
    return false;
  }

  if (
    normalizedIngredient.includes(normalizedLegume) ||
    (normalizedLegume.length >= 4 && normalizedLegume.includes(normalizedIngredient))
  ) {
    return true;
  }

  const legumeTokens = normalizedLegume.split(/\s+/).filter((token) => token.length >= 4);

  return legumeTokens.some((token) => normalizedIngredient.includes(token));
}

export function ingredientMatchesSeasonalVegetable(
  ingredient: string,
  legumes: readonly string[],
): boolean {
  return legumes.some((legume) => ingredientMatchesLegume(ingredient, legume));
}

export function recipeHasSeasonalIngredient(
  ingredientNames: readonly string[],
  mois?: number,
): boolean {
  const legumes = getLegumesDuMois(mois);

  return ingredientNames.some((ingredient) =>
    ingredientMatchesSeasonalVegetable(ingredient, legumes),
  );
}

export function filterSeasonalRecipes<T extends SeasonalRecipeCandidate>(
  recipes: readonly T[],
  mois?: number,
): T[] {
  return recipes.filter((recipe) => recipeHasSeasonalIngredient(recipe.ingredientNames, mois));
}

export function computeSeasonalRecipeIds(
  recipes: readonly SeasonalRecipeCandidate[],
  mois?: number,
): Set<string> {
  return new Set(filterSeasonalRecipes(recipes, mois).map((recipe) => recipe.id));
}
