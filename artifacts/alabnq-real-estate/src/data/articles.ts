import { officialProperties } from './mockProperties';

export interface Article {
  id: string;
  title: string;
  titleEn?: string;
  excerpt: string;
  excerptEn?: string;
  content: string;
  contentEn?: string;
  category: string;
  categoryEn?: string;
  date: string;
  readTime: string;
  readTimeEn?: string;
  image: string;
  author: string;
  authorEn?: string;
}

export const articles: Article[] = [
  {
    id: "makkah-real-estate-investment-2026",
    title: "مستقبل الاستثمار العقاري في مكة المكرمة لعام 2026",
    titleEn: "The Future of Real Estate Investment in Makkah in 2026",
    excerpt: "نظرة تحليلية على توجهات السوق العقاري في العاصمة المقدسة والفرص الاستثمارية الواعدة في الأحياء النامية.",
    excerptEn: "An analytical look at real estate market trends in the Holy Capital and promising investment opportunities in developing districts.",
    content: `
      <p>تستمر مكة المكرمة في جذب المستثمرين العقاريين بفضل مكانتها الدينية والاقتصادية الاستثنائية. يشهد عام 2026 تحولات نوعية في الطلب على العقارات السكنية والتجارية، خاصة مع استمرار مشاريع تطوير البنية التحتية وتحسين جودة الحياة في مختلف الأحياء.</p>
      
      <h2>أبرز التوجهات الاستثمارية</h2>
      <p>تشير البيانات الحالية إلى ارتفاع ملحوظ في الطلب على الشقق السكنية المخصصة للتأجير السنوي في أحياء مثل العوالي والحسينية، حيث يفضل السكان الجدد هذه المناطق لتوفر الخدمات وتكامل المرافق. كما تظل العمائر الاستثمارية في حي العدل وما جاوره خياراً آمناً يحقق عوائد مستقرة.</p>
      
      <h2>العوامل المؤثرة على السوق</h2>
      <p>يلعب التوسع العمراني وتطوير شبكات الطرق دوراً محورياً في إعادة تقييم الأراضي والمباني. الأحياء التي ترتبط مباشرة بالطرق الدائرية تشهد نمواً متسارعاً في الأسعار، مما يجعلها أهدافاً مثالية للاستثمار طويل الأجل.</p>
      
      <p>نحن في العبنق العقارية نوصي المستثمرين بدراسة العائد على الاستثمار بشكل دقيق، مع الأخذ في الاعتبار الصيانة الدورية وتكاليف الإدارة لضمان استدامة الأرباح.</p>
    `,
    contentEn: `
      <p>Makkah continues to attract real estate investors thanks to its exceptional religious and economic significance. In 2026, demand for residential and commercial properties is undergoing notable changes, particularly as infrastructure development projects and efforts to improve quality of life continue across the districts.</p>

      <h2>Key Investment Trends</h2>
      <p>Current data points to a notable increase in demand for residential apartments for annual rent in districts such as Al-Awali and Al-Husayniyah, where new residents favor these areas for their available services and integrated facilities. Investment buildings in Al-Adl and its surroundings also remain a relatively secure option that generates stable returns.</p>

      <h2>Factors Affecting the Market</h2>
      <p>Urban expansion and road network development play a central role in the revaluation of land and buildings. Districts directly connected to ring roads are seeing accelerated price growth, making them potential targets for long-term investment.</p>

      <p>At Alabnq Real Estate, we recommend that investors carefully assess return on investment, taking regular maintenance and management costs into account to help ensure sustainable profits.</p>
    `,
    category: "تحليلات السوق",
    categoryEn: "Market Analysis",
    date: "2026-08-20",
    readTime: "4 دقائق قراءة",
    readTimeEn: "4 min read",
    image: officialProperties[0]?.image || "https://alabannq.com/wp-content/uploads/2026/08/3-592x444.png",
    author: "فريق العبنق العقارية",
    authorEn: "Alabnq Real Estate Team"
  },
  {
    id: "choosing-right-neighborhood-makkah",
    title: "كيف تختار الحي المناسب للسكن في مكة؟",
    titleEn: "How to Choose the Right Neighborhood to Live in Makkah",
    excerpt: "دليل شامل لمقارنة أبرز أحياء مكة المكرمة من حيث الخدمات، الهدوء، وسهولة التنقل لمساعدتك في اتخاذ القرار الصحيح.",
    excerptEn: "A comprehensive guide to comparing prominent neighborhoods in Makkah in terms of services, tranquility, and ease of getting around to help you make the right decision.",
    content: `
      <p>قرار اختيار الحي المناسب للسكن يعد من أهم القرارات التي تؤثر على جودة حياة الأسرة. تختلف أحياء مكة المكرمة في طابعها والخدمات التي تقدمها، مما يجعل لكل حي ميزة فريدة تلبي احتياجات معينة.</p>
      
      <h2>حي العوالي: الهدوء والرقي</h2>
      <p>يعتبر حي العوالي من أرقى أحياء مكة، يتميز بالشوارع الواسعة والهدوء النسبي مقارنة بالأحياء المركزية. تتوفر فيه مرافق تعليمية وصحية متكاملة، مما يجعله الخيار الأول للعائلات الباحثة عن الاستقرار.</p>
      
      <h2>حي العدل: الحيوية وسهولة الوصول</h2>
      <p>يتميز حي العدل بموقعه الاستراتيجي وقربه من المشاعر المقدسة والطرق الرئيسية. يعتبر حياً حيوياً يضم تنوعاً في الخيارات السكنية من شقق وعمائر، وهو مفضل للموظفين والعاملين في القطاعات المركزية.</p>
      
      <h2>نصائح قبل اتخاذ القرار</h2>
      <p>قبل توقيع عقد الإيجار أو الشراء، تأكد من زيارة الحي في أوقات مختلفة من اليوم. تحقق من توفر مواقف السيارات، وقرب المدارس إذا كان لديك أطفال، ومدى توفر الخدمات الأساسية مثل السوبرماركت والصيدليات على مسافة قريبة.</p>
    `,
    contentEn: `
      <p>Choosing the right neighborhood to live in is one of the most important decisions affecting a family's quality of life. Neighborhoods in Makkah differ in character and in the services they offer, so each has distinct advantages that meet particular needs.</p>

      <h2>Al-Awali: Tranquility and Comfort</h2>
      <p>Al-Awali is considered one of Makkah's more upscale neighborhoods. It is distinguished by wide streets and relative quiet compared with central districts. It has comprehensive educational and healthcare facilities, making it a leading choice for families seeking stability.</p>

      <h2>Al-Adl: Activity and Accessibility</h2>
      <p>Al-Adl is distinguished by its strategic location and proximity to the holy sites and main roads. It is an active neighborhood with a range of residential options, including apartments and buildings, and is favored by employees and workers in central sectors.</p>

      <h2>Tips Before Making a Decision</h2>
      <p>Before signing a rental or purchase contract, make sure to visit the neighborhood at different times of day. Check the availability of parking, how close schools are if you have children, and whether essential services such as supermarkets and pharmacies are nearby.</p>
    `,
    category: "نصائح عقارية",
    categoryEn: "Real Estate Tips",
    date: "2026-08-12",
    readTime: "3 دقائق قراءة",
    readTimeEn: "3 min read",
    image: officialProperties[2]?.image || "https://alabannq.com/wp-content/uploads/2026/07/1-3.jpeg",
    author: "فريق العبنق العقارية",
    authorEn: "Alabnq Real Estate Team"
  },
  {
    id: "preparing-property-for-rent",
    title: "خطوات تجهيز عقارك للتأجير السريع",
    titleEn: "Steps to Prepare Your Property for a Faster Rental",
    excerpt: "أهم التعديلات والتحسينات التي ترفع من قيمة عقارك وتجعله جذاباً للمستأجرين في وقت قياسي.",
    excerptEn: "The most important changes and improvements that can increase your property's value and make it attractive to tenants in a short time.",
    content: `
      <p>يواجه العديد من ملاك العقارات تحديات في تأجير وحداتهم السكنية بسرعة وبسعر مجزٍ. السر يكمن في الانطباع الأول الذي يتركه العقار لدى المستأجر المحتمل.</p>
      
      <h2>الصيانة الأساسية قبل العرض</h2>
      <p>تأكد من عمل جميع التمديدات الكهربائية والسباكة بكفاءة. المستأجر يبحث عن راحة البال ولا يفضل السكن في عقار يحتاج إلى إصلاحات مستمرة. قم بطلاء الجدران بألوان محايدة فاتحة لتعطي شعوراً بالاتساع والنظافة.</p>
      
      <h2>الاهتمام بالتفاصيل الجمالية</h2>
      <p>نظافة العقار بشكل احترافي هي خطوة لا يمكن تجاهلها. تنظيف النوافذ والأرضيات وتلميع الأبواب يعطي انطباعاً بالعناية والاهتمام. تأكد أيضاً من جودة الإضاءة، فالإضاءة الجيدة تبرز جمال المساحات وتجعلها أكثر ترحيباً.</p>
      
      <h2>التسعير الذكي</h2>
      <p>دراسة أسعار العقارات المشابهة في نفس الحي تساعدك على وضع سعر تنافسي. السعر المرتفع جداً قد يؤدي إلى بقاء العقار شاغراً لفترات طويلة، بينما السعر العادل يضمن لك مستأجراً مستداماً وعوائد مستمرة.</p>
    `,
    contentEn: `
      <p>Many property owners face challenges renting out their residential units quickly and at a worthwhile price. The key lies in the first impression the property makes on a prospective tenant.</p>

      <h2>Essential Maintenance Before Listing</h2>
      <p>Make sure all electrical and plumbing systems are working properly. Tenants seek peace of mind and generally prefer not to live in a property that needs ongoing repairs. Paint the walls in light, neutral colors to create a sense of spaciousness and cleanliness.</p>

      <h2>Attention to Aesthetic Details</h2>
      <p>Professional cleaning is a step that should not be overlooked. Cleaning windows and floors and polishing doors conveys care and attention. Also check the quality of the lighting: good lighting highlights the spaces and makes them more welcoming.</p>

      <h2>Smart Pricing</h2>
      <p>Researching prices for similar properties in the same neighborhood can help you set a competitive price. An excessively high price may leave the property vacant for long periods, while a fair price can help secure a stable tenant and ongoing returns.</p>
    `,
    category: "دليل الملاك",
    categoryEn: "Owner's Guide",
    date: "2026-08-04",
    readTime: "5 دقائق قراءة",
    readTimeEn: "5 min read",
    image: officialProperties[1]?.image || "https://alabannq.com/wp-content/uploads/2026/08/WhatsApp-Image-2025-12-25-at-8.40.46-PM-1-592x444.jpeg",
    author: "فريق العبنق العقارية",
    authorEn: "Alabnq Real Estate Team"
  }
];
