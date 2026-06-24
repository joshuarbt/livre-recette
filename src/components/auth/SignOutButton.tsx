import { LogOut } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { signOut } from "@/lib/auth/actions";

const headerIconButtonClass =
  "btn-icon group relative h-9 w-9 min-h-9 min-w-9 p-2 md:min-h-[var(--touch-min)] md:min-w-[var(--touch-min)] md:p-[var(--btn-icon-padding)]";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className={headerIconButtonClass} aria-label="Se déconnecter">
        <Icon icon={LogOut} size="md" />
        <span
          role="tooltip"
          className="text-caption pointer-events-none absolute left-1/2 top-full z-50 mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border border-[var(--border-hairline)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)] md:group-hover:block"
        >
          Se déconnecter
        </span>
      </button>
    </form>
  );
}
