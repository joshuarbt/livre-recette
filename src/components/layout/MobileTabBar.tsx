"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { navIcons } from "@/lib/icons";
import { isTabBarRoute } from "@/lib/navigation/tab-bar-routes";

const tabs = [
  { href: "/", label: "Recettes", icon: navIcons.recipes },
  { href: "/planning", label: "Planning", icon: navIcons.planning },
  { href: "/courses", label: "Courses", icon: navIcons.courses },
  { href: "/congelateur", label: "Congélateur", icon: navIcons.freezer },
] as const;

function isTabActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/recipes") ||
      pathname.startsWith("/recettes")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar() {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();

  if (isDesktop || !isTabBarRoute(pathname)) {
    return null;
  }

  return (
    <nav className="mobile-tab-bar" aria-label="Navigation principale">
      <div className="mobile-tab-bar__inner">
        {tabs.map(({ href, label, icon }) => {
          const active = isTabActive(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              className="mobile-tab-bar__link"
              aria-current={active ? "page" : undefined}
            >
              <span className="mobile-tab-bar__icon-pill">
                <Icon
                  icon={icon}
                  size="md"
                  weight={active ? "active" : "regular"}
                  className="mobile-tab-bar__icon"
                />
              </span>
              <span className="mobile-tab-bar__label">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
