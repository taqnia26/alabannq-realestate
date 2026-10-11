import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const workspace = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const root = path.join(workspace, "artifacts/alabnq-real-estate/src");
const groups = {
  Home: "الرئيسية", HomeMetrics: "إحصائيات الرئيسية", HeroSlider: "سلايدر الرئيسية",
  FeaturedSlider: "العروض الرئيسية", ArticleSlider: "أخبار الرئيسية",
  About: "من نحن", Contact: "تواصل معنا", Articles: "المقالات",
  Properties: "العقارات", PropertyDetail: "تفاصيل العقار", ArticleDetail: "تفاصيل المقال",
  Navbar: "الترويسة والتنقل", Footer: "التذييل", BrandLogo: "الشعار",
  SiteSearch: "البحث", PropertyCard: "بطاقات العقارات", ArticleCard: "بطاقات المقالات",
  WhatsAppButton: "واتساب",
};
function textKey(arabic, english) {
  let hash = 2166136261;
  for (const character of `${arabic}\u0000${english}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  return `copy.${hash.toString(16)}`;
}
const fields = new Map();
const labels = {
  "home.intro":"مقدمة الرئيسية","home.commitment":"التزام الشركة في الرئيسية","home.customerService":"وصف الخدمات في الرئيسية",
  "home.propertiesHeading":"عنوان العروض الرئيسية","home.articlesHeading":"عنوان أخبار الرئيسية",
  "home.introImage":"صورة التعريف في الرئيسية","home.servicesImage":"خلفية الخدمات في الرئيسية",
  "about.heading":"عنوان صفحة من نحن","about.intro":"مقدمة من نحن","about.story":"قصة الشركة","about.commitment":"التزام الشركة",
  "about.vision":"نص الرؤية","about.mission":"نص الرسالة","about.servicesHeading":"عنوان خدمات الشركة",
  "about.servicesIntro":"مقدمة الخدمات","about.image":"صورة صفحة من نحن",
  "about.service.marketing":"وصف التسويق العقاري","about.service.auctions":"وصف المزادات","about.service.management":"وصف إدارة الأملاك",
  "about.service.facilities":"وصف إدارة المرافق","about.service.legal":"وصف المتابعة القانونية",
  "articles.heading":"عنوان صفحة المقالات","articles.intro":"وصف صفحة المقالات","articles.image":"خلفية صفحة المقالات",
  "properties.image":"خلفية صفحة العقارات","contact.image":"خلفية صفحة التواصل","contact.heading":"عنوان صفحة التواصل",
  "contact.intro":"وصف صفحة التواصل","contact.address":"عنوان المكتب","contact.phone":"رقم الهاتف","contact.whatsapp":"رقم واتساب",
  "footer.about":"نبذة التذييل","footer.image":"خلفية التذييل","footer.email":"بريد التواصل",
  "footer.twitter":"رابط حساب X","footer.instagram":"رابط إنستغرام","footer.linkedin":"رابط لينكدإن",
  "brand.image.dark":"شعار الخلفيات الداكنة","brand.image.light":"شعار الخلفيات الفاتحة",
};
for (const directory of ["pages", "components"]) {
  for (const filename of fs.readdirSync(path.join(root, directory))) {
    if (!filename.endsWith(".tsx")) continue;
    const group = groups[filename.replace(".tsx", "")];
    if (!group) continue;
    const source = ts.createSourceFile(filename, fs.readFileSync(path.join(root, directory, filename), "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const args = node.arguments;
        const literal = i => args[i] && ts.isStringLiteralLike(args[i]) ? args[i].text : undefined;
        const name = node.expression.text;
        let field;
        if (name === "t" && literal(0) !== undefined && literal(1) !== undefined) {
          field = { key: textKey(literal(0), literal(1)), defaultValue: literal(0), englishDefault: literal(1), type: "text" };
        } else if (name === "useLocalizedSiteValue" && [0, 1, 2].every(i => literal(i) !== undefined)) {
          field = { key: literal(0), defaultValue: literal(1), englishDefault: literal(2), type: "text" };
        } else if (name === "useSiteValue" && literal(0) !== undefined && literal(1) !== undefined) {
          field = { key: literal(0), defaultValue: literal(1), type: /image/i.test(literal(0)) ? "image" : "value" };
        }
        if (field && !fields.has(field.key)) {
          fields.set(field.key, { ...field, label: labels[field.key] ?? (field.type === "text" ? field.defaultValue.slice(0,90) : field.key), group });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
const extras = [
  {key:"site.name",label:"اسم الشركة",group:"الهوية",type:"text",defaultValue:"شركة العبنق العقارية",englishDefault:"ALABNQ REAL ESTATE"},
  ...["home","about","properties","articles","contact"].map(page => ({
    key:`pages.${page}.enabled`,label:`إظهار صفحة ${{home:"الرئيسية",about:"من نحن",properties:"العقارات",articles:"المقالات",contact:"تواصل معنا"}[page]}`,group:"إظهار الصفحات",type:"value",defaultValue:"true",
  })),
  {key:"seo.description",label:"وصف الموقع لمحركات البحث",group:"الهوية",type:"text",defaultValue:"شركة العبنق العقارية — خبرة عقارية.. وخدمات متكاملة.",englishDefault:"Alabnq Real Estate Company — real estate expertise and integrated services."},
  ...[
    ["100000000","مبيعاتنا","Our sales","ريال مبيعات تجاوزت 100 مليون","SAR in sales exceeding 100 million"],
    ["500000","المساحات","Property area","متر مربع مباعة ومعروضة","sqm sold and offered"],
    ["10000","قاعدة العملاء","Our clients","عميل في قاعدة عملائنا","clients in our network"],
  ].flatMap(([value,title,titleEn,label,labelEn],index) => [
    {key:`metrics.${index+1}.value`,label:`قيمة ${title}`,group:"إحصائيات الرئيسية",type:"value",defaultValue:value},
    {key:`metrics.${index+1}.title`,label:`عنوان ${title}`,group:"إحصائيات الرئيسية",type:"text",defaultValue:title,englishDefault:titleEn},
    {key:`metrics.${index+1}.label`,label:`وصف ${title}`,group:"إحصائيات الرئيسية",type:"text",defaultValue:label,englishDefault:labelEn},
  ]),
];
for (const field of extras) fields.set(field.key, field);
const output = [...fields.values()];
fs.writeFileSync(path.join(root, "data/contentCatalog.json"), JSON.stringify(output, null, 2) + "\n");
console.log(`Content catalog: ${output.length} fields extracted from the actual public components.`);
