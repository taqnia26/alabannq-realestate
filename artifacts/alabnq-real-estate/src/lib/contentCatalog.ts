import catalog from "../data/contentCatalog.json";

export type ContentField = {
  key: string;
  label: string;
  group: string;
  type: "text" | "image" | "value";
  defaultValue: string;
  englishDefault?: string;
};

export const contentFields = catalog as ContentField[];
export const contentDefaults = Object.fromEntries(contentFields.flatMap(field => [
  [field.key, field.defaultValue],
  ...(field.englishDefault !== undefined ? [[`${field.key}.en`, field.englishDefault]] : []),
])) as Record<string, string>;

// Stable across page ordering and independent of the administrator's replacement text.
export function contentTextKey(arabic: string, english: string) {
  let hash = 2166136261;
  for (const character of `${arabic}\u0000${english}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  return `copy.${hash.toString(16)}`;
}
