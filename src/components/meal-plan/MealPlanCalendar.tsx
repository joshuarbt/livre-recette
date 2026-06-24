"use client";

import Link from "next/link";
import { useState } from "react";
import { AssignMealModal } from "@/components/meal-plan/AssignMealModal";
import { MealPlanDayHeader } from "@/components/meal-plan/MealPlanDayHeader";
import { MealPlanSlot } from "@/components/meal-plan/MealPlanSlot";
import { Icon } from "@/components/ui/Icon";
import { useMealPlan } from "@/hooks/useMealPlan";
import { actionIcons } from "@/lib/icons";
import type { FreezerEntry } from "@/types/freezer";
import type { MealPlanEntry, MealType, RecipeSummary } from "@/types/meal-plan";
import { MEAL_TYPES, MEAL_TYPE_LABELS, mealPlanSlotKey } from "@/types/meal-plan";
import { addWeeks, formatWeekRange, getTodayDate } from "@/utils/week";

type MealPlanCalendarProps = {
  userId: string;
  initialWeekStart: string;
  initialEntries: MealPlanEntry[];
  recipes: RecipeSummary[];
  freezerEntries?: FreezerEntry[];
  preselectedRecipeId?: string;
  preselectedFromFreezerId?: string;
  preselectedServings?: number;
};

type SelectedSlot = {
  date: string;
  mealType: MealType;
};

function buildPlanningHref(weekStart: string): string {
  return `/planning?week=${weekStart}`;
}

export function MealPlanCalendar({
  userId,
  initialWeekStart,
  initialEntries,
  recipes,
  freezerEntries = [],
  preselectedRecipeId,
  preselectedFromFreezerId,
  preselectedServings,
}: MealPlanCalendarProps) {
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const today = getTodayDate();

  const {
    weekStart,
    weekDates,
    entriesBySlot,
    isPending,
    error,
    addMeal,
    removeMeal,
    updateMealServings,
  } = useMealPlan({
    userId,
    initialWeekStart,
    initialEntries,
    recipes,
  });

  const selectedEntry = selectedSlot
    ? entriesBySlot.get(mealPlanSlotKey(selectedSlot.date, selectedSlot.mealType)) ?? null
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href={buildPlanningHref(addWeeks(weekStart, -1))}
          className="btn-icon"
          aria-label="Semaine précédente"
        >
          <Icon icon={actionIcons.weekPrev} size="md" />
        </Link>
        <div className="min-w-0 text-center">
          <p className="text-title">{formatWeekRange(weekStart)}</p>
          {isPending ? <p className="text-caption mt-1 text-[var(--muted)]">Chargement…</p> : null}
        </div>
        <Link
          href={buildPlanningHref(addWeeks(weekStart, 1))}
          className="btn-icon"
          aria-label="Semaine suivante"
        >
          <Icon icon={actionIcons.weekNext} size="md" />
        </Link>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[56rem]">
          <div className="grid grid-cols-8 border border-[var(--border-subtle)]">
            <div className="border-b border-r border-[var(--border-subtle)] bg-[var(--surface-muted)]" />
            {weekDates.map((date) => (
              <MealPlanDayHeader key={date} date={date} isToday={date === today} />
            ))}

            {MEAL_TYPES.map((mealType) => (
              <div key={mealType} className="contents">
                <div className="flex items-center border-r border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-3">
                  <span className="text-caption font-medium text-[var(--muted)]">
                    {MEAL_TYPE_LABELS[mealType]}
                  </span>
                </div>
                {weekDates.map((date) => {
                  const entry =
                    entriesBySlot.get(mealPlanSlotKey(date, mealType)) ?? null;
                  return (
                    <MealPlanSlot
                      key={`${date}-${mealType}`}
                      entry={entry}
                      mealLabel={MEAL_TYPE_LABELS[mealType]}
                      isToday={date === today}
                      onSelect={() => setSelectedSlot({ date, mealType })}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 md:hidden">
        {weekDates.map((date) => (
          <section
            key={date}
            className="border border-[var(--border-subtle)] bg-[var(--surface)]"
          >
            <MealPlanDayHeader date={date} isToday={date === today} />
            <div className="divide-y divide-[var(--border-subtle)]">
              {MEAL_TYPES.map((mealType) => {
                const entry =
                  entriesBySlot.get(mealPlanSlotKey(date, mealType)) ?? null;
                return (
                  <div key={mealType} className="grid grid-cols-[4.5rem_1fr]">
                    <div className="flex items-center border-r border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2 py-3">
                      <span className="text-caption text-[var(--muted)]">
                        {MEAL_TYPE_LABELS[mealType]}
                      </span>
                    </div>
                    <MealPlanSlot
                      entry={entry}
                      mealLabel={MEAL_TYPE_LABELS[mealType]}
                      isToday={date === today}
                      onSelect={() => setSelectedSlot({ date, mealType })}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {error ? (
        <p role="alert" className="text-status-error text-sm">
          {error}
        </p>
      ) : null}

      {selectedSlot ? (
        <AssignMealModal
          date={selectedSlot.date}
          mealType={selectedSlot.mealType}
          currentEntry={selectedEntry}
          recipes={recipes}
          freezerEntries={freezerEntries}
          preselectedRecipeId={preselectedRecipeId}
          preselectedFromFreezerId={preselectedFromFreezerId}
          preselectedServings={preselectedServings}
          onClose={() => setSelectedSlot(null)}
          onAssign={async (recipeId, servingsPlanned, freezerServingsToUse) => {
            const result = await addMeal(
              recipeId,
              selectedSlot.date,
              servingsPlanned,
              selectedSlot.mealType,
              freezerServingsToUse,
            );
            return result.success
              ? { success: true }
              : { success: false, error: result.error };
          }}
          onRemove={async (id) => {
            const result = await removeMeal(id);
            return result.success
              ? { success: true }
              : { success: false, error: result.error };
          }}
          onUpdateServings={async (id, servings) => {
            const result = await updateMealServings(id, servings);
            return result.success
              ? { success: true }
              : { success: false, error: result.error };
          }}
        />
      ) : null}
    </div>
  );
}
