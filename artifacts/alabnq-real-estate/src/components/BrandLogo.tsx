import { cn } from "@/lib/utils";
import { usePreferences } from "@/lib/preferences";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
  label?: string;
  tone?: "auto" | "dark" | "light";
};

export function BrandLogo({
  className,
  imageClassName,
  label = "شركة العبنق العقارية",
  tone = "auto",
}: BrandLogoProps) {
  const { theme } = usePreferences();
  const resolvedTone = tone === "auto" ? theme : tone;
  return (
    <span
      className={cn(
        "brand-logo relative block shrink-0",
        className,
      )}
      aria-label={label}
    >
      <img
        src={`/brand/alabnq-mark-${resolvedTone}.png`}
        alt={label}
        className={cn("brand-logo__image pointer-events-none block", imageClassName)}
      />
    </span>
  );
}