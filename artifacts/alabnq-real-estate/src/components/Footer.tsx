import { Link } from "wouter";
import { Mail, MapPin, Phone, Instagram, Twitter, Linkedin } from "lucide-react";
import { BrandLogo } from "./BrandLogo";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-primary/20 bg-primary pt-16 pb-8 text-white">
      <img
        src="/hero/drive-04.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-primary via-primary/95 to-primary/80" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <BrandLogo className="h-24 w-24 rounded-md shadow-sm" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              العبنق عقارات مكتب متخصص في إدارة وتشغيل الأملاك والتسويق العقاري نيابةً عن الملاك.
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-accent">روابط سريعة</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-white/70 transition-colors hover:text-accent">الرئيسية</Link></li>
              <li><Link href="/properties" className="text-white/70 transition-colors hover:text-accent">العقارات</Link></li>
              <li><Link href="/about" className="text-white/70 transition-colors hover:text-accent">عن الشركة</Link></li>
              <li><Link href="/articles" className="text-white/70 transition-colors hover:text-accent">الأخبار والمقالات</Link></li>
              <li><Link href="/contact" className="text-white/70 transition-colors hover:text-accent">تواصل معنا</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-accent">عروض مكة المكرمة</h3>
            <ul className="space-y-4">
              <li><Link href="/properties?q=العوالي" className="text-white/70 transition-colors hover:text-accent">عقارات العوالي</Link></li>
              <li><Link href="/properties?q=العدل" className="text-white/70 transition-colors hover:text-accent">عقارات العدل</Link></li>
              <li><Link href="/properties?q=الحسينية" className="text-white/70 transition-colors hover:text-accent">عقارات الحسينية</Link></li>
              <li><Link href="/properties?q=مكة" className="text-white/70 transition-colors hover:text-accent">كل عروض مكة</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-lg font-bold text-accent">معلومات التواصل</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <span>مكة المكرمة – العوالي – شارع الشيخ محمد بن مانع</span>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <a href="tel:8002450000" className="hover:text-accent transition-colors" dir="ltr">800 245 0000</a>
              </li>
              <li className="flex items-center gap-3 text-white/70">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <a href="mailto:info@alabnq.com" className="hover:text-accent transition-colors">info@alabnq.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-4 mt-8">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-accent hover:text-primary">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-accent hover:text-primary">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all hover:bg-accent hover:text-primary">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 text-sm text-white/60 md:flex-row">
          <p>© {new Date().getFullYear()} شركة العبنق العقارية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-accent">سياسة الخصوصية</a>
            <a href="#" className="transition-colors hover:text-accent">الشروط والأحكام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
