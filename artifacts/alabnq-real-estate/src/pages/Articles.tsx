import { Link } from "wouter";
import { useSiteContent, useLocalizedSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";
import { ArticleCard } from "@/components/ArticleCard";

export default function Articles() {
  const { data, isLoading, isError, refetch } = useSiteContent();
  const { t } = usePreferences();
  const heading = useLocalizedSiteValue("articles.heading", "دليلك نحو قرارات عقارية واثقة", "A clearer perspective on property");
  const intro = useLocalizedSiteValue("articles.intro", "تغطيات، نصائح، وتحليلات متعمقة لسوق العقارات في مكة المكرمة نضعها بين يديك لتكون دليلك الشامل في رحلتك العقارية.", "Coverage, advice, and in-depth analysis of Makkah's property market to guide your property journey.");
  return <main className="site-shell flex-1 pb-28">
    <section className="site-always-dark relative isolate overflow-hidden bg-[#172329] py-24 text-[#f0ebdf] md:py-36"><img src="/hero/drive-05.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" /><div className="absolute inset-0 bg-gradient-to-l from-[#172329] via-[#172329]/85 to-[#172329]/55" /><div className="site-container relative"><span className="site-eyebrow">{t("الأخبار والمقالات", "THE JOURNAL")}</span><h1 className="site-display mt-7 max-w-4xl text-[clamp(2.7rem,5vw,5.8rem)]">{heading}</h1><p className="mt-7 max-w-2xl text-sm leading-9 text-[#eee8db]/75">{intro}</p></div></section>
    <div className="site-container py-16 md:py-24"><div className="mb-10 flex items-center justify-between border-b border-[var(--line-soft)] pb-6"><span className="site-eyebrow">{t("اقرأ واستكشف", "READ & EXPLORE")}</span><Link href="/properties" className="text-xs text-muted-foreground hover:text-accent">{t("تصفح العقارات", "Explore properties")} ↗</Link></div>
      {isLoading ? <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i => <div key={i} className="site-card animate-pulse"><div className="aspect-[16/10] bg-muted" /><div className="h-40 p-8"><div className="h-5 w-2/3 bg-muted" /></div></div>)}</div> : isError ? <div className="site-card py-20 text-center"><p>{t("تعذر تحميل المقالات.", "Could not load articles.")}</p><button onClick={() => void refetch()} className="site-button mt-5 px-6 py-3">{t("إعادة المحاولة", "Try again")}</button></div> : data?.articles.length ? <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{data.articles.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <div className="site-card py-20 text-center text-muted-foreground">{t("لا توجد مقالات منشورة حاليًا.", "No articles are currently published.")}</div>}
    </div>
  </main>;
}