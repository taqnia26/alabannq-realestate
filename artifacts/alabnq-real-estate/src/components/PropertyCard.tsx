import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpLeft, MapPin, Bed, Bath, Square, Heart } from "lucide-react";
import type { Property } from "@/data/mockProperties";
import { localized, usePreferences } from "@/lib/preferences";

export function PropertyCard({ property }: { property: Property }) {
  const { locale, t } = usePreferences();
  const [favorite, setFavorite] = useState(false);
  return <article data-testid="property-card" data-property-id={property.id} className="site-card group flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
      <Link href={`/properties/${property.id}`} className="absolute inset-0 z-10" aria-label={t(`تفاصيل ${property.title}`, `Details of ${localized(property, "title", locale)}`)} />
      <img src={property.image} alt={localized(property, "title", locale)} loading="lazy" decoding="async" className="site-image h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#121b20]/50 to-transparent" />
      <span className="absolute start-5 top-5 z-20 bg-[#182329] px-3 py-1.5 text-[11px] font-bold text-[#e5c180]">{localized(property, "type", locale)}</span>
      <button type="button" data-testid={`button-favorite-${property.id}`} aria-label={favorite ? t("إزالة من المفضلة", "Remove from favorites") : t("إضافة للمفضلة", "Add to favorites")} aria-pressed={favorite} onClick={() => setFavorite(value => !value)} className="absolute end-5 top-5 z-20 flex h-9 w-9 items-center justify-center border border-[#eee8db]/45 bg-[#121b20]/50 text-[#eee8db] backdrop-blur-md"><Heart size={16} className={favorite ? "fill-[#d8b675] text-[#d8b675]" : ""} /></button>
    </div>
    <div className="flex flex-1 flex-col p-6 md:p-7">
      <span className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={14} className="text-accent" />{localized(property, "neighborhood", locale)}، {localized(property, "city", locale)}</span>
      <Link href={`/properties/${property.id}`} className="mt-3"><h3 className="site-display line-clamp-2 min-h-[3.7rem] text-xl transition-colors group-hover:text-accent">{localized(property, "title", locale)}</h3></Link>
      <p className="mt-5 text-xl font-bold text-accent" dir={locale === "en" ? "ltr" : undefined}>{localized(property, "priceLabel", locale)}</p>
      <div className="mt-6 grid grid-cols-3 border-y border-[var(--line-soft)] py-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><Bed size={16} className="text-accent" />{property.rooms || "—"} {t("غرف", "beds")}</span><span className="flex items-center gap-2"><Bath size={16} className="text-accent" />{property.bathrooms || "—"} {t("حمامات", "baths")}</span><span className="flex items-center gap-2"><Square size={16} className="text-accent" />{property.area || "—"} {t("م²", "m²")}</span></div>
      <Link href={`/properties/${property.id}`} className="site-link-arrow mt-5 justify-between">{t("تفاصيل العقار", "Property details")} <ArrowUpLeft size={17} /></Link>
    </div>
  </article>;
}