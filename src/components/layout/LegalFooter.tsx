"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { isTabBarRoute } from "@/lib/navigation/tab-bar-routes";

const linkClass =
  "inline-flex min-h-[44px] items-center px-1 transition-opacity hover:text-[var(--foreground)] hover:opacity-80";

export function LegalFooter() {
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const { openBanner } = useCookieConsent();

  const showTabBarClearance = !isDesktop && isTabBarRoute(pathname);

  return (
    <footer
      className={`mt-auto border-t border-[var(--border-hairline)] px-[var(--space-page-x)] py-4 ${
        showTabBarClearance ? "pb-tab-bar" : ""
      } md:pb-6`.trim()}
    >
      <nav
        className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-1 gap-y-1 text-caption text-[var(--muted)]"
        aria-label="Informations légales"
      >
        <Link href="/mentions-legales" className={linkClass}>
          Mentions légales
        </Link>
        <span aria-hidden="true" className="text-[var(--muted-light)]">
          ·
        </span>
        <Link href="/confidentialite" className={linkClass}>
          Confidentialité
        </Link>
        <span aria-hidden="true" className="text-[var(--muted-light)]">
          ·
        </span>
        <Link href="/cgu" className={linkClass}>
          CGU
        </Link>
        <span aria-hidden="true" className="text-[var(--muted-light)]">
          ·
        </span>
        <button type="button" className={linkClass} onClick={openBanner}>
          Gérer les cookies
        </button>
      </nav>
    </footer>
  );
}
