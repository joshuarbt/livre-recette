const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidPlanDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) {
    return false;
  }

  const date = parseLocalDate(value);
  const [year, month, day] = value.split("-").map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function getWeekStart(date: Date | string): string {
  const base = typeof date === "string" ? parseLocalDate(date) : new Date(date);
  const day = base.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(base);
  monday.setDate(base.getDate() + diff);
  return formatDate(monday);
}

export function getWeekEnd(weekStart: string): string {
  const monday = parseLocalDate(weekStart);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return formatDate(sunday);
}

export function addWeeks(weekStart: string, delta: number): string {
  const monday = parseLocalDate(weekStart);
  monday.setDate(monday.getDate() + delta * 7);
  return formatDate(monday);
}

export function getWeekDates(weekStart: string): string[] {
  const monday = parseLocalDate(weekStart);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return formatDate(date);
  });
}

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

export function formatDayHeader(date: string): string {
  const parsed = parseLocalDate(date);
  const weekday = WEEKDAY_LABELS[parsed.getDay() === 0 ? 6 : parsed.getDay() - 1];
  return `${weekday} ${parsed.getDate()}`;
}

export function getTodayDate(): string {
  return formatDate(new Date());
}

export function formatWeekRange(weekStart: string): string {
  const end = getWeekEnd(weekStart);
  const startLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
  }).format(parseLocalDate(weekStart));
  const endLabel = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseLocalDate(end));
  return `${startLabel} – ${endLabel}`;
}
