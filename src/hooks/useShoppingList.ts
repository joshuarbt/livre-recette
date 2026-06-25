"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  addManualItemAction,
  addRecipeToListAction,
  clearListAction,
  generateShoppingListAction,
  removeShoppingListItemAction,
  toggleShoppingListItem,
} from "@/lib/shopping-list/actions";
import type {
  GenerateShoppingListResult,
  MutateShoppingListResult,
  ShoppingListActionResult,
  ShoppingListData,
  ShoppingListItem,
} from "@/types/shopping-list";
import { computeShoppingProgress } from "@/types/shopping-list";

type UseShoppingListOptions = {
  userId: string;
  initialWeekStart: string;
  initialList: ShoppingListData | null;
};

type UseShoppingListReturn = {
  userId: string;
  weekStart: string;
  list: ShoppingListData | null;
  items: ShoppingListItem[];
  planningItems: ShoppingListItem[];
  manualItems: ShoppingListItem[];
  progress: { checkedCount: number; totalCount: number };
  isPending: boolean;
  error: string | null;
  generateList: () => Promise<GenerateShoppingListResult>;
  toggleItem: (itemId: string, isChecked: boolean) => Promise<ShoppingListActionResult>;
  addManualItem: (
    name: string,
    quantity?: number,
    unit?: string,
  ) => Promise<MutateShoppingListResult>;
  addRecipeToList: (recipeId: string, servings: number) => Promise<MutateShoppingListResult>;
  clearList: (onlyChecked: boolean) => Promise<MutateShoppingListResult>;
  removeItem: (itemId: string) => Promise<MutateShoppingListResult>;
};

function wrapTransition<T>(
  startTransition: (callback: () => void) => void,
  action: () => Promise<T>,
): Promise<T> {
  return new Promise((resolve) => {
    startTransition(async () => {
      const result = await action();
      resolve(result);
    });
  });
}

export function useShoppingList({
  userId,
  initialWeekStart,
  initialList,
}: UseShoppingListOptions): UseShoppingListReturn {
  const [weekStart] = useState(initialWeekStart);
  const [list, setList] = useState(initialList);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const items = list?.items ?? [];

  const planningItems = useMemo(
    () => items.filter((item) => !item.isManual),
    [items],
  );

  const manualItems = useMemo(
    () => items.filter((item) => item.isManual),
    [items],
  );

  const progress = useMemo(() => computeShoppingProgress(items), [items]);

  const generateList = useCallback(async (): Promise<GenerateShoppingListResult> => {
    setError(null);
    const result = await generateShoppingListAction(weekStart);

    if (!result.success) {
      setError(result.error);
      return result;
    }

    setList(result.data);
    return result;
  }, [weekStart]);

  const toggleItem = useCallback(
    async (itemId: string, isChecked: boolean): Promise<ShoppingListActionResult> => {
      const previousList = list;
      setError(null);

      setList((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.map((item) =>
            item.id === itemId ? { ...item, isChecked } : item,
          ),
        };
      });

      const result = await toggleShoppingListItem(itemId, isChecked);

      if (!result.success) {
        setError(result.error);
        setList(previousList);
        return result;
      }

      return result;
    },
    [list],
  );

  const addManualItem = useCallback(
    async (
      name: string,
      quantity?: number,
      unit?: string,
    ): Promise<MutateShoppingListResult> => {
      setError(null);
      const result = await addManualItemAction(weekStart, name, quantity, unit);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setList(result.data);
      return result;
    },
    [weekStart],
  );

  const addRecipeToList = useCallback(
    async (recipeId: string, servings: number): Promise<MutateShoppingListResult> => {
      setError(null);
      const result = await addRecipeToListAction(weekStart, recipeId, servings);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      setList(result.data);
      return result;
    },
    [weekStart],
  );

  const clearList = useCallback(
    async (onlyChecked: boolean): Promise<MutateShoppingListResult> => {
      const previousList = list;
      setError(null);

      if (onlyChecked) {
        setList((current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            items: current.items.filter((item) => !item.isChecked),
          };
        });
      } else {
        setList((current) => (current ? { ...current, items: [] } : current));
      }

      const result = await clearListAction(weekStart, onlyChecked);

      if (!result.success) {
        setError(result.error);
        setList(previousList);
        return result;
      }

      setList(result.data);
      return result;
    },
    [list, weekStart],
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<MutateShoppingListResult> => {
      const previousList = list;
      setError(null);

      setList((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          items: current.items.filter((item) => item.id !== itemId),
        };
      });

      const result = await removeShoppingListItemAction(itemId);

      if (!result.success) {
        setError(result.error);
        setList(previousList);
        return result;
      }

      setList(result.data);
      return result;
    },
    [list],
  );

  return {
    userId,
    weekStart,
    list,
    items,
    planningItems,
    manualItems,
    progress,
    isPending,
    error,
    generateList: () => wrapTransition(startTransition, generateList),
    toggleItem,
    addManualItem: (name, quantity, unit) =>
      wrapTransition(startTransition, () => addManualItem(name, quantity, unit)),
    addRecipeToList: (recipeId, servings) =>
      wrapTransition(startTransition, () => addRecipeToList(recipeId, servings)),
    clearList: (onlyChecked) =>
      wrapTransition(startTransition, () => clearList(onlyChecked)),
    removeItem: (itemId) => wrapTransition(startTransition, () => removeItem(itemId)),
  };
}
