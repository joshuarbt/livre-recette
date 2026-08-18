type BrandLogoSize = "sm" | "md" | "lg";

type BrandLogoProps = {
  size?: BrandLogoSize;
  decorative?: boolean;
  className?: string;
};

const SIZE_CLASS: Record<BrandLogoSize, string> = {
  sm: "h-7 w-7 md:h-8 md:w-8",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

export function BrandLogo({
  size = "md",
  decorative = false,
  className = "",
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt={decorative ? "" : "App cuisine"}
      aria-hidden={decorative ? true : undefined}
      width={size === "lg" ? 64 : size === "md" ? 40 : 32}
      height={size === "lg" ? 64 : size === "md" ? 40 : 32}
      className={`shrink-0 ${SIZE_CLASS[size]} ${className}`.trim()}
    />
  );
}
