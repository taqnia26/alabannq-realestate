import { z } from "zod";

export const HERO_SLIDER_KEY = "home.slider";
export const MAX_SLIDES = 12;
export const MAX_SLIDER_BYTES = 40_000;
const safeUrl = (value: string) => {
  if (!value) return true;
  if (/[\u0000-\u0020\u007f\\]/.test(value)) return false;
  try {
    const relative = /^\/(?!\/)/.test(value);
    if (!relative && !/^https?:\/\//i.test(value)) return false;
    const url = new URL(value, "https://slider.invalid");
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
};
const safeImageUrl = (value: string) => {
  if (!safeUrl(value)) return false;
  // Uploaded files must use the canonical relative URL for reference tracking.
  return !/^https?:\/\//i.test(value) || !new URL(value).pathname.startsWith("/api/media/images/");
};
export const heroSlideSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  image: z.string().max(2048).refine(safeImageUrl, "رابط الصورة غير صالح. استخدم الرابط النسبي للصور المرفوعة إلى الموقع."),
  imageAlt: z.string().max(220),
  imageAltEn: z.string().max(220),
  title: z.string().max(220),
  titleEn: z.string().max(220),
  subtitle: z.string().max(600),
  subtitleEn: z.string().max(600),
  eyebrow: z.string().max(120),
  eyebrowEn: z.string().max(120),
  buttonText: z.string().max(80),
  buttonTextEn: z.string().max(80),
  buttonHref: z.string().max(2048).refine(safeUrl, "رابط الزر غير صالح"),
  enabled: z.boolean(),
  imagePosition: z.enum(["center", "top", "bottom"]),
  textAlign: z.enum(["start", "center"]),
  overlayOpacity: z.number().min(0.15).max(0.9),
});
export const heroSliderSchema = z.object({
  version: z.literal(1),
  slides: z.array(heroSlideSchema).min(1).max(MAX_SLIDES),
  autoplay: z.boolean(),
  interval: z.number().int().min(3000).max(30000),
  transition: z.enum(["fade", "slide", "none"]),
  transitionDuration: z.number().int().min(300).max(2500),
  imageMotion: z.boolean(),
  goldLines: z.boolean(),
  pauseOnHover: z.boolean(),
  showIndicators: z.boolean(),
}).superRefine((config, ctx) => {
  if (new TextEncoder().encode(JSON.stringify(config)).byteLength > MAX_SLIDER_BYTES)
    ctx.addIssue({ code: "custom", message: "حجم إعدادات السلايدر كبير جدًا. اختصر النصوص أو الروابط (الحد الأقصى 40 كيلوبايت؛ الصور نفسها لا تُحسب)." });
  if (!config.slides.some(slide => slide.enabled))
    ctx.addIssue({ code: "custom", path: ["slides"], message: "يجب تفعيل شريحة واحدة على الأقل." });
  if (new Set(config.slides.map(slide => slide.id)).size !== config.slides.length)
    ctx.addIssue({ code: "custom", path: ["slides"], message: "معرّفات الشرائح يجب أن تكون فريدة." });
  config.slides.forEach((slide, index) => {
    if (slide.enabled && (!slide.image.trim() || !slide.title.trim()))
      ctx.addIssue({ code: "custom", path: ["slides", index], message: "أضف صورة وعنوانًا لكل شريحة مفعّلة." });
    if (slide.buttonText.trim() && !slide.buttonHref.trim())
      ctx.addIssue({ code: "custom", path: ["slides", index, "buttonHref"], message: "أضف رابطًا لزر الشريحة أو امسح نص الزر." });
  });
});
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroSliderConfig = z.infer<typeof heroSliderSchema>;
type HeroTextKey = "title" | "subtitle" | "eyebrow" | "buttonText" | "imageAlt";

export function heroSlideText(slide: HeroSlide, key: HeroTextKey, locale: string): string {
  return locale === "en" ? slide[`${key}En` as `${HeroTextKey}En`] || slide[key] : slide[key];
}
export function heroImagePosition(position: HeroSlide["imagePosition"]): string {
  return position === "top" ? "center 15%" : position === "bottom" ? "center 85%" : "center";
}
export function heroOverlay(opacity: number): string {
  return `linear-gradient(to top,rgba(18,26,30,.92),rgba(18,26,30,${opacity}) 60%,rgba(18,26,30,${opacity * 0.4}))`;
}

export function newHeroSlide(id: string): HeroSlide {
  return {
    id, image: "", imageAlt: "", imageAltEn: "", title: "", titleEn: "",
    subtitle: "", subtitleEn: "", eyebrow: "شركة العبنق العقارية", eyebrowEn: "ALABNQ REAL ESTATE",
    buttonText: "", buttonTextEn: "", buttonHref: "", enabled: true,
    imagePosition: "center", textAlign: "start", overlayOpacity: 0.35,
  };
}

export function defaultHeroSlider(site: Record<string, string> = {}): HeroSliderConfig {
  const images = site["home.heroImage"] ? [site["home.heroImage"]] : [
    "/hero/riyadh-kingdom.jpg", "/hero/makkah-clocktower.jpg", "/hero/riyadh-aerial.jpg",
    "/hero/makkah-abraj.jpg", "/hero/riyadh-financial.jpg",
  ];
  return {
    version: 1,
    slides: images.map((image, index) => ({
      ...newHeroSlide(`default-${index + 1}`), image,
      title: site["home.title"] || "خبرة عقارية.. وخدمات متكاملة",
      titleEn: site["home.title.en"] || "Real estate expertise. Complete service.",
      subtitle: site["home.subtitle"] || "خبرة تُرسّخ الثقة.. وخدمات تصنع قيمة.",
      subtitleEn: site["home.subtitle.en"] || "Experience that builds trust. Services that create value.",
      imagePosition: image.includes("/hero/makkah-") ? "top" : "center",
    })),
    autoplay: true, interval: 6500, transition: "fade", transitionDuration: 1500,
    imageMotion: true, goldLines: true, pauseOnHover: true, showIndicators: true,
  };
}

/** Explicit validation prevents corrupt stored content being silently replaced by defaults. */
export function readHeroSlider(site: Record<string, string>): HeroSliderConfig {
  const value = site[HERO_SLIDER_KEY];
  return value ? heroSliderSchema.parse(JSON.parse(value)) : defaultHeroSlider(site);
}