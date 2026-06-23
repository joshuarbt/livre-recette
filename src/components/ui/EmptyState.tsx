import Link from "next/link";

type EmptyStateProps = {
  message: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  message,
  description,
  actionLabel,
  actionHref,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`py-16 text-center md:py-20 ${className}`.trim()}>
      <p className="font-display text-[var(--text-display)] leading-[var(--text-display-leading)] text-[var(--muted)]">
        {message}
      </p>
      {description ? <p className="text-caption mx-auto mt-3 max-w-sm">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className="btn-ghost btn-ghost-underline mt-8 inline-flex">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
