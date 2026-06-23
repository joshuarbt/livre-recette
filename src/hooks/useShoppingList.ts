"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import {
  generateShoppingListAction,
  toggleShoppingListItem,
} from "@/lib/shopping-list/actions";
import type {
  GenerateShoppingListResult,
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
  progress: { checkedCount: number; totalCount: number };
  isPending: boolean;
  error: string | null;
  generateList: () => Promise<GenerateShoppingListResult>;
  toggleItem: (itemId: string, isChecked: boolean) => Promise<ShoppingListActionResult>;
};

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

  const generateListWithTransition = useCallback(async (): Promise<GenerateShoppingListResult> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const result = await generateList();
        resolve(result);
      });
    });
  }, [generateList]);

  return {
    userId,
    weekStart,
    list,
    items,
    progress,
    isPending,
    error,
    generateList: generateListWithTransition,
    toggleItem,
  };
}
