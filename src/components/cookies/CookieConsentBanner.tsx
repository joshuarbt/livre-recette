"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useCookieConsent } from "@/components/cookies/CookieConsentProvider";

export function CookieConsentBanner() {
  const {
    isBannerOpen,
    hasChoice,
    preferences,
    acceptAll,
    refuseAll,
    savePreferences,
    closeBanner,
  } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(preferences.analytics);
  const titleId = useId();
  const settingsId = useId();

  useEffect(() => {
    if (isBannerOpen) {
      setAnalyticsEnabled(preferences.analytics);
      setShowSettings(false);
    }
  }, [isBannerOpen, preferences.analytics]);

  if (!isBannerOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[60] px-[var(--space-page-x)] pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-[var(--border-hairline)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] md:p-5">
        <div className="space-y-3">
          <h2 id={titleId} className="text-title text-[var(--foreground)]">
            Gestion des cookies
          </h2>
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            Nous utilisons des cookies essentiels au fonctionnement du service (session,
            préférences). Les cookies non essentiels (mesure d&apos;audience) sont bloqués par
            défaut. Consultez notre{" "}
            <Link
              href="/confidentialite#cookies"
              className="text-[var(--foreground)] underline-offset-2 hover:underline"
            >
              politique de confidentialité
            </Link>
            .
          </p>

          {showSettings ? (
            <div
              id={settingsId}
              className="space-y-3 rounded-[var(--radius-md)] border border-[var(--border-hairline)] bg-[var(--background)] p-3"
            >
              <label className="flex items-start gap-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1"
                  aria-describedby={`${settingsId}-essential`}
                />
                <span>
                  <span className="font-medium">Essentiels</span>
                  <span
                    id={`${settingsId}-essential`}
                    className="mt-1 block text-[var(--muted)]"
                  >
                    Nécessaires à la connexion et aux préférences techniques. Toujours actifs.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                  className="mt-1"
                  aria-describedby={`${settingsId}-analytics`}
                />
                <span>
                  <span className="font-medium">Mesure d&apos;audience</span>
                  <span
                    id={`${settingsId}-analytics`}
                    className="mt-1 block text-[var(--muted)]"
                  >
                    Statistiques anonymisées pour améliorer le service. Désactivée par défaut ;
                    aucun script n&apos;est chargé actuellement même si vous acceptez.
                  </span>
                </span>
              </label>

              <button
                type="button"
                className="btn-primary w-full sm:w-auto"
                onClick={() => savePreferences({ analytics: analyticsEnabled })}
              >
                Enregistrer mes choix
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn-primary flex-1 sm:flex-none" onClick={acceptAll}>
              Tout accepter
            </button>
            <button
              type="button"
              className="btn-secondary flex-1 sm:flex-none"
              onClick={refuseAll}
            >
              Tout refuser
            </button>
            <button
              type="button"
              className="btn-ghost flex-1 sm:flex-none"
              aria-expanded={showSettings}
              aria-controls={settingsId}
              onClick={() => setShowSettings((open) => !open)}
            >
              Paramétrer
            </button>
            {hasChoice ? (
              <button
                type="button"
                className="btn-ghost flex-1 sm:flex-none"
                onClick={closeBanner}
              >
                Fermer
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
