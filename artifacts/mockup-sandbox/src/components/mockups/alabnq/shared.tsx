import type { ReactNode } from "react";
import { ArrowLeft, Building2, ChevronDown, Clock3, House, MapPin, Phone, Search, ShieldCheck, Sparkles } from "lucide-react";
import { officialProperties } from "./catalog";
import "./alabnq.css";

export const asset = (file: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}/alabnq/${file}`;

export function Header({ light = false }: { light?: boolean }) {
  return <header className={`ab-header ${light ? "ab-header-light" : ""}`} dir="rtl">
    <a className="ab-brand" href="#top" aria-label="شركة العبنق العقارية">
      <img src={asset(light ? "alabnq-mark-light.png" : "alabnq-mark-dark.png")} alt="شركة العبنق العقارية" />
      <span className="ab-brand-name">شركة العبنق<br />العقارية</span>
    </a>
    <nav className="ab-nav" aria-label="التنقل الرئيسي">
      <a href="#top">الرئيسية</a><a href="#properties">العقارات</a><a href="#company">عن الشركة</a><a href="#services">خدماتنا</a>
    </nav>
    <a className="ab-header-contact" href="#contact"><Phone size={15} /><span>تواصل معنا</span></a>
    <button className="ab-menu" type="button" aria-label="القائمة"><span /><span /></button>
  </header>;
}

export function SearchPanel({ dark = false, floating = false }: { dark?: boolean; floating?: boolean }) {
  return <form className={`ab-search ${dark ? "ab-search-dark" : ""} ${floating ? "ab-search-float" : ""}`} dir="rtl" onSubmit={(event) => event.preventDefault()}>
    <label className="ab-search-field"><span>أبحث عن</span><select defaultValue="all" aria-label="نوع العقار"><option value="all">كل العقارات</option><option>شقق للبيع</option><option>أراضي للبيع</option><option>عمائر للبيع</option><option>شقق للإيجار</option></select><ChevronDown size={15} /></label>
    <label className="ab-search-field"><span>المدينة</span><select defaultValue="makkah" aria-label="المدينة"><option value="makkah">مكة المكرمة</option></select><MapPin size={15} /></label>
    <label className="ab-search-field"><span>الغرض</span><select defaultValue="any" aria-label="الغرض"><option value="any">بيع أو إيجار</option><option>للبيع</option><option>للإيجار</option></select><ChevronDown size={15} /></label>
    <button className="ab-search-submit" type="submit"><Search size={18} /><span>ابحث عن عقار</span></button>
  </form>;
}

export function SectionHead({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return <div className={`ab-section-head ${dark ? "ab-on-dark" : ""}`} dir="rtl">
    <div><span className="ab-eyebrow">{eyebrow}</span><h2>{title}</h2></div>{body && <p>{body}</p>}
  </div>;
}

export function PropertyCards({ dark = false, limit = 3 }: { dark?: boolean; limit?: number }) {
  return <div className={`ab-property-grid ${dark ? "ab-property-grid-dark" : ""}`} dir="rtl">
    {officialProperties.slice(0, limit).map((property, index) => <article className={`ab-property-card ${index === 0 ? "ab-property-featured" : ""}`} key={property.id}>
      <a className="ab-property-image" href={property.sourceUrl} target="_blank" rel="noreferrer">
        <img src={property.image} alt={property.title} loading="eager" />
        <span className="ab-property-type">{property.type}</span><span className="ab-property-no">عرض {property.id.replace("listing-", "")}</span>
      </a>
      <div className="ab-property-copy"><div className="ab-property-place"><MapPin size={14} />{property.neighborhood}، مكة المكرمة</div>
        <h3>{property.title}</h3>
        <div className="ab-property-meta">{property.rooms > 0 && <span><House size={14} />{property.rooms} غرف</span>}{property.area > 0 && <span>{property.area} م²</span>}<span>{property.purpose === "rent" ? "إيجار سنوي" : "للبيع"}</span></div>
        <div className="ab-property-bottom"><strong>{property.priceLabel}</strong><a href={property.sourceUrl} target="_blank" rel="noreferrer" aria-label={`تفاصيل ${property.title}`}><ArrowLeft size={18} /></a></div>
      </div>
    </article>)}
  </div>;
}

const serviceItems = [
  ["التسويق العقاري", "نصل بالعقار المناسب إلى العميل المناسب.", Building2],
  ["المزادات العقارية", "إدارة المزادات بخطوات واضحة ومهنية.", Sparkles],
  ["إدارة الأملاك", "متابعة متكاملة تحفظ قيمة الأصول.", House],
  ["إدارة المرافق", "تشغيل ومتابعة تهتم بالتفاصيل.", ShieldCheck],
  ["المتابعة القانونية والإدارية", "إسناد ومتابعة تحفظ الحقوق.", Clock3],
  ["إدارة أملاك متكاملة", "حلول عقارية من البداية إلى المتابعة.", Building2],
] as const;

export function Services({ dark = false }: { dark?: boolean }) {
  return <div className={`ab-services ${dark ? "ab-services-dark" : ""}`} dir="rtl">
    {serviceItems.map(([title, copy, Icon], i) => <article className="ab-service" key={title}><span className="ab-service-index">0{i + 1}</span><span className="ab-service-icon"><Icon size={21} strokeWidth={1.5} /></span><div><h3>{title}</h3><p>{copy}</p></div><ArrowLeft className="ab-service-arrow" size={17} /></article>)}
  </div>;
}

export function Footer({ dark = false }: { dark?: boolean }) {
  return <footer className={`ab-footer ${dark ? "ab-footer-dark" : ""}`} id="contact" dir="rtl">
    <div className="ab-footer-top"><div><span className="ab-eyebrow">نحن بالقرب منك</span><h2>لكل عقار قصة.<br />نود سماع قصتك.</h2></div><a className="ab-footer-cta" href="tel:8002450000"><Phone size={17} /> تواصل معنا <ArrowLeft size={17} /></a></div>
    <div className="ab-footer-details">
      <div className="ab-footer-brand"><img src={asset(dark ? "alabnq-mark-dark.png" : "alabnq-mark-light.png")} alt="شركة العبنق العقارية" /><p>شركة العبنق العقارية: خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.</p></div>
      <div><span className="ab-footer-label">بيانات التواصل</span><p><MapPin size={15} /> مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع</p><a href="tel:8002450000"><Phone size={15} /> 8002450000</a><a href="mailto:info@alabnq.com">info@alabnq.com</a></div>
      <div><span className="ab-footer-label">استكشف</span><a href="#properties">العقارات</a><a href="#company">عن الشركة</a><a href="#services">خدماتنا</a></div>
    </div>
    <div className="ab-copyright"><span>© شركة العبنق العقارية. جميع الحقوق محفوظة.</span><span>المملكة العربية السعودية</span></div>
  </footer>;
}

export function Photo({ name, alt, className = "" }: { name: string; alt: string; className?: string }) {
  return <img className={className} src={asset(name)} alt={alt} />;
}

export function Wrap({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ab-wrap ${className}`}>{children}</div>;
}