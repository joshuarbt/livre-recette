"use client";

import { useState, useTransition } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RecipeSummary } from "@/types/meal-plan";

type AddFreezerEntrySheetProps = {
  open: boolean;
  recipes: RecipeSummary[];
  onClose: () => void;
  onAdd: (
    recipeId: string,
    servingsCount: number,
    expiryDate?: string,
    notes?: string,
  ) => Promise<{ success: boolean; error?: string }>;
};

export function AddFreezerEntrySheet({
  open,
  recipes,
  onClose,
  onAdd,
}: AddFreezerEntrySheetProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? "");
  const [servingsInput, setServingsInput] = useState("2");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return null;
  }

  function parseServings(): number | null {
    const value = Number(servingsInput);
    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }
    return value;
  }

  function handleSubmit() {
    if (!selectedRecipeId) {
      setError("Sélectionnez une recette.");
      return;
    }

    const servings = parseServings();
    if (servings === null) {
      setError("Indiquez un nombre de parts valide.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onAdd(
        selectedRecipeId,
        servings,
        expiryDate || undefined,
        notes || undefined,
      );

      if (!result.success) {
        setError(result.error ?? "Erreur lors de l'ajout.");
        return;
      }

      setServingsInput("2");
      setExpiryDate("");
      setNotes("");
      onClose();
    });
  }

  const footer = (
    <button
      type="button"
      disabled={isPending || recipes.length === 0}
      onClick={handleSubmit}
      className="btn-primary w-full disabled:opacity-60 md:w-auto md:self-end"
    >
      {isPending ? "Ajout…" : "Ajouter au congélateur"}
    </button>
  );

  return (
    <BottomSheet
      open
      onClose={onClose}
      title="Ajouter au congélateur"
      titleId="add-freezer-title"
      footer={footer}
      className="rounded-t-xl md:rounded-sm"
    >
      {recipes.length === 0 ? (
        <EmptyState message="Créez d'abord une recette pour remplir le congélateur." />
      ) : (
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-caption">Nombre de parts</span>
            <input
              type="number"
              min={1}
              value={servingsInput}
              disabled={isPending}
              onChange={(event) => setServingsInput(event.target.value)}
              className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-caption">Date d&apos;expiration (optionnel)</span>
            <input
              type="date"
              value={expiryDate}
              disabled={isPending}
              onChange={(event) => setExpiryDate(event.target.value)}
              className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-caption">Notes (optionnel)</span>
            <textarea
              value={notes}
              disabled={isPending}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
            />
          </label>

          <div className="space-y-2">
            <span className="text-caption">Recette</span>
            <ul className="max-h-48 divide-y divide-[var(--border-hairline)] overflow-y-auto border border-[var(--border-subtle)]">
              {recipes.map((recipe) => (
                <li key={recipe.id}>
                  <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 px-3 py-2 transition-opacity active:opacity-70">
                    <input
                      type="radio"
                      name="freezer-recipe"
                      value={recipe.id}
                      checked={selectedRecipeId === recipe.id}
                      disabled={isPending}
                      onChange={() => setSelectedRecipeId(recipe.id)}
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1 text-sm">{recipe.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error ? (
        <p role="alert" className="text-status-error mt-4 text-sm">
          {error}
        </p>
      ) : null}
    </BottomSheet>
  );
}
