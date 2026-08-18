import type { User } from "@supabase/supabase-js";
import { getAdminUserIds } from "@/lib/env/server";

function getAppRole(user: User): string | undefined {
  const role = user.app_metadata?.role;
  return typeof role === "string" ? role : undefined;
}

export function isAdmin(user: User): boolean {
  if (getAppRole(user) === "admin") {
    return true;
  }

  return getAdminUserIds().includes(user.id);
}
