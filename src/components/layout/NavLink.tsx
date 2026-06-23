"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
};

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return (
      pathname === "/" ||
      pathname.startsWith("/recipes") ||
      pathname.startsWith("/recettes")
    );
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      className={`text-caption relative pb-0.5 font-normal transition-opacity hover:opacity-70 ${
        isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
      }`}
    >
      {label}
      {isActive ? (
        <span className="absolute -bottom-1 left-0 h-px w-full bg-[var(--accent)]" />
      ) : null}
    </Link>
  );
}
