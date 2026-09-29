import { Link } from "wouter";
import { ArrowUpLeft, Mail, MapPin, Phone, Instagram, Twitter, Linkedin } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useSiteValue, useLocalizedSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";

export function Footer() {
  const { t } = usePreferences();
  const image = useSiteValue("footer.image", "/hero/riyadh-kingdom.jpg");
  const about = useLocalizedSiteValue("footer.about", "شركة العبنق العقارية: خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.", "Alabnq Real Estate: experience that builds trust, services that create value.");
  const address = useLocalizedSiteValue("contact.address", "مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع", "Makkah – Al-Awali – Sheikh Mohammed bin Manea Street");
  const phone = useSiteValue("contact.phone", "8002450000");
  const email = useSiteValue("footer.email", "info@alabnq.com");
  const socials = [
    { icon: Twitter, label: "X", url: useSiteValue("footer.twitter", "") },
    { icon: Instagram, label: "Instagram", url: useSiteValue("footer.instagram", "") },
    { icon: Linkedin, label: "LinkedIn", url: useSiteValue("footer.linkedin", "") },
  ];
  const links = [
    ["/", t("الرئيسية", "Home")], ["/properties", t("العقارات", "Properties")],
    ["/about", t("عن الشركة", "Our company")], ["/articles", t("الأخبار والمقالات", "Journal")],
    ["/contact", t("تواصل معنا", "Contact")],
  ];
  return <footer className="site-always-dark relative isolate overflow-hidden bg-[#121b20] text-[#eee8db]">
    <img src={image} loading="lazy" alt="" className="footer-bg-motion pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[.13]" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#121b20] via-[#121b20]/95 to-[#121b20]/80" />
    <div className="site-container relative">
      <div className="grid gap-10 border-b border-[#e6d8b6]/20 py-20 lg:grid-cols-[1fr_auto] lg:items-end lg:py-28">
        <div><span className="site-eyebrow">{t("دعنا نبدأ الحديث", "LET'S BEGIN")}</span><h2 className="site-display mt-7 max-w-3xl text-[clamp(2.5rem,4.5vw,5.5rem)]">{t("لكل عقار قصة. نود سماع قصتك.", "Every property has a story. Tell us yours.")}</h2></div>
        <Link href="/contact" className="site-button inline-flex min-h-14 w-fit items-center gap-5 px-7 text-sm font-bold">{t("تواصل معنا", "Get in touch")} <ArrowUpLeft size={19} /></Link>
      </div>
      <div className="grid gap-14 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_1fr] lg:gap-20 lg:py-20">
        <div><Link href="/" className="inline-flex items-center gap-4"><BrandLogo className="h-16 w-16 rounded-[2px] ring-1 ring-[#d8b675]/30" label={t("شعار شركة العبنق العقارية", "Alabnq logo")} /><span className="text-base font-bold leading-6">{t("شركة العبنق العقارية", "ALABNQ REAL ESTATE")}</span></Link><p className="mt-7 max-w-sm text-sm leading-8 text-[#eee8db]/65">{about}</p><div className="mt-8 flex gap-2">{socials.filter(s => s.url).map(s => <a key={s.label} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="flex h-10 w-10 items-center justify-center border border-[#e6d8b6]/20 transition-colors hover:border-[#d8b675] hover:text-[#d8b675]"><s.icon size={16} /></a>)}</div></div>
        <div><h3 className="mb-7 text-[11px] font-bold tracking-[.17em] text-[#d8b675]">{t("استكشف", "EXPLORE")}</h3><ul className="space-y-4">{links.map(([href, label]) => <li key={href}><Link href={href} className="text-sm text-[#eee8db]/65 transition-colors hover:text-[#d8b675]">{label}</Link></li>)}</ul></div>
        <div><h3 className="mb-7 text-[11px] font-bold tracking-[.17em] text-[#d8b675]">{t("بيانات التواصل", "CONTACT DETAILS")}</h3><div className="space-y-6 text-sm leading-7 text-[#eee8db]/70"><div className="flex items-start gap-4"><MapPin size={17} className="mt-1 shrink-0 text-[#d8b675]" /><span>{address}</span></div><a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-4 transition-colors hover:text-[#d8b675]"><Phone size={17} className="text-[#d8b675]" /><span dir="ltr">{phone}</span></a><a href={`mailto:${email}`} className="flex items-center gap-4 transition-colors hover:text-[#d8b675]"><Mail size={17} className="text-[#d8b675]" /><span>{email}</span></a></div></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6d8b6]/20 py-7 text-[11px] text-[#eee8db]/45"><span>© {new Date().getFullYear()} {t("شركة العبنق العقارية. جميع الحقوق محفوظة.", "Alabnq Real Estate. All rights reserved.")}</span><span>{t("المملكة العربية السعودية", "Saudi Arabia")}</span></div>
    </div>
  </footer>;
}