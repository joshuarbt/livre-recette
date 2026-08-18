import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PageShell } from "@/components/layout/PageShell";

export default function LoginPage() {
  return (
    <PageShell title="Se connecter" lead={<BrandLogo size="lg" />}>
      <LoginForm />
    </PageShell>
  );
}
