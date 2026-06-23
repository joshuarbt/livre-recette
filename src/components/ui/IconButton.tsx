import Link from "next/link";
import type { LucideIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/Icon";

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
};

export function IconButton({
  icon,
  label,
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-icon relative ${className}`.trim()}
      aria-label={label}
    >
      <Icon icon={icon} size="md" />
    </button>
  );
}

type IconLinkProps = {
  icon: LucideIcon;
  label: string;
  href: string;
  className?: string;
};

export function IconLink({ icon, label, href, className = "" }: IconLinkProps) {
  return (
    <Link href={href} className={`btn-icon ${className}`.trim()} aria-label={label}>
      <Icon icon={icon} size="md" />
    </Link>
  );
}
