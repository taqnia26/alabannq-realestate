import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  label?: string;
};

export function BrandLogo({
  className,
  imageClassName,
  label = "شركة العبنق العقارية",
}: BrandLogoProps) {
  return (
    <span
      className={cn(
        "brand-logo relative block overflow-hidden bg-[#222] shrink-0",
        className,
      )}
      aria-label={label}
    >
      <img
        src="/brand/alabnq-logo.png"
        alt={label}
        className={cn("brand-logo__image pointer-events-none absolute max-w-none", imageClassName)}
      />
    </span>
  );
}