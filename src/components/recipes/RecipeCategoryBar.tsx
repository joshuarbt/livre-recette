import type { RecipeCategory } from "@/types/recipes";
import { RECIPE_CATEGORIES } from "@/types/recipes";

type RecipeCategoryBarProps = {
  selectedCategory: RecipeCategory | null;
  categoryCounts: Record<string, number>;
  totalCount: number;
  onCategoryChange: (category: RecipeCategory | null) => void;
};

export function RecipeCategoryBar({
  selectedCategory,
  categoryCounts,
  totalCount,
  onCategoryChange,
}: RecipeCategoryBarProps) {
  return (
    <div
      className="filter-chip-row -mx-[var(--space-page-x)] px-[var(--space-page-x)]"
      role="tablist"
      aria-label="Catégories de recettes"
    >
      <button
        type="button"
        role="tab"
        aria-selected={selectedCategory === null}
        onClick={() => onCategoryChange(null)}
        className={`filter-chip ${selectedCategory === null ? "filter-chip--active" : ""}`}
      >
        Toutes
        <span className="text-[var(--muted)]">{totalCount}</span>
      </button>
      {RECIPE_CATEGORIES.map((category) => {
        const count = categoryCounts[category.value] ?? 0;
        const isActive = selectedCategory === category.value;

        return (
          <button
            key={category.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(category.value)}
            className={`filter-chip ${isActive ? "filter-chip--active" : ""}`}
          >
            {category.label}
            <span className={isActive ? "text-[var(--accent-muted)]" : "text-[var(--muted)]"}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
