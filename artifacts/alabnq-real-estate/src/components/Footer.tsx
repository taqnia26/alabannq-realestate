import { Link } from "wouter";
import { Mail, MapPin, Phone, Instagram, Twitter, Linkedin } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="bg-secondary text-foreground pt-16 pb-8 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <BrandLogo className="h-24 w-24 rounded-md shadow-sm" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              العبنق عقارات مكتب متخصص في إدارة وتشغيل الأملاك والتسويق العقاري نيابةً عن الملاك.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-primary">روابط سريعة</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link></li>
              <li><Link href="/properties" className="text-muted-foreground hover:text-primary transition-colors">العقارات</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">عن الشركة</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">تواصل معنا</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-primary">عروض مكة المكرمة</h3>
            <ul className="space-y-4">
              <li><Link href="/properties?q=العوالي" className="text-muted-foreground hover:text-primary transition-colors">عقارات العوالي</Link></li>
              <li><Link href="/properties?q=العدل" className="text-muted-foreground hover:text-primary transition-colors">عقارات العدل</Link></li>
              <li><Link href="/properties?q=الحسينية" className="text-muted-foreground hover:text-primary transition-colors">عقارات الحسينية</Link></li>
              <li><Link href="/properties?q=مكة" className="text-muted-foreground hover:text-primary transition-colors">كل عروض مكة</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-primary">معلومات التواصل</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع</span>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href="tel:8002450000" className="hover:text-accent transition-colors" dir="ltr">800 245 0000</a>
              </li>
              <li className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href="mailto:info@alabnq.com" className="hover:text-accent transition-colors">info@alabnq.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-accent hover:text-primary transition-all text-primary">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-accent hover:text-primary transition-all text-primary">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-accent hover:text-primary transition-all text-primary">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} شركة العبنق العقارية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-accent transition-colors">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
