import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowUpLeft, Building2, MapPin, Newspaper, Search } from "lucide-react";
import { useSiteContent } from "@/data/siteContent";
import { localized, usePreferences } from "@/lib/preferences";

type SearchMode = "hero" | "navbar" | "mobile";
type Suggestion = { id: string; title: string; subtitle: string; href: string; type: "property" | "article" | "neighborhood"; searchText: string };
const normalize = (s: string) => s.toLocaleLowerCase().replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();
const icons = { property: Building2, article: Newspaper, neighborhood: MapPin };

export function SiteSearch({ mode = "navbar", className = "", onNavigate }: { mode?: SearchMode; className?: string; onNavigate?: () => void }) {
  const { data } = useSiteContent();
  const { locale, t } = usePreferences();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const properties = data?.properties ?? [];
  const articles = data?.articles ?? [];
  const suggestions = useMemo(() => {
    if (!normalize(query)) return [];
    const items: Suggestion[] = [
      ...properties.map(p => ({ id: `property-${p.id}`, title: localized(p, "title", locale), subtitle: `${localized(p, "type", locale)} · ${localized(p, "neighborhood", locale)} · ${localized(p, "priceLabel", locale)}`, href: `/properties/${p.id}`, type: "property" as const, searchText: `${p.title} ${p.titleEn} ${p.neighborhood} ${p.neighborhoodEn} ${p.description} ${p.descriptionEn}` })),
      ...articles.map(a => ({ id: `article-${a.id}`, title: localized(a, "title", locale), subtitle: `${localized(a, "category", locale)} · ${localized(a, "readTime", locale)}`, href: `/articles/${a.id}`, type: "article" as const, searchText: `${a.title} ${a.titleEn} ${a.excerpt} ${a.excerptEn}` })),
      ...Array.from(new Set(properties.map(p => p.neighborhood))).map(n => { const p = properties.find(item => item.neighborhood === n)!; return { id: `neighborhood-${n}`, title: t(`عقارات حي ${n}`, `Properties in ${localized(p, "neighborhood", "en")}`), subtitle: t("استعراض العقارات في الحي", "Explore properties in this district"), href: `/properties?q=${encodeURIComponent(n)}`, type: "neighborhood" as const, searchText: `${n} ${p.neighborhoodEn}` }; }),
    ];
    return items.map(item => ({ item, score: normalize(item.title).startsWith(normalize(query)) ? 0 : normalize(item.title).includes(normalize(query)) ? 1 : normalize(`${item.subtitle} ${item.searchText}`).includes(normalize(query)) ? 2 : 3 })).filter(({ score }) => score < 3).sort((a, b) => a.score - b.score).slice(0, 7).map(({ item }) => item);
  }, [query, properties, articles, locale, t]);
  const navigate = (href: string) => { setLocation(href); setQuery(""); setIsOpen(false); onNavigate?.(); };
  const hero = mode === "hero";
  return <form role="search" onSubmit={event => { event.preventDefault(); if (!query.trim()) return; navigate(suggestions[0]?.href || `/properties?q=${encodeURIComponent(query.trim())}`); }} onBlur={() => window.setTimeout(() => setIsOpen(false), 120)} className={`relative ${hero ? "flex flex-col gap-2 sm:flex-row" : ""} ${className}`}>
    <div className="relative flex-1">
      <Search size={19} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input type="search" data-testid={`input-search-${mode}`} value={query} onFocus={() => setIsOpen(true)} onChange={event => { setQuery(event.target.value); setIsOpen(true); }} placeholder={hero ? t("ابحث عن عقار أو حي أو مقال", "Search property, district or article") : t("ابحث في الموقع", "Search the site")} aria-label={t("البحث في العقارات والأخبار", "Search properties and articles")} aria-autocomplete="list" autoComplete="off" className={`site-input w-full ps-12 pe-4 text-sm ${hero ? "h-14 border-[#eee8db]/30 bg-[#182329]/85 text-[#f3eee4] placeholder:text-[#eee8db]/55" : "h-11"}`} />
      {isOpen && query.trim() && <div role="listbox" className="absolute inset-x-0 top-[calc(100%+7px)] z-[80] max-h-[400px] overflow-y-auto border border-border bg-popover p-2 text-popover-foreground shadow-2xl">
        <div className="border-b border-border px-3 py-2 text-[11px] font-bold text-accent">{t("اقتراحات من الموقع", "SITE SUGGESTIONS")} · {suggestions.length}</div>
        {suggestions.length ? suggestions.map(s => { const Icon = icons[s.type]; return <button key={s.id} type="button" role="option" aria-selected="false" onMouseDown={event => event.preventDefault()} onClick={() => navigate(s.href)} className="flex w-full items-center gap-3 border-b border-border/50 p-3 text-start transition-colors hover:bg-secondary"><Icon size={17} className="shrink-0 text-accent" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{s.title}</span><span className="block truncate text-xs text-muted-foreground">{s.subtitle}</span></span></button>; }) : <p className="p-4 text-sm text-muted-foreground">{t("لا توجد نتيجة مطابقة. جرّب كلمة أخرى.", "No matching results. Try another search.")}</p>}
        <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => navigate(`/properties?q=${encodeURIComponent(query.trim())}`)} className="flex w-full items-center justify-between p-3 text-sm font-bold text-accent">{t("عرض كل نتائج العقارات", "View property search results")} <ArrowUpLeft size={16} /></button>
      </div>}
    </div>
    {hero && <button type="submit" data-testid="button-search-submit" className="site-button flex h-14 items-center justify-center gap-3 px-7 text-sm font-bold">{t("ابحث الآن", "Search now")} <ArrowUpLeft size={17} /></button>}
  </form>;
}