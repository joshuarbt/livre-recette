const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "Identifiants incorrects.",
  "Email not confirmed": "Adresse e-mail non confirmée.",
  "User already registered": "Un compte existe déjà avec cette adresse e-mail.",
  "Password should be at least 6 characters":
    "Le mot de passe doit contenir au moins 6 caractères.",
  "Unable to validate email address: invalid format":
    "Format d'adresse e-mail invalide.",
};

export function translateAuthError(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}
