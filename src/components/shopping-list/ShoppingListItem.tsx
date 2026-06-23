import { formatQuantity } from "@/types/shopping-list";

type ShoppingListItemProps = {
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export function ShoppingListItemRow({
  name,
  quantity,
  unit,
  isChecked,
  disabled = false,
  onToggle,
}: ShoppingListItemProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex min-h-[var(--touch-min)] w-full items-center gap-3 rounded-sm border border-[var(--border-hairline)] px-3 py-2 text-left transition-opacity disabled:opacity-60 ${
        isChecked ? "bg-[var(--surface-muted)] opacity-70" : "bg-[var(--surface)]"
      }`}
    >
      <span className="min-w-0 flex-1">
        <span
          className={`block text-body ${isChecked ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}`}
        >
          {name}
        </span>
        <span className="text-caption mt-0.5 block text-[var(--muted)]">
          {formatQuantity(quantity)} {unit}
        </span>
      </span>
      <span
        aria-hidden="true"
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border transition-colors duration-200 ${
          isChecked
            ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
            : "border-[var(--border-subtle)] bg-[var(--background)]"
        }`}
      >
        {isChecked ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8.5 6.5 12 13 4" />
          </svg>
        ) : null}
      </span>
    </button>
  );
}
