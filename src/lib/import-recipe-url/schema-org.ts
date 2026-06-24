import { mapRecipeCategory } from "@/lib/import-recipe-url/category";
import { parseIso8601DurationToMinutes } from "@/lib/import-recipe-url/duration";
import { parseIngredientString } from "@/lib/import-recipe-url/ingredient";
import type { ImportedRecipeData } from "@/lib/import-recipe-url/types";
import type { CheerioAPI } from "cheerio";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRecipeType(typeValue: unknown): boolean {
  if (typeof typeValue === "string") {
    return typeValue.toLowerCase().includes("recipe");
  }

  if (Array.isArray(typeValue)) {
    return typeValue.some((item) => isRecipeType(item));
  }

  return false;
}

function collectJsonLdNodes(value: unknown, nodes: Record<string, unknown>[]): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdNodes(item, nodes));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (Array.isArray(value["@graph"])) {
    collectJsonLdNodes(value["@graph"], nodes);
  }

  if (isRecipeType(value["@type"])) {
    nodes.push(value);
  }
}

function extractImageUrl(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const url = extractImageUrl(item);
      if (url) {
        return url;
      }
    }
    return null;
  }

  if (isRecord(value) && typeof value.url === "string" && value.url.trim()) {
    return value.url.trim();
  }

  return null;
}

function extractStrings(value: unknown): string[] {
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractStrings(item));
  }

  if (isRecord(value)) {
    if (typeof value.text === "string" && value.text.trim()) {
      return [value.text.trim()];
    }
    if (typeof value.name === "string" && value.name.trim()) {
      return [value.name.trim()];
    }
  }

  return [];
}

function extractYield(value: unknown): number | null {
  const strings = extractStrings(value);
  for (const item of strings) {
    const match = item.match(/(\d+)/);
    if (match) {
      const parsed = Number.parseInt(match[1], 10);
      if (parsed > 0) {
        return parsed;
      }
    }
  }
  return null;
}

function recipeNodeToData(node: Record<string, unknown>): ImportedRecipeData | null {
  const title = typeof node.name === "string" ? node.name.trim() : "";
  if (!title) {
    return null;
  }

  const ingredients = extractStrings(node.recipeIngredient)
    .map(parseIngredientString)
    .filter((ingredient) => ingredient.name);

  const steps = extractStrings(node.recipeInstructions).filter(Boolean);

  return {
    title,
    description:
      typeof node.description === "string" && node.description.trim()
        ? node.description.trim()
        : null,
    category: mapRecipeCategory(node.recipeCategory),
    prepTime: parseIso8601DurationToMinutes(node.prepTime),
    cookTime: parseIso8601DurationToMinutes(node.cookTime),
    servings: extractYield(node.recipeYield),
    imageUrl: extractImageUrl(node.image),
    ingredients,
    steps,
  };
}

export function extractSchemaOrgRecipe($: CheerioAPI): ImportedRecipeData | null {
  const recipeNodes: Record<string, unknown>[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()?.trim();
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      collectJsonLdNodes(parsed, recipeNodes);
    } catch {
      // ignore invalid JSON-LD blocks
    }
  });

  for (const node of recipeNodes) {
    const recipe = recipeNodeToData(node);
    if (recipe) {
      return recipe;
    }
  }

  return null;
}
