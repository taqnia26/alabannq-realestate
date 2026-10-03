import { chromium } from "../../../node_modules/.pnpm/playwright@1.55.0/node_modules/playwright/index.mjs";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const origin = process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : "http://127.0.0.1:80";
const browser = await chromium.launch({ executablePath: "/repl/tools/bin/chromium", headless: true, args: ["--no-sandbox"] });
try {
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1120, height: 1000 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${origin}/__mockup/alabnq-downloads.html`, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (const image of document.images) image.loading = "eager";
    await Promise.all(Array.from(document.images, image => image.decode()));
    await document.fonts.ready;
  });
  const links = page.locator("a[download]");
  if (await links.count() !== 8) throw new Error("Expected PNG and JPG download buttons for all four proposals.");
  const report = [];
  for (let i = 0; i < await links.count(); i++) {
    const link = links.nth(i);
    const name = await link.getAttribute("download");
    const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
    if (await download.failure()) throw new Error(await download.failure());
    const source = await readFile(`deliverables/alabnq/${name}`);
    const received = await readFile(await download.path());
    const hash = bytes => createHash("sha256").update(bytes).digest("hex");
    if (hash(source) !== hash(received)) throw new Error(`Download differs from original: ${name}`);
    report.push({ file: name, bytes: received.length, verified: true });
  }
  if (errors.length) throw new Error(errors.join("\n"));
  for (const key of ["Architect", "Collection"]) {
    await page.goto(`${origin}/__mockup/preview/alabnq/${key}`, { waitUntil: "networkidle" });
    await page.getByLabel("نوع العقار", { exact: true }).count().then(async count => {
      // The prototypes use their enclosing label as the accessible name.
      if (count) await page.getByLabel("نوع العقار", { exact: true }).selectOption("شقق للإيجار");
      else await page.locator("select").first().selectOption("شقق للإيجار");
    });
    await page.locator('form button[type="submit"]').click();
    const visible = await page.locator('a[href*="alabannq.com/property/"]').count();
    if (!visible) throw new Error(`${key}: filtering removed all rental offers.`);
  }
  await writeFile("deliverables/alabnq/download-checks.json", JSON.stringify({ report, errors }, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await context.close();
} finally { await browser.close(); }