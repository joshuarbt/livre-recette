import type { LucideIcon } from "@/lib/icons";

type IconSize = "sm" | "md";
type IconWeight = "regular" | "active";

const sizeClasses: Record<IconSize, string> = {
  sm: "h-[var(--icon-size-sm)] w-[var(--icon-size-sm)]",
  md: "h-[var(--icon-size-md)] w-[var(--icon-size-md)]",
};

const strokeWidths: Record<IconWeight, number> = {
  regular: 1.5,
  active: 1.75,
};

type IconProps = {
  icon: LucideIcon;
  size?: IconSize;
  weight?: IconWeight;
  className?: string;
};

export function Icon({
  icon: IconComponent,
  size = "md",
  weight = "regular",
  className = "",
}: IconProps) {
  return (
    <IconComponent
      className={`shrink-0 ${sizeClasses[size]} ${className}`.trim()}
      strokeWidth={strokeWidths[weight]}
      aria-hidden
    />
  );
}
