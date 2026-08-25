import { MapPin, CheckCircle2, Building2 } from "lucide-react";

export default function About() {
  return (
    <main className="flex-1 w-full bg-background pt-24">
      
      {/* Header */}
      <section className="container mx-auto px-4 mb-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">العبنق عقارات لإدارة الأملاك والتسويق العقاري</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            مكتب فهاد سعد منصور السبيعي لإدارة الأملاك والتسويق العقاري في مكة المكرمة، نقدّم خدمات عملية تساعد الملاك والباحثين عن العقار.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="container mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1572204292164-b35ba473f446?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="مكتب العبنق العقارية" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent rounded-full -z-10 blur-3xl opacity-30"></div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary">من نحن</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              العبنق عقارات مكتب متخصص في استلام وإدارة وتشغيل العقارات والأراضي داخل مكة المكرمة، ويعمل كشريك استراتيجي للمالكين الراغبين في تحقيق أقصى قدر من الفوائد من استثماراتهم العقارية.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              نسهّل إدارة الأملاك والتسويق العقاري داخل مكة المكرمة من خلال التواصل السلس، وتنسيق إجراءات التأجير والبيع، وإعداد التقارير المالية وفق احتياجات المالك.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h4 className="font-bold text-primary mb-1">خدمة عملاء مستمرة</h4>
                  <p className="text-sm text-muted-foreground">فريق خدمة يعمل على مدار الأسبوع</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h4 className="font-bold text-primary mb-1">تسويق أكثر فاعلية</h4>
                  <p className="text-sm text-muted-foreground">قاعدة عملاء تساعد على سرعة الوصول</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h4 className="font-bold text-primary mb-1">تقارير مالية مخصصة</h4>
                  <p className="text-sm text-muted-foreground">حسب رغبة المالك ومواعيد التحويل</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-accent shrink-0" />
                <div>
                  <h4 className="font-bold text-primary mb-1">مرونة وسهولة</h4>
                  <p className="text-sm text-muted-foreground">في التعاقد وإضافة البنود أو إلغائها</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership / Team (Placeholder) */}
      <section className="bg-primary text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full mb-8">
            <Building2 className="w-12 h-12 text-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">خدمات متكاملة للمالك والعميل</h2>
          <p className="text-white/70 max-w-2xl mx-auto text-lg leading-relaxed mb-16">
            فريق من الكفاءات في مختلف الإدارات يقدّم متابعة أسرع وخدمة أكثر سلاسة للملاك والمستأجرين.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">إدارة وتشغيل الأملاك</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  متابعة احتياجات العقار والتواصل مع الملاك والمستأجرين بصورة منظمة.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">التسويق العقاري</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  تسويق عقارات البيع والإيجار ومتابعة آراء العملاء والمهتمين بالعروض.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-accent/50 transition-colors">
                <h3 className="text-xl font-bold text-accent mb-3">التقارير والمتابعة المالية</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                  إعداد تقارير مالية ومتابعة تحويل الإيجارات وفق المواعيد التي يحددها المالك.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
