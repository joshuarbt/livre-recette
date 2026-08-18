import { SignUpForm } from "@/components/auth/SignUpForm";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { PageShell } from "@/components/layout/PageShell";

export default function SignUpPage() {
  return (
    <PageShell title="Créer un compte" lead={<BrandLogo size="lg" />}>
      <SignUpForm />
    </PageShell>
  );
}
