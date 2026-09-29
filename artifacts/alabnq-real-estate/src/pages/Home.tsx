import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Map, ChevronLeft } from "lucide-react";
import { useSiteContent, useSiteValue } from "@/data/siteContent";
import { BrandLogo } from "@/components/BrandLogo";
import { SiteSearch } from "@/components/SiteSearch";
import { FeaturedSlider } from "@/components/FeaturedSlider";

const heroSlides = [
  "/hero/drive-01.jpg",
  "/hero/drive-02.jpg",
  "/hero/drive-03.jpg",
  "/hero/drive-04.jpg",
  "/hero/drive-05.jpg",
  "/hero/drive-06.jpg",
].map((src) => ({
  src,
  alt: "مشهد معماري جوي",
}));

export default function Home() {
  const { data } = useSiteContent();
  const officialProperties = data?.properties ?? [];
  const heroTitle = useSiteValue("home.title", "خبرة عقارية.. وخدمات متكاملة");
  const heroSubtitle = useSiteValue("home.subtitle", "خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.");
  const heroImage = useSiteValue("home.heroImage", "");
  const featuredHeading = useSiteValue("home.propertiesHeading", "أحدث العروض المميزة");
  const aboutImage = useSiteValue("about.image", "/hero/drive-03.jpg");
  const featuredProperties = officialProperties.filter(p => p.featured);

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slider = window.setInterval(() => {
      if (!heroImage) setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(slider);
  }, [heroImage]);

  return (
    <main className="flex-1 w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] max-h-[850px] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        {/* Animated background slider */}
        <div className="absolute inset-0 z-0">
          {/* Single portrait image on narrow mobile screens */}
          {(heroImage ? [{src: heroImage, alt: "صورة رئيسية"}] : heroSlides).map((slide, index) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={index === activeSlide ? slide.alt : ""}
              fetchPriority={index === 0 ? "high" : "auto"}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1400ms] ${heroImage ? "" : "min-[520px]:hidden"} ${
                heroImage || index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* Three portrait photos fill wide screens without large top/bottom crops */}
          {!heroImage && heroSlides.map((_, groupIndex) => (
            <div
              key={`group-${groupIndex}`}
              aria-hidden={groupIndex !== activeSlide}
              className={`absolute inset-0 hidden min-[520px]:grid grid-cols-3 gap-1 bg-primary transition-opacity duration-[1400ms] ease-in-out ${
                groupIndex === activeSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              {[0, 1, 2].map((offset) => {
                const slide = heroSlides[(groupIndex + offset) % heroSlides.length];
                return (
                  <img
                    key={`${groupIndex}-${slide.src}`}
                    src={slide.src}
                    alt=""
                    className="h-full w-full object-cover object-center"
                  />
                );
              })}
            </div>
          ))}

          <div className="absolute inset-0 bg-[#241b0d]/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#241b0d]/80 via-[#241b0d]/15 to-[#241b0d]/20"></div>
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center mt-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight max-w-5xl">
            {heroTitle} <br/>
            <span className="text-accent">في مكة والرياض</span>
          </h1>
          {heroSubtitle && <p className="max-w-2xl text-lg text-white/90 md:text-xl">{heroSubtitle}</p>}
          <div className="mt-6 w-full max-w-3xl bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl">
            <SiteSearch mode="hero" />
          </div>
        </div>
        {!heroImage && <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" aria-label="شرائح الصور">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`عرض الصورة ${index + 1}`}
              aria-current={index === activeSlide}
              onClick={() => setActiveSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeSlide ? "w-8 bg-accent" : "w-2.5 bg-white/70 hover:bg-white"
              }`}
            />
          ))}
        </div>}
      </section>

      {/* Value Proposition */}
      <section className="py-16 md:py-24 bg-secondary text-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/hero/drive-01.jpg"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-full w-full object-cover opacity-[0.055] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-secondary via-secondary/95 to-secondary/75" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <BrandLogo className="mb-8 h-24 w-24 rounded-lg shadow-sm" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary leading-tight">
                من نحن
              </h2>
              <p className="text-primary/75 text-lg mb-5 leading-relaxed">
                تعمل شركة العبنق العقارية في السوق العقاري بالمملكة، مستندة إلى خبرة ميدانية ممتدة وفهم متكامل لاحتياجات ملاك العقارات والمستثمرين ومتطلبات السوق.
              </p>
              <ul className="mb-8 grid grid-cols-1 gap-x-5 gap-y-2 text-sm font-medium text-primary/85 sm:grid-cols-2">
                {["التسويق العقاري", "المزادات العقارية", "إدارة الأملاك", "إدارة المرافق", "المتابعة القانونية والإدارية"].map(service => (
                  <li key={service} className="flex items-center gap-2"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{service}</li>
                ))}
              </ul>
              <p className="mb-8 border-r-2 border-accent pr-4 text-sm leading-relaxed text-primary/75">
                نجاحنا لا يقاس بتقديم الخدمة فحسب، بل بقدرتنا على تقديمها بمهنية ووضوح، وبما يحقق مصلحة عملائنا ويحفظ حقوقهم.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-9">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">+100 مليون</div>
                  <div className="text-primary/70">مبيعاتنا</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">+300 ألف</div>
                  <div className="text-primary/70">مساحات</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">+10 آلاف عميل</div>
                  <div className="text-primary/70">قاعدة عملاء</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">6 أيام، 12 ساعة</div>
                  <div className="text-primary/70">أوقات العمل</div>
                </div>
              </div>
              <Link href="/properties?view=map" className="inline-flex min-h-14 items-center gap-3 rounded-xl border border-primary/20 bg-white px-6 font-bold text-primary shadow-sm transition hover:border-accent hover:shadow-md">
                <Map size={21} aria-hidden="true" /> خريطة العقارات <ChevronLeft size={18} aria-hidden="true" />
              </Link>
            </div>
            
            <div className="relative">
              <div className="value-showcase-frame relative aspect-[4/5] overflow-hidden rounded-2xl">
                <img 
                  src={aboutImage}
                  alt="مشهد معماري جوي"
                  loading="lazy"
                  className="value-showcase-image h-full w-full object-cover"
                />
                <div className="value-showcase-sheen absolute inset-y-0 -left-1/2 w-1/3" aria-hidden="true" />
                <div className="absolute inset-0 border-2 border-accent/30 rounded-2xl m-4 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSlider properties={featuredProperties} heading={featuredHeading} />
    </main>
  );
}
