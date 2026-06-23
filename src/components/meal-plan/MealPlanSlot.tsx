import type { MealPlanEntry } from "@/types/meal-plan";
import { formatServingsLabel } from "@/types/meal-plan";

type MealPlanSlotProps = {
  entry: MealPlanEntry | null;
  mealLabel: string;
  onSelect: () => void;
  isToday: boolean;
};

export function MealPlanSlot({
  entry,
  mealLabel,
  onSelect,
  isToday,
}: MealPlanSlotProps) {
  const ariaLabel = entry
    ? `${mealLabel} : ${entry.recipeTitle}, ${formatServingsLabel(entry.servingsPlanned)}`
    : `${mealLabel} : aucun repas planifié`;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={ariaLabel}
      className={`flex min-h-16 w-full flex-col items-start justify-start border border-[var(--border-subtle)] px-2 py-2 text-left transition-opacity active:opacity-60 ${
        isToday ? "bg-[var(--surface-muted)]" : "bg-[var(--surface)]"
      }`}
    >
      {entry ? (
        <>
          <span className="line-clamp-2 text-caption font-medium text-[var(--foreground)]">
            {entry.recipeTitle}
          </span>
          <span className="text-caption mt-1 text-[var(--muted)]">
            ({formatServingsLabel(entry.servingsPlanned)})
          </span>
        </>
      ) : (
        <span className="text-caption text-[var(--muted-light)]">—</span>
      )}
    </button>
  );
}
