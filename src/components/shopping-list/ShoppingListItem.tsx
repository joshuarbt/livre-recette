import { formatQuantity } from "@/types/shopping-list";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";

type ShoppingListItemProps = {
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
  isManual?: boolean;
  showQuantity?: boolean;
  disabled?: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

export function ShoppingListItemRow({
  name,
  quantity,
  unit,
  isChecked,
  isManual = false,
  showQuantity = true,
  disabled = false,
  onToggle,
  onRemove,
}: ShoppingListItemProps) {
  const shouldShowQuantity = showQuantity && quantity > 0;

  return (
    <div
      className={`flex min-h-[var(--touch-min)] w-full items-center gap-3 rounded-sm border border-[var(--border-hairline)] px-3 py-2 transition-opacity ${
        isChecked ? "bg-[var(--surface-muted)] opacity-70" : "bg-[var(--surface)]"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        aria-label={isChecked ? "Décocher l'article" : "Cocher l'article"}
        className="btn-icon shrink-0"
      >
        <span
          aria-hidden="true"
          className={`flex h-6 w-6 items-center justify-center rounded-sm border transition-colors duration-200 ${
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

      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className="min-w-0 flex-1 text-left"
      >
        <span className="flex items-center gap-1.5">
          <span
            className={`text-body ${isChecked ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}`}
          >
            {name}
          </span>
          {isManual ? (
            <Icon
              icon={actionIcons.pencil}
              size="sm"
              className="shrink-0 text-[var(--muted)]"
              aria-label="Ajout manuel"
            />
          ) : null}
        </span>
        {shouldShowQuantity ? (
          <span className="text-caption mt-0.5 block text-[var(--muted)]">
            {formatQuantity(quantity)} {unit}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="btn-icon shrink-0 text-[var(--muted)]"
        aria-label="Retirer l'article"
      >
        <Icon icon={actionIcons.close} size="sm" />
      </button>
    </div>
  );
}
