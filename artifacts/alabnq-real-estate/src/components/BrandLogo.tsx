import { cn } from "@/lib/utils";
import { usePreferences } from "@/lib/preferences";
import { useSiteValue } from "@/data/siteContent";

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
  const darkImage = useSiteValue("brand.image.dark", "/brand/alabnq-mark-dark.png");
  const lightImage = useSiteValue("brand.image.light", "/brand/alabnq-mark-light.png");
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
        src={resolvedTone === "dark" ? darkImage : lightImage}
        alt={label}
        className={cn("brand-logo__image pointer-events-none block", imageClassName)}
      />
    </span>
  );
}