"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { actionIcons } from "@/lib/icons";

export function RecipeAddAction() {
  return (
    <Link href="/recettes/nouvelle" className="btn-primary inline-flex items-center gap-2">
      <Icon icon={actionIcons.add} size="sm" />
      Nouvelle recette
    </Link>
  );
}
