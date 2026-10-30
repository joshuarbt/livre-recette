export const COOKIE_CONSENT_STORAGE_KEY = "app-cuisine-cookie-consent";

export type CookieConsentPreferences = {
  /** Toujours true — cookies de session et préférences techniques. */
  essential: true;
  /** Mesure d'audience / analytics — désactivé par défaut (CNIL). */
  analytics: boolean;
};

export type CookieConsentState = {
  version: 1;
  updatedAt: string;
  preferences: CookieConsentPreferences;
};

export const DEFAULT_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  analytics: false,
};

export function createConsentState(
  preferences: Pick<CookieConsentPreferences, "analytics">,
): CookieConsentState {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    preferences: {
      essential: true,
      analytics: preferences.analytics,
    },
  };
}

export function parseConsentState(raw: string | null): CookieConsentState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.version !== 1 || !parsed.preferences || !parsed.updatedAt) {
      return null;
    }

    return {
      version: 1,
      updatedAt: parsed.updatedAt,
      preferences: {
        essential: true,
        analytics: Boolean(parsed.preferences.analytics),
      },
    };
  } catch {
    return null;
  }
}

export function readConsentFromStorage(): CookieConsentState | null {
  if (typeof window === "undefined") {
    return null;
  }

  return parseConsentState(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY));
}

export function writeConsentToStorage(state: CookieConsentState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(state));
}
