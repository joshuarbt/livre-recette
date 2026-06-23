import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RecipeDetailView } from "@/components/recipes/RecipeDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { getRecipeById } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";

type RecipeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipeDetailPage({ params }: RecipeDetailPageProps) {
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
    <PageShell title={recipe.title}>
      <Link href="/" className="btn-ghost mb-6 inline-flex items-center">
        Retour aux recettes
      </Link>
      <RecipeDetailView recipe={recipe} />
    </PageShell>
  );
}
