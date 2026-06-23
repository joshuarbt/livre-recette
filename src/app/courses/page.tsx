import { redirect } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ShoppingList } from "@/components/shopping-list/ShoppingList";
import { getShoppingListByWeek } from "@/lib/shopping-list/queries";
import { createClient } from "@/lib/supabase/server";
import { getWeekStart, isValidPlanDate } from "@/utils/week";

export const dynamic = "force-dynamic";

type CoursesPageProps = {
  searchParams: Promise<{ week?: string }>;
};

function parseWeekStart(rawWeek: string | undefined): string {
  if (rawWeek && isValidPlanDate(rawWeek)) {
    return getWeekStart(rawWeek);
  }

  return getWeekStart(new Date());
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const weekStart = parseWeekStart(params.week);
  const shoppingList = await getShoppingListByWeek(user.id, weekStart);

  return (
    <PageShell
      title="Liste de courses"
      subtitle="Générée automatiquement depuis votre planning hebdomadaire."
      wide
    >
      <ShoppingList
        key={`${weekStart}-${shoppingList?.id ?? "empty"}`}
        userId={user.id}
        initialWeekStart={weekStart}
        initialList={shoppingList}
      />
    </PageShell>
  );
}
