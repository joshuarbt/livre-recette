import { redirect } from "next/navigation";
import { ShoppingListPage } from "@/components/shopping-list/ShoppingListPage";
import { getShoppingListByWeek } from "@/lib/shopping-list/queries";
import { getRecipesForShoppingList } from "@/lib/recipes/queries";
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
  const [shoppingList, recipes] = await Promise.all([
    getShoppingListByWeek(user.id, weekStart),
    getRecipesForShoppingList(),
  ]);

  return (
    <ShoppingListPage
      key={`${weekStart}-${shoppingList?.id ?? "empty"}`}
      userId={user.id}
      initialWeekStart={weekStart}
      initialList={shoppingList}
      recipes={recipes}
    />
  );
}
