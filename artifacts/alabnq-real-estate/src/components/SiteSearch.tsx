import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Building2, MapPin, Newspaper, Search } from "lucide-react";
import { articles } from "@/data/articles";
import { officialProperties, uniqueNeighborhoods } from "@/data/mockProperties";

type SearchMode = "hero" | "navbar" | "mobile";

interface SiteSearchProps {
  mode?: SearchMode;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  type: "property" | "article" | "neighborhood";
}

const normalizeArabic = (value: string) =>
  value
    .toLocaleLowerCase("ar")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .trim();

const suggestionIcon = {
  property: Building2,
  article: Newspaper,
  neighborhood: MapPin,
};

const suggestionLabel = {
  property: "عقار",
  article: "خبر",
  neighborhood: "حي",
};

export function SiteSearch({ mode = "navbar", className = "" }: SiteSearchProps) {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeArabic(query);
    if (!normalizedQuery) return [];

    const items: SearchSuggestion[] = [
      ...officialProperties.map((property) => ({
        id: `property-${property.id}`,
        title: property.title,
        subtitle: `${property.type} · حي ${property.neighborhood} · ${property.priceLabel}`,
        href: `/properties/${property.id}`,
        type: "property" as const,
      })),
      ...articles.map((article) => ({
        id: `article-${article.id}`,
        title: article.title,
        subtitle: `${article.category} · ${article.readTime}`,
        href: `/articles/${article.id}`,
        type: "article" as const,
      })),
      ...uniqueNeighborhoods.map((neighborhood) => ({
        id: `neighborhood-${neighborhood}`,
        title: `عقارات حي ${neighborhood}`,
        subtitle: "استعراض العروض الرسمية في الحي",
        href: `/properties?q=${encodeURIComponent(neighborhood)}`,
        type: "neighborhood" as const,
      })),
    ];

    return items
      .map((item) => {
        const searchable = normalizeArabic(`${item.title} ${item.subtitle}`);
        const title = normalizeArabic(item.title);
        const score = title.startsWith(normalizedQuery)
          ? 0
          : title.includes(normalizedQuery)
            ? 1
            : searchable.includes(normalizedQuery)
              ? 2
              : 3;
        return { item, score };
      })
      .filter(({ score }) => score < 3)
      .sort((a, b) => a.score - b.score)
      .slice(0, 7)
      .map(({ item }) => item);
  }, [query]);

  const navigateTo = (href: string) => {
    setLocation(href);
    setQuery("");
    setIsOpen(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    if (suggestions[0]) {
      navigateTo(suggestions[0].href);
      return;
    }

    navigateTo(`/properties?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const isHero = mode === "hero";
  const inputHeight = isHero ? "h-14" : "h-11";

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={`relative ${isHero ? "flex flex-col md:flex-row gap-3" : ""} ${className}`}
      onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
    >
      <div className="relative flex-1">
        <Search className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isHero ? "text-muted-foreground" : "text-primary/55"}`} />
        <input
          type="search"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder={isHero ? "ابحث عن عقار، حي، أو خبر..." : "ابحث في الموقع..."}
          aria-label="البحث في العقارات والأخبار"
          aria-autocomplete="list"
          autoComplete="off"
          className={`w-full ${inputHeight} rounded-xl border border-border/70 bg-white pr-12 pl-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-accent focus:ring-4 focus:ring-accent/10 ${isHero ? "text-base border-none shadow-sm" : ""}`}
        />

        {isOpen && query.trim() && (
          <div
            role="listbox"
            className="absolute top-[calc(100%+10px)] right-0 left-0 z-[80] overflow-hidden rounded-2xl border border-border bg-white text-right shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border/60 bg-secondary/50 px-4 py-3">
              <span className="text-xs font-bold text-primary">اقتراحات من داخل الموقع</span>
              <span className="text-[11px] text-muted-foreground">{suggestions.length} نتائج</span>
            </div>

            {suggestions.length > 0 ? (
              <div className="max-h-[360px] overflow-y-auto py-2">
                {suggestions.map((suggestion) => {
                  const Icon = suggestionIcon[suggestion.type];
                  return (
                    <button
                      key={suggestion.id}
                      type="button"
                      role="option"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateTo(suggestion.href)}
                      className="group flex w-full items-center gap-3 px-4 py-3 text-right transition-colors hover:bg-secondary/70"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-accent">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-primary">{suggestion.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">{suggestion.subtitle}</span>
                      </span>
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary">
                        {suggestionLabel[suggestion.type]}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => navigateTo(`/properties?q=${encodeURIComponent(query.trim())}`)}
                  className="flex w-full items-center justify-between border-t border-border/60 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-secondary/70"
                >
                  <span>عرض نتائج العقارات عن “{query.trim()}”</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <p className="font-bold text-primary">لا توجد نتيجة مطابقة داخل الموقع</p>
                <p className="mt-1 text-xs text-muted-foreground">جرّب اسم حي، نوع عقار، أو كلمة من عنوان خبر.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isHero && (
        <button
          type="submit"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-accent px-8 text-base font-bold text-primary transition-colors hover:bg-accent/90"
        >
          <Search className="ml-2 h-5 w-5" />
          بحث في الموقع
        </button>
      )}
    </form>
  );
}