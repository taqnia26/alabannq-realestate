import assert from "node:assert/strict";
import test from "node:test";
import { defaultHeroSlider } from "@workspace/slider-config";
import { discardSliderDraft, readSliderDraft, storeSliderDraft } from "../src/admin/sliderDraft.ts";

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "window", { configurable: true, value: {
  sessionStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  },
} });

test("unsaved work survives editor unmount and reopening, including incomplete fields", () => {
  const config = defaultHeroSlider();
  const baseline = JSON.stringify(config);
  config.slides[0].title = "مسودة غير محفوظة";
  config.slides[0].image = "";
  storeSliderDraft(config, baseline, config.slides[0].id);
  assert.deepEqual(readSliderDraft(), { config, baseline, selectedId: config.slides[0].id });
  assert.notEqual(JSON.stringify(readSliderDraft()!.config), readSliderDraft()!.baseline);
});

test("an explicit discard removes the recoverable draft", () => {
  discardSliderDraft();
  assert.equal(readSliderDraft(), null);
});

test("corrupt browser storage cannot crash or replace the editor state", () => {
  storage.set("alabnq-hero-slider-draft", "{broken");
  assert.equal(readSliderDraft(), null);
  storage.set("alabnq-hero-slider-draft", JSON.stringify({ baseline: "", selectedId: "", config: { slides: "not-an-array" } }));
  assert.equal(readSliderDraft(), null);
  storage.clear();
});