"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Crossfade } from "@/components/layout/motion";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import type { FreezerEntry } from "@/types/freezer";
import { getTotalFreezerServingsForRecipe } from "@/types/freezer";
import type {
  MealPlanEntry,
  MealType,
  RecipeSummary,
} from "@/types/meal-plan";
import { MEAL_TYPE_LABELS, formatServingsLabel } from "@/types/meal-plan";

type AssignMealModalProps = {
  date: string;
  mealType: MealType;
  currentEntry: MealPlanEntry | null;
  recipes: RecipeSummary[];
  freezerEntries?: FreezerEntry[];
  preselectedRecipeId?: string;
  preselectedFromFreezerId?: string;
  onClose: () => void;
  onAssign: (
    recipeId: string,
    servingsPlanned: number,
    freezerServingsToUse?: number,
  ) => Promise<{ success: boolean; error?: string }>;
  onRemove: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateServings: (
    id: string,
    servings: number,
  ) => Promise<{ success: boolean; error?: string }>;
};

export function AssignMealModal({
  date,
  mealType,
  currentEntry,
  recipes,
  freezerEntries = [],
  preselectedRecipeId,
  preselectedFromFreezerId,
  onClose,
  onAssign,
  onRemove,
  onUpdateServings,
}: AssignMealModalProps) {
  const initialRecipeId =
    preselectedRecipeId ?? currentEntry?.recipeId ?? recipes[0]?.id ?? "";

  const [isChanging, setIsChanging] = useState(!currentEntry);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialRecipeId);
  const [servingsInput, setServingsInput] = useState(
    String(currentEntry?.servingsPlanned ?? 2),
  );
  const [useFreezer, setUseFreezer] = useState(Boolean(preselectedFromFreezerId));
  const [freezerServingsInput, setFreezerServingsInput] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formattedDate = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));

  const title =
    currentEntry && !isChanging ? "Repas planifié" : "Planifier un repas";
  const contentKey = currentEntry && !isChanging ? "view" : "assign";

  const recipesById = useMemo(() => {
    const map = new Map<string, RecipeSummary>();
    for (const recipe of recipes) {
      map.set(recipe.id, recipe);
    }
    return map;
  }, [recipes]);

  const selectedRecipe = selectedRecipeId
    ? recipesById.get(selectedRecipeId) ?? null
    : null;

  const freezerStockForRecipe = useMemo(
    () => getTotalFreezerServingsForRecipe(freezerEntries, selectedRecipeId),
    [freezerEntries, selectedRecipeId],
  );

  const plannedServings = parseServingsInput(servingsInput);
  const maxFreezerServings =
    plannedServings !== null
      ? Math.min(freezerStockForRecipe, plannedServings)
      : freezerStockForRecipe;

  useEffect(() => {
    if (!preselectedFromFreezerId || !selectedRecipeId) {
      return;
    }

    const entry = freezerEntries.find((item) => item.id === preselectedFromFreezerId);
    if (entry && entry.recipeId === selectedRecipeId) {
      setUseFreezer(true);
      const servings = parseServingsInput(servingsInput) ?? 1;
      setFreezerServingsInput(String(Math.min(entry.servingsCount, servings)));
    }
  }, [freezerEntries, preselectedFromFreezerId, selectedRecipeId, servingsInput]);

  useEffect(() => {
    if (freezerStockForRecipe === 0) {
      setUseFreezer(false);
      return;
    }

    const parsedFreezer = parseFreezerServingsInput(freezerServingsInput);
    if (parsedFreezer !== null && parsedFreezer > maxFreezerServings) {
      setFreezerServingsInput(String(maxFreezerServings));
    }
  }, [freezerStockForRecipe, freezerServingsInput, maxFreezerServings]);

  function parseServingsInput(value = servingsInput): number | null {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  function parseFreezerServingsInput(value = freezerServingsInput): number | null {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return null;
    }
    return parsed;
  }

  function handleAssign() {
    if (!selectedRecipeId) {
      setError("Sélectionnez une recette.");
      return;
    }

    const servings = parseServingsInput();
    if (servings === null) {
      setError("Indiquez un nombre de parts valide.");
      return;
    }

    let freezerServingsToUse: number | undefined;
    if (useFreezer && freezerStockForRecipe > 0) {
      const freezerServings = parseFreezerServingsInput();
      if (freezerServings === null) {
        setError("Indiquez un nombre de parts congélateur valide.");
        return;
      }

      if (freezerServings > maxFreezerServings) {
        setError("Stock congélateur insuffisant pour ce repas.");
        return;
      }

      freezerServingsToUse = freezerServings;
    }

    setError(null);
    startTransition(async () => {
      const result = await onAssign(selectedRecipeId, servings, freezerServingsToUse);
      if (!result.success) {
        setError(result.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      onClose();
    });
  }

  function handleUpdateServings() {
    if (!currentEntry) {
      return;
    }

    const servings = parseServingsInput();
    if (servings === null) {
      setError("Indiquez un nombre de parts valide.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onUpdateServings(currentEntry.id, servings);
      if (!result.success) {
        setError(result.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      onClose();
    });
  }

  function handleRemove() {
    if (!currentEntry) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await onRemove(currentEntry.id);
      if (!result.success) {
        setError(result.error ?? "Erreur lors de la suppression.");
        return;
      }
      onClose();
    });
  }

  const footer = (
    <div className="space-y-3">
      {currentEntry && !isChanging ? (
        <div className="flex flex-wrap justify-center gap-4 md:justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setIsChanging(true);
              setSelectedRecipeId(currentEntry.recipeId);
              setServingsInput(String(currentEntry.servingsPlanned));
              setError(null);
            }}
            className="btn-ghost text-sm disabled:opacity-60"
          >
            Changer de recette
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleUpdateServings}
            className="btn-ghost text-sm disabled:opacity-60"
          >
            Mettre à jour les parts
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleRemove}
            className="btn-ghost text-sm text-[var(--status-error)] disabled:opacity-60"
          >
            Supprimer
          </button>
        </div>
      ) : (
        <>
          {currentEntry ? (
            <div className="flex justify-center md:justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setIsChanging(false);
                  setSelectedRecipeId(currentEntry.recipeId);
                  setServingsInput(String(currentEntry.servingsPlanned));
                  setError(null);
                }}
                className="btn-ghost text-sm disabled:opacity-60"
              >
                Annuler
              </button>
            </div>
          ) : null}
          <button
            type="button"
            disabled={isPending || recipes.length === 0}
            onClick={handleAssign}
            className="btn-primary w-full disabled:opacity-60 md:w-auto md:self-end"
          >
            {isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </>
      )}
    </div>
  );

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={title}
      titleId="assign-meal-title"
      footer={footer}
      className="rounded-t-xl md:rounded-sm"
    >
      <p className="text-sm text-[var(--muted)]">
        {formattedDate} · {MEAL_TYPE_LABELS[mealType]}
      </p>

      <Crossfade contentKey={contentKey}>
        {currentEntry && !isChanging ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <p className="text-overline">Recette planifiée</p>
              <p className="text-title text-[var(--foreground)]">
                {currentEntry.recipeTitle}
              </p>
              <p className="text-caption">
                {formatServingsLabel(currentEntry.servingsPlanned)} prévues
              </p>
            </div>
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
          </div>
        ) : (
          <>
            {!currentEntry ? (
              <p className="mt-6 text-sm text-[var(--muted)]">
                Aucun repas planifié pour ce créneau.
              </p>
            ) : null}

            {recipes.length === 0 ? (
              <div className="mt-6">
                <EmptyState message="Créez d'abord une recette avant de planifier un repas." />
              </div>
            ) : (
              <div className="mt-6 space-y-4">
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

                {freezerStockForRecipe > 0 ? (
                  <div className="space-y-3 rounded-sm border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3">
                    <p className="text-overline">Prendre du congélateur</p>
                    <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useFreezer}
                        disabled={isPending}
                        onChange={(event) => setUseFreezer(event.target.checked)}
                        className="shrink-0"
                      />
                      <span className="text-sm">
                        Utiliser {formatServingsLabel(freezerStockForRecipe)} disponibles
                      </span>
                    </label>
                    {useFreezer ? (
                      <label className="block space-y-2">
                        <span className="text-caption">Parts du congélateur</span>
                        <input
                          type="number"
                          min={1}
                          max={maxFreezerServings}
                          value={freezerServingsInput}
                          disabled={isPending}
                          onChange={(event) => setFreezerServingsInput(event.target.value)}
                          className="w-full border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-sm"
                        />
                      </label>
                    ) : null}
                  </div>
                ) : null}

                <ul className="max-h-60 divide-y divide-[var(--border-hairline)] overflow-y-auto">
                  {recipes.map((recipe) => (
                    <li key={recipe.id}>
                      <label className="flex min-h-[var(--touch-min)] cursor-pointer items-center gap-3 py-3 transition-opacity active:opacity-70">
                        <input
                          type="radio"
                          name="recipe"
                          value={recipe.id}
                          checked={selectedRecipeId === recipe.id}
                          disabled={isPending}
                          onChange={() => setSelectedRecipeId(recipe.id)}
                          className="shrink-0"
                        />
                        <span className="min-w-0 flex-1 text-sm text-[var(--foreground)]">
                          {recipe.title}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>

                {selectedRecipe ? (
                  <p className="text-caption text-[var(--muted)]">
                    {selectedRecipe.title} sera planifiée
                    {parseServingsInput() !== null
                      ? ` en ${formatServingsLabel(parseServingsInput()!)}`
                      : ""}
                    {useFreezer && parseFreezerServingsInput() !== null
                      ? ` (${formatServingsLabel(parseFreezerServingsInput()!)} du congélateur)`
                      : ""}
                    .
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </Crossfade>

      {error ? (
        <p role="alert" className="text-status-error mt-4 text-sm">
          {error}
        </p>
      ) : null}
    </BottomSheet>
  );
}
