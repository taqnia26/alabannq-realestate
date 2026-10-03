import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, MapPin, Search } from "lucide-react";
import { officialProperties, type PropertyType } from "./catalog";
import { Footer, Header, asset } from "./shared";
import "./collection.css";

const types: { value: "all" | PropertyType; label: string }[] = [
  { value: "all", label: "كل العقارات" },
  { value: "شقق للبيع", label: "شقق للبيع" },
  { value: "أراضي للبيع", label: "أراضي للبيع" },
  { value: "عمائر للبيع", label: "عمائر للبيع" },
  { value: "شقق للإيجار", label: "شقق للإيجار" },
];

function PropertyMeta({ property }: { property: (typeof officialProperties)[number] }) {
  return <div className="col-meta">
    {property.rooms > 0 && <span>{property.rooms} غرف</span>}
    {property.area > 0 && <span>{property.area} م²</span>}
    <span>{property.purpose === "rent" ? "إيجار سنوي" : "للبيع"}</span>
  </div>;
}

export default function Collection() {
  const [type, setType] = useState<"all" | PropertyType>("all");
  const [purpose, setPurpose] = useState<"all" | "sale" | "rent">("all");
  const [applied, setApplied] = useState({ type: "all" as "all" | PropertyType, purpose: "all" as "all" | "sale" | "rent" });
  const properties = useMemo(() => officialProperties.filter((property) =>
    (applied.type === "all" || property.type === applied.type) &&
    (applied.purpose === "all" || property.purpose === applied.purpose)
  ), [applied]);
  const featured = properties[0];
  const sideProperties = properties.slice(1);

  return <main className="ab-site ab-light ab-collection" dir="rtl" id="top">
    <div className="ab-light-header-wrap"><Header light /></div>
    <section className="col-opening" aria-labelledby="collection-title">
      <div className="col-opening-top">
        <div className="col-opening-copy">
          <span className="col-kicker">شركة العبنق العقارية · مكة المكرمة</span>
          <h1 id="collection-title">اكتشف عقارك،<br /><span>على مهل.</span></h1>
          <p>مجموعة من العروض العقارية في مكة المكرمة، وخبرة محلية تساعدك على الوصول إلى ما يناسبك.</p>
          <a className="col-opening-link" href="#properties">ابدأ استكشاف العروض <ArrowLeft size={17} /></a>
        </div>
        <div className="col-open-art" aria-label="صور من عروض عقارية رسمية">
          <div className="col-open-main">
            <img src={officialProperties[0].image} alt={officialProperties[0].title} />
            <span className="col-image-index">عرض 366</span>
            <span className="col-photo-tag">عمارة للبيع · حي العدل</span>
          </div>
          <div className="col-open-side">
            <img src={officialProperties[1].image} alt={officialProperties[1].title} />
          </div>
          <div className="col-open-label"><small>من عروض مكة</small><strong>عقار لكل غاية</strong></div>
        </div>
      </div>
      <div className="col-local-note"><strong>اختيارك يبدأ من معرفة المكان.</strong><span>عروض فعلية · تفاصيل واضحة · خبرة من مكة المكرمة</span></div>
    </section>

    <section className="col-discovery" aria-labelledby="search-title">
      <div className="col-discovery-heading">
        <div><span className="col-kicker">دليلك العقاري</span><h2 id="search-title">ما الذي تبحث عنه؟</h2></div>
        <p>حدّد نوع العقار والغرض لتصفّح العروض المتاحة.</p>
      </div>
      <form className="col-search" onSubmit={(event) => { event.preventDefault(); setApplied({ type, purpose }); }}>
        <label><span>نوع العقار</span><select aria-label="نوع العقار" value={type} onChange={(event) => setType(event.target.value as "all" | PropertyType)}>{types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown size={15} /></label>
        <label><span>المدينة</span><select aria-label="المدينة" defaultValue="makkah"><option value="makkah">مكة المكرمة</option></select><MapPin size={15} /></label>
        <label><span>الغرض</span><select aria-label="الغرض" value={purpose} onChange={(event) => setPurpose(event.target.value as "all" | "sale" | "rent")}><option value="all">بيع أو إيجار</option><option value="sale">للبيع</option><option value="rent">للإيجار</option></select><ChevronDown size={15} /></label>
        <button type="submit"><Search size={17} /> اعرض النتائج</button>
      </form>
    </section>

    <section className="col-offers" id="properties">
      <div className="col-content">
        <div className="col-offer-heading">
          <div><span className="col-kicker">العروض العقارية</span><h2>مختارة من مكة.</h2></div>
          <p>اطّلع على تفاصيل العروض الرسمية، واختر العقار الأقرب لاحتياجك.</p>
        </div>
        {featured ? <div className="col-offer-layout">
          <article className="col-feature">
            <a className="col-feature-image" href={featured.sourceUrl} target="_blank" rel="noreferrer" aria-label={`تفاصيل ${featured.title}`}>
              <img src={featured.image} alt={featured.title} />
            </a>
            <div className="col-feature-copy">
              <div className="col-property-place"><MapPin size={15} />{featured.neighborhood}، مكة المكرمة</div>
              <span className="col-property-kind">{featured.type}</span>
              <h3>{featured.title}</h3>
              <PropertyMeta property={featured} />
              <div className="col-price-line"><strong>{featured.priceLabel}</strong><a className="col-detail-link" href={featured.sourceUrl} target="_blank" rel="noreferrer">تفاصيل العرض <ArrowLeft size={16} /></a></div>
            </div>
          </article>
          {sideProperties.length > 0 && <div className="col-side-list">
            {sideProperties.map((property) => <article className="col-side-item" key={property.id}>
              <a className="col-side-image" href={property.sourceUrl} target="_blank" rel="noreferrer" aria-label={`تفاصيل ${property.title}`}><img src={property.image} alt={property.title} /></a>
              <div className="col-side-copy">
                <div className="col-property-place"><MapPin size={14} />{property.neighborhood}، مكة المكرمة</div>
                <h3>{property.title}</h3>
                <div className="col-side-bottom"><span>{property.priceLabel}</span><a href={property.sourceUrl} target="_blank" rel="noreferrer" aria-label={`تفاصيل ${property.title}`}><ArrowLeft size={16} /></a></div>
              </div>
            </article>)}
          </div>}
        </div> : <div className="col-no-results">لا توجد عروض مطابقة لهذه الخيارات حالياً. جرّب تغيير نوع العقار أو الغرض.</div>}
      </div>
    </section>

    <section className="col-company" id="company">
      <div className="col-company-copy">
        <span className="col-kicker">عن العبنق</span>
        <h2>فهم للسوق،<br />وعناية بما يهمّك.</h2>
        <p>تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.</p>
        <blockquote>نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.</blockquote>
      </div>
      <div className="col-service-side" id="services">
        <h3>خدمات عقارية متكاملة</h3>
        <div className="col-service-list">
          {["التسويق العقاري", "المزادات العقارية", "إدارة الأملاك", "إدارة المرافق", "المتابعة القانونية والإدارية", "إدارة أملاك متكاملة"].map((service, index) => <span key={service}><i>0{index + 1}</i>{service}</span>)}
        </div>
      </div>
    </section>
    <Footer dark />
  </main>;
}