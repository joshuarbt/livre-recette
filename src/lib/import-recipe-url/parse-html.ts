import { extractHtmlFallbackRecipe } from "@/lib/import-recipe-url/html-fallback";
import { extractSchemaOrgRecipe } from "@/lib/import-recipe-url/schema-org";
import type { ImportedRecipeData } from "@/lib/import-recipe-url/types";
import * as cheerio from "cheerio";

export function parseRecipeHtml(html: string): ImportedRecipeData | null {
  const $ = cheerio.load(html);

  const schemaRecipe = extractSchemaOrgRecipe($);
  if (schemaRecipe) {
    return schemaRecipe;
  }

  return extractHtmlFallbackRecipe($);
}

export function isPartialImport(data: ImportedRecipeData): boolean {
  return (
    !data.title.trim() ||
    data.ingredients.length === 0 ||
    data.steps.length === 0 ||
    data.servings === null ||
    data.servings <= 0
  );
}
