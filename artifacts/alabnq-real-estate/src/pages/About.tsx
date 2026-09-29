import { BrandLogo } from "@/components/BrandLogo";
import { useSiteValue } from "@/data/siteContent";

export default function About() {
  const heading = useSiteValue("about.heading", "شركة العبنق العقارية");
  const intro = useSiteValue("about.intro", "على مدى أكثر من عشرين عامًا، تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.");
  const image = useSiteValue("about.image", "/hero/alabnq-company-exterior.png");
  const story = useSiteValue("about.story", "تقدم الشركة مجموعة من الخدمات العقارية المتخصصة التي تشمل التسويق العقاري، والمزادات العقارية، وإدارة الأملاك، وإدارة المرافق، والمتابعة القانونية والإدارية وغيرها من الخدمات العقارية، وفق منهجية عمل تهدف إلى رفع كفاءة الأصول، والمحافظة على قيمتها، وتحسين إدارتها وتشغيلها.");
  const servicesHeading = useSiteValue("about.servicesHeading", "خدمات الشركة");
  return (
    <main className="flex-1 w-full bg-background pt-24">
      
      {/* Header */}
      <section className="container mx-auto px-4 mb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">{heading}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {intro}
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="about-company-visual relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src={image}
                alt="واجهة تخيلية لمقر شركة العبنق العقارية"
                className="about-company-visual__image w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
              <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
                <BrandLogo
                  className="h-20 w-20 rounded-md shadow-[0_6px_20px_rgba(0,0,0,0.3)] sm:h-28 sm:w-28"
                  label="شعار شركة العبنق العقارية على واجهة المقر"
                />
              </div>
              <div className="absolute inset-0 rounded-2xl border-2 border-accent/35 pointer-events-none" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-10 blur-3xl opacity-30"></div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">من نحن</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {story}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              ونؤمن في العبنق العقارية بأن نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم، في إطار من الالتزام بالأنظمة واللوائح المعمول بها في المملكة.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-secondary p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-primary">رؤيتنا</h2>
            <p className="leading-loose text-primary/75">أن تكون شركة العبنق العقارية من الشركات العقارية الموثوقة والرائدة في تقديم الخدمات العقارية المتكاملة بالمملكة، وأن نكون خيارًا مفضلًا لملاك العقارات والمستثمرين الباحثين عن الخبرة والمهنية وجودة الخدمة.</p>
          </div>
          <div className="rounded-2xl border border-border bg-secondary p-8 md:p-10">
            <h2 className="mb-4 text-2xl font-bold text-primary">رسالتنا</h2>
            <p className="leading-loose text-primary/75">تقديم خدمات عقارية احترافية ومتكاملة تستند إلى الخبرة والمعرفة بالسوق، وتلتزم بالشفافية والامتثال للأنظمة واللوائح، بما يسهم في رفع كفاءة الأصول العقارية، وتعظيم قيمتها، وتوفير تجربة موثوقة لعملائنا وشركائنا.</p>
          </div>
        </div>
      </section>

      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{servicesHeading}</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed mb-16">
            خدمات عقارية متكاملة تغطي جوانب متعددة من دورة العقار، من التسويق والمزادات إلى إدارة الأملاك والمرافق والمتابعة القانونية والإدارية.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">التسويق العقاري</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  دراسة العقار وتحديد خصائصه، وإعداد خطته التسويقية، والوصول إلى الفئات المستهدفة من المشترين والمستثمرين.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">المزادات العقارية</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  دراسة العقار وتجهيزه، والتسويق واستقطاب المهتمين، وإدارة إجراءات المزايدة والترسية.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">إدارة الأملاك العقارية</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  إدارة العقار ومتابعة تفاصيله التشغيلية والمالية والإيجارية.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
              <h3 className="text-xl font-bold text-accent mb-3">إدارة المرافق العقارية</h3>
              <p className="text-white/70 text-sm leading-relaxed">إعداد ومتابعة خطط الصيانة الوقائية، والإشراف على الأعمال الفنية والتشغيلية، والمحافظة على جاهزية العقار ومرافقه.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
              <h3 className="text-xl font-bold text-accent mb-3">المتابعة القانونية والإدارية</h3>
              <p className="text-white/70 text-sm leading-relaxed">متابعة المطالبات والإجراءات القضائية والتنفيذية المتعلقة بحقوق العقار، وفق الأنظمة ونطاق التكليف.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
