"use client";

import { useState } from "react";
import { AddFreezerEntrySheet } from "@/components/freezer/AddFreezerEntrySheet";
import { FreezerEntryCard } from "@/components/freezer/FreezerEntryCard";
import { DismissibleBanner } from "@/components/ui/DismissibleBanner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { useFreezerInventory } from "@/hooks/useFreezerInventory";
import { actionIcons } from "@/lib/icons";
import type { FreezerInventoryData } from "@/types/freezer";
import type { RecipeSummary } from "@/types/meal-plan";

type FreezerInventoryProps = {
  userId: string;
  initialData: FreezerInventoryData;
  recipes: RecipeSummary[];
};

export function FreezerInventory({
  userId,
  initialData,
  recipes,
}: FreezerInventoryProps) {
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

  const {
    entries,
    expiringCount,
    isPending,
    error,
    addEntry,
    adjustServings,
  } = useFreezerInventory({ userId, initialData });

  const bannerMessage =
    expiringCount === 1
      ? "1 produit expire bientôt ou est déjà expiré."
      : `${expiringCount} produits expirent bientôt ou sont déjà expirés.`;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsAddSheetOpen(true)}
          className="btn-primary inline-flex items-center gap-2"
        >
          <Icon icon={actionIcons.add} size="sm" />
          Ajouter au congélateur
        </button>
      </div>

      {expiringCount > 0 ? (
        <DismissibleBanner message={bannerMessage} />
      ) : null}

      {entries.length === 0 ? (
        <EmptyState
          message="Votre congélateur est vide."
          description="Ajoutez des parts congelées pour les déduire automatiquement de vos courses."
        />
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              <FreezerEntryCard
                entry={entry}
                disabled={isPending}
                onAdjustServings={(entryId, delta) => {
                  void adjustServings(entryId, delta);
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <p role="alert" className="text-status-error text-sm">
          {error}
        </p>
      ) : null}

      <AddFreezerEntrySheet
        open={isAddSheetOpen}
        recipes={recipes}
        onClose={() => setIsAddSheetOpen(false)}
        onAdd={async (recipeId, servingsCount, expiryDate, notes) => {
          const result = await addEntry(recipeId, servingsCount, expiryDate, notes);
          return result.success
            ? { success: true }
            : { success: false, error: result.error };
        }}
      />
    </div>
  );
}
