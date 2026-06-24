export type AppTheme = "default" | "aero" | "matrix";
export type ColorScheme = "light" | "dark";

export const THEME_COOKIE = "app-theme";
export const COLOR_SCHEME_COOKIE = "app-color-scheme";

export const DEFAULT_THEME: AppTheme = "default";
export const DEFAULT_COLOR_SCHEME: ColorScheme = "light";

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const THEME_CYCLE: AppTheme[] = ["default", "aero", "matrix"];

export function getNextTheme(current: AppTheme): AppTheme {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export function parseAppTheme(value: string | undefined): AppTheme {
  if (value === "aero" || value === "matrix") {
    return value;
  }

  return "default";
}

export function parseColorScheme(value: string | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}
