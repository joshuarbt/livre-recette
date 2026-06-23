import { redirect } from "next/navigation";
import { RecipeHomeActions } from "@/components/recipes/RecipeHomeActions";
import { RecipeList } from "@/components/recipes/RecipeList";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getRecipes } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const recipes = await getRecipes();
  const recipeLabel = `${recipes.length} recette${recipes.length === 1 ? "" : "s"}`;

  return (
    <PageShell
      title="Recettes"
      subtitle={recipeLabel}
      wide
      actions={
        <RecipeHomeActions userId={user.id} existingTitles={recipes.map((recipe) => recipe.title)} />
      }
    >
      {recipes.length === 0 ? (
        <EmptyState
          message="Votre livre de recettes est vide."
          description="Ajoutez vos recettes pour les planifier et remplir le congélateur."
          actionLabel="Ajouter votre première recette"
          actionHref="/recettes/nouvelle"
        />
      ) : (
        <RecipeList recipes={recipes} />
      )}
    </PageShell>
  );
}
