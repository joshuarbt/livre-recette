"use client";

import Link from "next/link";
import { ExpiryBadge } from "@/components/freezer/ExpiryBadge";
import { IconButton } from "@/components/ui/IconButton";
import { actionIcons } from "@/lib/icons";
import type { FreezerEntry } from "@/types/freezer";
import { formatServingsLabel } from "@/types/meal-plan";
import { getWeekStart } from "@/utils/week";
import { Minus } from "lucide-react";

type FreezerEntryCardProps = {
  entry: FreezerEntry;
  disabled?: boolean;
  onAdjustServings: (entryId: string, delta: number) => void;
};

function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function buildPlanningHref(entry: FreezerEntry): string {
  const week = getWeekStart(new Date());
  return `/planning?week=${week}&recipeId=${entry.recipeId}&fromFreezer=${entry.id}`;
}

export function FreezerEntryCard({
  entry,
  disabled = false,
  onAdjustServings,
}: FreezerEntryCardProps) {
  return (
    <article className="rounded-sm border border-[var(--border-hairline)] bg-[var(--surface)] px-3 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body text-[var(--foreground)]">{entry.recipeTitle}</h3>
            <ExpiryBadge
              status={entry.expiryStatus}
              daysUntilExpiry={entry.daysUntilExpiry}
            />
          </div>
          <p className="text-caption text-[var(--muted)]">
            {formatServingsLabel(entry.servingsCount)} restantes
          </p>
          <p className="text-caption text-[var(--muted)]">
            Congelé le {formatDateLabel(entry.frozenDate)}
            {entry.expiryDate ? ` · Expire le ${formatDateLabel(entry.expiryDate)}` : null}
          </p>
          {entry.notes ? (
            <p className="text-caption text-[var(--muted)]">{entry.notes}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <IconButton
            icon={Minus}
            label="Retirer une part"
            disabled={disabled}
            onClick={() => onAdjustServings(entry.id, -1)}
          />
          <span className="min-w-[1.5rem] text-center text-sm font-medium">
            {entry.servingsCount}
          </span>
          <IconButton
            icon={actionIcons.add}
            label="Ajouter une part"
            disabled={disabled}
            onClick={() => onAdjustServings(entry.id, 1)}
          />
        </div>
      </div>

      <div className="mt-3">
        <Link href={buildPlanningHref(entry)} className="btn-ghost text-sm">
          Utiliser dans le planning
        </Link>
      </div>
    </article>
  );
}
