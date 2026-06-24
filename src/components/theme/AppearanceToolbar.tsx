"use client";

import { Droplets, Moon, Sun, Terminal } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AppTheme } from "@/lib/theme/constants";

const headerIconButtonClass =
  "btn-icon h-9 w-9 min-h-9 min-w-9 p-2 md:min-h-[var(--touch-min)] md:min-w-[var(--touch-min)] md:p-[var(--btn-icon-padding)]";

const themeLabels: Record<AppTheme, string> = {
  default: "Thème Default",
  aero: "Thème Aero",
  matrix: "Thème Matrix",
};

function getThemeButtonClass(theme: AppTheme): string {
  if (theme === "aero") {
    return "text-[var(--accent)]";
  }

  if (theme === "matrix") {
    return "text-[#00ff41] drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]";
  }

  return "text-[var(--muted)]";
}

export function AppearanceToolbar() {
  const { theme, colorScheme, toggleTheme, toggleColorScheme, canToggleColorScheme } =
    useTheme();

  const nextThemeLabel =
    theme === "default" ? "Aero" : theme === "aero" ? "Matrix" : "Default";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={`${headerIconButtonClass} ${getThemeButtonClass(theme)}`}
        aria-label={`${themeLabels[theme]} actif — passer au thème ${nextThemeLabel}`}
        aria-pressed={theme !== "default"}
        onClick={toggleTheme}
      >
        {theme === "matrix" ? (
          <Icon icon={Terminal} size="md" />
        ) : (
          <Icon icon={Droplets} size="md" />
        )}
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
