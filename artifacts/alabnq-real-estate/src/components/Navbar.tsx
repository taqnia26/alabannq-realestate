import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpLeft, Menu, Moon, Sun, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { SiteSearch } from "./SiteSearch";
import { usePreferences } from "@/lib/preferences";

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { locale, setLocale, theme, setTheme, t } = usePreferences();
  useEffect(() => setOpen(false), [location]);
  const links = [
    { href: "/", label: t("الرئيسية", "Home") },
    { href: "/properties", label: t("العقارات", "Properties") },
    { href: "/about", label: t("من نحن", "Our company") },
    { href: "/articles", label: t("الأخبار والمقالات", "Journal") },
    { href: "/contact", label: t("تواصل معنا", "Contact") },
  ];
  return <header className="site-header sticky top-0 z-50 border-b border-[var(--line-soft)] bg-background/95 backdrop-blur-xl">
    <div className="site-container flex h-[76px] items-center justify-between gap-5 lg:h-[88px]">
      <Link href="/" data-testid="link-home-logo" className="group flex min-w-0 shrink-0 items-center gap-3" aria-label={t("العبنق العقارية، الرئيسية", "Alabnq Real Estate, home")}>
        <BrandLogo className="h-[53px] w-[53px] rounded-[2px] ring-1 ring-accent/30 lg:h-[62px] lg:w-[62px]" label={t("شعار شركة العبنق العقارية", "Alabnq Real Estate logo")} />
        <span className="text-[13px] font-bold leading-[1.5] tracking-tight text-foreground lg:hidden xl:block xl:text-[15px]">{t("شركة العبنق العقارية", "ALABNQ REAL ESTATE")}</span>
      </Link>
      <nav aria-label={t("التنقل الرئيسي", "Main navigation")} className="hidden items-center gap-3 lg:flex xl:gap-6">
        {links.map(link => <Link key={link.href} href={link.href} data-testid={`link-nav-${link.href.replace(/\W/g, "") || "home"}`} aria-current={location === link.href ? "page" : undefined} className={`relative whitespace-nowrap py-2 text-[13px] font-semibold transition-colors hover:text-accent ${location === link.href ? "text-accent" : "text-foreground/75"}`}>{link.label}{location === link.href && <span className="absolute inset-x-0 -bottom-1 h-px bg-accent" />}</Link>)}
      </nav>
      <div className="flex items-center gap-1.5 lg:gap-3">
        <div className="hidden w-36 lg:block xl:w-48"><SiteSearch mode="navbar" /></div>
        <button type="button" data-testid="button-locale" onClick={() => setLocale(locale === "ar" ? "en" : "ar")} aria-label={t("التبديل إلى الإنجليزية", "Switch to Arabic")} className="flex h-9 min-w-10 items-center justify-center border border-[var(--line-soft)] px-2 text-[11px] font-bold tracking-widest text-foreground transition-colors hover:border-accent">{locale === "ar" ? "EN" : "عربي"}</button>
        <button type="button" data-testid="button-theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={theme === "dark" ? t("الوضع الفاتح", "Light mode") : t("الوضع الداكن", "Dark mode")} className="flex h-9 w-9 items-center justify-center border border-[var(--line-soft)] text-foreground transition-colors hover:border-accent">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</button>
        <Link href="/contact" data-testid="link-consultation" className="site-button hidden h-10 items-center gap-3 px-5 text-xs font-bold xl:inline-flex">{t("احجز استشارة", "Book a consultation")} <ArrowUpLeft size={15} /></Link>
        <button type="button" data-testid="button-menu" aria-expanded={open} aria-label={open ? t("إغلاق القائمة", "Close menu") : t("فتح القائمة", "Open menu")} onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center border border-[var(--line-soft)] text-foreground lg:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
    {open && <nav aria-label={t("قائمة الجوال", "Mobile menu")} className="absolute inset-x-0 top-full max-h-[calc(100dvh-76px)] overflow-y-auto border-b border-[var(--line-soft)] bg-background px-5 py-6 shadow-2xl lg:hidden">
      <SiteSearch mode="mobile" className="mb-5" onNavigate={() => setOpen(false)} />
      {links.map((link, i) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex items-center justify-between border-b border-[var(--line-soft)] py-4 text-lg text-foreground"><span>{link.label}</span><span className="text-xs text-accent" dir="ltr">0{i + 1}</span></Link>)}
      <Link href="/contact" data-testid="link-mobile-consultation" onClick={() => setOpen(false)} className="site-button mt-6 flex min-h-12 items-center justify-between px-5 text-sm font-bold">{t("احجز استشارة", "Book a consultation")} <ArrowUpLeft size={17} /></Link>
    </nav>}
  </header>;
}