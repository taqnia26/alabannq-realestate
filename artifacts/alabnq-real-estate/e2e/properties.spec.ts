import { expect, test, type Page } from "@playwright/test";

async function getListCount(page: Page) {
  return page.getByTestId("property-card").count();
}

async function getPropertyIds(page: Page, view: "list" | "map") {
  const locator = view === "list"
    ? page.getByTestId("property-card")
    : page.getByTestId("map-results").locator(".custom-map-marker [data-property-id]");

  return locator.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-property-id")),
  );
}

async function expectListAndMapToMatch(page: Page) {
  await page.getByRole("tab", { name: "قائمة" }).click();
  await expect(page.getByTestId("property-list")).toBeVisible();
  const listIds = await getPropertyIds(page, "list");

  await expect(page.getByTestId("results-count")).toContainText(String(listIds.length));
  await page.getByRole("tab", { name: "خريطة" }).click();
  await expect(page.getByTestId("map-results")).toBeVisible();
  await expect(page.getByTestId("map-results").locator(".leaflet-marker-icon")).toHaveCount(listIds.length);
  await expect.poll(() => getPropertyIds(page, "map")).toEqual(listIds);

  await page.getByRole("tab", { name: "قائمة" }).click();
  await expect(page.getByTestId("property-list")).toBeVisible();
  await expect(page.getByTestId("property-card")).toHaveCount(listIds.length);
  await expect.poll(() => getPropertyIds(page, "list")).toEqual(listIds);
}

test.describe("تطابق نتائج العقارات بين القائمة والخريطة", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/properties");
    await expect(page.getByTestId("results-count")).toBeVisible();
  });

  test("يحافظ على النتائج نفسها بعد البحث وفلاتر السعر والنوع والحي", async ({ page }) => {
    const initialCount = await getListCount(page);
    await page.getByLabel("البحث بالكلمات").fill("العوالي");
    await page.getByRole("button", { name: "التصفية المتقدمة" }).click();
    await page.locator("#property-type").selectOption("شقق");
    await page.locator("#neighborhood").selectOption("العوالي");
    await page.getByLabel("الحد الأدنى للسعر").fill("30000");
    await page.getByLabel("الحد الأعلى للسعر").fill("40000");

    const filteredCount = await getListCount(page);
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(initialCount);
    await expectListAndMapToMatch(page);
  });

  test("يعرض الحالة الفارغة ثم يعيد كل العروض عند إعادة الضبط", async ({ page }) => {
    await page.getByLabel("البحث بالكلمات").fill("بحث لا يعيد أي عرض");
    await expect(page.getByTestId("list-empty-state")).toBeVisible();
    await expect(page.getByTestId("property-card")).toHaveCount(0);
    expect(await getPropertyIds(page, "list")).toEqual([]);

    await page.getByRole("tab", { name: "خريطة" }).click();
    await expect(page.getByTestId("map-empty-state")).toBeVisible();
    await expect(page.getByTestId("map-results").locator(".leaflet-marker-icon")).toHaveCount(0);
    expect(await getPropertyIds(page, "map")).toEqual([]);

    await page.getByRole("button", { name: "إعادة ضبط الفلاتر" }).click();
    await page.getByRole("tab", { name: "قائمة" }).click();
    const resetCount = await getListCount(page);
    expect(resetCount).toBeGreaterThan(0);
    await expectListAndMapToMatch(page);
  });
});