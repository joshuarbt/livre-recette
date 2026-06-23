"use client";

import { useState, useTransition } from "react";
import { createRecipe, updateRecipe } from "@/lib/recipes/actions";
import type { RecipeDetail, RecipeFormInput } from "@/types/recipes";

type RecipeFormProps = {
  userId: string;
  initialRecipe?: RecipeDetail;
  submitLabel: string;
};

function toFormState(recipe?: RecipeDetail) {
  return {
    title: recipe?.title ?? "",
    description: recipe?.description ?? "",
    servings: recipe?.servings ? String(recipe.servings) : "",
    prepTime: recipe?.prepTime ? String(recipe.prepTime) : "",
    cookTime: recipe?.cookTime ? String(recipe.cookTime) : "",
    category: recipe?.category ?? "",
  };
}

export function RecipeForm({ userId, initialRecipe, submitLabel }: RecipeFormProps) {
  const [form, setForm] = useState(() => toFormState(initialRecipe));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function parseOptionalNumber(value: string): number | undefined {
    if (!value.trim()) {
      return undefined;
    }
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : undefined;
  }

  function buildInput(): RecipeFormInput {
    return {
      title: form.title,
      description: form.description || undefined,
      servings: parseOptionalNumber(form.servings),
      prepTime: parseOptionalNumber(form.prepTime),
      cookTime: parseOptionalNumber(form.cookTime),
      category: form.category || undefined,
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const input = buildInput();
      const result = initialRecipe
        ? await updateRecipe(initialRecipe.id, input)
        : await createRecipe(input);

      if (!result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <label className="block space-y-2">
        <span className="input-label">Titre</span>
        <input
          type="text"
          required
          value={form.title}
          disabled={isPending}
          onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          className="input-field"
        />
      </label>

      <label className="block space-y-2">
        <span className="input-label">Description</span>
        <textarea
          value={form.description}
          disabled={isPending}
          rows={4}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          className="input-field"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="input-label">Parts</span>
          <input
            type="number"
            min={1}
            value={form.servings}
            disabled={isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, servings: event.target.value }))
            }
            className="input-field"
          />
        </label>

        <label className="block space-y-2">
          <span className="input-label">Catégorie</span>
          <input
            type="text"
            value={form.category}
            disabled={isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value }))
            }
            className="input-field"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="input-label">Préparation (min)</span>
          <input
            type="number"
            min={1}
            value={form.prepTime}
            disabled={isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, prepTime: event.target.value }))
            }
            className="input-field"
          />
        </label>

        <label className="block space-y-2">
          <span className="input-label">Cuisson (min)</span>
          <input
            type="number"
            min={1}
            value={form.cookTime}
            disabled={isPending}
            onChange={(event) =>
              setForm((current) => ({ ...current, cookTime: event.target.value }))
            }
            className="input-field"
          />
        </label>
      </div>

      {error ? (
        <p role="alert" className="alert-error">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={isPending} className="btn-primary w-full sm:w-auto">
        {isPending ? "Enregistrement…" : submitLabel}
      </button>

      <input type="hidden" name="userId" value={userId} />
    </form>
  );
}
