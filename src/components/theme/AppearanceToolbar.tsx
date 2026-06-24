"use client";

import { Droplets, Moon, Sun } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";

const headerIconButtonClass =
  "btn-icon h-9 w-9 min-h-9 min-w-9 p-2 md:min-h-[var(--touch-min)] md:min-w-[var(--touch-min)] md:p-[var(--btn-icon-padding)]";

export function AppearanceToolbar() {
  const { isAero, colorScheme, toggleTheme, toggleColorScheme, canToggleColorScheme } =
    useTheme();

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={`${headerIconButtonClass} ${isAero ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}
        aria-label={isAero ? "Revenir au thème Default" : "Activer le thème Aero"}
        aria-pressed={isAero}
        onClick={toggleTheme}
      >
        <Icon icon={Droplets} size="md" />
      </button>

      <button
        type="button"
        className={`${headerIconButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
        aria-label={
          colorScheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
        }
        aria-disabled={!canToggleColorScheme}
        disabled={!canToggleColorScheme}
        onClick={toggleColorScheme}
      >
        <Icon icon={colorScheme === "dark" ? Sun : Moon} size="md" />
      </button>
    </div>
  );
}
