import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowUpLeft, ArrowDown, MapPin } from "lucide-react";
import { useSiteContent, useLocalizedSiteValue, useSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";
import { SiteSearch } from "@/components/SiteSearch";
import { FeaturedSlider } from "@/components/FeaturedSlider";
import { CityGallerySlider } from "@/components/CityGallerySlider";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const heroSlides = [
  "/hero/riyadh-kingdom.jpg",
  "/hero/makkah-clocktower.jpg",
  "/hero/riyadh-aerial.jpg",
  "/hero/makkah-abraj.jpg",
  "/hero/riyadh-financial.jpg",
];

export default function Home() {
  const mainRef = useScrollReveal<HTMLElement>();
  const { data, isLoading, isError, refetch } = useSiteContent();
  const { t } = usePreferences();
  const heroTitle = useLocalizedSiteValue("home.title", "خبرة عقارية.. وخدمات متكاملة", "Real estate expertise. Complete service.");
  const heroSubtitle = useLocalizedSiteValue("home.subtitle", "خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.", "Experience that builds trust. Services that create value.");
  const featuredHeading = useLocalizedSiteValue("home.propertiesHeading", "أحدث العروض المميزة", "Selected properties");
  const heroImage = useSiteValue("home.heroImage", "");
  const aboutImage = useSiteValue("about.image", "/hero/riyadh-financial.jpg");
  const intro = useLocalizedSiteValue("home.intro", "تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.", "Alabnq Real Estate operates in the Kingdom's property market, drawing on extensive field experience and a thorough understanding of property owners, investors, and market needs.");
  const commitment = useLocalizedSiteValue("home.commitment", "نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.", "Our success is measured not merely by providing a service, but by delivering it with professionalism and clarity, protecting our clients' interests and rights.");
  const customerService = useLocalizedSiteValue("home.customerService", "تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق", "Providing professional, integrated real estate services grounded in experience and market knowledge.");
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (heroImage || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive(value => (value + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(timer);
  }, [heroImage, paused]);
  const images = heroImage ? [heroImage] : heroSlides;
  return <main ref={mainRef} className="site-shell flex-1">
    <section aria-label={t("المشهد الرئيسي", "Introduction")} className="site-always-dark relative isolate flex min-h-[720px] items-end overflow-hidden bg-[#162127] text-[#eee8db] md:min-h-[min(860px,calc(100dvh-88px))]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
      <div className="hero-frame absolute inset-0">
        {images.map((image, index) => <img key={image} src={image} alt="" loading={index === 0 ? "eager" : "lazy"} fetchPriority={index === 0 ? "high" : "low"} aria-hidden="true" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${image.includes("/hero/makkah-") ? "md:object-[center_15%]" : ""} ${index === active || !!heroImage ? "active opacity-100" : "opacity-0"}`} />)}
        <div className="absolute inset-0 bg-gradient-to-t from-[#121a1e]/90 via-[#121a1e]/25 to-[#121a1e]/10" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#121a1e]/40 via-transparent to-transparent" />
      </div>
      <div className="site-container relative z-10 pb-16 pt-36 md:pb-20">
        <div className="mb-9 flex items-center gap-4 text-xl font-bold text-[#e4bd70] md:text-[1.75rem]"><span className="h-px w-10 bg-current" /> {t("شركة العبنق العقارية", "ALABNQ REAL ESTATE")}</div>
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-24">
          <div className="site-reveal">
            <h1 data-testid="text-hero-title" className="site-display max-w-[870px] text-[clamp(2.8rem,5.8vw,6.8rem)] font-semibold text-[#f3eee4]">{heroTitle}</h1>
            <p className="mt-7 max-w-xl text-base leading-9 text-[#e4e0d6]/85 md:text-lg">{heroSubtitle}</p>
            <div className="mt-10 max-w-[680px]"><SiteSearch mode="hero" /></div>
          </div>
          <div className="hidden border-s border-[#d8b675]/40 ps-7 lg:block">
             <span className="text-[11px] font-semibold tracking-[.2em] text-[#d8b675]">{t("العقارات", "PROPERTIES")}</span>
            <p className="mt-4 text-sm leading-8 text-[#eee8db]/75">{customerService}</p>
            <Link href="/properties" className="mt-6 inline-flex items-center gap-3 text-xs font-bold text-[#d8b675]">{t("استكشف العقارات", "Explore properties")} <ArrowUpLeft size={17} /></Link>
          </div>
        </div>
        <div className="mt-20 flex items-end justify-between border-t border-[#eee8db]/20 pt-6">
          <a href="#introduction" className="flex items-center gap-3 text-[11px] font-semibold tracking-widest text-[#eee8db]/75">{t("اكتشف المزيد", "DISCOVER MORE")} <ArrowDown size={15} /></a>
          {!heroImage && <div className="flex items-center gap-3" aria-label={t("شرائح الصور", "Image slides")}>{images.map((_, index) => <button key={index} type="button" data-testid={`button-hero-slide-${index}`} aria-label={t(`عرض الصورة ${index + 1}`, `View image ${index + 1}`)} aria-current={index === active} onClick={() => setActive(index)} className={`h-1 transition-all duration-500 ${active === index ? "w-11 bg-[#d8b675]" : "w-5 bg-[#eee8db]/40 hover:bg-[#eee8db]"}`} />)}</div>}
          <span className="hidden text-xs tracking-widest text-[#eee8db]/60 md:block" dir="ltr">{String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
        </div>
      </div>
    </section>

    <section id="introduction" className="site-container grid gap-12 py-24 md:py-36 lg:grid-cols-[.88fr_1.12fr] lg:gap-28">
      <div data-scroll-reveal className="relative order-2 lg:order-1">
        <div className="group relative aspect-[4/5] overflow-hidden bg-secondary"><img src={aboutImage} alt={t("مشهد معماري", "Architectural scene")} loading="lazy" className="site-image h-full w-full object-cover" /><div className="pointer-events-none absolute inset-5 border border-[#e4c187]/50" /></div>
         <span className="absolute bottom-8 end-8 bg-[#142127] px-6 py-4 text-[11px] font-bold tracking-wider text-[#d8b675]">{t("الخدمات العقارية", "REAL ESTATE SERVICES")}</span>
      </div>
      <div data-scroll-reveal className="order-1 flex flex-col justify-center lg:order-2" style={{ "--reveal-delay": "100ms" } as React.CSSProperties}>
        <span className="site-eyebrow">{t("من نحن", "OUR COMPANY")}</span>
         <h2 className="site-display mt-7 max-w-[660px] text-[clamp(2.5rem,4vw,5rem)]">{t("خبرة ميدانية وفهم متكامل", "Field experience and comprehensive understanding")}</h2>
        <p className="mt-9 max-w-xl text-base leading-[2.3] text-muted-foreground">{intro}</p>
        <p className="mt-7 max-w-xl border-s border-accent ps-6 text-sm leading-[2.2] text-muted-foreground">{commitment}</p>
        <div className="mt-12 grid gap-4 border-t border-[var(--line-soft)] pt-8 sm:grid-cols-2">
          {[t("التسويق العقاري", "Property marketing"), t("المزادات العقارية", "Property auctions"), t("إدارة الأملاك", "Property management"), t("إدارة المرافق", "Facilities management"), t("المتابعة القانونية والإدارية", "Legal and administrative follow-up")].map((service, index) => <div key={index} className="flex items-center gap-3 text-sm font-semibold"><span className="text-xs text-accent" dir="ltr">0{index + 1}</span><span>{service}</span></div>)}
        </div>
        <Link href="/about" className="site-link-arrow mt-11">{t("تعرّف على الشركة", "Meet the company")} <ArrowUpLeft size={17} /></Link>
      </div>
       <div className="order-3 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--line-soft)] pt-9 lg:col-span-2 lg:grid-cols-4 lg:gap-x-10 lg:pt-12">
         {[
           { valueAr: "+100 مليون", valueEn: "100+ million", labelAr: "مبيعاتنا", labelEn: "Sales" },
           { valueAr: "+300 ألف", valueEn: "300,000+", labelAr: "مساحات", labelEn: "Areas" },
           { valueAr: "+10 آلاف عميل", valueEn: "10,000+ clients", labelAr: "قاعدة عملاء", labelEn: "Client base" },
           { valueAr: "6 أيام، 12 ساعة", valueEn: "6 days, 12 hours", labelAr: "أوقات العمل", labelEn: "Working hours" },
          ].map((metric, index) => <div key={metric.labelEn} data-scroll-reveal className="home-metric border-s border-accent/50 ps-4 md:ps-6" style={{ "--reveal-delay": `${index * 85}ms` } as React.CSSProperties}>
           <span className="block text-[10px] tracking-widest text-accent" dir="ltr">0{index + 1}</span>
           <strong className="mt-3 block text-xl font-semibold leading-relaxed text-foreground md:text-2xl">{t(metric.valueAr, metric.valueEn)}</strong>
           <span className="mt-1 block text-xs text-muted-foreground">{t(metric.labelAr, metric.labelEn)}</span>
         </div>)}
       </div>
    </section>
    <section className="site-always-dark relative isolate overflow-hidden bg-[#172329] py-24 text-[#f0ebdf] md:py-32">
      <img src="/hero/riyadh-kingdom.jpg" loading="lazy" alt="" className="value-showcase-image absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#172329] via-[#172329]/90 to-[#172329]/60" />
      <div aria-hidden="true" className="value-showcase-glow pointer-events-none absolute -end-32 -top-44 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(216,182,117,.15),transparent_68%)]" />
      <div aria-hidden="true" className="value-showcase-sheen absolute -inset-y-1/2 start-[-25%] w-[15%]" />
      <div className="site-container relative grid gap-10 lg:grid-cols-2 lg:items-end">
          <div data-scroll-reveal><span className="site-eyebrow">{t("عروض عقارية", "PROPERTY LISTINGS")}</span><h2 className="site-display mt-7 max-w-xl text-4xl md:text-6xl">{t("الخدمات العقارية المتكاملة", "Integrated real estate services")}</h2></div>
         <div data-scroll-reveal className="lg:justify-self-end" style={{ "--reveal-delay": "120ms" } as React.CSSProperties}><p className="max-w-md text-sm leading-9 text-[#eee8db]/75">{customerService}</p><Link href="/properties?view=map" className="mt-7 inline-flex items-center gap-3 border-b border-[#d8b675] pb-3 text-xs font-bold text-[#d8b675]"><MapPin size={17} /> {t("استعرض خريطة العقارات", "Explore the property map")} <ArrowUpLeft size={17} /></Link></div>
      </div>
    </section>
    {isLoading ? <section className="site-container py-24"><div className="mb-8 h-10 w-1/2 animate-pulse bg-muted" /><div className="h-[490px] animate-pulse bg-muted md:h-[650px]" /></section> : isError ? <section className="site-container py-24 text-center"><p>{t("تعذر تحميل العقارات المميزة.", "Could not load featured properties.")}</p><button type="button" className="site-button mt-6 px-7 py-3" onClick={() => void refetch()}>{t("إعادة المحاولة", "Try again")}</button></section> : <FeaturedSlider properties={(data?.properties ?? []).filter(property => property.featured)} heading={featuredHeading} />}
    <div data-scroll-reveal><CityGallerySlider /></div>
  </main>;
}