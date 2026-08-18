import { FadeIn } from "@/components/layout/motion";

type PageShellProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  wide?: boolean;
  actions?: React.ReactNode;
  lead?: React.ReactNode;
};

export function PageShell({
  title,
  subtitle,
  children,
  wide = false,
  actions,
  lead,
}: PageShellProps) {
  return (
    <FadeIn
      className={`mx-auto min-w-0 w-full px-[var(--space-page-x)] py-[var(--space-page-y)] ${
        wide ? "max-w-5xl" : "max-w-2xl"
      }`}
    >
      {lead ? <div className="mb-6 flex justify-center">{lead}</div> : null}
      <div
        className={`flex flex-col gap-4 md:flex-row md:items-start md:justify-between ${
          lead ? "text-center md:text-center" : ""
        }`}
      >
        <div className={`min-w-0 flex-1 ${lead ? "flex flex-col items-center" : ""}`}>
          <h1 className="break-words text-display">{title}</h1>
          {subtitle ? <p className="text-caption mt-3 break-words">{subtitle}</p> : null}
        </div>
        {actions ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children ? <div className="mt-8 min-w-0 md:mt-12">{children}</div> : null}
    </FadeIn>
  );
}
