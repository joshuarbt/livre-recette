export type AppTheme = "default" | "aero";
export type ColorScheme = "light" | "dark";

export const THEME_COOKIE = "app-theme";
export const COLOR_SCHEME_COOKIE = "app-color-scheme";

export const DEFAULT_THEME: AppTheme = "default";
export const DEFAULT_COLOR_SCHEME: ColorScheme = "light";

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseAppTheme(value: string | undefined): AppTheme {
  return value === "aero" ? "aero" : "default";
}

export function parseColorScheme(value: string | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}
