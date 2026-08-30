"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";

export function RecipeAddAction() {
  return (
    <Link
      href="/recettes/nouvelle"
      aria-label="Nouvelle recette"
      className="btn-primary btn-sm inline-flex items-center gap-2"
    >
      <Icon icon={actionIcons.add} size="sm" />
      <span className="truncate md:hidden">Nouvelle</span>
      <span className="hidden truncate md:inline">Nouvelle recette</span>
    </Link>
  );
}
