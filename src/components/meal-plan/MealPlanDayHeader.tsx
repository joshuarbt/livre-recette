import { formatDayHeader } from "@/utils/week";

type MealPlanDayHeaderProps = {
  date: string;
  isToday: boolean;
};

export function MealPlanDayHeader({ date, isToday }: MealPlanDayHeaderProps) {
  return (
    <div
      className={`border-b border-[var(--border-subtle)] px-1 py-2 text-center ${
        isToday ? "font-medium text-[var(--foreground)]" : "text-[var(--muted)]"
      }`}
    >
      <span className="text-caption">{formatDayHeader(date)}</span>
    </div>
  );
}
