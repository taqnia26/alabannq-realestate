import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { usePreferences } from "@/lib/preferences";

const photos = [
  { src: "/gallery/city-01.jpg", ar: "مكة المكرمة", en: "Makkah" },
  { src: "/gallery/city-02.jpg", ar: "مكة المكرمة", en: "Makkah" },
  { src: "/gallery/city-03.jpg", ar: "مكة المكرمة", en: "Makkah" },
  { src: "/gallery/city-04.jpg", ar: "مكة المكرمة", en: "Makkah" },
  { src: "/gallery/city-05.jpg", ar: "الرياض", en: "Riyadh" },
  { src: "/gallery/city-06.jpg", ar: "مكة المكرمة", en: "Makkah" },
  { src: "/gallery/city-07.jpg", ar: "الرياض", en: "Riyadh" },
  { src: "/gallery/city-08.jpg", ar: "جدة", en: "Jeddah" },
  { src: "/gallery/city-09.jpg", ar: "جدة", en: "Jeddah" },
  { src: "/gallery/city-10.jpg", ar: "الرياض", en: "Riyadh" },
  { src: "/gallery/city-11.jpg", ar: "الرياض", en: "Riyadh" },
  { src: "/gallery/city-12.jpg", ar: "الرياض", en: "Riyadh", landscape: true },
  { src: "/gallery/city-13.jpg", ar: "الرياض", en: "Riyadh" },
  { src: "/gallery/city-14.jpg", ar: "الرياض", en: "Riyadh" },
];

export function CityGallerySlider() {
  const { locale, t } = usePreferences();
  const [viewportRef, api] = useEmblaCarousel({
    align: "start",
    direction: locale === "ar" ? "rtl" : "ltr",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const [position, setPosition] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateControls = useCallback(() => {
    if (!api) return;
    setPosition(api.selectedScrollSnap());
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    updateControls();
    api.on("select", updateControls);
    api.on("reInit", updateControls);
    return () => {
      api.off("select", updateControls);
      api.off("reInit", updateControls);
    };
  }, [api, updateControls]);

  const PrevIcon = locale === "ar" ? ArrowRight : ArrowLeft;
  const NextIcon = locale === "ar" ? ArrowLeft : ArrowRight;
  const totalPositions = api?.scrollSnapList().length ?? photos.length;

  return (
    <section id="city-gallery" className="site-always-dark overflow-hidden bg-[#142127] py-20 text-[#f3eee4] md:py-28" aria-label={t("معرض صور مدن المملكة", "Saudi cities photo gallery")} dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="site-container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8 md:mb-12">
          <div>
            <span className="site-eyebrow">{t("من مدن المملكة", "AROUND THE KINGDOM")}</span>
            <h2 className="site-display mt-6 text-4xl md:text-6xl">{t("مشاهد من مكة والرياض وجدة", "Scenes from Makkah, Riyadh & Jeddah")}</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="me-3 text-xs text-[#e5d9c7]/65">{t(`${photos.length} صورة`, `${photos.length} photos`)}</span>
            <button type="button" onClick={() => api?.scrollPrev()} disabled={!canPrev} aria-label={t("الصور السابقة", "Previous photos")} className="flex h-12 w-12 items-center justify-center border border-[#d8b675]/45 text-[#d8b675] transition-colors hover:bg-[#d8b675] hover:text-[#142127] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#d8b675]"><PrevIcon size={20} /></button>
            <button type="button" onClick={() => api?.scrollNext()} disabled={!canNext} aria-label={t("الصور التالية", "Next photos")} className="flex h-12 w-12 items-center justify-center border border-[#d8b675]/45 text-[#d8b675] transition-colors hover:bg-[#d8b675] hover:text-[#142127] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#d8b675]"><NextIcon size={20} /></button>
          </div>
        </div>
        <div ref={viewportRef} className="overflow-hidden" tabIndex={0} aria-label={t("اسحب لاستعراض الصور أو استخدم أزرار التنقل", "Swipe to browse photos or use the navigation buttons")} onKeyDown={event => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            const forward = event.key === (locale === "ar" ? "ArrowLeft" : "ArrowRight");
            if (forward) api?.scrollNext(); else api?.scrollPrev();
          }
        }}>
          <div className="flex gap-4 md:gap-5">
            {photos.map((photo, index) => (
              <figure key={photo.src} className={`min-w-0 shrink-0 grow-0 border border-[#e5d9c7]/15 bg-[#1b292f] ${photo.landscape ? "basis-[min(80vw,510px)]" : "basis-[min(70vw,300px)]"}`}>
                <div className="flex h-[min(124vw,533px)] items-center justify-center overflow-hidden bg-[#111b20]">
                  <img src={photo.src} alt={t(`مشهد من ${photo.ar}`, `View of ${photo.en}`)} width={photo.landscape ? 1280 : 720} height={photo.landscape ? 720 : 1280} loading={index < 5 ? "eager" : "lazy"} decoding="async" className="h-full w-full object-contain" />
                </div>
                <figcaption className="flex items-center justify-between border-t border-[#e5d9c7]/15 px-4 py-4 text-sm">
                  <span className="font-semibold">{t(photo.ar, photo.en)}</span>
                  <span className="text-xs tracking-wider text-[#d8b675]" dir="ltr">{String(index + 1).padStart(2, "0")}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="mt-8 flex items-center gap-5" aria-live="polite">
          <span className="min-w-16 text-xs tracking-widest text-[#d8b675]" dir="ltr">{String(position + 1).padStart(2, "0")} / {String(totalPositions).padStart(2, "0")}</span>
          <div className="h-px flex-1 bg-[#e5d9c7]/20"><div className="h-px bg-[#d8b675] transition-[width] duration-300" style={{ width: `${((position + 1) / totalPositions) * 100}%` }} /></div>
        </div>
      </div>
    </section>
  );
}