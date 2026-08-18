"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AdminUserEditSheet } from "@/components/admin/AdminUserEditSheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { deleteUserAccount } from "@/lib/admin/actions";
import type { AdminUserListItem } from "@/types/admin";

type AdminUsersPanelProps = {
  users: AdminUserListItem[];
  currentUserId: string;
};

type EditState = {
  userId: string;
  email: string;
  mode: "email" | "password";
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Jamais";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminUsersPanel({ users, currentUserId }: AdminUsersPanelProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editState, setEditState] = useState<EditState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");
    if (!term) {
      return users;
    }

    return users.filter(
      (user) =>
        user.email.toLocaleLowerCase("fr").includes(term) ||
        user.id.toLocaleLowerCase("fr").includes(term),
    );
  }, [users, search]);

  function handleDelete(user: AdminUserListItem) {
    if (user.id === currentUserId) {
      return;
    }

    if (!window.confirm(`Supprimer le compte ${user.email || user.id} ? Cette action est irréversible.`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteUserAccount(user.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="input-field"
        placeholder="Rechercher un e-mail ou un identifiant…"
        aria-label="Rechercher un utilisateur"
      />

      {filteredUsers.length === 0 ? (
        <EmptyState message="Aucun utilisateur trouvé." />
      ) : (
        <ul className="space-y-3">
          {filteredUsers.map((user) => {
            const isSelf = user.id === currentUserId;

            return (
              <li
                key={user.id}
                className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
              >
                <div className="min-w-0">
                  <p className="text-heading break-all">{user.email || "Sans e-mail"}</p>
                  <p className="text-caption mt-1 break-all">{user.id}</p>
                  <p className="text-caption mt-1">
                    Créé le {formatDate(user.createdAt)}
                    {" · "}
                    Dernière connexion {formatDate(user.lastSignInAt)}
                    {user.isAdmin ? " · Admin" : ""}
                    {isSelf ? " · Vous" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setEditState({ userId: user.id, email: user.email, mode: "email" })
                    }
                    className="btn-ghost text-sm"
                  >
                    Identifiant
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setEditState({ userId: user.id, email: user.email, mode: "password" })
                    }
                    className="btn-ghost text-sm"
                  >
                    Mot de passe
                  </button>
                  <button
                    type="button"
                    disabled={isPending || isSelf}
                    onClick={() => handleDelete(user)}
                    className="btn-ghost text-sm text-[var(--status-error)] disabled:opacity-40"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {error ? (
        <p role="alert" className="alert-error">
          {error}
        </p>
      ) : null}

      {editState ? (
        <AdminUserEditSheet
          userId={editState.userId}
          currentEmail={editState.email}
          mode={editState.mode}
          onClose={() => setEditState(null)}
          onSaved={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
