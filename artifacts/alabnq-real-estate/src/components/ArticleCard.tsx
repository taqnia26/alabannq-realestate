import { Link } from "wouter";
import { Article } from "@/data/articles";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`} className="group block h-full">
      <article className="flex flex-col h-full bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden transform group-hover:-translate-y-1">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium border-none px-3 py-1">
              {article.category}
            </Badge>
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTime}</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-accent transition-colors leading-snug">
            {article.title}
          </h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
            {article.excerpt}
          </p>
          
          <div className="flex items-center text-primary font-bold text-sm mt-auto group-hover:text-accent transition-colors">
            <span>اقرأ المزيد</span>
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          </div>
        </div>
      </article>
    </Link>
  );
}
