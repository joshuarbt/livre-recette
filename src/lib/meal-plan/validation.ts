import type { MealType } from "@/types/meal-plan";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const MEAL_TYPES = new Set<MealType>(["breakfast", "lunch", "dinner"]);

export function parsePlanDate(value: string): string | null {
  if (!DATE_REGEX.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
}

export function parseMealType(value: string): MealType | null {
  if (MEAL_TYPES.has(value as MealType)) {
    return value as MealType;
  }

  return null;
}

export function parseServings(value: number): number | null {
  if (!Number.isInteger(value) || value <= 0) {
    return null;
  }

  return value;
}
