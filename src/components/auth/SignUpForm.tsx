"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormField } from "@/components/auth/AuthFormField";
import { translateAuthError } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
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
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(translateAuthError(signUpError.message));
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
          id="signup-email"
          label="E-mail"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          disabled={isLoading}
        />
        <AuthFormField
          id="signup-password"
          label="Mot de passe"
          type="password"
          name="password"
          autoComplete="new-password"
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
          {isLoading ? "Création du compte…" : "Créer un compte"}
        </button>
      </form>

      <p className="text-meta text-center">
        Vous avez déjà un compte ?{" "}
        <Link href="/login" className="text-[var(--foreground)] underline-offset-2 hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
