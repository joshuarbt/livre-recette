import type { ExpiryStatus } from "@/types/freezer";

const WARNING_DAYS = 7;

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

export function getTodayDateString(): string {
  return formatDate(new Date());
}

export function getDaysUntilExpiry(expiryDate: string, today = getTodayDateString()): number {
  const expiry = parseLocalDate(expiryDate);
  const base = parseLocalDate(today);
  const diffMs = expiry.getTime() - base.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(
  expiryDate: string | null,
  today = getTodayDateString(),
): { status: ExpiryStatus; daysUntilExpiry: number | null } {
  if (!expiryDate) {
    return { status: "none", daysUntilExpiry: null };
  }

  const daysUntilExpiry = getDaysUntilExpiry(expiryDate, today);

  if (daysUntilExpiry < 0) {
    return { status: "expired", daysUntilExpiry };
  }

  if (daysUntilExpiry <= WARNING_DAYS) {
    return { status: "warning", daysUntilExpiry };
  }

  return { status: "ok", daysUntilExpiry };
}

export function isExpiringSoon(
  expiryDate: string | null,
  today = getTodayDateString(),
): boolean {
  const { status } = getExpiryStatus(expiryDate, today);
  return status === "warning" || status === "expired";
}
