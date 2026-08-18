import { isAdmin } from "@/lib/admin/is-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AdminUserListItem } from "@/types/admin";
import type { User } from "@supabase/supabase-js";

function mapAdminUser(user: User): AdminUserListItem {
  return {
    id: user.id,
    email: user.email ?? "",
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at ?? null,
    isAdmin: isAdmin(user),
  };
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  const admin = createAdminClient();
  const users: AdminUserListItem[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(error.message);
    }

    const batch = data.users.map(mapAdminUser);
    users.push(...batch);

    if (batch.length < perPage) {
      break;
    }

    page += 1;
  }

  return users.sort((left, right) => left.email.localeCompare(right.email, "fr"));
}
