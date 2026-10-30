/**
 * Informations légales et RGPD.
 * Remplacez les valeurs par défaut via les variables d'environnement en production.
 */
function envOrPlaceholder(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value || fallback;
}

export const legalConfig = {
  appName: "App cuisine",
  lastUpdated: "30 octobre 2026",

  /** Éditeur / responsable du traitement */
  controllerName: envOrPlaceholder(
    "LEGAL_CONTROLLER_NAME",
    "[Nom de l'éditeur — À REMPLIR]",
  ),
  legalForm: envOrPlaceholder(
    "LEGAL_FORM",
    "[Forme juridique — À REMPLIR, ex. EI / SAS / SARL]",
  ),
  shareCapital: envOrPlaceholder(
    "LEGAL_SHARE_CAPITAL",
    "[Capital social — À REMPLIR, ou « non applicable » pour une personne physique]",
  ),
  siret: envOrPlaceholder("LEGAL_SIRET", "[SIRET — À REMPLIR]"),
  rcs: envOrPlaceholder(
    "LEGAL_RCS",
    "[RCS / ville d'immatriculation — À REMPLIR, ou « non applicable »]",
  ),
  address: envOrPlaceholder(
    "LEGAL_ADDRESS",
    "[Adresse du siège / domicile — À REMPLIR]",
  ),
  contactEmail: envOrPlaceholder("LEGAL_CONTACT_EMAIL", "contact@example.com"),
  contactPhone: envOrPlaceholder(
    "LEGAL_CONTACT_PHONE",
    "[Téléphone — À REMPLIR]",
  ),

  publicationDirector: envOrPlaceholder(
    "LEGAL_PUBLICATION_DIRECTOR",
    "[Nom du directeur de la publication — À REMPLIR]",
  ),

  hostName: envOrPlaceholder(
    "LEGAL_HOST_NAME",
    "[Nom de l'hébergeur — À REMPLIR, ex. Vercel Inc.]",
  ),
  hostAddress: envOrPlaceholder(
    "LEGAL_HOST_ADDRESS",
    "[Adresse de l'hébergeur — À REMPLIR]",
  ),
  hostPhone: envOrPlaceholder(
    "LEGAL_HOST_PHONE",
    "[Téléphone de l'hébergeur — À REMPLIR]",
  ),

  supabaseRegion: envOrPlaceholder(
    "LEGAL_SUPABASE_REGION",
    "Union européenne (région de votre projet Supabase)",
  ),
} as const;
