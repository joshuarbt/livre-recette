import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { PageShell } from "@/components/layout/PageShell";
import { getRecipeById } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";

type EditRecipePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <PageShell title="Modifier la recette">
      <Link href={`/recipes/${recipe.id}`} className="btn-ghost mb-6 inline-flex items-center">
        Retour
      </Link>
      <RecipeForm userId={user.id} initialRecipe={recipe} submitLabel="Mettre à jour" />
    </PageShell>
  );
}
