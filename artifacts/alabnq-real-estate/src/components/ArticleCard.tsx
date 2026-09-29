import { Link } from "wouter";
import { ArrowUpLeft } from "lucide-react";
import type { Article } from "@/data/articles";
import { localized, usePreferences } from "@/lib/preferences";

export function ArticleCard({ article }: { article: Article }) {
  const { locale, t } = usePreferences();
  return <Link href={`/articles/${article.id}`} className="site-card group flex h-full flex-col overflow-hidden">
    <div className="relative aspect-[16/10] overflow-hidden bg-secondary"><img src={article.image} alt={localized(article, "title", locale)} loading="lazy" className="site-image h-full w-full object-cover" /><span className="absolute start-5 top-5 bg-[#182329] px-3 py-1.5 text-[10px] font-bold text-[#e5c180]">{localized(article, "category", locale)}</span></div>
    <div className="flex flex-1 flex-col p-6 md:p-8"><span className="text-xs text-muted-foreground">{new Date(article.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-GB", { year: "numeric", month: "long", day: "numeric" })} <span className="mx-2 text-accent">/</span> {localized(article, "readTime", locale)}</span><h3 className="site-display mt-5 text-xl transition-colors group-hover:text-accent md:text-2xl">{localized(article, "title", locale)}</h3><p className="mt-4 line-clamp-3 flex-1 text-sm leading-8 text-muted-foreground">{localized(article, "excerpt", locale)}</p><span className="site-link-arrow mt-7 border-t border-[var(--line-soft)] pt-5">{t("اقرأ المقال", "Read article")} <ArrowUpLeft size={17} /></span></div>
  </Link>;
}