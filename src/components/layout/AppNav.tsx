import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AppNavUser } from "@/components/layout/AppNavUser";
import { NavLink } from "@/components/layout/NavLink";
import { AppearanceToolbar } from "@/components/theme/AppearanceToolbar";
import { isAdmin } from "@/lib/admin/is-admin";
import { hasPublicEnv } from "@/lib/env/public";
import { createClient } from "@/lib/supabase/server";

const desktopNavLinks = [
  { href: "/", label: "Recettes" },
  { href: "/planning", label: "Planning" },
  { href: "/courses", label: "Courses" },
  { href: "/congelateur", label: "Congélateur" },
] as const;

export async function AppNav() {
  let user = null;

  if (hasPublicEnv()) {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  const showAdminLink = Boolean(user && isAdmin(user));

  return (
    <header className="app-header sticky top-0 z-40 md:border-b md:border-[var(--border-hairline)] md:bg-[var(--background)]">
      <div
        className="mx-auto flex max-w-5xl items-center justify-between px-[var(--space-page-x)]"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 text-[var(--foreground)] transition-opacity hover:opacity-70"
        >
          <BrandLogo size="sm" decorative />
          <span className="font-display truncate text-base tracking-wide md:text-xl">
            App cuisine
          </span>
        </Link>

        {user ? (
          <div className="flex shrink-0 items-center gap-1 md:gap-x-3">
            <nav className="hidden items-center gap-x-6 md:flex" aria-label="Navigation principale">
              {desktopNavLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} />
              ))}
              {showAdminLink ? <NavLink href="/admin" label="Admin" /> : null}
            </nav>
            {showAdminLink ? (
              <Link href="/admin" className="text-caption md:hidden">
                Admin
              </Link>
            ) : null}
            <AppearanceToolbar />
            <AppNavUser email={user.email} />
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-x-3 md:gap-x-5">
            <AppearanceToolbar />
            <div className="hidden items-center gap-x-5 md:flex">
              <Link href="/login" className="text-caption transition-opacity hover:opacity-70">
                Se connecter
              </Link>
              <Link href="/signup" className="btn-primary btn-sm text-xs">
                Créer un compte
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
