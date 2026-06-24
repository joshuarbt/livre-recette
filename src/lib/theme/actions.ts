"use server";

import { cookies } from "next/headers";
import {
  COLOR_SCHEME_COOKIE,
  DEFAULT_COLOR_SCHEME,
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type AppTheme,
  type ColorScheme,
} from "@/lib/theme/constants";

const cookieOptions = {
  path: "/",
  maxAge: THEME_COOKIE_MAX_AGE,
  sameSite: "lax" as const,
};

export async function setAppTheme(theme: AppTheme): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE, theme, cookieOptions);

  if (theme === "aero") {
    cookieStore.set(COLOR_SCHEME_COOKIE, DEFAULT_COLOR_SCHEME, cookieOptions);
  }
}

export async function setColorScheme(scheme: ColorScheme): Promise<void> {
  const cookieStore = await cookies();
  const currentTheme = cookieStore.get(THEME_COOKIE)?.value;

  if (currentTheme === "aero") {
    return;
  }

  cookieStore.set(COLOR_SCHEME_COOKIE, scheme, cookieOptions);
}
