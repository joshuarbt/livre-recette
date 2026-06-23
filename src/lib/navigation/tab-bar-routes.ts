function isAuthRoute(pathname: string): boolean {
  return pathname === "/login" || pathname === "/signup";
}

const TAB_BAR_PREFIXES = ["/planning", "/courses", "/congelateur"] as const;

/** Routes where the mobile bottom tab bar should appear (authenticated app shell). */
export function isTabBarRoute(pathname: string): boolean {
  if (isAuthRoute(pathname)) {
    return false;
  }

  if (pathname === "/" || pathname.startsWith("/recipes") || pathname.startsWith("/recettes")) {
    return true;
  }

  return TAB_BAR_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
