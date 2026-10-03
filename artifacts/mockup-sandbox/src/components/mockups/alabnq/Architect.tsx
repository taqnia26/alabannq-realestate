import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpLeft, Building2, MapPin, Phone, Search } from "lucide-react";
import { officialProperties } from "./catalog";
import { asset, Services } from "./shared";
import "./architect.css";

export default function Architect() {
  const [kind, setKind] = useState("all");
  const [purpose, setPurpose] = useState("all");
  const [searched, setSearched] = useState(false);
  const listings = useMemo(() => officialProperties.filter((property) =>
    (kind === "all" || property.type === kind) &&
    (purpose === "all" || property.purpose === purpose)
  ), [kind, purpose]);

  return <main className="ab-site ab-architect" dir="rtl" id="top">
    <header className="arc-header">
      <a className="arc-brand" href="#top" aria-label="شركة العبنق العقارية">
        <img src={asset("alabnq-mark-dark.png")} alt="شركة العبنق العقارية" />
        <span>شركة العبنق<br />العقارية</span>
      </a>
      <nav aria-label="التنقل الرئيسي">
        <a href="#top">الرئيسية</a><a href="#properties">العقارات</a><a href="#company">عن الشركة</a><a href="#services">خدماتنا</a>
      </nav>
      <a className="arc-contact-link" href="#contact"><Phone size={16} /> تواصل معنا</a>
    </header>

    <section className="arc-entry" aria-labelledby="arc-title">
      <div className="arc-entry-copy">
        <div className="arc-entry-index"><span>مكة المكرمة</span><i /> شركة العبنق العقارية</div>
        <p className="arc-kicker">خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.</p>
        <h1 id="arc-title">نرعى قيمة<br /><span>كل عقار.</span></h1>
        <p className="arc-entry-intro">خبرة عقارية.. وخدمات متكاملة<br />لأصحاب العقار والباحثين عنه في مكة.</p>
        <a className="arc-entry-cta" href="#properties">اكتشف العروض <ArrowLeft size={18} /></a>
        <div className="arc-entry-rule"><span>01</span><i /><span>من مكة.. وإليها</span></div>
      </div>
      <div className="arc-entry-visual">
        <div className="arc-frame arc-frame-outer" />
        <div className="arc-frame arc-frame-inner" />
        <img className="arc-office-photo" src={asset("alabnq-company-exterior.png")} alt="مقر شركة العبنق العقارية" />
        <div className="arc-photo-caption"><Building2 size={16} /><span>شركة العبنق العقارية</span><span className="arc-caption-line" /> مكة المكرمة</div>
        <div className="arc-vertical-note" dir="ltr">ALABNQ / REAL ESTATE</div>
        <div className="arc-image-chip"><span>01</span><span>حضور مهني<br />في السوق العقاري</span></div>
      </div>
      <div className="arc-side-mark" aria-hidden="true">العبنق</div>
    </section>

    <section className="arc-search-section" aria-label="البحث عن عقار">
      <div className="arc-search-intro"><span className="arc-kicker">ابدأ من احتياجك</span><h2>ابحث عن عقارك</h2></div>
      <form className="arc-search" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}>
        <label><span>نوع العقار</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">كل العقارات</option><option value="شقق للبيع">شقق للبيع</option><option value="أراضي للبيع">أراضي للبيع</option><option value="عمائر للبيع">عمائر للبيع</option><option value="شقق للإيجار">شقق للإيجار</option></select></label>
        <label><span>المدينة</span><select defaultValue="makkah"><option value="makkah">مكة المكرمة</option></select></label>
        <label><span>الغرض</span><select value={purpose} onChange={(event) => setPurpose(event.target.value)}><option value="all">بيع أو إيجار</option><option value="sale">للبيع</option><option value="rent">للإيجار</option></select></label>
        <button type="submit"><Search size={18} /> ابحث عن عقار</button>
      </form>
    </section>

    <section className="arc-company" id="company">
      <div className="arc-company-aside">
        <span className="arc-kicker">من نحن</span>
        <p className="arc-aside-phrase">وضوح في التعامل.<br /><b>عناية بالعقار.</b></p>
        <span className="arc-aside-number">مكة المكرمة <i /> 01</span>
      </div>
      <div className="arc-company-copy">
        <h2>خبرة ميدانية،<br /><span>وفهم متكامل.</span></h2>
        <p>تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.</p>
        <blockquote>نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.</blockquote>
        <a href="#services">تعرّف على خدماتنا <ArrowUpLeft size={17} /></a>
      </div>
      <div className="arc-company-image">
        <img src={asset("alabnq-company-exterior.png")} alt="مقر شركة العبنق العقارية" />
        <span>العبنق العقارية <i /> خبرة من أرض السوق</span>
      </div>
    </section>

    <section className="arc-offers" id="properties">
      <div className="arc-offers-heading">
        <div><span className="arc-kicker">عروض عقارية</span><h2>فرص متاحة<br /><span>في مكة المكرمة.</span></h2></div>
        <p>تعرّف على أحدث العروض المتاحة من شركة العبنق العقارية.</p>
      </div>
      <div className="arc-offer-list">
        {listings.map((property, index) => <a className="arc-offer" key={property.id} href={property.sourceUrl} target="_blank" rel="noreferrer">
          <div className="arc-offer-image"><img src={property.image} alt={property.title} /><span>{property.type}</span></div>
          <div className="arc-offer-number">0{index + 1}</div>
          <div className="arc-offer-copy"><span className="arc-offer-location"><MapPin size={14} /> {property.neighborhood}، مكة المكرمة</span><h3>{property.title}</h3><div className="arc-offer-meta">{property.rooms > 0 && <span>{property.rooms} غرف</span>}{property.area > 0 && <span>{property.area} م²</span>}<span>{property.purpose === "rent" ? "إيجار سنوي" : "للبيع"}</span></div></div>
          <div className="arc-offer-price"><strong>{property.priceLabel}</strong><span>تفاصيل العرض <ArrowLeft size={16} /></span></div>
        </a>)}
        {listings.length === 0 && <div className="arc-no-results"><span>لا توجد عروض مطابقة</span><p>جرّب اختيار نوع أو غرض مختلف.</p><button type="button" onClick={() => { setKind("all"); setPurpose("all"); setSearched(false); }}>عرض جميع العقارات</button></div>}
      </div>
      {searched && listings.length > 0 && <p className="arc-results-note">العروض المطابقة لاختياراتك: {listings.length}</p>}
    </section>

    <section className="arc-services" id="services">
      <div className="arc-services-head"><div><span className="arc-kicker">خدماتنا</span><h2>رعاية متكاملة<br />لعقارك.</h2></div><p>تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق.</p></div>
      <Services dark />
    </section>

    <footer className="arc-footer" id="contact">
      <div className="arc-footer-top"><div><span className="arc-kicker">نحن بالقرب منك</span><h2>لكل عقار قصة.<br /><span>نود سماع قصتك.</span></h2></div><a href="tel:8002450000"><Phone size={17} /> تواصل معنا <ArrowLeft size={17} /></a></div>
      <div className="arc-footer-grid">
        <div className="arc-footer-brand"><img src={asset("alabnq-mark-dark.png")} alt="شركة العبنق العقارية" /><p>شركة العبنق العقارية: خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.</p></div>
        <div><strong>بيانات التواصل</strong><p><MapPin size={15} /> مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع</p><a href="tel:8002450000"><Phone size={15} /> 8002450000</a><a href="mailto:info@alabnq.com">info@alabnq.com</a></div>
        <div><strong>استكشف</strong><a href="#properties">العقارات</a><a href="#company">عن الشركة</a><a href="#services">خدماتنا</a></div>
      </div>
      <div className="arc-copyright"><span>© شركة العبنق العقارية. جميع الحقوق محفوظة.</span><span>المملكة العربية السعودية</span></div>
    </footer>
  </main>;
}