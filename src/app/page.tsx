import { redirect } from "next/navigation";
import { RecipeHomeContent } from "@/components/recipes/RecipeHomeContent";
import { getRecipes } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";
import { computeSeasonalRecipeIds } from "@/utils/seasonal-recipes";

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
  const seasonalRecipeIds = [...computeSeasonalRecipeIds(recipes)];

  return (
    <RecipeHomeContent recipes={recipes} seasonalRecipeIds={seasonalRecipeIds} userId={user.id} />
  );
}
