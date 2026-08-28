"use client";

import { useCallback, useState } from "react";
import { RecipeHomeActions } from "@/components/recipes/RecipeHomeActions";
import { RecipeHomeBrowser } from "@/components/recipes/RecipeHomeBrowser";
import { RecipeHomeSubtitle } from "@/components/recipes/RecipeHomeSubtitle";
import { PageShell } from "@/components/layout/PageShell";
import type { RecipeListItem } from "@/types/recipes";

type RecipeHomeContentProps = {
  recipes: RecipeListItem[];
  userId: string;
};

export function RecipeHomeContent({ recipes, userId }: RecipeHomeContentProps) {
  const [filteredCount, setFilteredCount] = useState(recipes.length);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const handleFilterStateChange = useCallback(
    (state: { filteredCount: number; hasActiveFilters: boolean }) => {
      setFilteredCount(state.filteredCount);
      setHasActiveFilters(state.hasActiveFilters);
    },
    [],
  );

  return (
    <PageShell
      title="Recettes"
      subtitle={
        <RecipeHomeSubtitle
          filteredCount={filteredCount}
          totalCount={recipes.length}
          hasActiveFilters={hasActiveFilters}
        />
      }
      wide
      actions={
        <RecipeHomeActions
          userId={userId}
          existingTitles={recipes.map((recipe) => recipe.title)}
        />
      }
    >
      <RecipeHomeBrowser recipes={recipes} onFilterStateChange={handleFilterStateChange} />
    </PageShell>
  );
}
