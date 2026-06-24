"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ShoppingListItemRow } from "@/components/shopping-list/ShoppingListItem";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { useShoppingList } from "@/hooks/useShoppingList";
import { actionIcons } from "@/lib/icons";
import type { ShoppingListData } from "@/types/shopping-list";
import { addWeeks, formatWeekRange } from "@/utils/week";

type ShoppingListProps = {
  userId: string;
  initialWeekStart: string;
  initialList: ShoppingListData | null;
};

function buildCoursesHref(weekStart: string): string {
  return `/courses?week=${weekStart}`;
}

export function ShoppingList({
  userId,
  initialWeekStart,
  initialList,
}: ShoppingListProps) {
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [isToggling, startToggleTransition] = useTransition();

  const {
    weekStart,
    items,
    progress,
    isPending,
    error,
    generateList,
    toggleItem,
  } = useShoppingList({
    userId,
    initialWeekStart,
    initialList,
  });

  function handleGenerate() {
    void generateList();
  }

  function handleToggle(itemId: string, nextChecked: boolean) {
    setToggleError(null);
    startToggleTransition(async () => {
      const result = await toggleItem(itemId, nextChecked);
      if (!result.success) {
        setToggleError(result.error);
      }
    });
  }

  const hasItems = items.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4 md:justify-start">
          <Link
            href={buildCoursesHref(addWeeks(weekStart, -1))}
            className="btn-icon"
            aria-label="Semaine précédente"
          >
            <Icon icon={actionIcons.weekPrev} size="md" />
          </Link>
          <div className="min-w-0 text-center">
            <p className="text-title">{formatWeekRange(weekStart)}</p>
            {hasItems ? (
              <p className="text-caption mt-1 text-[var(--muted)]">
                {progress.checkedCount} / {progress.totalCount} cochés
              </p>
            ) : null}
          </div>
          <Link
            href={buildCoursesHref(addWeeks(weekStart, 1))}
            className="btn-icon"
            aria-label="Semaine suivante"
          >
            <Icon icon={actionIcons.weekNext} size="md" />
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="btn-primary disabled:opacity-60"
          >
            {isPending
              ? "Génération…"
              : hasItems
                ? "Regénérer la liste"
                : "Générer la liste"}
          </button>
        </div>
      </div>

      {!hasItems ? (
        <EmptyState
          message="Aucune liste de courses pour cette semaine."
          description="Planifiez des repas puis générez la liste à partir du planning."
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ShoppingListItemRow
              key={item.id}
              name={item.ingredientName}
              quantity={item.totalQuantity}
              unit={item.unit}
              showQuantity={item.totalQuantity > 0}
              isChecked={item.isChecked}
              disabled={isPending || isToggling}
              onToggle={() => handleToggle(item.id, !item.isChecked)}
            />
          ))}
        </div>
      )}

      {error ? (
        <p role="alert" className="text-status-error text-sm">
          {error}
        </p>
      ) : null}

      {toggleError ? (
        <p role="alert" className="text-status-error text-sm">
          {toggleError}
        </p>
      ) : null}
    </div>
  );
}
