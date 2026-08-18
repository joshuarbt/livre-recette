import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isAdmin } from "@/lib/admin/is-admin";
import { createClient } from "@/lib/supabase/server";

export { isAdmin };

export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user)) {
    redirect("/");
  }

  return user;
}
