"use client";

import { Moon, Sun } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";

const headerIconButtonClass =
  "btn-icon h-9 w-9 min-h-9 min-w-9 p-2 md:min-h-[var(--touch-min)] md:min-w-[var(--touch-min)] md:p-[var(--btn-icon-padding)]";

export function AppearanceToolbar() {
  const { colorScheme, toggleColorScheme } = useTheme();

  return (
    <button
      type="button"
      className={headerIconButtonClass}
      aria-label={colorScheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      onClick={toggleColorScheme}
    >
      <Icon icon={colorScheme === "dark" ? Sun : Moon} size="md" />
    </button>
  );
}
