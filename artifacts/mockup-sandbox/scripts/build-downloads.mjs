import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const source = path.resolve("deliverables/alabnq");
const publicDir = path.resolve("artifacts/mockup-sandbox/public");
const target = path.join(publicDir, "alabnq-downloads");
await mkdir(target, { recursive: true });
const proposals = [
  ["03", "تكوين معماري", "فحمي وذهبي — المقترح الثالث", "alabnq-proposal-03-architect.png", "alabnq-proposal-03-architect.jpg"],
  ["04", "مجموعة العقارات", "كريمي وذهبي — المقترح الرابع", "alabnq-proposal-04-collection.png", "alabnq-proposal-04-collection.jpg"],
  ["01", "حضور الشركة", "داكن وذهبي — المقترح الأول", "alabnq-proposal-01-dark-gold.png", "alabnq-proposal-01-lightweight.jpg"],
  ["02", "اكتشاف العقارات", "كريمي وذهبي — المقترح الثاني", "alabnq-proposal-02-cream-gold.png", "alabnq-proposal-02-lightweight.jpg"],
];
const font = (await readFile(path.join(publicDir, "alabnq/cairo.ttf"))).toString("base64");
async function generate(inline) {
  const sections = [];
  for (const [number, name, description, png, jpg] of proposals) {
    const pngBytes = await readFile(path.join(source, png));
    const jpgBytes = await readFile(path.join(source, jpg));
    if (!inline) {
      await copyFile(path.join(source, png), path.join(target, png));
      await copyFile(path.join(source, jpg), path.join(target, jpg));
    }
    const pngUrl = inline ? `data:image/png;base64,${pngBytes.toString("base64")}` : `./alabnq-downloads/${png}`;
    const jpgUrl = inline ? `data:image/jpeg;base64,${jpgBytes.toString("base64")}` : `./alabnq-downloads/${jpg}`;
    sections.push(`<article><div class="title"><span>${number}</span><div><h2>${name}</h2><p>${description}</p></div></div>
      <a class="preview" href="${jpgUrl}" target="_blank" rel="noopener" aria-label="عرض صورة ${name}"><img src="${jpgUrl}" alt="مقترح ${name}: الكمبيوتر والجوال" loading="lazy"></a>
      <div class="actions"><a class="primary" download="${png}" href="${pngUrl}">تنزيل PNG · ${(pngBytes.length / 1048576).toFixed(1)} MB</a><a download="${jpg}" href="${jpgUrl}">تنزيل JPG خفيفة · ${(jpgBytes.length / 1048576).toFixed(1)} MB</a></div>
      <a class="open" href="${jpgUrl}" target="_blank" rel="noopener">فتح الصورة بحجمها الكامل</a></article>`);
  }
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>معاينة وتنزيل مقترحات العبنق العقارية</title><link rel="icon" href="data:,"><meta name="description" content="أربعة مقترحات بصرية مستقلة لموقع العبنق العقارية مع تنزيل صور PNG وJPG.">
    <style>@font-face{font-family:Cairo;src:url(data:font/ttf;base64,${font})}*{box-sizing:border-box}body{margin:0;font-family:Cairo,sans-serif;background:#f1ede3;color:#182326}header{padding:38px max(24px,calc((100% - 1100px)/2));background:#182326;color:#f5eedf;border-bottom:4px solid #ba9854}h1{font-size:28px;margin:0 0 10px}header p{color:#d2bd91;margin:0;line-height:2}.notice{max-width:1100px;margin:24px auto;padding:20px;background:#fffaf0;border-right:4px solid #b38e4c;line-height:2}.grid{max-width:1100px;margin:24px auto 48px;display:grid;grid-template-columns:1fr 1fr;gap:24px}article{background:#fffdf8;border:1px solid #dbd0ba;padding:20px;border-radius:8px}.title{display:flex;gap:16px;align-items:center}.title>span{font-size:26px;color:#a5813f}.title h2{margin:0;font-size:22px}.title p{margin:4px 0 12px;font-size:14px;color:#6a604d}.preview{display:block;height:300px;overflow:auto;background:#e5e0d4;border:1px solid #e0d7c7}.preview img{display:block;width:100%;height:auto}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.actions a{display:inline-block;text-decoration:none;padding:10px 14px;border:1px solid #b38e4c;border-radius:5px;color:#6c5126;font-size:14px}.actions .primary{background:#182326;color:#ead3a3;border-color:#182326}.open{display:block;margin-top:12px;color:#735b30;font-size:14px}footer{text-align:center;padding:20px;color:#756954}a:focus-visible{outline:3px solid #b38e4c;outline-offset:3px}@media(max-width:700px){.grid{grid-template-columns:1fr;margin-inline:16px}.notice{margin-inline:16px}h1{font-size:23px}.preview{height:280px}}</style></head><body><header><h1>مقترحات العبنق العقارية</h1><p>معاينة الصور وتنزيلها — الكمبيوتر والجوال · الموقع الحالي لم يتغيّر</p></header>
    <div class="notice"><strong>ظهرت لك رموز عند فتح PNG في محرّر الأكواد؟</strong><br>هذا عرض نصّي لملف الصورة وليس دليلًا على تلفها. استخدم أزرار التنزيل أدناه بدل فتح الملف في المحرّر. بعد التنزيل افتح الصورة بعارض الصور على جهازك. يمكنك تمرير المعاينة لرؤية التصميم كاملًا.</div>
    <main class="grid">${sections.join("")}</main><footer>مقترحات بصرية للمراجعة فقط · هوية الشركة والشعار الأصلي محفوظان</footer></body></html>`;
}
await writeFile(path.join(publicDir, "alabnq-downloads.html"), await generate(false));
// Standalone portable fallback, with no external files or network needed.
await writeFile(path.join(source, "alabnq-downloads.html"), await generate(true));
console.log("Generated hosted and self-contained download pages for four proposals.");