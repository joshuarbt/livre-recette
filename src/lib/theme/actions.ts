"use server";

import { cookies } from "next/headers";
import {
  COLOR_SCHEME_COOKIE,
  COLOR_SCHEME_COOKIE_MAX_AGE,
  type ColorScheme,
} from "@/lib/theme/constants";

export async function setColorScheme(scheme: ColorScheme): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COLOR_SCHEME_COOKIE, scheme, {
    path: "/",
    maxAge: COLOR_SCHEME_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}
