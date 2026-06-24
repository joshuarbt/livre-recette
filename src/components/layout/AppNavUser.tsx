type AppNavUserProps = {
  email: string | undefined;
};

export function AppNavUser({ email }: AppNavUserProps) {
  const initial = email?.[0]?.toUpperCase() ?? "?";
  const label = email ? `Compte de ${email}` : "Compte utilisateur";

  return (
    <div className="flex items-center gap-x-2 md:gap-x-3">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--border-subtle)] text-xs font-medium text-[var(--foreground)] md:h-8 md:w-8"
        aria-label={label}
      >
        {initial}
      </span>
      {email ? (
        <span className="text-caption hidden max-w-[12rem] truncate text-[var(--muted)] sm:inline">
          {email}
        </span>
      ) : null}
    </div>
  );
}
