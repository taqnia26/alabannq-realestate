import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, ArrowUpLeft } from "lucide-react";
import type { PublishedArticle } from "@/data/siteContent";
import { localized, usePreferences } from "@/lib/preferences";

export function ArticleSlider({ articles, heading }: { articles: PublishedArticle[]; heading: string }) {
  const { locale, t } = usePreferences();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const currentIndex = index % Math.max(articles.length, 1);
  const current = articles[currentIndex];

  useEffect(() => {
    if (paused || articles.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % articles.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, articles.length]);

  const move = (direction: number) => setIndex(value => (value + direction + articles.length) % articles.length);
  return <section className="site-container py-24 md:py-36" aria-label={heading} dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="mb-12 flex flex-wrap items-end justify-between gap-8">
      <div><span className="site-eyebrow">{t("من أخبارنا", "FROM THE JOURNAL")}</span><h2 className="site-display mt-6 text-4xl md:text-6xl">{heading}</h2></div>
      <Link href="/articles" data-testid="link-all-articles" className="site-link-arrow">{t("جميع الأخبار والمقالات", "All news and articles")} <ArrowUpLeft size={17} /></Link>
    </div>
    {current ? <div className="relative overflow-hidden bg-[#172329]"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}
      onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; setPaused(true); }}
      onTouchEnd={event => {
        const start = touchStart.current;
        const end = event.changedTouches[0]?.clientX;
        if (start !== null && end !== undefined && Math.abs(end - start) > 40) move(end < start ? 1 : -1);
        touchStart.current = null; setPaused(false);
      }}>
      <Link href={`/articles/${current.id}`} data-testid={`link-featured-article-${current.id}`} aria-label={t(`اقرأ ${current.title}`, `Read ${localized(current, "title", locale)}`)} className="group relative block h-[490px] md:h-[650px]">
        {articles.map((article, i) => <img key={article.id} src={article.image} loading="lazy" alt={i === currentIndex ? localized(article, "title", locale) : ""} aria-hidden={i !== currentIndex} className={`site-image absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${i === currentIndex ? "opacity-100" : "opacity-0"}`} />)}
        <div className="absolute inset-0 bg-gradient-to-t from-[#11191d]/95 via-[#11191d]/40 to-[#11191d]/10" />
        <div className="absolute inset-x-0 bottom-0 p-7 text-[#f3eee4] md:p-14">
          <span className="mb-5 inline-block border border-[#d8b675]/60 px-3 py-1.5 text-[10px] font-bold tracking-widest text-[#d8b675]">{localized(current, "category", locale)}</span>
          <h3 className="site-display max-w-3xl text-3xl md:text-5xl">{localized(current, "title", locale)}</h3>
          <p className="mt-5 line-clamp-2 max-w-2xl text-sm leading-8 text-[#f3eee4]/80">{localized(current, "excerpt", locale)}</p>
          <span className="mt-5 inline-flex items-center gap-3 text-xs text-[#d8b675]">{new Date(current.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}<span aria-hidden="true">/</span>{t("اقرأ المقال", "Read article")} <ArrowUpLeft size={15} /></span>
        </div>
      </Link>
      {articles.length > 1 && <div className="absolute end-6 top-6 flex gap-2 md:end-12 md:top-12">
        <button type="button" data-testid="button-article-previous" aria-label={t("المقال السابق", "Previous article")} onClick={() => move(-1)} className="flex h-11 w-11 items-center justify-center border border-[#f3eee4]/45 bg-[#11191d]/30 text-[#f3eee4] backdrop-blur-md transition-colors hover:border-[#d8b675]"><ArrowRight size={19} /></button>
        <button type="button" data-testid="button-article-next" aria-label={t("المقال التالي", "Next article")} onClick={() => move(1)} className="flex h-11 w-11 items-center justify-center border border-[#f3eee4]/45 bg-[#11191d]/30 text-[#f3eee4] backdrop-blur-md transition-colors hover:border-[#d8b675]"><ArrowLeft size={19} /></button>
      </div>}
    </div> : <div className="site-card px-8 py-20 text-center text-muted-foreground">{t("لا توجد أخبار أو مقالات منشورة حاليًا.", "No published news or articles yet.")}</div>}
    {articles.length > 1 && <div className="mt-6 flex items-center gap-6" aria-live="polite"><span className="text-xs tracking-widest text-accent" dir="ltr">{String(currentIndex + 1).padStart(2, "0")} / {String(articles.length).padStart(2, "0")}</span><div className="h-px flex-1 bg-border"><div key={currentIndex} className="site-progress h-px w-full bg-accent" style={{ animationPlayState: paused ? "paused" : "running" }} /></div></div>}
  </section>;
}