"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import {
  addFreezerEntry,
  adjustFreezerServings,
  deleteFreezerEntry,
} from "@/lib/freezer/actions";
import type {
  FreezerActionResult,
  FreezerEntry,
  FreezerInventoryData,
} from "@/types/freezer";
import { getExpiryStatus, isExpiringSoon } from "@/utils/expiry";

type UseFreezerInventoryOptions = {
  userId: string;
  initialData: FreezerInventoryData;
};

type UseFreezerInventoryReturn = {
  entries: FreezerEntry[];
  expiringCount: number;
  totalServings: number;
  isPending: boolean;
  error: string | null;
  addEntry: (
    recipeId: string,
    servingsCount: number,
    expiryDate?: string,
    notes?: string,
  ) => Promise<FreezerActionResult>;
  adjustServings: (entryId: string, delta: number) => Promise<FreezerActionResult>;
  removeEntry: (entryId: string) => Promise<FreezerActionResult>;
};

function buildInventoryData(entries: FreezerEntry[]): FreezerInventoryData {
  return {
    entries,
    totalServings: entries.reduce((sum, entry) => sum + entry.servingsCount, 0),
    expiringCount: entries.filter((entry) => isExpiringSoon(entry.expiryDate)).length,
  };
}

function mapEntryWithExpiry(entry: FreezerEntry): FreezerEntry {
  const { status, daysUntilExpiry } = getExpiryStatus(entry.expiryDate);
  return { ...entry, expiryStatus: status, daysUntilExpiry: daysUntilExpiry };
}

export function useFreezerInventory({
  userId,
  initialData,
}: UseFreezerInventoryOptions): UseFreezerInventoryReturn {
  const router = useRouter();
  const [entries, setEntries] = useState(initialData.entries);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const inventory = useMemo(() => buildInventoryData(entries), [entries]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const addEntry = useCallback(
    async (
      recipeId: string,
      servingsCount: number,
      expiryDate?: string,
      notes?: string,
    ): Promise<FreezerActionResult> => {
      setError(null);
      const result = await addFreezerEntry(recipeId, servingsCount, expiryDate, notes);

      if (!result.success) {
        setError(result.error);
        return result;
      }

      startTransition(() => {
        refresh();
      });
      return result;
    },
    [refresh],
  );

  const adjustServings = useCallback(
    async (entryId: string, delta: number): Promise<FreezerActionResult> => {
      const previousEntries = entries;
      setError(null);

      setEntries((current) => {
        const next = current
          .map((entry) => {
            if (entry.id !== entryId) {
              return entry;
            }
            const nextCount = entry.servingsCount + delta;
            if (nextCount <= 0) {
              return null;
            }
            return mapEntryWithExpiry({ ...entry, servingsCount: nextCount });
          })
          .filter((entry): entry is FreezerEntry => entry !== null);

        return next;
      });

      const result = await adjustFreezerServings(entryId, delta);

      if (!result.success) {
        setError(result.error);
        setEntries(previousEntries);
        return result;
      }

      startTransition(() => {
        refresh();
      });
      return result;
    },
    [entries, refresh],
  );

  const removeEntry = useCallback(
    async (entryId: string): Promise<FreezerActionResult> => {
      const previousEntries = entries;
      setError(null);

      setEntries((current) => current.filter((entry) => entry.id !== entryId));

      const result = await deleteFreezerEntry(entryId);

      if (!result.success) {
        setError(result.error);
        setEntries(previousEntries);
        return result;
      }

      startTransition(() => {
        refresh();
      });
      return result;
    },
    [entries, refresh],
  );

  return {
    entries: inventory.entries,
    expiringCount: inventory.expiringCount,
    totalServings: inventory.totalServings,
    isPending,
    error,
    addEntry,
    adjustServings,
    removeEntry,
  };
}
