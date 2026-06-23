import type { ExpiryStatus } from "@/types/freezer";

type ExpiryBadgeProps = {
  status: ExpiryStatus;
  daysUntilExpiry: number | null;
};

const LABELS: Record<Exclude<ExpiryStatus, "ok" | "none">, string> = {
  warning: "Expire bientôt",
  expired: "Expiré",
};

export function ExpiryBadge({ status, daysUntilExpiry }: ExpiryBadgeProps) {
  if (status === "ok" || status === "none") {
    return null;
  }

  const detail =
    daysUntilExpiry !== null && status === "warning"
      ? daysUntilExpiry === 0
        ? "Aujourd'hui"
        : daysUntilExpiry === 1
          ? "Demain"
          : `J-${daysUntilExpiry}`
      : null;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        status === "expired"
          ? "bg-[var(--status-error-bg)] text-[var(--status-error)]"
          : "bg-[var(--status-warning-bg)] text-[var(--status-warning)]"
      }`}
    >
      {LABELS[status]}
      {detail ? ` · ${detail}` : null}
    </span>
  );
}
