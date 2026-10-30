import type { Metadata } from "next";
import Link from "next/link";
import { LegalArticle, LegalSection } from "@/components/legal/LegalArticle";
import { PageShell } from "@/components/layout/PageShell";
import { legalConfig } from "@/lib/legal/config";

export const metadata: Metadata = {
  title: `Politique de confidentialité — ${legalConfig.appName}`,
  description:
    "Politique de confidentialité et protection des données personnelles (RGPD).",
};

export default function ConfidentialitePage() {
  return (
    <PageShell
      title="Politique de confidentialité"
      subtitle={`Dernière mise à jour : ${legalConfig.lastUpdated}`}
      wide
    >
      <LegalArticle>
        <LegalSection title="1. Responsable du traitement">
          <p>
            Le responsable du traitement des données personnelles est{" "}
            <strong>{legalConfig.controllerName}</strong>.
          </p>
          <p>
            Pour toute question relative à vos données personnelles :{" "}
            <a
              href={`mailto:${legalConfig.contactEmail}`}
              className="text-[var(--foreground)] underline-offset-2 hover:underline"
            >
              {legalConfig.contactEmail}
            </a>
          </p>
        </LegalSection>

        <LegalSection title="2. Données collectées">
          <p>
            Nous collectons les données suivantes lorsque vous utilisez {legalConfig.appName} :
          </p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Compte</strong> — adresse e-mail et
              mot de passe (stockés de manière sécurisée par Supabase Auth)
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Recettes</strong> — titres,
              ingrédients, étapes, notes, photos et métadonnées associées
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Planning des repas</strong> —
              assignations de recettes aux jours / repas
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Listes de courses</strong> — articles
              et quantités
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Congélateur</strong> — entrées et
              dates de conservation
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Technique</strong> — cookies de
              session, préférence de thème et choix de consentement cookies (voir section
              Cookies)
            </li>
          </ul>
          <p className="text-[var(--muted)]">
            Nous ne collectons pas de données de géolocalisation, de publicité ni de suivi
            comportemental par défaut. Aucun outil d&apos;analytics n&apos;est chargé sans votre
            consentement préalable.
          </p>
        </LegalSection>

        <LegalSection title="3. Finalités et bases légales">
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Exécution du contrat</strong> (art. 6
              §1 b RGPD) — création de compte, gestion de vos recettes, planning, courses et
              congélateur
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Cookies essentiels</strong> —
              maintien de votre session connectée et mémorisation de préférences techniques
              (nécessaires au service)
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Consentement</strong> (art. 6 §1 a) —
              réservé à d&apos;éventuels outils d&apos;analyse ou de marketing ; bloqués par
              défaut jusqu&apos;à acceptation via le bandeau cookies
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Destinataires et sous-traitants">
          <p>Vos données sont hébergées et traitées par les prestataires suivants :</p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Supabase Inc.</strong> —
              authentification, base de données PostgreSQL et stockage des images (
              {legalConfig.supabaseRegion})
            </li>
            <li>
              <strong className="text-[var(--foreground)]">{legalConfig.hostName}</strong> —
              hébergement de l&apos;application web
            </li>
          </ul>
          <p className="text-[var(--muted)]">
            Des accords de sous-traitance (DPA) conformes au RGPD doivent être signés avec ces
            prestataires. Les polices typographiques Google sont téléchargées à la compilation et
            servies depuis notre infrastructure — aucune requête runtime vers Google.
          </p>
        </LegalSection>

        <LegalSection title="5. Transferts hors Union européenne">
          <p className="text-[var(--muted)]">
            Lorsque nos sous-traitants traitent des données en dehors de l&apos;Espace économique
            européen, ils s&apos;appuient sur des garanties appropriées (clauses contractuelles
            types de la Commission européenne ou décision d&apos;adéquation). Vérifiez la région
            de votre projet Supabase dans votre tableau de bord.
          </p>
        </LegalSection>

        <LegalSection title="6. Durée de conservation">
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              Données de compte et contenu utilisateur : conservées tant que votre compte est
              actif — [À REMPLIR : précision éventuelle de durée d&apos;inactivité]
            </li>
            <li>
              Après demande de suppression de compte : effacement sous 30 jours (sauf obligation
              légale contraire) — [À REMPLIR : confirmer le délai opérationnel]
            </li>
            <li>Cookies de session : durée de la session ou jusqu&apos;à déconnexion</li>
            <li>
              Préférence de thème et choix de consentement cookies : jusqu&apos;à 13 mois ou
              jusqu&apos;à suppression manuelle
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Vos droits">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Accès</strong> et{" "}
              <strong className="text-[var(--foreground)]">portabilité</strong> — demandez une
              copie de vos données à{" "}
              <a
                href={`mailto:${legalConfig.contactEmail}`}
                className="text-[var(--foreground)] underline-offset-2 hover:underline"
              >
                {legalConfig.contactEmail}
              </a>
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Rectification</strong> — modification
              de vos recettes et contenus dans l&apos;application ; contactez-nous pour
              l&apos;e-mail de compte
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Effacement</strong> — demandez la
              suppression de votre compte et de vos données par e-mail
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Opposition et limitation</strong> —
              contactez-nous par e-mail
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Réclamation</strong> — auprès de la
              CNIL (
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--foreground)] underline-offset-2 hover:underline"
              >
                www.cnil.fr
              </a>
              )
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="8. Sécurité">
          <p className="text-[var(--muted)]">
            Nous appliquons des mesures techniques appropriées : chiffrement HTTPS, isolation des
            données par utilisateur (Row Level Security), stockage privé des images, clés
            d&apos;API à privilèges limités côté client.
          </p>
        </LegalSection>

        <LegalSection title="9. Cookies" id="cookies">
          <p>
            Nous utilisons des cookies et stockages locaux strictement nécessaires au
            fonctionnement du service :
          </p>
          <ul className="list-disc space-y-2 pl-5 text-[var(--muted)]">
            <li>
              <strong className="text-[var(--foreground)]">Session Supabase</strong> (
              <code className="text-[var(--foreground)]">sb-*-auth-token</code>) — connexion
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Thème</strong> (
              <code className="text-[var(--foreground)]">app-color-scheme</code>) — préférence
              d&apos;affichage
            </li>
            <li>
              <strong className="text-[var(--foreground)]">Consentement</strong> — mémorisation
              de vos choix cookies (stockage local)
            </li>
          </ul>
          <p className="text-[var(--muted)]">
            Les cookies non essentiels (ex. mesure d&apos;audience) sont{" "}
            <strong className="text-[var(--foreground)]">bloqués par défaut</strong> et ne sont
            déposés qu&apos;après votre acceptation via le bandeau de consentement. Vous pouvez
            modifier vos choix à tout moment depuis le pied de page (« Gérer les cookies »).
          </p>
          <p className="text-[var(--muted)]">
            Pour plus de détails, consultez également nos{" "}
            <Link
              href="/mentions-legales"
              className="text-[var(--foreground)] underline-offset-2 hover:underline"
            >
              mentions légales
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="10. Âge minimum">
          <p className="text-[var(--muted)]">
            Le service est destiné aux personnes âgées d&apos;au moins 16 ans. Si vous pensez
            qu&apos;un mineur nous a transmis des données sans autorisation parentale,
            contactez-nous pour demander leur suppression.
          </p>
        </LegalSection>

        <LegalSection title="11. Modifications">
          <p className="text-[var(--muted)]">
            Nous pouvons mettre à jour cette politique. La date de dernière mise à jour figure en
            tête de page. En cas de changement substantiel, nous vous en informerons par des
            moyens appropriés.
          </p>
        </LegalSection>
      </LegalArticle>
    </PageShell>
  );
}
