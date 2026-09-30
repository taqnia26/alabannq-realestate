import { useEffect, useRef, useState } from "react";
import { MapPinned, Ruler, TrendingUp, UsersRound } from "lucide-react";
import { usePreferences } from "@/lib/preferences";

const metrics = [
  {
    value: 100_000_000,
    titleAr: "مبيعاتنا", titleEn: "Our sales",
    labelAr: "ريال مبيعات تجاوزت 100 مليون", labelEn: "SAR in sales exceeding 100 million",
    icon: TrendingUp,
  },
  {
    value: 500_000,
    titleAr: "المساحات", titleEn: "Property area",
    labelAr: "متر مربع مباعة ومعروضة", labelEn: "sqm sold and offered",
    icon: Ruler,
  },
  {
    value: 10_000,
    titleAr: "قاعدة العملاء", titleEn: "Our clients",
    labelAr: "عميل في قاعدة عملائنا", labelEn: "clients in our network",
    icon: UsersRound,
  },
] as const;

export function HomeMetrics() {
  const { t } = usePreferences();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      if (!entries[0]?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = Math.min((now - start) / 1600, 1);
        setProgress(1 - Math.pow(1 - elapsed, 3));
        if (elapsed < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);

  return <div ref={sectionRef} className="order-3 grid grid-cols-2 gap-3 border-t border-[var(--line-soft)] pt-9 lg:col-span-2 lg:grid-cols-4 lg:gap-4 lg:pt-12">
    {metrics.map((metric, index) => <div key={metric.titleEn} data-scroll-reveal className="home-metric min-w-0 border border-[var(--line-soft)] bg-secondary/20 p-4 sm:p-6" style={{ "--reveal-delay": `${index * 85}ms` } as React.CSSProperties}>
      <div className="mb-8 flex justify-start text-accent"><metric.icon size={22} strokeWidth={1.5} aria-hidden="true" /></div>
      <span className="block text-[11px] font-semibold text-muted-foreground">{t(metric.titleAr, metric.titleEn)}</span>
      <strong className="mt-2 block whitespace-nowrap font-sans text-[clamp(1.15rem,2.3vw,2.15rem)] font-semibold leading-tight tracking-tight text-foreground tabular-nums" dir="ltr">{Math.round(metric.value * progress).toLocaleString("en-US")}{progress === 1 ? "+" : ""}</strong>
      <span className="mt-3 block text-xs leading-6 text-muted-foreground">{t(metric.labelAr, metric.labelEn)}</span>
    </div>)}
    <div data-scroll-reveal className="home-metric min-w-0 border border-[var(--line-soft)] bg-secondary/20 p-4 sm:p-6" style={{ "--reveal-delay": "255ms" } as React.CSSProperties}>
      <div className="mb-8 flex justify-start text-accent"><MapPinned size={22} strokeWidth={1.5} aria-hidden="true" /></div>
      <span className="block text-[11px] font-semibold text-muted-foreground">{t("نطاق أعمالنا", "Our reach")}</span>
      <strong className="mt-2 block text-[clamp(1.15rem,2.3vw,2.15rem)] font-semibold leading-tight text-foreground">{t("أنحاء المملكة", "Across the Kingdom")}</strong>
      <span className="mt-3 block text-xs leading-6 text-muted-foreground">{t("تغطية في مختلف مناطق المملكة", "Coverage across the Kingdom's regions")}</span>
    </div>
  </div>;
}