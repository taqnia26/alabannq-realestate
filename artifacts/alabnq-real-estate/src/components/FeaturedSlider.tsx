import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpLeft, ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import type { PublishedProperty } from "@/data/siteContent";
import { localized, usePreferences } from "@/lib/preferences";

export function FeaturedSlider({ properties, heading }: { properties: PublishedProperty[]; heading?: string }) {
  const { locale, t } = usePreferences();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const current = properties[index % properties.length];
  useEffect(() => {
    if (paused || properties.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % properties.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, properties.length]);
  const move = (direction: number) => setIndex(value => (value + direction + properties.length) % properties.length);
  return <section className="site-container py-24 md:py-36" aria-label={heading || t("العقارات المميزة", "Featured properties")}>
    <div className="mb-12 flex flex-wrap items-end justify-between gap-8"><div><span className="site-eyebrow">{t("اختياراتنا", "SELECTED SPACES")}</span><h2 className="site-display mt-6 text-4xl md:text-6xl">{heading || t("أحدث العروض المميزة", "Selected properties")}</h2></div><Link href="/properties" className="site-link-arrow">{t("جميع العقارات", "All properties")} <ArrowUpLeft size={17} /></Link></div>
    {current ? <div className="relative overflow-hidden bg-[#172329]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)} onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; setPaused(true); }} onTouchEnd={event => { const start = touchStart.current; const end = event.changedTouches[0]?.clientX; if (start !== null && end !== undefined && Math.abs(end - start) > 40) move(end < start ? 1 : -1); touchStart.current = null; setPaused(false); }}>
      <Link href={`/properties/${current.id}`} aria-label={t(`تفاصيل ${current.title}`, `Details of ${localized(current, "title", locale)}`)} className="group relative block h-[490px] md:h-[650px]">
        {properties.map((property, i) => <img key={property.id} src={property.image} loading="lazy" alt={i === index % properties.length ? localized(property, "title", locale) : ""} aria-hidden={i !== index % properties.length} className={`site-image absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === index % properties.length ? "opacity-100" : "opacity-0"}`} />)}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11191d]/95 via-[#11191d]/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-7 text-[#f3eee4] md:p-14"><span className="mb-5 inline-block border border-[#d8b675]/60 px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#d8b675]">{localized(current, "type", locale)}</span><h3 className="site-display max-w-3xl text-3xl md:text-5xl">{localized(current, "title", locale)}</h3><div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-[#f3eee4]/75"><span className="inline-flex items-center gap-2"><MapPin size={15} className="text-[#d8b675]" />{localized(current, "neighborhood", locale)}، {localized(current, "city", locale)}</span><span className="font-bold text-[#d8b675]">{localized(current, "priceLabel", locale)}</span></div></div>
      </Link>
      {properties.length > 1 && <div className="absolute end-6 top-6 flex gap-2 md:end-12 md:top-12"><button type="button" aria-label={t("العرض السابق", "Previous property")} onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center border border-[#f3eee4]/45 bg-[#11191d]/30 text-[#f3eee4] backdrop-blur-md transition-colors hover:border-[#d8b675]"><ArrowRight size={19} /></button><button type="button" aria-label={t("العرض التالي", "Next property")} onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center border border-[#f3eee4]/45 bg-[#11191d]/30 text-[#f3eee4] backdrop-blur-md transition-colors hover:border-[#d8b675]"><ArrowLeft size={19} /></button></div>}
    </div> : <div className="site-card px-8 py-20 text-center text-muted-foreground">{t("لا توجد عروض مميزة منشورة حاليًا.", "No featured properties are currently published.")}</div>}
    {properties.length > 1 && <div className="mt-6 flex items-center gap-6"><span className="text-xs tracking-widest text-accent" dir="ltr">{String(index % properties.length + 1).padStart(2, "0")} / {String(properties.length).padStart(2, "0")}</span><div className="h-px flex-1 bg-border"><div key={index} className="site-progress h-px w-full bg-accent" style={{ animationPlayState: paused ? "paused" : "running" }} /></div></div>}
  </section>;
}