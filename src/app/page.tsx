import { redirect } from "next/navigation";
import { RecipeHomeContent } from "@/components/recipes/RecipeHomeContent";
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

  return <RecipeHomeContent recipes={recipes} userId={user.id} />;
}
