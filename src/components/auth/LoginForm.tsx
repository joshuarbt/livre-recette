"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { translateAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(translateAuthError(signInError.message));
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthFormField
          id="login-email"
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={isLoading}
        />
        <AuthFormField
          id="login-password"
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          disabled={isLoading}
        />

        {error ? (
          <p role="alert" className="alert-error">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={isLoading} className="btn-primary w-full">
          {isLoading ? "Connexion en cours…" : "Se connecter"}
        </button>
      </form>

      <p className="text-meta text-center">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-[var(--foreground)] underline-offset-2 hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
