type LegalArticleProps = {
  children: React.ReactNode;
};

export function LegalArticle({ children }: LegalArticleProps) {
  return (
    <article className="legal-article space-y-6 text-sm leading-relaxed text-[var(--foreground)]">
      {children}
    </article>
  );
}

export function LegalSection({
  title,
  id,
  children,
}: {
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="space-y-3 scroll-mt-24">
      <h2 className="text-title text-[var(--foreground)]">{title}</h2>
      {children}
    </section>
  );
}
