function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getServiceRoleKey(): string {
  const value = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!value) {
    throw new Error(
      "Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return value;
}

export function getAdminUserIds(): string[] {
  const raw = readEnv("ADMIN_USER_IDS") ?? "";
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}
