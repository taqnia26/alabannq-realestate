import { chromium } from "../../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/index.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Capture actual, isolated React pages; no interaction with the live website.
const origin = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : "http://127.0.0.1:80";
const out = path.resolve("deliverables/alabnq");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/repl/tools/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const report = [];
const font = (await readFile("artifacts/mockup-sandbox/public/alabnq/cairo.ttf")).toString("base64");
const additional = process.argv.includes("--new");
const variants = additional ? [
  { key: "Architect", file: "alabnq-proposal-03-architect.png", title: "المقترح الثالث — تكوين معماري",
    desc: "فحمي وذهبي · تكوين هندسي غير متماثل يبرز هوية الشركة وخبرتها العقارية." },
  { key: "Collection", file: "alabnq-proposal-04-collection.png", title: "المقترح الرابع — مجموعة العقارات",
    desc: "كريمي وذهبي · صور العروض الحقيقية والبحث في الواجهة، بتكوين أقرب إلى مجموعة عقارية منتقاة." },
] : [
  { key: "Dark", file: "alabnq-proposal-01-dark-gold.png", title: "المقترح الأول — حضور الشركة",
    desc: "داكن وذهبي · مقدمة تصويرية واسعة تبرز الشركة وخدماتها، ثم البحث والعروض المختارة." },
  { key: "Light", file: "alabnq-proposal-02-cream-gold.png", title: "المقترح الثاني — اكتشاف العقارات",
    desc: "كريمي وذهبي · مقدمة مقسومة وبحث واضح وعروض مبكرة، ثم التعريف بالشركة وخدماتها." },
];
try {
  for (const variant of variants) {
    const captures = [];
    for (const [device, width] of [["desktop", 1360], ["mobile", 420]]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${origin}/__mockup/preview/alabnq/${variant.key}`, { waitUntil: "networkidle" });
      await page.waitForSelector(".ab-site");
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => image.decode()));
      });
      const metrics = await page.evaluate(() => ({
        width: innerWidth,
        pageWidth: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        rtl: getComputedStyle(document.querySelector(".ab-site")).direction,
        font: document.fonts.check('16px "Cairo"'),
        clippedHeadings: Array.from(document.querySelectorAll("h1, h2, h3")).flatMap(heading => {
          const range = document.createRange();
          range.selectNodeContents(heading);
          return Array.from(range.getClientRects()).some(rect => rect.left < -1 || rect.right > innerWidth + 1) ? [heading.textContent] : [];
        }),
        images: Array.from(document.images, image => ({ src: image.currentSrc, loaded: image.complete && image.naturalWidth > 0 })),
        hero: (() => {
          const hero = document.querySelector(".ab-dark-hero-copy");
          if (!hero) return true;
          return hero.getBoundingClientRect().bottom <= document.querySelector(".ab-dark-hero").getBoundingClientRect().bottom;
        })(),
      }));
      if (errors.length || metrics.pageWidth > width || metrics.clippedHeadings.length || metrics.rtl !== "rtl" || !metrics.font || !metrics.hero || metrics.images.some(i => !i.loaded)) {
        throw new Error(JSON.stringify({ variant: variant.key, device, errors, metrics }));
      }
      const png = await page.screenshot({ fullPage: true, type: "png", animations: "disabled" });
      captures.push({ device, width, height: metrics.height, png: png.toString("base64") });
      report.push({ variant: variant.key, device, ...metrics, errors });
      await context.close();
    }
    // Native-size desktop and mobile next to one another, never shrink Arabic.
    const board = await browser.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: additional ? 1 : 2 });
    await board.setContent(`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
      @font-face{font-family:Cairo;src:url(data:font/ttf;base64,${font});font-weight:200 1000}
      *{box-sizing:border-box}body{margin:0;background:#e5e0d4;color:#182326;font-family:Cairo,sans-serif}
      header{padding:35px 50px 28px;border-bottom:1px solid #c7b58d}
      h1{margin:0;font-size:34px;font-weight:700}p{margin:7px 0 0;font-size:19px;color:#625438}
      .views{display:flex;direction:ltr;gap:40px;padding:30px 50px 40px;align-items:flex-start}
      .view{flex:none}h2{direction:rtl;font-size:18px;margin:0 0 15px;color:#625438}
      img{display:block;width:100%;height:auto;border:1px solid #cbbd9f;box-shadow:0 6px 24px #18232615}
      .note{direction:rtl;padding:32px;background:#f4f0e7;margin-top:26px;font-size:18px;line-height:2;max-width:1360px}
      footer{padding:0 50px 30px;font-size:16px;color:#625438}
      </style></head><body><header><h1>${variant.title}</h1><p>${variant.desc}</p></header><div class="views">
      ${captures.map(c => `<div class="view" style="width:${c.width}px"><h2>${c.device === "desktop" ? "تصميم الكمبيوتر" : "تصميم الجوال"}</h2><img src="data:image/png;base64,${c.png}" alt="${c.device === "desktop" ? "تصميم الكمبيوتر" : "تصميم الجوال"}">${c.device === "desktop" ? `<div class="note"><strong>${variant.title}</strong><br>${variant.desc}<br>الهوية الحالية محفوظة · عروض فعلية من الموقع · اتجاه عربي من اليمين إلى اليسار.<br>مقترح بصري للمراجعة — لم يُطبّق على الموقع الحالي.</div>` : ""}</div>`).join("")}
      </div><footer>شركة العبنق العقارية · مقترح للصفحة الرئيسية · الكمبيوتر والجوال</footer></body></html>`);
    await board.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, image => image.decode()));
    });
    const finalPng = await board.screenshot({ path: path.join(out, variant.file), fullPage: true, type: "png" });
    // Smaller review-only image, not the delivery file.
    const review = await browser.newPage({ viewport: { width: 960, height: 1000 }, deviceScaleFactor: 1 });
    await review.setContent(`<body style="margin:0"><img style="display:block;width:960px" src="data:image/png;base64,${finalPng.toString("base64")}"></body>`);
    await review.evaluate(async () => { await document.images[0].decode(); });
    await review.screenshot({ path: path.join(out, `${variant.key.toLowerCase()}-review.jpg`), fullPage: true, type: "jpeg", quality: 90 });
    await review.close();
    await board.close();
    console.log(`Exported ${variant.file}`);
  }
  await writeFile(path.join(out, additional ? "additional-capture-checks.json" : "capture-checks.json"), JSON.stringify(report, null, 2));
  console.log(report.map(({ variant, device, width, height, pageWidth, font, hero, images }) => ({ variant, device, width, height, pageWidth, font, hero, loadedImages: images.length })));
} finally {
  await browser.close();
}