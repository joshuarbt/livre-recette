"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  addMealToPlanning,
  fetchMealPlanByWeek,
  removeMealFromPlanning,
  updateServings,
} from "@/lib/meal-plan/actions";
import type {
  MealPlanActionResult,
  MealPlanEntry,
  MealType,
  RecipeSummary,
} from "@/types/meal-plan";
import { mealPlanSlotKey } from "@/types/meal-plan";
import { addWeeks, getWeekDates } from "@/utils/week";

type UseMealPlanOptions = {
  userId: string;
  initialWeekStart: string;
  initialEntries: MealPlanEntry[];
  recipes: RecipeSummary[];
};

type UseMealPlanReturn = {
  weekStart: string;
  weekDates: string[];
  entries: MealPlanEntry[];
  entriesBySlot: Map<string, MealPlanEntry>;
  recipes: RecipeSummary[];
  isPending: boolean;
  error: string | null;
  goToPreviousWeek: () => Promise<void>;
  goToNextWeek: () => Promise<void>;
  addMeal: (
    recipeId: string,
    date: string,
    servingsPlanned: number,
    mealType: MealType,
    freezerServingsToUse?: number,
  ) => Promise<MealPlanActionResult>;
  removeMeal: (id: string) => Promise<MealPlanActionResult>;
  updateMealServings: (id: string, servings: number) => Promise<MealPlanActionResult>;
  refreshWeek: () => Promise<void>;
};

export function useMealPlan({
  userId,
  initialWeekStart,
  initialEntries,
  recipes,
}: UseMealPlanOptions): UseMealPlanReturn {
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);

  const entriesBySlot = useMemo(() => {
    const map = new Map<string, MealPlanEntry>();
    for (const entry of entries) {
      map.set(mealPlanSlotKey(entry.date, entry.mealType), entry);
    }
    return map;
  }, [entries]);

  const loadWeek = useCallback(
    (nextWeekStart: string) => {
      startTransition(async () => {
        setError(null);
        const result = await fetchMealPlanByWeek(nextWeekStart);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setWeekStart(result.data.weekStart);
        setEntries(result.data.entries);
      });
    },
    [],
  );

  const goToPreviousWeek = useCallback(async () => {
    loadWeek(addWeeks(weekStart, -1));
  }, [loadWeek, weekStart]);

  const goToNextWeek = useCallback(async () => {
    loadWeek(addWeeks(weekStart, 1));
  }, [loadWeek, weekStart]);

  const refreshWeek = useCallback(async () => {
    loadWeek(weekStart);
  }, [loadWeek, weekStart]);

  const addMeal = useCallback(
    async (
      recipeId: string,
      date: string,
      servingsPlanned: number,
      mealType: MealType,
      freezerServingsToUse?: number,
    ): Promise<MealPlanActionResult> => {
      setError(null);
      const result = await addMealToPlanning(
        userId,
        recipeId,
        date,
        servingsPlanned,
        mealType,
        freezerServingsToUse,
      );

      if (!result.success) {
        setError(result.error);
        return result;
      }

      await refreshWeek();
      return result;
    },
    [refreshWeek, userId],
  );

  const removeMeal = useCallback(
    async (id: string): Promise<MealPlanActionResult> => {
      setError(null);
      const result = await removeMealFromPlanning(id);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setEntries((current) => current.filter((entry) => entry.id !== id));
      return result;
    },
    [],
  );

  const updateMealServings = useCallback(
    async (id: string, servings: number): Promise<MealPlanActionResult> => {
      setError(null);
      const result = await updateServings(id, servings);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setEntries((current) =>
        current.map((entry) =>
          entry.id === id ? { ...entry, servingsPlanned: servings } : entry,
        ),
      );
      return result;
    },
    [],
  );

  return {
    weekStart,
    weekDates,
    entries,
    entriesBySlot,
    recipes,
    isPending,
    error,
    goToPreviousWeek,
    goToNextWeek,
    addMeal,
    removeMeal,
    updateMealServings,
    refreshWeek,
  };
}
