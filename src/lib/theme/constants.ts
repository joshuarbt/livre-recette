export type AppTheme =
  | "default"
  | "aero"
  | "matrix"
  | "gameboy"
  | "barbie"
  | "vaporwave"
  | "ghibli";
export type ColorScheme = "light" | "dark";

export const THEME_COOKIE = "app-theme";
export const COLOR_SCHEME_COOKIE = "app-color-scheme";

export const DEFAULT_THEME: AppTheme = "default";
export const DEFAULT_COLOR_SCHEME: ColorScheme = "light";

export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const THEME_CYCLE: AppTheme[] = [
  "default",
  "aero",
  "matrix",
  "gameboy",
  "barbie",
  "vaporwave",
  "ghibli",
];

export const THEME_LABELS: Record<AppTheme, string> = {
  default: "Default",
  aero: "Aero",
  matrix: "Matrix",
  gameboy: "GameBoy",
  barbie: "Barbie",
  vaporwave: "Vaporwave",
  ghibli: "Ghibli",
};

const VALID_THEMES = new Set<string>(THEME_CYCLE);

export function getNextTheme(current: AppTheme): AppTheme {
  const index = THEME_CYCLE.indexOf(current);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export function parseAppTheme(value: string | undefined): AppTheme {
  if (value === "ios26") {
    return "gameboy";
  }

  if (value && VALID_THEMES.has(value)) {
    return value as AppTheme;
  }

  return "default";
}

export function parseColorScheme(value: string | undefined): ColorScheme {
  return value === "dark" ? "dark" : "light";
}
