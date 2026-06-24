"use client";

import { Droplets, Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { AppTheme } from "@/lib/theme/constants";

const themeOptions: { value: AppTheme; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "aero", label: "Aero" },
];

export function AppearanceToolbar() {
  const { theme, colorScheme, setTheme, toggleColorScheme, canToggleColorScheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <div ref={menuRef} className="relative">
        <button
          type="button"
          className="btn-icon"
          aria-label="Choisir le thème visuel"
          aria-haspopup="listbox"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <Icon icon={Droplets} size="md" />
        </button>

        {isMenuOpen ? (
          <ul
            role="listbox"
            aria-label="Thèmes disponibles"
            className="theme-menu absolute right-0 top-full z-50 mt-2 min-w-[9rem] overflow-hidden rounded-sm py-1"
          >
            {themeOptions.map((option) => {
              const selected = theme === option.value;

              return (
                <li key={option.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`text-body flex w-full items-center px-3 py-2 text-left transition-opacity hover:opacity-80 ${
                      selected ? "font-medium text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                    onClick={() => {
                      setTheme(option.value);
                      setIsMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        className="btn-icon disabled:cursor-not-allowed disabled:opacity-40"
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
