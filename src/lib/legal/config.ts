/**
 * Informations légales et RGPD.
 * Les variables d'environnement LEGAL_* écrasent ces valeurs par défaut en production.
 */
function envOrPlaceholder(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

export const legalConfig = {
  appName: "App cuisine",
  lastUpdated: "30 octobre 2026",

  /** Éditeur / responsable du traitement */
  controllerName: envOrPlaceholder("LEGAL_CONTROLLER_NAME", "Joshua Raboteau"),
  legalForm: envOrPlaceholder(
    "LEGAL_FORM",
    "Personne physique (non professionnelle)",
  ),
  shareCapital: envOrPlaceholder("LEGAL_SHARE_CAPITAL", "Non applicable"),
  siret: envOrPlaceholder("LEGAL_SIRET", "Non applicable"),
  rcs: envOrPlaceholder("LEGAL_RCS", "Non applicable"),
  address: envOrPlaceholder(
    "LEGAL_ADDRESS",
    "Contact par e-mail uniquement (pas d'adresse postale publiée)",
  ),
  contactEmail: envOrPlaceholder("LEGAL_CONTACT_EMAIL", "joshua@raboteau.fr"),
  contactPhone: envOrPlaceholder("LEGAL_CONTACT_PHONE", "+33 6 30 06 11 49"),

  publicationDirector: envOrPlaceholder(
    "LEGAL_PUBLICATION_DIRECTOR",
    "Joshua Raboteau",
  ),

  hostName: envOrPlaceholder("LEGAL_HOST_NAME", "Vercel Inc."),
  hostAddress: envOrPlaceholder(
    "LEGAL_HOST_ADDRESS",
    "440 N Barranca Ave #4133, Covina, CA 91723, United States",
  ),
  hostPhone: envOrPlaceholder("LEGAL_HOST_PHONE", "+1 (415) 398-5463"),

  supabaseRegion: envOrPlaceholder(
    "LEGAL_SUPABASE_REGION",
    "Union européenne (région de votre projet Supabase)",
  ),
} as const;
