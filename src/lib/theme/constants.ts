export type ColorScheme = "light" | "dark";

export const COLOR_SCHEME_COOKIE = "app-color-scheme";

export const DEFAULT_COLOR_SCHEME: ColorScheme = "light";

export const COLOR_SCHEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseColorScheme(value: string | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}
