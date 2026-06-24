import type { ImportedIngredient } from "@/lib/import-recipe-url/types";

const INGREDIENT_PATTERNS = [
  /^(\d+(?:[.,]\d+)?)\s*([a-zA-Zàâäéèêëïîôùûüç%°]+)\s+(?:de\s+|d['’])?(.+)$/iu,
  /^(\d+(?:[.,]\d+)?)\s+(.+)$/u,
];

export function parseIngredientString(raw: string): ImportedIngredient {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) {
    return { name: "", quantity: 1, unit: "" };
  }

  for (const pattern of INGREDIENT_PATTERNS) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    const quantity = Number.parseFloat(match[1].replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      continue;
    }

    if (match.length === 3) {
      return {
        quantity,
        unit: "",
        name: match[2].trim(),
      };
    }

    return {
      quantity,
      unit: match[2].trim(),
      name: match[3].trim(),
    };
  }

  return {
    name: text,
    quantity: 1,
    unit: "",
  };
}
