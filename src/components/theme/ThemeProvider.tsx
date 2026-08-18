"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setColorScheme as persistColorScheme } from "@/lib/theme/actions";
import { DEFAULT_COLOR_SCHEME, type ColorScheme } from "@/lib/theme/constants";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  toggleColorScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyColorSchemeToDocument(colorScheme: ColorScheme) {
  document.documentElement.dataset.colorScheme = colorScheme;
}

type ThemeProviderProps = {
  initialColorScheme?: ColorScheme;
  children: ReactNode;
};

export function ThemeProvider({
  initialColorScheme = DEFAULT_COLOR_SCHEME,
  children,
}: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(initialColorScheme);

  const toggleColorScheme = useCallback(() => {
    const nextColorScheme: ColorScheme = colorScheme === "light" ? "dark" : "light";
    setColorSchemeState(nextColorScheme);
    applyColorSchemeToDocument(nextColorScheme);
    void persistColorScheme(nextColorScheme);
  }, [colorScheme]);

  const value = useMemo(
    () => ({
      colorScheme,
      toggleColorScheme,
    }),
    [colorScheme, toggleColorScheme],
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
