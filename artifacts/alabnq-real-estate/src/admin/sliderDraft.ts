import { defaultHeroSlider, newHeroSlide, MAX_SLIDES, type HeroSliderConfig } from "@workspace/slider-config";

const KEY = "alabnq-hero-slider-draft";
type Draft = { baseline: string; config: HeroSliderConfig; selectedId: string };

// Drafts may contain incomplete fields, so published-content validation is too strict here.
function matchesShape(value: unknown, template: object, skip: string[] = []): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return Object.entries(template).every(([key, sample]) =>
    skip.includes(key) || (typeof record[key] === typeof sample &&
      (typeof record[key] !== "number" || Number.isFinite(record[key]))));
}

export function readSliderDraft(): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw || raw.length > 100_000) return null;
    const draft = JSON.parse(raw) as Draft;
    const config = draft.config;
    if (typeof draft.baseline !== "string" || typeof draft.selectedId !== "string" ||
      !matchesShape(config, defaultHeroSlider(), ["slides"]) || config.version !== 1 ||
      !Array.isArray(config.slides) || !config.slides.length || config.slides.length > MAX_SLIDES ||
      !config.slides.every(slide => matchesShape(slide, newHeroSlide("shape")))) return null;
    return draft;
  } catch { return null; }
}

export function storeSliderDraft(config: HeroSliderConfig, baseline: string, selectedId: string) {
  try { window.sessionStorage.setItem(KEY, JSON.stringify({ config, baseline, selectedId })); }
  catch { /* The editor still works when private browsing or storage limits disable recovery. */ }
}

export function discardSliderDraft() {
  try { window.sessionStorage.removeItem(KEY); } catch { /* Storage may be unavailable. */ }
}