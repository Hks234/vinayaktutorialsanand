"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { safeHref } from "@/lib/utils";

export type BannerSlide = {
  id: string;
  imagePath: string;
  heading?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
};

export function BannerSlider({ banners }: { banners: BannerSlide[] }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % banners.length), 6500);
    return () => clearInterval(timer);
  }, [banners.length]);
  if (!banners.length) return null;
  const banner = banners[index];
  return (
    <section className="mx-auto max-w-6xl px-4 py-6" aria-roledescription="carousel" aria-label="Promotional banners">
      <div className="relative min-h-[280px] overflow-hidden rounded-[2rem] bg-navy shadow-card md:min-h-[380px]">
        <img src={banner.imagePath} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-navy/10" />
        <div className="relative z-10 flex min-h-[280px] max-w-xl flex-col justify-center p-8 text-white md:min-h-[380px] md:p-12">
          {banner.heading ? <h2 className="font-serif text-3xl leading-tight md:text-5xl">{banner.heading}</h2> : null}
          {banner.subtitle ? <p className="mt-4 text-base leading-7 text-white/80">{banner.subtitle}</p> : null}
          {banner.ctaText ? (
            <a className="btn-primary mt-6 w-fit" href={safeHref(banner.ctaHref, "/admission-enquiry")}>
              {banner.ctaText}
            </a>
          ) : null}
        </div>
        {banners.length > 1 ? (
          <div className="absolute bottom-5 right-5 flex gap-2">
            <button type="button" aria-label="Previous banner" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur" onClick={() => setIndex((value) => (value - 1 + banners.length) % banners.length)}>
              <ChevronLeft size={18} />
            </button>
            <button type="button" aria-label="Next banner" className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur" onClick={() => setIndex((value) => (value + 1) % banners.length)}>
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
