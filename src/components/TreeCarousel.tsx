"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Glyph, type GlyphName } from "./Glyph";

export type CarouselView = "wholeTree" | "bark" | "leaf";

export type CarouselSlide = {
  view: CarouselView;
  url: string;
  optimizable: boolean;
  /** "Vis hele træet" and the like, for the view buttons. */
  label: string;
};

const GLYPHS: Record<CarouselView, GlyphName> = {
  wholeTree: "tree",
  bark: "bark",
  leaf: "broad",
};

/**
 * A tree's photos as a swipeable strip (whole tree, bark, leaf), with one
 * round glyph button per view in the top right. Swiping or tapping a button
 * changes the view; tapping the photo opens the card.
 */
export function TreeCarousel({
  slides,
  slug,
}: {
  slides: CarouselSlide[];
  slug: string;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function show(index: number) {
    const element = strip.current;
    if (!element) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollTo({
      left: index * element.clientWidth,
      behavior: reduce ? "auto" : "smooth",
    });
    setActive(index);
  }

  function onScroll() {
    const element = strip.current;
    if (!element || element.clientWidth === 0) return;
    setActive(Math.round(element.scrollLeft / element.clientWidth));
  }

  return (
    <>
      <div
        ref={strip}
        onScroll={onScroll}
        className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide, index) => (
          <Link
            key={slide.view}
            href={{ pathname: "/arter/[slug]", params: { slug } }}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block size-full shrink-0 snap-start"
          >
            <Image
              src={slide.url}
              alt=""
              fill
              sizes="(min-width: 1024px) 18rem, (min-width: 640px) 33vw, 50vw"
              loading={index === 0 ? "eager" : "lazy"}
              unoptimized={!slide.optimizable}
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {slides.length > 1 ? (
        <div className="absolute top-2 right-2 flex gap-1">
          {slides.map((slide, index) => (
            <button
              key={slide.view}
              type="button"
              onClick={() => show(index)}
              aria-label={slide.label}
              aria-pressed={index === active}
              title={slide.label}
              className={`flex size-7 items-center justify-center rounded-full transition-colors duration-200 ${index === active ? "bg-accent text-accent-ink" : "bg-surface text-accent hover:bg-surface-muted"}`}
            >
              <Glyph name={GLYPHS[slide.view]} className="size-4" />
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}
