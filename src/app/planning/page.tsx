import { redirect } from "next/navigation";
import { MealPlanCalendar } from "@/components/meal-plan/MealPlanCalendar";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFreezerInventory } from "@/lib/freezer/queries";
import { getMealPlanByWeek } from "@/lib/meal-plan/queries";
import { getRecipeSummaries } from "@/lib/recipes/queries";
import { createClient } from "@/lib/supabase/server";
import { getWeekStart, isValidPlanDate } from "@/utils/week";

export const dynamic = "force-dynamic";

type PlanningPageProps = {
  searchParams: Promise<{
    week?: string;
    recipeId?: string;
    fromFreezer?: string;
  }>;
};

function parseWeekStart(rawWeek: string | undefined): string {
  if (rawWeek && isValidPlanDate(rawWeek)) {
    return getWeekStart(rawWeek);
  }

  return getWeekStart(new Date());
}

export default async function PlanningPage({ searchParams }: PlanningPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const weekStart = parseWeekStart(params.week);

  const [mealPlanData, recipes, freezerInventory] = await Promise.all([
    getMealPlanByWeek(user.id, weekStart),
    getRecipeSummaries(),
    getFreezerInventory(user.id),
  ]);

  const preselectedRecipeId = params.recipeId;
  const preselectedFromFreezerId = params.fromFreezer;

  return (
    <PageShell
      title="Planning"
      subtitle="Planifiez vos repas par portions — une recette, plusieurs parts."
      wide
    >
      {recipes.length === 0 ? (
        <EmptyState
          message="Créez d'abord une recette pour utiliser le planning."
          description="Une recette existe en un seul exemplaire. Le planning enregistre le nombre de parts prévues."
        />
      ) : (
        <MealPlanCalendar
          key={`${mealPlanData.weekStart}-${preselectedRecipeId ?? ""}-${preselectedFromFreezerId ?? ""}`}
          userId={user.id}
          initialWeekStart={mealPlanData.weekStart}
          initialEntries={mealPlanData.entries}
          recipes={recipes}
          freezerEntries={freezerInventory.entries}
          preselectedRecipeId={preselectedRecipeId}
          preselectedFromFreezerId={preselectedFromFreezerId}
        />
      )}
    </PageShell>
  );
}
