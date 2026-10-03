import { ArrowLeft, MapPin } from "lucide-react";
import { Footer, Header, Photo, PropertyCards, SearchPanel, SectionHead, Services, Wrap } from "./shared";

export default function Light() {
  return <main className="ab-site ab-light" dir="rtl" id="top">
    <div className="ab-light-header-wrap"><Header light /></div>
    <section className="ab-light-hero">
      <div className="ab-light-hero-copy"><span className="ab-eyebrow">شركة العبنق العقارية · مكة المكرمة</span>
        <h1>العقار المناسب<br /><span>يبدأ من هنا.</span></h1><p>خبرة عقارية.. وخدمات متكاملة<br />خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.</p>
        <a className="ab-hero-link" href="#properties">اكتشف العقارات <ArrowLeft size={18} /></a>
        <span className="ab-light-hero-index">01 <i /> مكة المكرمة</span>
      </div>
      <div className="ab-light-hero-image"><Photo name="makkah-clocktower.jpg" alt="مكة المكرمة وبرج الساعة" /><div className="ab-image-label"><MapPin size={15} /> مكة المكرمة</div><span className="ab-hero-vertical">ALABNQ REAL ESTATE · MAKKAH</span></div>
    </section>
    <Wrap className="ab-light-search-shell"><div className="ab-search-heading"><span className="ab-eyebrow">اكتشف مساحتك</span><h2>ما الذي تبحث عنه؟</h2></div><SearchPanel /></Wrap>
    <section className="ab-light-listings" id="properties">
      <Wrap><div className="ab-listing-head"><SectionHead eyebrow="العروض العقارية" title="خيارات مختارة في مكة." body="ابدأ جولتك بين عروض العبنق العقارية." /><a href="#contact" className="ab-text-link">كل العروض <ArrowLeft size={17} /></a></div>
        <PropertyCards limit={4} />
      </Wrap>
    </section>
    <section className="ab-light-editorial" id="company">
      <Wrap className="ab-editorial-grid"><div className="ab-editorial-photo"><Photo name="alabnq-company-exterior.png" alt="مقر شركة العبنق العقارية" /><span>خبرة من أرض السوق</span></div>
        <div className="ab-editorial-copy"><span className="ab-eyebrow">عن العبنق</span><h2>خبرة ميدانية،<br /><em>وفهم متكامل.</em></h2>
          <p>تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.</p>
          <blockquote>نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.</blockquote>
          <div className="ab-editorial-signature"><span>شركة العبنق العقارية</span><span>خبرة تُرسّخ الثقة</span></div>
        </div></Wrap>
    </section>
    <section className="ab-light-services" id="services"><Wrap>
      <div className="ab-services-intro"><span className="ab-eyebrow">خدماتنا</span><h2>كل ما يحتاجه عقارك،<br />في مكان واحد.</h2><p>تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق.</p></div>
      <Services />
    </Wrap></section>
    <section className="ab-light-trust"><Wrap><img className="ab-trust-logo" src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/alabnq/alabnq-mark-light.png`} alt="شركة العبنق العقارية" /><div><span className="ab-eyebrow">معرفة محلية</span><h2>من مكة المكرمة،<br />نخدم ملاك العقار والباحثين عنه.</h2></div><a href="#contact">تحدث مع فريقنا <ArrowLeft size={17} /></a></Wrap></section>
    <Footer />
  </main>;
}