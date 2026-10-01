import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpLeft, Pause, Play } from "lucide-react";
import { heroImagePosition, heroOverlay, heroSlideText, type HeroSliderConfig } from "@workspace/slider-config";
import { usePreferences } from "@/lib/preferences";
import { SiteSearch } from "./SiteSearch";
import { GoldMotionLines } from "./GoldMotionLines";

export function HeroSlider({ config, customerService }: { config: HeroSliderConfig; customerService: string }) {
  const { locale, t } = usePreferences();
  const reducedMotion = useReducedMotion();
  const slides = useMemo(() => config.slides.filter(slide => slide.enabled), [config.slides]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const currentIndex = index % Math.max(slides.length, 1);
  const current = slides[currentIndex];
  const paused = userPaused || focused || (config.pauseOnHover && hovered);
  const slideIds = slides.map(slide => slide.id).join(",");
  useEffect(() => { setIndex(0); }, [slideIds]);
  useEffect(() => {
    if (!config.autoplay || paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setIndex(value => (value + 1) % slides.length);
    }, config.interval);
    return () => window.clearInterval(timer);
  }, [config.autoplay, config.interval, paused, reducedMotion, slides.length, currentIndex]);
  useEffect(() => {
    if (slides.length < 2) return;
    const image = new Image();
    image.src = slides[(currentIndex + 1) % slides.length].image;
  }, [currentIndex, slides]);
  if (!current) return null;
  const title = heroSlideText(current, "title", locale);
  const subtitle = heroSlideText(current, "subtitle", locale);
  const eyebrow = heroSlideText(current, "eyebrow", locale);
  const buttonText = heroSlideText(current, "buttonText", locale);
  const centered = current.textAlign === "center";
  const duration = reducedMotion || config.transition === "none" ? 0 : config.transitionDuration / 1000;
  const offset = config.transition === "slide" && !reducedMotion ? direction * (locale === "ar" ? -100 : 100) : 0;
  const move = (change: number) => {
    setDirection(change);
    setIndex(value => (value + change + slides.length) % slides.length);
  };

  return <section data-testid="hero-slider" aria-label={t("المشهد الرئيسي", "Introduction")}
    className="site-always-dark relative isolate flex min-h-[720px] items-end overflow-hidden bg-[#162127] text-[#eee8db] md:min-h-[min(860px,calc(100dvh-88px))]"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <AnimatePresence initial={false}>
      <motion.div key={current.id} className="absolute inset-0" initial={{ opacity: 0, x: `${offset}%` }} animate={{ opacity: 1, x: "0%" }}
        exit={{ opacity: 0, x: `${-offset}%` }} transition={{ duration, ease: "easeInOut" }}>
        <img src={current.image} alt={heroSlideText(current, "imageAlt", locale)} loading="eager" fetchPriority={currentIndex === 0 ? "high" : "auto"}
          className={`h-full w-full object-cover ${config.imageMotion && !reducedMotion ? "hero-slider-image-motion" : ""}`}
          style={{ objectPosition: heroImagePosition(current.imagePosition) }} />
      </motion.div>
    </AnimatePresence>
    <div className="pointer-events-none absolute inset-0" style={{ background: heroOverlay(current.overlayOpacity) }} />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#121a1e]/40 via-transparent to-transparent" />
    {config.goldLines && <GoldMotionLines />}
    <div className="site-container relative z-10 pb-16 pt-36 md:pb-20">
      {eyebrow && <div className={`mb-9 flex items-center gap-4 text-xl font-bold text-[#e4bd70] md:text-[1.75rem] ${centered ? "justify-center" : ""}`}><span className="h-px w-10 bg-current" />{eyebrow}</div>}
      <div className={`grid items-end gap-10 ${centered ? "text-center" : "lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-24"}`}>
        <div key={current.id} className={config.transition !== "none" ? "site-reveal" : ""}>
          <h1 data-testid="text-hero-title" className={`site-display max-w-[870px] text-[clamp(2.8rem,5.8vw,6.8rem)] font-semibold text-[#f3eee4] ${centered ? "mx-auto" : ""}`}>{title}</h1>
          {subtitle && <p className={`mt-7 max-w-xl text-base leading-9 text-[#e4e0d6]/85 md:text-lg ${centered ? "mx-auto" : ""}`}>{subtitle}</p>}
          {buttonText && current.buttonHref && (current.buttonHref.startsWith("/") ?
            <Link href={current.buttonHref} className="site-button mt-7 inline-flex items-center gap-3 px-6 py-3 text-sm font-bold" data-testid="link-hero-slide-button">{buttonText} <ArrowUpLeft size={17} /></Link> :
            <a href={current.buttonHref} className="site-button mt-7 inline-flex items-center gap-3 px-6 py-3 text-sm font-bold" data-testid="link-hero-slide-button">{buttonText} <ArrowUpLeft size={17} /></a>)}
          <div className={`mt-10 max-w-[680px] ${centered ? "mx-auto" : ""}`}><SiteSearch mode="hero" /></div>
        </div>
        {!centered && <div className="hidden border-s border-[#d8b675]/40 ps-7 lg:block">
          <span className="text-[11px] font-semibold tracking-[.2em] text-[#d8b675]">{t("العقارات", "PROPERTIES")}</span>
          <p className="mt-4 text-sm leading-8 text-[#eee8db]/75">{customerService}</p>
          <Link href="/properties" className="mt-6 inline-flex items-center gap-3 text-xs font-bold text-[#d8b675]">{t("استكشف العقارات", "Explore properties")} <ArrowUpLeft size={17} /></Link>
        </div>}
      </div>
      <div className="mt-16 flex flex-wrap items-center justify-between gap-5 border-t border-[#eee8db]/20 pt-6 md:mt-20">
        <a href="#introduction" className="flex items-center gap-3 text-[11px] font-semibold tracking-widest text-[#eee8db]/75">{t("اكتشف المزيد", "DISCOVER MORE")} <ArrowDown size={15} /></a>
        {slides.length > 1 && <div className="flex flex-wrap items-center gap-3">
          <button type="button" data-testid="button-hero-previous" onClick={() => move(-1)} aria-label={t("الشريحة السابقة", "Previous slide")} className="flex h-9 w-9 items-center justify-center border border-[#eee8db]/30 hover:border-[#d8b675]">{locale === "ar" ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}</button>
          {config.showIndicators && <div className="flex max-w-[160px] flex-wrap gap-2" aria-label={t("الشرائح", "Slides")}>{slides.map((slide, position) => <button key={slide.id} type="button" data-testid={`button-hero-slide-${position}`} aria-label={t(`عرض الشريحة ${position + 1}`, `View slide ${position + 1}`)} aria-current={currentIndex === position} onClick={() => { setDirection(position > currentIndex ? 1 : -1); setIndex(position); }} className={`h-1.5 ${position === currentIndex ? "w-8 bg-[#d8b675]" : "w-4 bg-[#eee8db]/40 hover:bg-[#eee8db]"}`} />)}</div>}
          <button type="button" data-testid="button-hero-next" onClick={() => move(1)} aria-label={t("الشريحة التالية", "Next slide")} className="flex h-9 w-9 items-center justify-center border border-[#eee8db]/30 hover:border-[#d8b675]">{locale === "ar" ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</button>
          {config.autoplay && !reducedMotion && <button type="button" data-testid="button-hero-pause" onClick={() => setUserPaused(value => !value)} aria-label={userPaused ? t("تشغيل السلايدر", "Play slideshow") : t("إيقاف السلايدر مؤقتًا", "Pause slideshow")} aria-pressed={userPaused} className="flex h-9 w-9 items-center justify-center border border-[#eee8db]/30 hover:border-[#d8b675]">{userPaused ? <Play size={14} /> : <Pause size={14} />}</button>}
        </div>}
        {config.showIndicators && <span className="hidden text-xs tracking-widest text-[#eee8db]/60 md:block" dir="ltr">{String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>}
      </div>
    </div>
  </section>;
}