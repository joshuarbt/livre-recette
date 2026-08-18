"use client";

import { useState, useTransition } from "react";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { updateUserEmail, updateUserPassword } from "@/lib/admin/actions";

type AdminUserEditSheetProps = {
  userId: string;
  currentEmail: string;
  mode: "email" | "password";
  onClose: () => void;
  onSaved: () => void;
};

export function AdminUserEditSheet({
  userId,
  currentEmail,
  mode,
  onClose,
  onSaved,
}: AdminUserEditSheetProps) {
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    setError(null);

    startTransition(async () => {
      const result =
        mode === "email"
          ? await updateUserEmail(userId, email)
          : await updateUserPassword(userId, password);

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSaved();
      onClose();
    });
  }

  const title = mode === "email" ? "Modifier l'identifiant" : "Nouveau mot de passe";

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={title}
      footer={
        <button
          type="button"
          disabled={isPending}
          onClick={handleSubmit}
          className="btn-primary w-full disabled:opacity-60"
        >
          {isPending ? "Enregistrement…" : "Enregistrer"}
        </button>
      }
    >
      <div className="space-y-4">
        {mode === "email" ? (
          <AuthFormField
            id="admin-user-email"
            label="E-mail (identifiant de connexion)"
            type="email"
            name="email"
            autoComplete="off"
            value={email}
            onChange={setEmail}
            disabled={isPending}
          />
        ) : (
          <AuthFormField
            id="admin-user-password"
            label="Nouveau mot de passe"
            type="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={setPassword}
            disabled={isPending}
          />
        )}

        {error ? (
          <p role="alert" className="alert-error">
            {error}
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
