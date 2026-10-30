import type { Metadata } from "next";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import { PageShell } from "@/components/layout/PageShell";
import { legalConfig } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: `Mentions légales — ${legalConfig.appName}`,
  description: "Mentions légales du site (éditeur, hébergeur, directeur de la publication).",
};

export default function MentionsLegalesPage() {
  return (
    <PageShell
      title="Mentions légales"
      subtitle={`Dernière mise à jour : ${legalConfig.lastUpdated}`}
      wide
    >
      <LegalArticle>
        <LegalSection title="1. Éditeur du site">
          <p className="text-[var(--muted)]">
            Le site <strong className="text-[var(--foreground)]">{legalConfig.appName}</strong>{" "}
            est édité par :
          </p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Nom / raison sociale</strong> —{" "}
              {legalConfig.controllerName}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Forme juridique</strong> —{" "}
              {legalConfig.legalForm}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Capital social</strong> —{" "}
              {legalConfig.shareCapital}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">SIRET</strong> — {legalConfig.siret}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">RCS</strong> — {legalConfig.rcs}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Siège / adresse</strong> —{" "}
              {legalConfig.address}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">E-mail</strong> —{" "}
              <a
                href={`mailto:${legalConfig.contactEmail}`}
                className="text-[var(--foreground)] underline-offset-2 hover:underline"
              >
                {legalConfig.contactEmail}
              </a>
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Téléphone</strong> —{" "}
              {legalConfig.contactPhone}
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="2. Directeur de la publication">
          <p className="text-[var(--muted)]">
            Le directeur de la publication est{" "}
            <strong className="text-[var(--foreground)]">
              {legalConfig.publicationDirector}
            </strong>
            .
          </p>
        </LegalSection>

        <LegalSection title="3. Hébergeur">
          <p className="text-[var(--muted)]">Le site est hébergé par :</p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Nom</strong> — {legalConfig.hostName}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Adresse</strong> —{" "}
              {legalConfig.hostAddress}
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Téléphone</strong> —{" "}
              {legalConfig.hostPhone}
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Contact">
          <p className="text-[var(--muted)]">
            Pour toute question relative au site ou aux présentes mentions :{" "}
            <a
              href={`mailto:${legalConfig.contactEmail}`}
              className="text-[var(--foreground)] underline-offset-2 hover:underline"
            >
              {legalConfig.contactEmail}
            </a>
            .
          </p>
        </LegalSection>
      </LegalArticle>
    </PageShell>
  );
}
