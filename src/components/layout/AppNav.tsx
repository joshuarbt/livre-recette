import Link from "next/link";
import { AppNavUser } from "@/components/layout/AppNavUser";
import { NavLink } from "@/components/layout/NavLink";
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

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border-hairline)] bg-[var(--background)]">
      <div
        className="mx-auto flex max-w-5xl items-center justify-between px-[var(--space-page-x)]"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Link
          href={user ? "/" : "/"}
          className="font-display text-lg tracking-wide text-[var(--foreground)] transition-opacity hover:opacity-70 md:text-xl"
        >
          App cuisine
        </Link>

        {user ? (
          <div className="flex items-center gap-x-4 md:gap-x-6">
            <nav className="hidden items-center gap-x-6 md:flex" aria-label="Navigation principale">
              {desktopNavLinks.map(({ href, label }) => (
                <NavLink key={href} href={href} label={label} />
              ))}
            </nav>
            <AppNavUser email={user.email} />
          </div>
        ) : (
          <div className="hidden items-center gap-x-5 md:flex">
            <Link href="/login" className="text-caption transition-opacity hover:opacity-70">
              Se connecter
            </Link>
            <Link href="/signup" className="btn-primary btn-sm text-xs">
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
