import { Link } from "wouter";
import { ArrowUpLeft } from "lucide-react";
import { usePreferences } from "@/lib/preferences";

export default function NotFound() {
  const { t } = usePreferences();
  return <main className="site-shell grid min-h-[70dvh] flex-1 place-items-center px-5 py-24 text-center"><div><span className="site-eyebrow">{t("صفحة غير متاحة", "PAGE NOT FOUND")}</span><p className="site-display mt-7 text-[clamp(6rem,15vw,13rem)] leading-none text-accent" dir="ltr">404</p><h1 className="site-display mt-6 text-3xl">{t("لم نجد الصفحة التي تبحث عنها", "This page isn't here")}</h1><p className="mt-5 text-sm text-muted-foreground">{t("قد يكون الرابط تغيّر. يمكنك العودة لاستكشاف الموقع.", "The link may have changed. Return to explore the site.")}</p><Link href="/" className="site-button mt-9 inline-flex items-center gap-3 px-7 py-3 text-sm font-bold">{t("العودة للرئيسية", "Back to home")} <ArrowUpLeft size={17} /></Link></div></main>;
}