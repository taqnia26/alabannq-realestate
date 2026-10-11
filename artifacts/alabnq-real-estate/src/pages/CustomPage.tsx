import { useParams } from "wouter";
import { useSiteContent } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";
import NotFound from "./not-found";

export default function CustomPage() {
  const { slug } = useParams<{slug: string}>();
  const { data, isLoading, isError } = useSiteContent();
  const { locale, t } = usePreferences();
  if (isLoading) return <main className="site-container py-24">{t("جارٍ تحميل الصفحة…", "Loading page…")}</main>;
  if (isError) return <main className="site-container py-24" role="alert">{t("تعذر تحميل الصفحة.", "Could not load page.")}</main>;
  const page = data?.pages.find(page => page.slug === slug && page.published !== false);
  if (!page) return <NotFound />;
  const title = locale === "en" ? page.titleEn || page.title : page.title;
  const content = locale === "en" ? page.contentEn || page.content : page.content;
  return <main className="site-shell flex-1">
    <section className="site-container py-20 md:py-28">
      <h1 className="site-display text-4xl md:text-6xl">{title}</h1>
      {page.image && <img src={page.image} alt={title} className="mt-10 max-h-[550px] w-full object-cover" />}
      <div className="editorial-prose mt-10 whitespace-pre-wrap text-base">{content}</div>
    </section>
  </main>;
}
