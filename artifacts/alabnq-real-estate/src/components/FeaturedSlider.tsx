import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import type { PublishedProperty } from "@/data/siteContent";

export function FeaturedSlider({ properties, heading = "أحدث العروض المميزة" }: { properties: PublishedProperty[]; heading?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);
  const current = properties[index % properties.length];

  useEffect(() => {
    if (paused || properties.length < 2) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % properties.length), 7000);
    return () => window.clearInterval(timer);
  }, [paused, properties.length]);

  const move = (direction: number) =>
    setIndex(value => (value + direction + properties.length) % properties.length);

  return (
    <section aria-label="أحدث العروض المميزة" className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="mb-4 block h-1 w-14 rounded-full bg-accent" aria-hidden="true" />
            <h2 className="text-3xl font-bold text-primary md:text-4xl">{heading}</h2>
          </div>
          {properties.length > 1 && (
            <div className="flex gap-2">
              <button type="button" className="rounded-full border border-primary/20 p-3 text-primary transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-accent" onClick={() => move(-1)} aria-label="العرض السابق"><ChevronRight /></button>
              <button type="button" className="rounded-full border border-primary/20 p-3 text-primary transition hover:bg-accent focus-visible:outline-2 focus-visible:outline-accent" onClick={() => move(1)} aria-label="العرض التالي"><ChevronLeft /></button>
            </div>
          )}
        </div>
        {current ? (
          <div
            className="relative isolate overflow-hidden rounded-2xl bg-primary"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; setPaused(true); }}
            onTouchEnd={event => {
              const start = touchStart.current;
              const end = event.changedTouches[0]?.clientX;
              if (start !== null && end !== undefined && Math.abs(end - start) > 40) move(end < start ? 1 : -1);
              touchStart.current = null;
              setPaused(false);
            }}
            onTouchCancel={() => { touchStart.current = null; setPaused(false); }}
          >
            <Link href={`/properties/${current.id}`} className="block focus-visible:outline-2 focus-visible:outline-accent" aria-label={`تفاصيل ${current.title}`}>
              <img src={current.image} alt={current.title} className="h-[350px] w-full object-cover md:h-[460px]" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-6 pb-7 pt-24 text-white md:px-10 md:pb-10">
                <p className="mb-2 flex items-center gap-1 text-sm text-white/85"><MapPin size={16} />{current.neighborhood}، {current.city}</p>
                <h3 className="max-w-3xl text-xl font-bold md:text-3xl">{current.title}</h3>
                {current.priceLabel && <p className="mt-2 font-semibold text-accent">{current.priceLabel}</p>}
              </div>
            </Link>
          </div>
        ) : (
          <p className="rounded-2xl border border-border px-6 py-16 text-center text-muted-foreground">لا توجد عروض مميزة منشورة حاليًا.</p>
        )}
        {properties.length > 1 && (
          <p className="mt-3 text-center text-sm text-muted-foreground" aria-live="polite">{index % properties.length + 1} / {properties.length}</p>
        )}
        <div className="mt-7 text-center">
          <Link href="/properties" className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-8 font-bold text-primary transition hover:bg-accent/85">
            عرض جميع العقارات
          </Link>
        </div>
      </div>
    </section>
  );
}