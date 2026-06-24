import { parseIngredientString } from "@/lib/import-recipe-url/ingredient";
import type { ImportedRecipeData } from "@/lib/import-recipe-url/types";
import type { CheerioAPI } from "cheerio";

const INGREDIENT_SELECTORS = [
  '[class*="ingredient" i] li',
  '[id*="ingredient" i] li',
  '[class*="Ingredient" i] li',
  "ul li",
];

const STEP_SELECTORS = [
  '[class*="instruction" i] li',
  '[class*="step" i] li',
  '[id*="instruction" i] li',
  "ol li",
];

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function collectText($: CheerioAPI, selectors: string[]): string[] {
  const values: string[] = [];

  for (const selector of selectors) {
    $(selector).each((_, element) => {
      const text = $(element).text().trim().replace(/\s+/g, " ");
      if (text.length >= 3) {
        values.push(text);
      }
    });

    if (values.length >= 3) {
      break;
    }
  }

  return uniqueStrings(values);
}

export function extractHtmlFallbackRecipe($: CheerioAPI): ImportedRecipeData | null {
  const title =
    $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.trim() ||
    "";

  if (!title) {
    return null;
  }

  const description =
    $('meta[property="og:description"]').attr("content")?.trim() ||
    $('meta[name="description"]').attr("content")?.trim() ||
    null;

  const imageUrl = $('meta[property="og:image"]').attr("content")?.trim() || null;
  const ingredientLines = collectText($, INGREDIENT_SELECTORS);
  const stepLines = collectText($, STEP_SELECTORS);

  const ingredients = ingredientLines.map(parseIngredientString).filter((item) => item.name);
  const steps = stepLines.length > 0 ? stepLines : [];

  if (ingredients.length === 0 && steps.length === 0 && !description) {
    return null;
  }

  return {
    title,
    description,
    category: null,
    prepTime: null,
    cookTime: null,
    servings: null,
    imageUrl,
    ingredients,
    steps,
  };
}
