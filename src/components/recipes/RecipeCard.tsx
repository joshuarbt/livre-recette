import Image from "next/image";
import Link from "next/link";
import type { RecipeListItem } from "@/types/recipes";
import { formatRecipeServings, getRecipeCategoryLabel } from "@/types/recipes";

type RecipeCardProps = {
  recipe: RecipeListItem;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  const categoryLabel = getRecipeCategoryLabel(recipe.category);

  return (
    <article>
      <Link href={`/recipes/${recipe.id}`} className="block active:opacity-80">
        <div className="overflow-hidden bg-[var(--surface-muted)]">
          {recipe.imageUrl ? (
            <Image
              src={recipe.imageUrl}
              alt={recipe.title}
              width={400}
              height={300}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center bg-[var(--surface-muted)]">
              <span className="text-caption text-[var(--muted)]">Sans image</span>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-1">
          <h2 className="text-heading leading-snug">{recipe.title}</h2>
          <p className="text-caption truncate">
            {[categoryLabel, formatRecipeServings(recipe.servings)]
              .filter((part) => part && part !== "—")
              .join(" · ") || "Recette"}
          </p>
        </div>
      </Link>
    </article>
  );
}
