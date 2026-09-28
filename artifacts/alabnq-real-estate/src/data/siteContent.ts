import { useQuery } from "@tanstack/react-query";
import { officialProperties, type Property } from "./mockProperties";
import { articles, type Article } from "./articles";

export type PublishedProperty = Property & { published?: boolean; deleted?: boolean };
export type PublishedArticle = Article & { published?: boolean; deleted?: boolean };
export type SiteContent = {
  properties: PublishedProperty[];
  articles: PublishedArticle[];
  site: Record<string, string>;
};

export const contentQueryKey = ["site-content"];
export function mergeRecords<T extends { id: string }>(defaults: T[], overrides: (T & { published?: boolean; deleted?: boolean })[]): (T & { published?: boolean; deleted?: boolean })[] {
  const byId = new Map<string, T & { published?: boolean; deleted?: boolean }>(defaults.map(item => [item.id, item]));
  for (const item of overrides) {
    if (item.deleted) byId.delete(item.id);
    else byId.set(item.id, item);
  }
  return [...byId.values()];
}

export function useSiteContent() {
  return useQuery<SiteContent>({
    queryKey: contentQueryKey,
    queryFn: async () => {
      const response = await fetch("/api/content", { cache: "no-store" });
      if (!response.ok) throw new Error("تعذر تحميل محتوى الموقع");
      const data = await response.json() as SiteContent;
      return {
        properties: mergeRecords(officialProperties, data.properties).filter(item => item.published !== false),
        articles: mergeRecords(articles, data.articles).filter(item => item.published !== false),
        site: data.site,
      };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useSiteValue(key: string, fallback: string) {
  const { data } = useSiteContent();
  return data?.site[key] ?? fallback;
}