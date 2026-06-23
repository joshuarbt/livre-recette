import { LoginForm } from "@/components/auth/LoginForm";
import { PageShell } from "@/components/layout/PageShell";

export default function LoginPage() {
  return (
    <PageShell title="Se connecter">
      <LoginForm />
    </PageShell>
  );
}
