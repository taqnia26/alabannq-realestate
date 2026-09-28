import { useParams, Link } from "wouter";
import { useSiteContent } from "@/data/siteContent";
import DOMPurify from "dompurify";
import { ArticleCard } from "@/components/ArticleCard";
import { Calendar, Clock, ChevronRight, User, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ArticleDetail() {
  const { data, isLoading, isError } = useSiteContent();
  const articles = data?.articles ?? [];
  const { id } = useParams<{ id: string }>();
  const article = articles.find(a => a.id === id);

  if (isLoading) return <main className="container mx-auto px-4 py-32">جارٍ تحميل المقال…</main>;
  if (isError) return <main className="container mx-auto px-4 py-32">تعذر تحميل المقال. يرجى المحاولة لاحقًا.</main>;
  if (!article) {
    return (
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-3xl font-bold mb-4">المقال غير موجود</h1>
        <Link href="/articles">
          <Button>العودة للمدونة</Button>
        </Link>
      </div>
    );
  }

  // Get up to 3 related articles excluding the current one
  const relatedArticles = articles.filter(a => a.id !== id).slice(0, 3);
  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };

  return (
    <main className="flex-1 w-full bg-background pb-24">
      {/* Breadcrumb */}
      <div className="bg-secondary/50 border-b border-border py-4">
        <div className="container mx-auto px-4 flex items-center text-sm text-muted-foreground gap-2">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
           <Link href="/articles" className="hover:text-primary transition-colors whitespace-nowrap">الأخبار والمقالات</Link>
          <ChevronRight className="w-4 h-4 shrink-0" />
          <span className="text-primary font-medium truncate">{article.title}</span>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-10 text-center">
            <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/30 font-bold mb-6 border-none px-4 py-1.5 text-sm">
              {article.category}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="rounded-3xl overflow-hidden mb-12 shadow-lg border border-border">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full aspect-video object-cover"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Social Share Sidebar (Desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-32 flex flex-col items-center gap-4">
                <span className="text-xs font-bold text-muted-foreground mb-2 rotate-180" style={{ writingMode: 'vertical-rl' }}>مشاركة المقال</span>
                <div className="w-px h-12 bg-border mb-2"></div>
                <a href={shareLinks.twitter} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors" aria-label="مشاركة عبر تويتر">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors" aria-label="مشاركة عبر فيسبوك">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors" aria-label="مشاركة عبر لينكد إن">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Article Content */}
            <div className="lg:col-span-11">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-primary prose-strong:text-foreground mb-16
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:flex prose-h2:items-center prose-h2:gap-3
                [&>h2]:before:content-[''] [&>h2]:before:block [&>h2]:before:w-2 [&>h2]:before:h-8 [&>h2]:before:bg-accent [&>h2]:before:rounded-full"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
              />

              {/* Mobile Social Share */}
              <div className="flex lg:hidden items-center gap-4 py-6 border-y border-border mb-12">
                <span className="font-bold text-foreground flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-accent" />
                  مشاركة:
                </span>
                <a href={shareLinks.twitter} target="_blank" rel="noreferrer" aria-label="مشاركة عبر تويتر" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={shareLinks.facebook} target="_blank" rel="noreferrer" aria-label="مشاركة عبر فيسبوك" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href={shareLinks.linkedin} target="_blank" rel="noreferrer" aria-label="مشاركة عبر لينكد إن" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-accent hover:text-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>

              {/* CTA Section */}
              <div className="bg-primary text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden mb-16 shadow-xl">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_100%)]"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">هل تبحث عن عقار في مكة المكرمة؟</h3>
                  <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
                    فريقنا من الخبراء العقاريين مستعد لمساعدتك في العثور على العقار المثالي الذي يلبي طموحاتك وميزانيتك.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/properties">
                      <Button className="w-full sm:w-auto h-14 px-8 bg-accent text-primary hover:bg-accent/90 text-lg font-bold">
                        تصفح العقارات المتاحة
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full sm:w-auto h-14 px-8 border-white/20 text-white hover:bg-white/10 hover:text-white text-lg font-bold">
                        تواصل معنا الآن
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedArticles.length > 0 && (
        <section className="bg-secondary/30 py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <span className="w-2 h-8 bg-accent rounded-full inline-block"></span>
                مقالات ذات صلة
              </h2>
              <Link href="/articles">
                <Button variant="ghost" className="text-primary hover:text-accent font-bold">
                  عرض كل المقالات
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map(related => (
                <ArticleCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
