"use client";

import { useEffect, useMemo, useState } from "react";
import { RecipeCategoryBar } from "@/components/recipes/RecipeCategoryBar";
import { RecipeList } from "@/components/recipes/RecipeList";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchField } from "@/components/ui/SearchField";
import type { RecipeBrowseFilters, RecipeCategory, RecipeListItem } from "@/types/recipes";

type RecipeHomeBrowserProps = {
  recipes: RecipeListItem[];
  onFilterStateChange?: (state: {
    filteredCount: number;
    hasActiveFilters: boolean;
    filters: RecipeBrowseFilters;
  }) => void;
};

function filterRecipes(
  recipes: RecipeListItem[],
  filters: RecipeBrowseFilters,
): RecipeListItem[] {
  const term = filters.search.trim().toLocaleLowerCase("fr");

  return recipes.filter((recipe) => {
    if (filters.category !== null && recipe.category !== filters.category) {
      return false;
    }

    if (term && !recipe.title.toLocaleLowerCase("fr").includes(term)) {
      return false;
    }

    return true;
  });
}

function countRecipesByCategory(recipes: RecipeListItem[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const recipe of recipes) {
    if (!recipe.category) {
      continue;
    }
    counts[recipe.category] = (counts[recipe.category] ?? 0) + 1;
  }

  return counts;
}

export function RecipeHomeBrowser({ recipes, onFilterStateChange }: RecipeHomeBrowserProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<RecipeCategory | null>(null);

  const filters: RecipeBrowseFilters = { search, category };
  const hasActiveFilters = search.trim().length > 0 || category !== null;

  const filteredRecipes = useMemo(() => filterRecipes(recipes, filters), [recipes, search, category]);
  const categoryCounts = useMemo(() => countRecipesByCategory(recipes), [recipes]);

  useEffect(() => {
    onFilterStateChange?.({
      filteredCount: filteredRecipes.length,
      hasActiveFilters,
      filters: { search, category },
    });
  }, [filteredRecipes.length, hasActiveFilters, search, category, onFilterStateChange]);

  if (recipes.length === 0) {
    return (
      <EmptyState
        message="Votre livre de recettes est vide."
        description="Ajoutez vos recettes pour les planifier et remplir le congélateur."
        actionLabel="Ajouter votre première recette"
        actionHref="/recettes/nouvelle"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="sticky top-[var(--header-height)] z-40 -mx-[var(--space-page-x)] space-y-3 bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-[var(--space-page-x)] py-3 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
      >
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Rechercher une recette…"
          aria-label="Rechercher une recette"
        />
        <RecipeCategoryBar
          selectedCategory={category}
          categoryCounts={categoryCounts}
          totalCount={recipes.length}
          onCategoryChange={setCategory}
        />
      </div>

      {filteredRecipes.length === 0 ? (
        <EmptyState message="Aucune recette trouvée." />
      ) : (
        <RecipeList recipes={filteredRecipes} />
      )}
    </div>
  );
}
