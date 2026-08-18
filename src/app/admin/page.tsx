import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { PageShell } from "@/components/layout/PageShell";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminUser = await requireAdmin();

  let users;
  try {
    users = await listAdminUsers();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de charger les utilisateurs.";
    return (
      <PageShell title="Administration" subtitle="Comptes utilisateurs">
        <p role="alert" className="alert-error">
          {message}
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Administration"
      subtitle={`${users.length} compte${users.length === 1 ? "" : "s"}`}
    >
      <AdminUsersPanel users={users} currentUserId={adminUser.id} />
    </PageShell>
  );
}
