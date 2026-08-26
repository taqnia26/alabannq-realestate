import { articles } from "@/data/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export default function Articles() {
  return (
    <main className="flex-1 w-full bg-background pb-24">
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center text-sm text-muted-foreground gap-2">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary font-medium">الأخبار والمقالات</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_100%)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="mb-5 inline-flex rounded-full border border-accent/35 bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
              محتوى تجريبي لأغراض العرض
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">دليلك نحو قرارات عقارية واثقة</h1>
            <p className="text-lg text-primary-foreground/80 leading-relaxed">
              تغطيات، نصائح، وتحليلات متعمقة لسوق العقارات في مكة المكرمة نضعها بين يديك لتكون دليلك الشامل في رحلتك العقارية.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </main>
  );
}
