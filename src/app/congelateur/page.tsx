import { redirect } from "next/navigation";
import { FreezerInventory } from "@/components/freezer/FreezerInventory";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFreezerInventory } from "@/lib/freezer/queries";
import { getRecipeSummaries } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CongelateurPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [inventory, recipes] = await Promise.all([
    getFreezerInventory(user.id),
    getRecipeSummaries(),
  ]);

  return (
    <PageShell
      title="Congélateur"
      subtitle="Suivez vos parts congelées et leurs dates d'expiration."
      wide
    >
      {recipes.length === 0 ? (
        <EmptyState
          message="Créez d'abord une recette pour remplir le congélateur."
          description="Chaque entrée correspond à une recette et un nombre de parts congelées."
        />
      ) : (
        <FreezerInventory
          key={`${inventory.totalServings}-${inventory.entries.length}`}
          userId={user.id}
          initialData={inventory}
          recipes={recipes}
        />
      )}
    </PageShell>
  );
}
