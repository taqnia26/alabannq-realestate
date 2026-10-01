import assert from "node:assert/strict";
import test from "node:test";
import { defaultHeroSlider, heroSliderSchema, heroSlideText, MAX_SLIDES, readHeroSlider } from "../src/index.ts";

test("legacy content seeds the existing images and custom text without writing settings", () => {
  const config = readHeroSlider({ "home.title": "عنوان الشركة", "home.heroImage": "/hero/custom.jpg" });
  assert.equal(config.slides.length, 1);
  assert.equal(config.slides[0].image, "/hero/custom.jpg");
  assert.equal(config.slides[0].title, "عنوان الشركة");
  assert.equal(heroSliderSchema.safeParse(config).success, true);
});
test("stored config preserves ordering, effects, and disabled slides", () => {
  const config = defaultHeroSlider();
  config.slides.reverse();
  config.slides[0].enabled = false;
  config.transition = "slide";
  config.autoplay = false;
  assert.deepEqual(readHeroSlider({ "home.slider": JSON.stringify(config) }), config);
});
test("invalid stored settings fail explicitly rather than restoring unrelated defaults", () => {
  assert.throws(() => readHeroSlider({ "home.slider": "{broken" }));
  assert.throws(() => readHeroSlider({ "home.slider": "{}" }));
});
test("at least one enabled slide, unique IDs, and at most twelve slides are enforced", () => {
  const config = defaultHeroSlider();
  assert.equal(heroSliderSchema.safeParse({ ...config, slides: config.slides.map(s => ({ ...s, enabled: false })) }).success, false);
  assert.equal(heroSliderSchema.safeParse({ ...config, slides: [config.slides[0], config.slides[0]] }).success, false);
  assert.equal(heroSliderSchema.safeParse({ ...config, slides: Array.from({ length: MAX_SLIDES + 1 }, (_, i) => ({ ...config.slides[0], id: `slide-${i}` })) }).success, false);
});
test("script URLs, protocol-relative URLs, control characters and upload aliases are rejected", () => {
  const config = defaultHeroSlider();
  for (const buttonHref of ["javascript:alert(1)", "//other.example", "/contact\n", "https://user:pass@example.com"]) {
    assert.equal(heroSliderSchema.safeParse({ ...config, slides: [{ ...config.slides[0], buttonHref }] }).success, false, buttonHref);
  }
  const image = "https://example.com/api/media/images/00000000-0000-0000-0000-000000000001";
  assert.equal(heroSliderSchema.safeParse({ ...config, slides: [{ ...config.slides[0], image }] }).success, false);
});
test("bilingual settings exceeding the transport-safe UTF8 budget get a useful error", () => {
  const config = defaultHeroSlider();
  config.slides = Array.from({ length: MAX_SLIDES }, (_, i) => ({
    ...config.slides[0], id: `slide-${i}`, title: "أ".repeat(220), titleEn: "B".repeat(220),
    imageAlt: "أ".repeat(220), imageAltEn: "B".repeat(220),
    subtitle: "أ".repeat(600), subtitleEn: "B".repeat(600),
    eyebrow: "أ".repeat(120), eyebrowEn: "B".repeat(120),
  }));
  const result = heroSliderSchema.safeParse(config);
  assert.equal(result.success, false);
  if (!result.success) assert.ok(result.error.issues.some(issue => issue.message.includes("40")));
});
test("optional English content consistently falls back to Arabic", () => {
  const slide = { ...defaultHeroSlider().slides[0], titleEn: "" };
  assert.equal(heroSlideText(slide, "title", "en"), slide.title);
  assert.equal(heroSlideText(slide, "title", "ar"), slide.title);
});