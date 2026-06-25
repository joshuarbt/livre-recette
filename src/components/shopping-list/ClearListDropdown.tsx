"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";

type ClearListDropdownProps = {
  disabled?: boolean;
  hasItems: boolean;
  hasCheckedItems: boolean;
  onClearAll: () => void;
  onClearChecked: () => void;
};

export function ClearListDropdown({
  disabled = false,
  hasItems,
  hasCheckedItems,
  onClearAll,
  onClearChecked,
}: ClearListDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const isDisabled = disabled || !hasItems;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((current) => !current)}
        className="btn-ghost inline-flex items-center gap-2 text-sm text-[var(--status-error)] disabled:opacity-40"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Icon icon={actionIcons.trash} size="sm" />
        Vider
        <Icon icon={actionIcons.expand} size="sm" className={open ? "rotate-180" : ""} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[14rem] rounded-sm border border-[var(--border-hairline)] bg-[var(--surface)] py-1 shadow-[0_4px_12px_rgba(28,27,25,0.08)]"
        >
          <button
            type="button"
            role="menuitem"
            className="text-body flex min-h-[var(--touch-min)] w-full items-center px-3 py-2 text-left text-[var(--status-error)] hover:bg-[var(--surface-muted)]"
            onClick={() => {
              setOpen(false);
              onClearAll();
            }}
          >
            Tout vider
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={!hasCheckedItems}
            className="text-body flex min-h-[var(--touch-min)] w-full items-center px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--surface-muted)] disabled:opacity-40"
            onClick={() => {
              setOpen(false);
              onClearChecked();
            }}
          >
            Vider seulement les articles cochés
          </button>
        </div>
      ) : null}
    </div>
  );
}
