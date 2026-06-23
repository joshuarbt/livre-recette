import { RecipeCard } from "@/components/recipes/RecipeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { RecipeListItem } from "@/types/recipes";

type RecipeListProps = {
  recipes: RecipeListItem[];
};

export function RecipeList({ recipes }: RecipeListProps) {
  if (recipes.length === 0) {
    return (
      <EmptyState
        message="Aucune recette pour le moment."
        actionLabel="Ajouter votre première recette"
        actionHref="/recettes/nouvelle"
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-[var(--space-grid-y)] md:grid-cols-3 lg:grid-cols-4">
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <RecipeCard recipe={recipe} />
        </li>
      ))}
    </ul>
  );
}
