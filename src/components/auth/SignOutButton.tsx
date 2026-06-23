import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn-ghost text-[var(--muted)]">
        Se déconnecter
      </button>
    </form>
  );
}
