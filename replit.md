# العبنق العقارية

موقع عربي RTL فاخر لاستعراض عقارات الرياض، مع خريطة تفاعلية وفلاتر ومعرض عقارات تجريبية منظم.

## Run & Operate

- `pnpm --filter @workspace/alabnq-real-estate run dev` — تشغيل الموقع عبر سير العمل المخصص له.
- `pnpm --filter @workspace/alabnq-real-estate run typecheck` — فحص TypeScript للموقع.
- `pnpm run typecheck` — فحص كامل مساحة العمل.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 19 + Vite + Tailwind CSS
- Wouter للتنقل داخل الواجهة
- React Leaflet + OpenStreetMap للخريطة التفاعلية
- Lucide React للأيقونات

## Where things live

- `artifacts/alabnq-real-estate/src/App.tsx` — تعريف المسارات والغلاف العام للواجهة.
- `artifacts/alabnq-real-estate/src/data/mockProperties.ts` — المصدر الوحيد لبيانات العقارات التجريبية.
- `artifacts/alabnq-real-estate/src/pages/Properties.tsx` — بحث وفلاتر ومعرض العقارات والخريطة.
- `artifacts/alabnq-real-estate/src/index.css` — رموز الهوية والألوان والطباعة وRTL.
- `artifacts/alabnq-real-estate/public/brand/` — ملف الشعار الأصلي ونسخة العرض المستخدمة بالموقع.

## Architecture decisions

- المرحلة الأولى تعمل بالكامل في المتصفح وببيانات محلية، دون API أو قاعدة بيانات.
- مصدر بيانات واحد يغذي بطاقات العقارات والخريطة والبحث والفلاتر لتسهيل استبداله لاحقًا.
- الخريطة تستخدم OpenStreetMap عبر Leaflet بلا مفتاح API.
- يُحفظ الشعار المرفوع دون تعديل؛ يُستخدم قص بصري عند العرض فقط لأن الأصل لوحة عمودية.

## Product

- استكشاف عقارات سكنية واستثمارية موزعة على أحياء الرياض.
- فلترة حسب التصنيف والحي ونوع العملية والسعر وعدد الغرف.
- مشاهدة فقاعات الأسعار على الخريطة وفتح بطاقة كل عقار ثم صفحة التفاصيل.
- نموذج تواصل واجهته جاهزة للربط بخدمة إرسال مستقبلًا.

## User preferences

- الواجهة عربية أولًا وباتجاه RTL.
- الهوية الأساسية فاتحة ودافئة ببيج ذهبي، مع ذهبي الشعار كلون إبراز.
- استخدام الشعار المرفوع كما هو وعدم إعادة تصميمه.

## Gotchas

- بيانات الاتصال والعناوين داخل واجهة العرض تجريبية حتى تُستبدل ببيانات الشركة الفعلية.
- صور العقارات الحالية صور stock خارجية ومناسبة للعرض التجريبي.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
