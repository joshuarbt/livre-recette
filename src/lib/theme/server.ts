import { cookies } from "next/headers";
import {
  COLOR_SCHEME_COOKIE,
  DEFAULT_COLOR_SCHEME,
  parseColorScheme,
  type ColorScheme,
} from "@/lib/theme/constants";

export async function getThemePreferences(): Promise<{
  colorScheme: ColorScheme;
}> {
  const cookieStore = await cookies();
  const colorScheme = parseColorScheme(
    cookieStore.get(COLOR_SCHEME_COOKIE)?.value ?? DEFAULT_COLOR_SCHEME,
  );

  return { colorScheme };
}
