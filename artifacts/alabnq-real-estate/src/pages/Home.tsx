import { useEffect, useState } from "react";
import { Link } from "wouter";
import { MapPin, ChevronLeft } from "lucide-react";
import { officialProperties, uniqueNeighborhoods } from "@/data/mockProperties";
import { PropertyCard } from "@/components/PropertyCard";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { SiteSearch } from "@/components/SiteSearch";
import { ArticleCard } from "@/components/ArticleCard";
import { articles } from "@/data/articles";

import { Badge } from "@/components/ui/badge";

const heroSlides = Array.from({ length: 14 }, (_, index) => ({
  src: `/hero/makkah-${String(index + 1).padStart(2, "0")}.jpeg`,
  alt: "صورة جوية من مكة المكرمة",
}));

export default function Home() {
  const featuredProperties = officialProperties.filter(p => p.featured).slice(0, 3);
  const recentProperties = officialProperties.slice(0, 6);
  const showcaseProperty = officialProperties[0];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slider = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(slider);
  }, []);

  return (
    <main className="flex-1 w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        {/* Animated background slider */}
        <div className="absolute inset-0 z-0">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.src}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-in-out ${
                index === activeSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.src}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
              />
              <div className="absolute inset-0 bg-primary/55" />
              <img
                src={slide.src}
                alt={slide.alt}
                fetchPriority={index === 0 ? "high" : "auto"}
                className="relative z-10 h-full w-full object-contain transition-transform duration-[5500ms] ease-out"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[#332814]/25"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#241b0d]/75 via-[#241b0d]/20 to-transparent"></div>
        </div>

        <div className="container relative z-10 px-4 flex flex-col items-center text-center mt-16">
          <Badge variant="outline" className="mb-6 border-accent text-accent px-4 py-1.5 text-sm bg-primary/30 backdrop-blur-sm">
            عقارات وأراضي مكة المكرمة
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl">
            نُدير ونسوّق <br/>
            <span className="text-accent">عقارات مكة المكرمة</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl">
            نستلم العقارات والأراضي داخل مكة المكرمة، ونقدّم حلولًا متكاملة لإدارتها وتسويقها.
          </p>

          {/* Quick Search */}
          <div className="w-full max-w-3xl bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-2xl">
            <SiteSearch mode="hero" />
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2" aria-label="شرائح الصور">
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
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">العروض العقارية المميزة</h2>
              <p className="text-muted-foreground text-lg">
                نعرض فرص البيع والإيجار المتاحة في مكة المكرمة، ونتولى استلام العقارات والأراضي داخل المدينة.
              </p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="h-12 border-primary/20 hover:border-primary">
                عرض كل العقارات
                <ChevronLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-24 bg-secondary text-primary relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={officialProperties[1].image}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="h-full w-full object-cover opacity-[0.055] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-secondary via-secondary/95 to-secondary/75" />
          <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
          <div className="absolute -bottom-52 left-10 h-[28rem] w-[28rem] rounded-full bg-white/60 blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <BrandLogo className="mb-10 h-28 w-28 rounded-lg shadow-sm" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-primary leading-tight">
                  العبنق عقارات في مكة المكرمة
              </h2>
              <p className="text-primary/75 text-lg mb-8 leading-relaxed">
                  مكتب متخصص في استلام وإدارة وتسويق العقارات والأراضي داخل مكة المكرمة، لمساعدة الملاك على تحقيق أفضل استفادة من أصولهم.
              </p>
              
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">7 أيام</div>
                  <div className="text-primary/70">خدمة عملاء أسبوعية</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">تقارير</div>
                  <div className="text-primary/70">مالية حسب طلب المالك</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">قاعدة</div>
                  <div className="text-primary/70">عملاء نشطة للتسويق</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-accent mb-2">مرونة</div>
                  <div className="text-primary/70">في التعاقد والبنود</div>
                </div>
              </div>

              <Link href="/about">
                <Button className="bg-accent text-primary hover:bg-accent/90 h-12 px-8 font-bold">
                  اكتشف قصتنا
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden relative">
                <img 
                  src={showcaseProperty.image}
                  alt={showcaseProperty.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-2 border-accent/30 rounded-2xl m-4 pointer-events-none"></div>
              </div>
              <div className="absolute -bottom-8 -left-8 bg-white text-primary p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">نطاقنا مكة المكرمة</div>
                    <div className="text-sm text-muted-foreground">استلام عقارات وأراضٍ داخل مكة فقط</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uniqueNeighborhoods.slice(0, 6).map(n => (
                    <span key={n} className="text-xs px-3 py-1 bg-secondary rounded-full font-medium">{n}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">أحدث العروض</h2>
            <p className="text-muted-foreground text-lg">
              تصفح أحدث العروض المنشورة، ثم تواصل مع العبنق عقارات لمعرفة التفاصيل وتحديثات التوفر.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {recentProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="text-center">
            <Link href="/properties">
              <Button size="lg" className="h-14 px-12 text-lg">
                تصفح جميع العقارات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="border-t border-border bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="mb-4 inline-flex rounded-full bg-accent/20 px-4 py-2 text-sm font-bold text-primary">
                أخبار ورؤى عقارية
              </span>
              <h2 className="mb-4 text-3xl font-bold text-primary md:text-4xl">معرفة تساعدك على اتخاذ القرار</h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                أدلة عملية وتحليلات مبسطة حول السكن والاستثمار وإدارة الأملاك في مكة المكرمة.
              </p>
            </div>
            <Link href="/articles">
              <Button variant="outline" className="h-12 border-primary/20 hover:border-primary">
                تصفح الأخبار والمقالات
                <ChevronLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
