import type { RecipeBrowseCategory } from "@/types/recipes";
import { RECIPE_CATEGORIES, VIRTUAL_RECIPE_CATEGORIES } from "@/types/recipes";

type RecipeCategoryBarProps = {
  selectedCategory: RecipeBrowseCategory | null;
  categoryCounts: Record<string, number>;
  totalCount: number;
  seasonalCount: number;
  onCategoryChange: (category: RecipeBrowseCategory | null) => void;
};

export function RecipeCategoryBar({
  selectedCategory,
  categoryCounts,
  totalCount,
  seasonalCount,
  onCategoryChange,
}: RecipeCategoryBarProps) {
  const virtualCategory = VIRTUAL_RECIPE_CATEGORIES[0];
  const isSeasonalActive = selectedCategory === virtualCategory.value;

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
      <button
        type="button"
        role="tab"
        aria-selected={isSeasonalActive}
        aria-label="De saison — légumes du mois en cours"
        onClick={() => onCategoryChange(virtualCategory.value)}
        className={`filter-chip ${isSeasonalActive ? "filter-chip--active" : ""}`}
      >
        {virtualCategory.label}
        <span className={isSeasonalActive ? "text-[var(--accent-muted)]" : "text-[var(--muted)]"}>
          {seasonalCount}
        </span>
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
