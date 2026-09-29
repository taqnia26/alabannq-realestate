import { ArrowUpLeft } from "lucide-react";
import { Link } from "wouter";
import { useLocalizedSiteValue, useSiteValue } from "@/data/siteContent";
import { usePreferences } from "@/lib/preferences";

export default function About() {
  const { t } = usePreferences();
  const heading = useLocalizedSiteValue("about.heading", "شركة العبنق العقارية", "Alabnq Real Estate");
  const intro = useLocalizedSiteValue("about.intro", "على مدى أكثر من عشرين عامًا، تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.", "For more than twenty years, Alabnq Real Estate has operated in the Kingdom's property market, drawing on extensive field experience and an understanding of property owners, investors, and market needs.");
  const story = useLocalizedSiteValue("about.story", "تقدم الشركة مجموعة من الخدمات العقارية المتخصصة التي تشمل التسويق العقاري، والمزادات العقارية، وإدارة الأملاك، وإدارة المرافق، والمتابعة القانونية والإدارية وغيرها من الخدمات العقارية، وفق منهجية عمل تهدف إلى رفع كفاءة الأصول، والمحافظة على قيمتها، وتحسين إدارتها وتشغيلها.", "The company offers specialized property services including marketing, auctions, property and facilities management, and legal and administrative follow-up. Its approach aims to improve asset efficiency, preserve value, and enhance management and operations.");
  const commitment = useLocalizedSiteValue("about.commitment", "ونؤمن في العبنق العقارية بأن نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم، في إطار من الالتزام بالأنظمة واللوائح المعمول بها في المملكة.", "At Alabnq Real Estate, we believe success is measured not merely by providing a service, but by delivering it with professionalism and clarity, serving our clients' interests and protecting their rights within the Kingdom's applicable laws and regulations.");
  const vision = useLocalizedSiteValue("about.vision", "أن تكون شركة العبنق العقارية من الشركات العقارية الموثوقة والرائدة في تقديم الخدمات العقارية المتكاملة بالمملكة، وأن نكون خيارًا مفضلًا لملاك العقارات والمستثمرين الباحثين عن الخبرة والمهنية وجودة الخدمة.", "To be among the Kingdom's trusted, leading providers of integrated property services, and a preferred choice for owners and investors seeking expertise, professionalism, and quality.");
  const mission = useLocalizedSiteValue("about.mission", "تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق، وتلتزم بالشفافية والامتثال للأنظمة واللوائح، بما يسهم في رفع كفاءة الأصول العقارية، وتعظيم قيمتها، وتوفير تجربة موثوقة لعملائنا وشركائنا.", "To provide professional, integrated property services grounded in market experience and knowledge, committed to transparency and regulatory compliance, improving asset efficiency and value while providing a trustworthy experience for clients and partners.");
  const servicesHeading = useLocalizedSiteValue("about.servicesHeading", "خدمات الشركة", "Our services");
  const servicesIntro = useLocalizedSiteValue("about.servicesIntro", "خدمات عقارية متكاملة تغطي جوانب متعددة من دورة العقار، من التسويق والمزادات إلى إدارة الأملاك والمرافق والمتابعة القانونية والإدارية.", "Integrated property services spanning multiple stages of the property lifecycle, from marketing and auctions to management, facilities, and legal and administrative follow-up.");
  const marketing = useLocalizedSiteValue("about.service.marketing", "دراسة العقار وتحديد خصائصه، وإعداد خطته التسويقية، والوصول إلى الفئات المستهدفة من المشترين والمستثمرين.", "Studying each property and its characteristics, preparing its marketing plan, and reaching the relevant groups of buyers and investors.");
  const auctions = useLocalizedSiteValue("about.service.auctions", "دراسة العقار وتجهيزه، والتسويق واستقطاب المهتمين، وإدارة إجراءات المزايدة والترسية.", "Studying and preparing the property, marketing it to interested parties, and managing the bidding and award process.");
  const management = useLocalizedSiteValue("about.service.management", "إدارة العقار ومتابعة تفاصيله التشغيلية والمالية والإيجارية.", "Managing property and following up on its operational, financial, and leasing details.");
  const facilities = useLocalizedSiteValue("about.service.facilities", "إعداد ومتابعة خطط الصيانة الوقائية، والإشراف على الأعمال الفنية والتشغيلية، والمحافظة على جاهزية العقار ومرافقه.", "Preparing and monitoring preventive maintenance plans, supervising technical and operational work, and maintaining the readiness of the property and its facilities.");
  const legal = useLocalizedSiteValue("about.service.legal", "متابعة المطالبات والإجراءات القضائية والتنفيذية المتعلقة بحقوق العقار، وفق الأنظمة ونطاق التكليف.", "Following up on claims and judicial and enforcement procedures concerning property rights, within the applicable regulations and scope of engagement.");
  const image = useSiteValue("about.image", "/hero/alabnq-company-exterior.png");
  const services = [
    [t("التسويق العقاري", "Property marketing"), marketing],
    [t("المزادات العقارية", "Property auctions"), auctions],
    [t("إدارة الأملاك العقارية", "Property management"), management],
    [t("إدارة المرافق العقارية", "Facilities management"), facilities],
    [t("المتابعة القانونية والإدارية", "Legal and administrative follow-up"), legal],
  ];
  return <main className="site-shell flex-1">
    <section className="site-always-dark relative isolate flex min-h-[580px] items-end overflow-hidden bg-[#172329] text-[#f0ebdf] md:min-h-[660px]">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#172329] via-[#172329]/60 to-[#172329]/20" />
      <div className="site-container relative pb-16 pt-36 md:pb-24"><span className="site-eyebrow">{t("من نحن", "THE COMPANY")}</span><h1 className="site-display mt-7 max-w-4xl text-[clamp(3rem,6vw,6rem)]">{heading}</h1><p className="mt-6 max-w-2xl text-base leading-9 text-[#eee8db]/80">{intro}</p></div>
    </section>
    <section className="site-container grid gap-12 py-24 lg:grid-cols-[.9fr_1.1fr] lg:gap-28 lg:py-36">
      <div><span className="site-eyebrow">{t("قصتنا", "OUR APPROACH")}</span><h2 className="site-display mt-7 max-w-lg text-4xl md:text-6xl">{t("رؤية واضحة لكل أصل عقاري.", "A clear view of every property asset.")}</h2></div>
      <div className="border-s border-accent/50 ps-7 md:ps-12"><p className="text-lg leading-[2.15] text-foreground">{story}</p><p className="mt-9 text-base leading-[2.1] text-muted-foreground">{commitment}</p></div>
    </section>
    <section className="border-y border-[var(--line-soft)] bg-secondary/45"><div className="site-container grid md:grid-cols-2">
      <div className="border-b border-[var(--line-soft)] py-16 md:border-b-0 md:border-e md:pe-16 md:py-24"><span className="site-eyebrow">01 / {t("الرؤية", "VISION")}</span><h2 className="site-display mt-6 text-3xl">{t("رؤيتنا", "Our vision")}</h2><p className="mt-6 text-sm leading-[2.2] text-muted-foreground">{vision}</p></div>
      <div className="py-16 md:ps-16 md:py-24"><span className="site-eyebrow">02 / {t("الرسالة", "MISSION")}</span><h2 className="site-display mt-6 text-3xl">{t("رسالتنا", "Our mission")}</h2><p className="mt-6 text-sm leading-[2.2] text-muted-foreground">{mission}</p></div>
    </div></section>
    <section className="site-container py-24 md:py-36"><div className="grid gap-8 border-b border-[var(--line-soft)] pb-14 lg:grid-cols-2"><div><span className="site-eyebrow">{t("ما نقدمه", "WHAT WE DO")}</span><h2 className="site-display mt-7 text-4xl md:text-6xl">{servicesHeading}</h2></div><p className="max-w-lg self-end text-base leading-9 text-muted-foreground">{servicesIntro}</p></div>
      <div>{services.map(([title, description], i) => <div key={i} className="group grid gap-5 border-b border-[var(--line-soft)] py-9 transition-colors hover:border-accent/60 md:grid-cols-[70px_1fr_1.5fr] md:items-start md:gap-10 md:py-12"><span className="text-xs text-accent" dir="ltr">0{i + 1}</span><h3 className="site-display text-xl md:text-2xl">{title}</h3><p className="max-w-xl text-sm leading-8 text-muted-foreground">{description}</p></div>)}</div>
      <Link href="/contact" className="site-button mt-14 inline-flex min-h-13 items-center gap-4 px-7 text-sm font-bold">{t("تحدث معنا", "Talk to us")} <ArrowUpLeft size={18} /></Link>
    </section>
  </main>;
}