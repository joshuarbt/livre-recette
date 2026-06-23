"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { downloadRecipeExport } from "@/lib/export-import";
import { actionIcons } from "@/lib/icons";
import { deleteRecipe } from "@/lib/recipes/actions";
import type { RecipeDetail } from "@/types/recipes";
import { formatRecipeServings, getRecipeCategoryLabel } from "@/types/recipes";

type RecipeDetailViewProps = {
  recipe: RecipeDetail;
  showImportSuccess?: boolean;
};

function formatMinutes(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) {
    return null;
  }
  return `${minutes} min`;
}

export function RecipeDetailView({ recipe, showImportSuccess = false }: RecipeDetailViewProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm("Supprimer cette recette ?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteRecipe(recipe.id);
      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  const prepLabel = formatMinutes(recipe.prepTime);
  const cookLabel = formatMinutes(recipe.cookTime);
  const categoryLabel = getRecipeCategoryLabel(recipe.category);
  const timingParts = [prepLabel ? `Prépa ${prepLabel}` : null, cookLabel ? `Cuisson ${cookLabel}` : null].filter(
    Boolean,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {showImportSuccess ? (
        <p role="status" className="alert-success">
          Recette importée avec succès !
        </p>
      ) : null}
      {recipe.imageUrl ? (
        <div className="overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            width={800}
            height={600}
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-display">{recipe.title}</h2>
        <p className="text-caption text-[var(--muted)]">
          {[categoryLabel, formatRecipeServings(recipe.servings), ...timingParts]
            .filter((part) => part && part !== "—")
            .join(" · ")}
        </p>
        {recipe.description ? (
          <p className="text-body whitespace-pre-wrap text-[var(--foreground)]">{recipe.description}</p>
        ) : null}
      </div>

      {recipe.ingredients.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-overline">Ingrédients</h3>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient) => (
              <li
                key={ingredient.id}
                className="flex justify-between gap-4 border-b border-[var(--border-hairline)] py-2 text-sm"
              >
                <span>{ingredient.name}</span>
                <span className="text-[var(--muted)]">
                  {ingredient.quantity} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {recipe.utensils.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-overline">Ustensiles</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {recipe.utensils.map((utensil) => (
              <li key={utensil.id}>{utensil.name}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {recipe.steps.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-overline">Préparation</h3>
          <ol className="space-y-4">
            {recipe.steps.map((step) => (
              <li key={step.stepNumber} className="space-y-1">
                <p className="text-caption font-medium">Étape {step.stepNumber}</p>
                <p className="text-body whitespace-pre-wrap">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => downloadRecipeExport(recipe)}
          className="btn-ghost inline-flex items-center gap-2 text-sm"
        >
          <Icon icon={actionIcons.download} size="sm" />
          Exporter la recette
        </button>
        <Link href={`/recipes/${recipe.id}/edit`} className="btn-ghost text-sm">
          Modifier
        </Link>
        <button
          type="button"
          disabled={isPending}
          onClick={handleDelete}
          className="btn-ghost text-sm text-[var(--status-error)] disabled:opacity-60"
        >
          {isPending ? "Suppression…" : "Supprimer"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="alert-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
