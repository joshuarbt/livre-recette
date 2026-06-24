"use client";

import {
  Droplets,
  Gamepad2,
  Heart,
  Leaf,
  Moon,
  Sun,
  Sunset,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getNextTheme, THEME_LABELS, type AppTheme } from "@/lib/theme/constants";

const headerIconButtonClass =
  "btn-icon h-9 w-9 min-h-9 min-w-9 p-2 md:min-h-[var(--touch-min)] md:min-w-[var(--touch-min)] md:p-[var(--btn-icon-padding)]";

type ThemeButtonConfig = {
  icon: LucideIcon;
  className: string;
};

const THEME_BUTTON_CONFIG: Record<AppTheme, ThemeButtonConfig> = {
  default: { icon: Droplets, className: "text-[var(--muted)]" },
  aero: { icon: Droplets, className: "text-[var(--accent)]" },
  matrix: {
    icon: Terminal,
    className: "text-[#00ff41] drop-shadow-[0_0_6px_rgba(0,255,65,0.6)]",
  },
  gameboy: { icon: Gamepad2, className: "text-[#8bac0f]" },
  barbie: { icon: Heart, className: "text-[#ff69b4]" },
  vaporwave: { icon: Sunset, className: "text-[#b44fff]" },
  ghibli: { icon: Leaf, className: "text-[#7bc47e]" },
};

export function AppearanceToolbar() {
  const { theme, colorScheme, toggleTheme, toggleColorScheme, canToggleColorScheme } =
    useTheme();

  const { icon: ThemeIcon, className: themeButtonClass } = THEME_BUTTON_CONFIG[theme];
  const nextTheme = getNextTheme(theme);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={`${headerIconButtonClass} ${themeButtonClass}`}
        aria-label={`Thème ${THEME_LABELS[theme]} actif — passer au thème ${THEME_LABELS[nextTheme]}`}
        aria-pressed={theme !== "default"}
        onClick={toggleTheme}
      >
        <Icon icon={ThemeIcon} size="md" />
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
