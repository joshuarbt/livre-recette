import { cookies } from "next/headers";
import {
  COLOR_SCHEME_COOKIE,
  DEFAULT_COLOR_SCHEME,
  DEFAULT_THEME,
  THEME_COOKIE,
  parseAppTheme,
  parseColorScheme,
  type AppTheme,
  type ColorScheme,
} from "@/lib/theme/constants";

export async function getThemePreferences(): Promise<{
  theme: AppTheme;
  colorScheme: ColorScheme;
}> {
  const cookieStore = await cookies();
  const theme = parseAppTheme(cookieStore.get(THEME_COOKIE)?.value ?? DEFAULT_THEME);
  const colorScheme =
    theme === "aero"
      ? DEFAULT_COLOR_SCHEME
      : parseColorScheme(cookieStore.get(COLOR_SCHEME_COOKIE)?.value ?? DEFAULT_COLOR_SCHEME);

  return { theme, colorScheme };
}
