"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { AddRecipeToListModal } from "@/components/shopping-list/AddRecipeToListModal";
import { ShoppingListItemRow } from "@/components/shopping-list/ShoppingListItem";
import { ShoppingListManualAddForm } from "@/components/shopping-list/ShoppingListManualAddForm";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";
import type { RecipeForShopping, ShoppingListItem } from "@/types/shopping-list";
import { addWeeks, formatWeekRange } from "@/utils/week";

type ShoppingListProps = {
  weekStart: string;
  recipes: RecipeForShopping[];
  planningItems: ShoppingListItem[];
  manualItems: ShoppingListItem[];
  progress: { checkedCount: number; totalCount: number };
  isPending: boolean;
  error: string | null;
  onGenerate: () => void;
  onToggle: (
    itemId: string,
    nextChecked: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (itemId: string) => void;
  onAddManual: (name: string, quantity?: number, unit?: string) => Promise<{ success: boolean }>;
  onAddRecipes: (
    selections: { recipeId: string; servings: number }[],
  ) => Promise<{ success: boolean }>;
};

function buildCoursesHref(weekStart: string): string {
  return `/courses?week=${weekStart}`;
}

function ItemSection({
  title,
  items,
  isPending,
  isToggling,
  onToggle,
  onRemove,
}: {
  title: string;
  items: ShoppingListItem[];
  isPending: boolean;
  isToggling: boolean;
  onToggle: (
    itemId: string,
    nextChecked: boolean,
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (itemId: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h3 className="text-overline">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <ShoppingListItemRow
            key={item.id}
            name={item.ingredientName}
            quantity={item.totalQuantity}
            unit={item.unit}
            isManual={item.isManual}
            showQuantity={item.totalQuantity > 0}
            isChecked={item.isChecked}
            disabled={isPending || isToggling}
            onToggle={() => onToggle(item.id, !item.isChecked)}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </div>
    </section>
  );
}

export function ShoppingList({
  weekStart,
  recipes,
  planningItems,
  manualItems,
  progress,
  isPending,
  error,
  onGenerate,
  onToggle,
  onRemove,
  onAddManual,
  onAddRecipes,
}: ShoppingListProps) {
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [isToggling, startToggleTransition] = useTransition();

  const hasItems = planningItems.length > 0 || manualItems.length > 0;

  function handleToggle(
    itemId: string,
    nextChecked: boolean,
  ): Promise<{ success: boolean; error?: string }> {
    setToggleError(null);
    return new Promise((resolve) => {
      startToggleTransition(async () => {
        const result = await onToggle(itemId, nextChecked);
        if (!result.success) {
          setToggleError(result.error ?? "Erreur lors de la mise à jour.");
        }
        resolve(result);
      });
    });
  }

  async function handleAddRecipes(
    selections: { recipeId: string; servings: number }[],
  ): Promise<{ success: boolean }> {
    return onAddRecipes(selections);
  }

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

        <button
          type="button"
          onClick={onGenerate}
          disabled={isPending}
          className="btn-primary disabled:opacity-60"
        >
          {isPending ? "Génération…" : hasItems ? "Regénérer la liste" : "Générer la liste"}
        </button>
      </div>

      <div className="space-y-3 rounded-sm border border-[var(--border-subtle)] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
          <ShoppingListManualAddForm disabled={isPending} onAdd={onAddManual} />
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRecipeModalOpen(true)}
            className="btn-ghost shrink-0 whitespace-nowrap text-sm"
          >
            <Icon icon={actionIcons.add} size="sm" className="mr-1 inline" />
            Ajouter une recette
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)]" />

      {!hasItems ? (
        <p className="text-caption text-center text-[var(--muted)]">
          Aucun article pour le moment. Ajoutez-en manuellement ou générez la liste depuis le planning.
        </p>
      ) : (
        <div className="space-y-6">
          <ItemSection
            title="Depuis le planning"
            items={planningItems}
            isPending={isPending}
            isToggling={isToggling}
            onToggle={handleToggle}
            onRemove={onRemove}
          />
          <ItemSection
            title="Ajouts manuels"
            items={manualItems}
            isPending={isPending}
            isToggling={isToggling}
            onToggle={handleToggle}
            onRemove={onRemove}
          />
        </div>
      )}

      <AddRecipeToListModal
        open={recipeModalOpen}
        recipes={recipes}
        disabled={isPending}
        onClose={() => setRecipeModalOpen(false)}
        onAdd={handleAddRecipes}
      />

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
