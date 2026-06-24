"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setAppTheme, setColorScheme } from "@/lib/theme/actions";
import {
  DEFAULT_COLOR_SCHEME,
  DEFAULT_THEME,
  getNextTheme,
  type AppTheme,
  type ColorScheme,
} from "@/lib/theme/constants";

type ThemeContextValue = {
  theme: AppTheme;
  colorScheme: ColorScheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  toggleColorScheme: () => void;
  isAero: boolean;
  isMatrix: boolean;
  canToggleColorScheme: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyThemeToDocument(theme: AppTheme, colorScheme: ColorScheme) {
  const root = document.documentElement;
  root.dataset.theme = theme;

  if (theme === "aero") {
    root.dataset.colorScheme = DEFAULT_COLOR_SCHEME;
    return;
  }

  root.dataset.colorScheme = colorScheme;
}

type ThemeProviderProps = {
  initialTheme?: AppTheme;
  initialColorScheme?: ColorScheme;
  children: ReactNode;
};

export function ThemeProvider({
  initialTheme = DEFAULT_THEME,
  initialColorScheme = DEFAULT_COLOR_SCHEME,
  children,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(initialTheme);
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    initialTheme === "aero" ? DEFAULT_COLOR_SCHEME : initialColorScheme,
  );

  const setTheme = useCallback(
    (nextTheme: AppTheme) => {
      const nextColorScheme =
        nextTheme === "aero" ? DEFAULT_COLOR_SCHEME : colorScheme;

      setThemeState(nextTheme);
      if (nextTheme === "aero") {
        setColorSchemeState(DEFAULT_COLOR_SCHEME);
      }

      applyThemeToDocument(nextTheme, nextColorScheme);
      void setAppTheme(nextTheme);
    },
    [colorScheme],
  );

  const toggleTheme = useCallback(() => {
    setTheme(getNextTheme(theme));
  }, [setTheme, theme]);

  const toggleColorScheme = useCallback(() => {
    if (theme === "aero") {
      return;
    }

    const nextColorScheme: ColorScheme = colorScheme === "light" ? "dark" : "light";
    setColorSchemeState(nextColorScheme);
    applyThemeToDocument(theme, nextColorScheme);
    void setColorScheme(nextColorScheme);
  }, [colorScheme, theme]);

  const value = useMemo(
    () => ({
      theme,
      colorScheme,
      setTheme,
      toggleTheme,
      toggleColorScheme,
      isAero: theme === "aero",
      isMatrix: theme === "matrix",
      canToggleColorScheme: theme !== "aero",
    }),
    [colorScheme, setTheme, theme, toggleColorScheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
