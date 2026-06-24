import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RecipeFormClient } from "@/components/recipes/RecipeFormClient";
import { PageShell } from "@/components/layout/PageShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NouvelleRecettePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <PageShell title="Nouvelle recette" wide>
      <Link href="/" className="btn-ghost mb-6 inline-flex items-center">
        Retour aux recettes
      </Link>
      <Suspense fallback={<p className="text-caption text-[var(--muted)]">Chargement du formulaire…</p>}>
        <RecipeFormClient mode="create" userId={user.id} />
      </Suspense>
    </PageShell>
  );
}
