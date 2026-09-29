import { Link, useParams } from "wouter";
import DOMPurify from "dompurify";
import { ArrowUpLeft, Facebook, Linkedin, Twitter } from "lucide-react";
import { useSiteContent } from "@/data/siteContent";
import { localized, usePreferences } from "@/lib/preferences";
import { ArticleCard } from "@/components/ArticleCard";

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useSiteContent();
  const { locale, t } = usePreferences();
  const articles = data?.articles ?? [];
  const article = articles.find(a => a.id === id);
  if (isLoading) return <main className="site-container min-h-[70dvh] animate-pulse py-24"><div className="h-96 bg-muted" /></main>;
  if (isError) return <main className="site-container min-h-[60dvh] py-32 text-center"><p>{t("تعذر تحميل المقال.", "Could not load the article.")}</p><button onClick={() => void refetch()} className="site-button mt-6 px-7 py-3">{t("إعادة المحاولة", "Try again")}</button></main>;
  if (!article) return <main className="site-container min-h-[60dvh] py-32 text-center"><h1 className="site-display text-3xl">{t("المقال غير موجود", "Article not found")}</h1><Link href="/articles" className="site-button mt-8 inline-block px-7 py-3">{t("العودة للمقالات", "Back to articles")}</Link></main>;
  const title = localized(article, "title", locale);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(title);
  const links = [
    { icon: Twitter, label: "X", href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}` },
    { icon: Facebook, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}` },
    { icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` },
  ];
  const related = articles.filter(a => a.id !== id).slice(0, 3);
  return <main className="site-shell flex-1 pb-24">
    <div className="site-container flex items-center gap-3 py-5 text-xs text-muted-foreground"><Link href="/" className="hover:text-accent">{t("الرئيسية", "Home")}</Link><span>/</span><Link href="/articles" className="hover:text-accent">{t("المقالات", "Journal")}</Link><span>/</span><span className="truncate text-foreground">{title}</span></div>
    <article><header className="site-container max-w-5xl pb-14 pt-16 text-center md:pt-24"><span className="site-eyebrow">{localized(article, "category", locale)}</span><h1 className="site-display mt-7 text-4xl md:text-6xl">{title}</h1><p className="mt-8 text-xs text-muted-foreground">{localized(article, "author", locale)} <span className="mx-3 text-accent">/</span> {new Date(article.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-GB", { year: "numeric", month: "long", day: "numeric" })} <span className="mx-3 text-accent">/</span> {localized(article, "readTime", locale)}</p></header>
      <div className="site-container"><img src={article.image} alt={title} className="max-h-[650px] w-full object-cover" /></div>
      <div className="site-container grid gap-10 pt-16 lg:grid-cols-[130px_minmax(0,780px)] lg:justify-center lg:gap-16">
        <aside className="flex items-center gap-3 lg:sticky lg:top-32 lg:h-fit lg:flex-col lg:items-start"><span className="me-3 text-[11px] font-bold tracking-wider text-muted-foreground lg:mb-4">{t("شارك المقال", "SHARE")}</span>{links.map(({ icon: Icon, label, href }) => <a key={label} href={href} aria-label={t(`مشاركة عبر ${label}`, `Share on ${label}`)} target="_blank" rel="noreferrer" className="flex h-9 w-9 items-center justify-center border border-border text-foreground transition-colors hover:border-accent hover:text-accent"><Icon size={15} /></a>)}</aside>
        <div><div className="editorial-prose prose prose-lg max-w-none prose-headings:font-semibold prose-a:text-accent prose-strong:text-foreground" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(localized(article, "content", locale)) }} /><div className="site-always-dark mt-20 bg-[#172329] p-9 text-[#f0ebdf] md:p-12"><span className="site-eyebrow">{t("خطوتك التالية", "YOUR NEXT STEP")}</span><h2 className="site-display mt-5 text-3xl">{t("هل تبحث عن عقار؟", "Looking for a property?")}</h2><p className="mt-4 text-sm leading-8 text-[#eee8db]/70">{t("تصفح العروض المتاحة أو تواصل معنا لمناقشة احتياجاتك.", "Browse available listings or contact us to discuss what you need.")}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/properties" className="site-button inline-flex items-center gap-3 px-6 py-3 text-xs font-bold">{t("تصفح العقارات", "Browse properties")} <ArrowUpLeft size={16} /></Link><Link href="/contact" className="inline-flex items-center border border-[#eee8db]/35 px-6 py-3 text-xs">{t("تواصل معنا", "Contact us")}</Link></div></div></div>
      </div>
    </article>
    {related.length > 0 && <section className="site-container mt-28 border-t border-[var(--line-soft)] pt-16"><div className="mb-9 flex items-center justify-between"><h2 className="site-display text-3xl">{t("مقالات ذات صلة", "Related articles")}</h2><Link href="/articles" className="site-link-arrow">{t("كل المقالات", "All articles")} <ArrowUpLeft size={16} /></Link></div><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{related.map(item => <ArticleCard key={item.id} article={item} />)}</div></section>}
  </main>;
}