import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateRecipeFormClient } from "@/components/recipes/CreateRecipeFormClient";
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
      <CreateRecipeFormClient userId={user.id} />
    </PageShell>
  );
}
