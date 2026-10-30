"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createConsentState,
  DEFAULT_COOKIE_PREFERENCES,
  readConsentFromStorage,
  writeConsentToStorage,
  type CookieConsentPreferences,
  type CookieConsentState,
} from "@/lib/cookies/consent";

type CookieConsentContextValue = {
  /** Null tant que l'utilisateur n'a pas fait de choix. */
  consent: CookieConsentState | null;
  preferences: CookieConsentPreferences;
  hasChoice: boolean;
  isBannerOpen: boolean;
  openBanner: () => void;
  closeBanner: () => void;
  acceptAll: () => void;
  refuseAll: () => void;
  savePreferences: (preferences: Pick<CookieConsentPreferences, "analytics">) => void;
  /** Helper pour futurs scripts analytics. */
  canUseAnalytics: boolean;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error("useCookieConsent must be used within CookieConsentProvider");
  }
  return context;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isBannerOpen, setIsBannerOpen] = useState(false);

  useEffect(() => {
    const stored = readConsentFromStorage();
    setConsent(stored);
    setIsBannerOpen(stored === null);
    setHydrated(true);
  }, []);

  const persist = useCallback((next: CookieConsentState) => {
    writeConsentToStorage(next);
    setConsent(next);
    setIsBannerOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    persist(createConsentState({ analytics: true }));
  }, [persist]);

  const refuseAll = useCallback(() => {
    persist(createConsentState({ analytics: false }));
  }, [persist]);

  const savePreferences = useCallback(
    (preferences: Pick<CookieConsentPreferences, "analytics">) => {
      persist(createConsentState({ analytics: preferences.analytics }));
    },
    [persist],
  );

  const openBanner = useCallback(() => {
    setIsBannerOpen(true);
  }, []);

  const closeBanner = useCallback(() => {
    if (consent !== null) {
      setIsBannerOpen(false);
    }
  }, [consent]);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consent,
      preferences: consent?.preferences ?? DEFAULT_COOKIE_PREFERENCES,
      hasChoice: consent !== null,
      isBannerOpen: hydrated && isBannerOpen,
      openBanner,
      closeBanner,
      acceptAll,
      refuseAll,
      savePreferences,
      canUseAnalytics: consent?.preferences.analytics === true,
    }),
    [
      consent,
      hydrated,
      isBannerOpen,
      openBanner,
      closeBanner,
      acceptAll,
      refuseAll,
      savePreferences,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  );
}
