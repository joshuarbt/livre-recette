"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RecipeForShopping } from "@/types/shopping-list";

type SelectedRecipe = {
  recipeId: string;
  servings: string;
};

type AddRecipeToListModalProps = {
  open: boolean;
  recipes: RecipeForShopping[];
  disabled?: boolean;
  onClose: () => void;
  onAdd: (selections: { recipeId: string; servings: number }[]) => Promise<{ success: boolean }>;
};

function defaultServings(recipe: RecipeForShopping): string {
  return String(recipe.servings && recipe.servings > 0 ? recipe.servings : 2);
}

export function AddRecipeToListModal({
  open,
  recipes,
  disabled = false,
  onClose,
  onAdd,
}: AddRecipeToListModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, SelectedRecipe>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRecipes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.title.toLocaleLowerCase("fr").includes(term));
  }, [recipes, search]);

  function toggleRecipe(recipe: RecipeForShopping) {
    setSelected((current) => {
      const next = { ...current };
      if (next[recipe.id]) {
        delete next[recipe.id];
      } else {
        next[recipe.id] = {
          recipeId: recipe.id,
          servings: defaultServings(recipe),
        };
      }
      return next;
    });
  }

  function updateServings(recipeId: string, servings: string) {
    setSelected((current) => {
      const existing = current[recipeId];
      if (!existing) {
        return current;
      }

      return {
        ...current,
        [recipeId]: { ...existing, servings },
      };
    });
  }

  async function handleSubmit() {
    setError(null);
    const selections = Object.values(selected);

    if (selections.length === 0) {
      setError("Sélectionnez au moins une recette.");
      return;
    }

    const parsedSelections: { recipeId: string; servings: number }[] = [];

    for (const selection of selections) {
      const servings = Number(selection.servings);
      if (!Number.isInteger(servings) || servings <= 0) {
        setError("Indiquez un nombre de parts valide pour chaque recette.");
        return;
      }

      parsedSelections.push({
        recipeId: selection.recipeId,
        servings,
      });
    }

    setIsSubmitting(true);
    const result = await onAdd(parsedSelections);
    setIsSubmitting(false);

    if (result.success) {
      setSelected({});
      setSearch("");
      onClose();
    }
  }

  function handleClose() {
    if (isSubmitting) {
      return;
    }
    setError(null);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title="Ajouter une recette"
      footer={
        <button
          type="button"
          disabled={disabled || isSubmitting}
          onClick={() => void handleSubmit()}
          className="btn-primary w-full disabled:opacity-60"
        >
          {isSubmitting ? "Ajout…" : "Ajouter à la liste"}
        </button>
      }
    >
      <div className="space-y-4">
        <input
          type="search"
          value={search}
          disabled={disabled || isSubmitting}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field"
          placeholder="Rechercher une recette…"
        />

        {filteredRecipes.length === 0 ? (
          <EmptyState message="Aucune recette trouvée." />
        ) : (
          <ul className="max-h-[50vh] space-y-2 overflow-y-auto">
            {filteredRecipes.map((recipe) => {
              const isSelected = Boolean(selected[recipe.id]);
              const servingsValue = selected[recipe.id]?.servings ?? defaultServings(recipe);

              return (
                <li
                  key={recipe.id}
                  className="rounded-sm border border-[var(--border-hairline)] p-3"
                >
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled || isSubmitting}
                      onChange={() => toggleRecipe(recipe)}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="text-body block text-[var(--foreground)]">{recipe.title}</span>
                      {isSelected ? (
                        <label className="mt-2 block space-y-1">
                          <span className="text-caption">Parts</span>
                          <input
                            type="number"
                            min={1}
                            value={servingsValue}
                            disabled={disabled || isSubmitting}
                            onChange={(event) => updateServings(recipe.id, event.target.value)}
                            className="input-field max-w-[8rem]"
                          />
                        </label>
                      ) : null}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {error ? (
          <p role="alert" className="text-status-error text-sm">
            {error}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
