"use client";

import { ClearListDropdown } from "@/components/shopping-list/ClearListDropdown";
import { ShoppingList } from "@/components/shopping-list/ShoppingList";
import { PageShell } from "@/components/layout/PageShell";
import { useShoppingList } from "@/hooks/useShoppingList";
import type { RecipeForShopping, ShoppingListData } from "@/types/shopping-list";

type ShoppingListPageProps = {
  userId: string;
  initialWeekStart: string;
  initialList: ShoppingListData | null;
  recipes: RecipeForShopping[];
};

export function ShoppingListPage({
  userId,
  initialWeekStart,
  initialList,
  recipes,
}: ShoppingListPageProps) {
  const {
    weekStart,
    planningItems,
    manualItems,
    progress,
    isPending,
    error,
    generateList,
    toggleItem,
    addManualItem,
    addRecipeToList,
    clearList,
    removeItem,
    items,
  } = useShoppingList({
    userId,
    initialWeekStart,
    initialList,
  });

  const hasCheckedItems = items.some((item) => item.isChecked);

  return (
    <PageShell
      title="Liste de courses"
      subtitle="Générée automatiquement depuis votre planning hebdomadaire."
      wide
      actions={
        <ClearListDropdown
          disabled={isPending}
          hasItems={items.length > 0}
          hasCheckedItems={hasCheckedItems}
          onClearAll={() => void clearList(false)}
          onClearChecked={() => void clearList(true)}
        />
      }
    >
      <ShoppingList
        weekStart={weekStart}
        recipes={recipes}
        planningItems={planningItems}
        manualItems={manualItems}
        progress={progress}
        isPending={isPending}
        error={error}
        onGenerate={() => void generateList()}
        onToggle={async (itemId, nextChecked) => {
          const result = await toggleItem(itemId, nextChecked);
          return result.success
            ? { success: true }
            : { success: false, error: result.error };
        }}
        onRemove={(itemId) => void removeItem(itemId)}
        onAddManual={async (name, quantity, unit) => {
          const result = await addManualItem(name, quantity, unit);
          return { success: result.success };
        }}
        onAddRecipes={async (selections) => {
          for (const selection of selections) {
            const result = await addRecipeToList(selection.recipeId, selection.servings);
            if (!result.success) {
              return { success: false };
            }
          }
          return { success: true };
        }}
      />
    </PageShell>
  );
}
