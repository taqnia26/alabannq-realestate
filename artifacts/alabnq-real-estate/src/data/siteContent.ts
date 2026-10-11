import { usePreferences } from "@/lib/preferences";
import { useSiteContent } from "./siteQuery";
export { useSiteContent, mergeRecords, contentQueryKey } from "./siteQuery";
export type { PublishedProperty, PublishedArticle, SiteContent, SitePage } from "./siteQuery";

export function useSiteValue(key: string, fallback: string) {
  const { data } = useSiteContent();
  return data?.site[key] ?? fallback;
}

export function useLocalizedSiteValue(key: string, arabic: string, english: string) {
  const { locale } = usePreferences();
  const { data } = useSiteContent();
  return locale === "en"
    ? data?.site[`${key}.en`] ?? english
    : data?.site[key] ?? arabic;
}