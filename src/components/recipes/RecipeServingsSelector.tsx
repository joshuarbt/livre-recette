"use client";

import { formatServingsLabel } from "@/types/meal-plan";

type RecipeServingsSelectorProps = {
  baseServings: number;
  value: number;
  onChange: (servings: number) => void;
};

export function RecipeServingsSelector({
  baseServings,
  value,
  onChange,
}: RecipeServingsSelectorProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-caption text-[var(--muted)]">
        Pour {formatServingsLabel(value)}
        {value !== baseServings ? (
          <span className="text-[var(--muted)]"> (recette de base : {formatServingsLabel(baseServings)})</span>
        ) : null}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Réduire le nombre de parts"
          disabled={value <= 1}
          onClick={() => onChange(Math.max(1, value - 1))}
          className="btn-icon disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-sm font-medium tabular-nums">{value}</span>
        <button
          type="button"
          aria-label="Augmenter le nombre de parts"
          onClick={() => onChange(value + 1)}
          className="btn-icon"
        >
          +
        </button>
      </div>
    </div>
  );
}
