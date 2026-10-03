import { ArrowLeft, MapPin } from "lucide-react";
import { Footer, Header, Photo, PropertyCards, SearchPanel, SectionHead, Services, Wrap } from "./shared";

export default function Dark() {
  return <main className="ab-site ab-dark" dir="rtl" id="top">
    <div className="ab-dark-top">
      <Header />
      <section className="ab-dark-hero">
        <Photo name="makkah-clocktower.jpg" alt="مشهد لمكة المكرمة وبرج الساعة" className="ab-dark-hero-image" />
        <div className="ab-dark-hero-shade" />
        <div className="ab-dark-hero-copy">
          <span className="ab-eyebrow">شركة العبنق العقارية · مكة المكرمة</span>
          <h1>خبرة عقارية..<br /><em>وخدمات متكاملة</em></h1>
          <p>خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.</p>
          <a className="ab-hero-link" href="#company">اكتشف العبنق <ArrowLeft size={18} /></a>
        </div>
        <div className="ab-hero-caption"><span>مكة المكرمة</span><span className="ab-caption-line" /><span>وجهتنا وخبرتنا</span></div>
      </section>
      <Wrap className="ab-dark-search-wrap"><SearchPanel dark /></Wrap>
    </div>
    <section className="ab-dark-intro" id="company">
      <Wrap className="ab-dark-intro-grid">
        <div className="ab-intro-image-box"><Photo name="alabnq-company-exterior.png" alt="مقر شركة العبنق العقارية" /><span className="ab-image-corner">العبنق العقارية</span></div>
        <div className="ab-intro-copy"><span className="ab-eyebrow">من نحن</span><h2>حضور راسخ.<br /><span>ورؤية تعرف السوق.</span></h2>
          <p>تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.</p>
          <blockquote>نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.</blockquote>
          <a className="ab-text-link" href="#services">تعرف على خدماتنا <ArrowLeft size={17} /></a>
        </div>
      </Wrap>
    </section>
    <section className="ab-dark-values" id="services">
      <Wrap><div className="ab-values-kicker"><span>خدماتنا</span><span>رعاية متكاملة لعقارك</span></div>
        <SectionHead eyebrow="حلول عقارية متكاملة" title="خبرة تُترجم إلى خدمة." body="نقدم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق." dark />
        <Services dark />
      </Wrap>
    </section>
    <section className="ab-dark-listings" id="properties">
      <Wrap><SectionHead eyebrow="عروض مختارة" title="عقارات تستحق أن تُكتشف." body="تعرّف على أحدث العروض المتاحة في مكة المكرمة." />
        <PropertyCards dark limit={3} />
        <a className="ab-all-properties" href="#contact">استعرض جميع العقارات <ArrowLeft size={17} /></a>
      </Wrap>
    </section>
    <section className="ab-dark-location">
      <Wrap className="ab-location-inner"><div><span className="ab-eyebrow">من مكة.. وإليها</span><h2>نعرف تفاصيل المكان،<br />ونفهم قيمة العقار.</h2></div><div className="ab-location-note"><MapPin size={18} /><p>خبرة محلية في مكة المكرمة، لخدمة ملاك العقارات والباحثين عن فرص مناسبة.</p></div></Wrap>
    </section>
    <Footer dark />
  </main>;
}