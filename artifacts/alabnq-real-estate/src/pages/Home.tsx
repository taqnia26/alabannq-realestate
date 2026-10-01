import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowUpLeft, MapPin } from "lucide-react";
import { readHeroSlider } from "@workspace/slider-config";
import { useSiteContent, useLocalizedSiteValue, useSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";
import { HeroSlider } from "@/components/HeroSlider";
import { FeaturedSlider } from "@/components/FeaturedSlider";
import { ArticleSlider } from "@/components/ArticleSlider";
import { HomeMetrics } from "@/components/HomeMetrics";
import { GoldMotionLines } from "@/components/GoldMotionLines";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Home() {
  const mainRef = useScrollReveal<HTMLElement>();
  const { data, isLoading, isError, refetch } = useSiteContent();
  const { t } = usePreferences();
  const featuredHeading = useLocalizedSiteValue("home.propertiesHeading", "أحدث العروض المميزة", "Selected properties");
  const articlesHeading = useLocalizedSiteValue("home.articlesHeading", "الأخبار والمقالات", "News & articles");
  const aboutImage = useSiteValue("about.image", "/hero/riyadh-financial.jpg");
  const intro = useLocalizedSiteValue("home.intro", "تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.", "Alabnq Real Estate operates in the Kingdom's property market, drawing on extensive field experience and a thorough understanding of property owners, investors, and market needs.");
  const commitment = useLocalizedSiteValue("home.commitment", "نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.", "Our success is measured not merely by providing a service, but by delivering it with professionalism and clarity, protecting our clients' interests and rights.");
  const customerService = useLocalizedSiteValue("home.customerService", "تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق", "Providing professional, integrated real estate services grounded in experience and market knowledge.");
  const slider = useMemo(() => {
    try { return readHeroSlider(data?.site ?? {}); }
    catch { return null; }
  }, [data?.site]);
  return <main ref={mainRef} className="site-shell flex-1">
    {slider ? <HeroSlider config={slider} customerService={customerService} /> : <section className="site-container py-24 text-center" role="alert">{t("تعذر عرض السلايدر بسبب إعدادات غير صالحة. يرجى مراجعتها في لوحة التحكم.", "Invalid slideshow settings. Please review them in the admin panel.")}</section>}

    <section id="introduction" className="site-container relative isolate grid gap-12 overflow-hidden py-24 md:py-36 lg:grid-cols-[.88fr_1.12fr] lg:gap-28">
      <GoldMotionLines />
      <div data-scroll-reveal className="relative z-10 order-2 lg:order-1">
        <div className="group relative aspect-[4/5] overflow-hidden bg-secondary"><img src={aboutImage} alt={t("مشهد معماري", "Architectural scene")} loading="lazy" className="site-image h-full w-full object-cover" /><div className="pointer-events-none absolute inset-5 border border-[#e4c187]/50" /></div>
         <span className="absolute bottom-8 end-8 bg-[#142127] px-6 py-4 text-[11px] font-bold tracking-wider text-[#d8b675]">{t("الخدمات العقارية", "REAL ESTATE SERVICES")}</span>
      </div>
      <div data-scroll-reveal className="relative z-10 order-1 flex flex-col justify-center lg:order-2" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
        <span className="site-eyebrow">{t("من نحن", "OUR COMPANY")}</span>
         <h2 className="site-display mt-7 max-w-[660px] text-[clamp(2.5rem,4vw,5rem)]">{t("خبرة ميدانية وفهم متكامل", "Field experience and comprehensive understanding")}</h2>
        <p className="mt-9 max-w-xl text-base leading-[2.3] text-muted-foreground">{intro}</p>
        <p className="mt-7 max-w-xl border-s border-accent ps-6 text-sm leading-[2.2] text-muted-foreground">{commitment}</p>
        <div className="mt-12 grid gap-4 border-t border-[var(--line-soft)] pt-8 sm:grid-cols-2">
          {[t("التسويق العقاري", "Property marketing"), t("المزادات العقارية", "Property auctions"), t("إدارة الأملاك", "Property management"), t("إدارة المرافق", "Facilities management"), t("المتابعة القانونية والإدارية", "Legal and administrative follow-up"), t("إدارة أملاك متكاملة", "Comprehensive property management")].map((service, index) => <div key={index} className="flex items-center gap-3 text-sm font-semibold"><span className="text-xs text-accent" dir="ltr">0{index + 1}</span><span>{service}</span></div>)}
        </div>
        <Link href="/about" className="site-link-arrow mt-11">{t("تعرّف على الشركة", "Meet the company")} <ArrowUpLeft size={17} /></Link>
      </div>
       <div className="relative z-10 order-3 lg:col-span-2"><HomeMetrics /></div>
    </section>
    <section className="site-always-dark relative isolate overflow-hidden bg-[#172329] py-24 text-[#f0ebdf] md:py-32">
      <img src="/hero/riyadh-kingdom.jpg" loading="lazy" alt="" className="value-showcase-image absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#172329] via-[#172329]/90 to-[#172329]/60" />
      <div aria-hidden="true" className="value-showcase-glow pointer-events-none absolute -end-32 -top-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(216,182,117,.15),transparent_68%)]" />
      <div aria-hidden="true" className="value-showcase-sheen absolute -inset-y-1/2 start-[-25%] w-[15%]" />
      <GoldMotionLines />
      <div className="site-container relative z-10 grid gap-10 lg:grid-cols-2 lg:items-end">
          <div data-scroll-reveal><span className="site-eyebrow">{t("عروض عقارية", "PROPERTY LISTINGS")}</span><h2 className="site-display mt-7 max-w-xl text-4xl md:text-6xl">{t("الخدمات العقارية المتكاملة", "Integrated real estate services")}</h2></div>
         <div data-scroll-reveal className="lg:justify-self-end" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}><p className="max-w-md text-sm leading-9 text-[#eee8db]/75">{customerService}</p><Link href="/properties?view=map" className="mt-7 inline-flex items-center gap-3 border-b border-[#d8b675] pb-3 text-xs font-bold text-[#d8b675]"><MapPin size={17} /> {t("استعرض خريطة العقارات", "Explore the property map")} <ArrowUpLeft size={17} /></Link></div>
      </div>
    </section>
    {isLoading ? <section className="site-container py-24"><div className="mb-8 h-10 w-1/2 animate-pulse bg-muted" /><div className="h-[490px] animate-pulse bg-muted md:h-[650px]" /></section> : isError ? <section className="site-container py-24 text-center"><p>{t("تعذر تحميل العقارات المميزة.", "Could not load featured properties.")}</p><button type="button" className="site-button mt-6 px-7 py-3" onClick={() => void refetch()}>{t("إعادة المحاولة", "Try again")}</button></section> : <div className="relative isolate overflow-hidden"><GoldMotionLines /><div className="relative z-10"><FeaturedSlider properties={(data?.properties ?? []).filter(property => property.featured)} heading={featuredHeading} /></div></div>}
    {isLoading ? <section className="site-container py-24"><div className="mb-8 h-10 w-1/2 animate-pulse bg-muted" /><div className="h-[490px] animate-pulse bg-muted md:h-[650px]" /></section> : isError ? <section className="site-container py-24 text-center"><p>{t("تعذر تحميل الأخبار والمقالات.", "Could not load news and articles.")}</p><button type="button" className="site-button mt-6 px-7 py-3" onClick={() => void refetch()}>{t("إعادة المحاولة", "Try again")}</button></section> : <div className="site-reveal relative isolate overflow-hidden"><GoldMotionLines /><div className="relative z-10"><ArticleSlider articles={[...(data?.articles ?? [])].sort((a, b) => b.date.localeCompare(a.date))} heading={articlesHeading} /></div></div>}
  </main>;
}