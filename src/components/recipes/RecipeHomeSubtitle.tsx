type RecipeHomeSubtitleProps = {
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
};

function formatRecipeCount(count: number): string {
  return `${count} recette${count === 1 ? "" : "s"}`;
}

export function RecipeHomeSubtitle({
  filteredCount,
  totalCount,
  hasActiveFilters,
}: RecipeHomeSubtitleProps) {
  if (hasActiveFilters) {
    return (
      <span>
        {formatRecipeCount(filteredCount)} sur {formatRecipeCount(totalCount)}
      </span>
    );
  }

  return <span>{formatRecipeCount(totalCount)}</span>;
}
